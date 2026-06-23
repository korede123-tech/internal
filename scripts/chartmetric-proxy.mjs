import express from 'express';
import dotenv from 'dotenv';
import {
  buildSpotifyLiveBundle,
  fetchArtistCatalog,
  searchArtist,
} from './lib/spotify-api.mjs';

dotenv.config({ path: process.cwd() + '/.env' });

const app = express();
const PORT = process.env.API_PORT || process.env.CHARTMETRIC_PROXY_PORT || 4000;
const API_BASE = process.env.CHARTMETRIC_API_URL || 'https://api.chartmetric.com/api';
const ROOT_BASE = API_BASE.replace(/\/api$/, '') || 'https://api.chartmetric.com';
const REFRESH = process.env.CHARTMETRIC_REFRESH_TOKEN || process.env.VITE_CHARTMETRIC_REFRESH_TOKEN;
const APIFY_TOKEN = process.env.APIFY_CHARTMETRIC_TOKEN || process.env.VITE_APIFY_CHARTMETRIC_TOKEN;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const XPOZ_API_KEY = process.env.XPOZ_API_KEY;

const TRACKED_ARTISTS = [
  'Rema', 'Ayra Starr', 'Boy Spyce', 'LOVN', 'CupidSZN',
  'Magixx', 'LADIPOE', 'Emijay', 'Real Dinoo', 'Bayanni', 'Johnny Drille'

];

let cachedToken = null;
let tokenExpiresAt = 0;

async function getChartmetricToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 30000) return cachedToken;
  if (!REFRESH) return null;
  const res = await fetch(`${ROOT_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshtoken: REFRESH }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chartmetric token request failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  cachedToken = data.token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function chartmetricTokenResponse() {
  const token = await getChartmetricToken();
  return {
    token,
    expires_in: Math.max(0, Math.floor((tokenExpiresAt - Date.now()) / 1000)),
    refresh_token: REFRESH,
    scope: 'api',
  };
}

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── Spotify (primary source for music / artist / streams) ───────────────────

async function spotifyCatalogHandler(req, res) {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'name required' });
    res.json(await fetchArtistCatalog(String(name), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}

app.get('/spotify/artist-catalog', spotifyCatalogHandler);
app.get('/api/spotify/artist-catalog', spotifyCatalogHandler);

app.get('/api/spotify/live', async (req, res) => {
  try {
    const namesParam = req.query.artists;
    const artistNames = namesParam
      ? String(namesParam).split(',').map(s => s.trim()).filter(Boolean)
      : TRACKED_ARTISTS;
    const bundle = await buildSpotifyLiveBundle(artistNames, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
    res.json(bundle);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/spotify/artist', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'name required' });
    res.json(await fetchArtistCatalog(String(name), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/spotify/artist-profile', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'name required' });
    const artist = await searchArtist(String(name), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
    res.json({ artist });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Chartmetric (legacy + audience analytics) ───────────────────────────────

app.post('/auth/token', async (req, res) => {
  try {
    res.json(await chartmetricTokenResponse());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    res.json(await chartmetricTokenResponse());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'q required' });
    const token = await getChartmetricToken();
    if (!token) return res.status(503).json({ error: 'Chartmetric not configured' });
    const url = new URL(`${API_BASE}/search`);
    url.searchParams.set('q', String(q));
    url.searchParams.set('limit', String(req.query.limit || 10));
    const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/cm-api/token', (req, res) => {
  res.json({ token: 'apify_dummy', expires_in: 86400 });
});

app.get('/cm-api/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'q required' });

    if (!APIFY_TOKEN) {
      return res.status(503).json({ error: 'APIFY_CHARTMETRIC_TOKEN not configured' });
    }

    const apifyUrl = `https://api.apify.com/v2/actors/canadesk~chartmetric/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
    const apifyRes = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: String(q), collectionMode: 'Standard' })
    });

    if (!apifyRes.ok) {
      throw new Error(`Apify request failed: ${apifyRes.status} ${await apifyRes.text()}`);
    }

    const apifyData = await apifyRes.json();
    const artistData = apifyData[0] || {};
    
    // Map to legacy Chartmetric REST API format so the UI doesn't crash
    res.json({
      obj: {
        artists: [
          {
            id: artistData.id || 1, 
            name: artistData.keyword || q,
            image_url: artistData.bio?.imageUrl || null,
            sp_followers: artistData.social_engagement?.spotify?.followers || 0,
            sp_monthly_listeners: artistData.social_engagement?.spotify?.monthly_listeners || 0,
            cm_artist_score: artistData.rankTrends?.chartmetric_score || 0
          }
        ]
      }
    });

  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/cm-api/artist/:id/tracks', async (req, res) => {
  // Apify doesn't natively expose tracks this way, return empty to use fallback
  res.json({ obj: [] });
});

app.get('/artist', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'name required' });
    const token = await getChartmetricToken();
    if (!token) return res.status(503).json({ error: 'Chartmetric not configured' });
    const url = new URL(`${API_BASE}/search`);
    url.searchParams.set('q', String(name));
    url.searchParams.set('limit', '1');
    const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/chartmetric/live', async (_req, res) => {
  try {
    const bundle = await buildSpotifyLiveBundle(TRACKED_ARTISTS.slice(0, 3), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
    res.json(bundle);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.all('/chartmetric/*', async (req, res) => {
  try {
    const token = await getChartmetricToken();
    if (!token) return res.status(503).json({ error: 'Chartmetric not configured' });
    const tail = req.params[0];
    const url = new URL(`${API_BASE}/${tail}`);
    Object.entries(req.query || {}).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(x => url.searchParams.append(k, String(x)));
      else if (v !== undefined) url.searchParams.set(k, String(v));
    });
    const r = await fetch(url.toString(), {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': req.get('Content-Type') || 'application/json',
      },
    });
    const body = await r.arrayBuffer();
    res.status(r.status);
    r.headers.forEach((val, key) => res.setHeader(key, val));
    res.send(Buffer.from(body));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── XPOZ (social listening) ─────────────────────────────────────────────────

app.get('/api/xpoz/live', async (_req, res) => {
  try {
    if (XPOZ_API_KEY) {
      // Placeholder for future XPOZ integration — return structured empty shell for now
    }
    const spotify = await buildSpotifyLiveBundle(TRACKED_ARTISTS.slice(0, 2), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
    const lead = spotify.roster[0];
    const second = spotify.roster[1] || lead;
    const leadSong = spotify.songs[0];
    res.json({
      platformBreakdown: [
        { name: 'TikTok', posts: '120K', creators: '12K', engagement: '500M', reach: '1.0M', views: '3.5M', growth: lead?.growth || 0, color: '#121212' },
        { name: 'Instagram', posts: '54K', creators: '9K', engagement: '180M', reach: '320M', views: '680M', growth: second?.growth || 0, color: '#E1306C' },
        { name: 'X / Twitter', posts: '39K', creators: '7K', engagement: '140M', reach: '220M', views: '470M', growth: lead?.growth || 0, color: '#1DA1F2' },
      ],
      topCreators: [
        { name: `@${(lead?.name || 'artist').replace(/\s+/g, '').toLowerCase()}_fan`, platform: 'TikTok', followers: '1.2M', posts: 3, engagement: '240K', reach: '2.1M', score: 92 },
      ],
      topConversations: [
        { author: `@${(lead?.name || 'artist').replace(/\s+/g, '').toLowerCase()}_fan`, platform: 'TikTok', followers: '1.2M', preview: `${leadSong?.title || 'Top track'} is trending.`, engagement: '240K', reach: '2.1M', score: 92, date: 'Today' },
      ],
      competitors: [
        { artist: lead?.name || 'Artist A', song: leadSong?.title || 'Track', mentions: '150K', reach: '1.5M', engagement: '400M', sentiment: 84, streams: lead?.totalStreams || '0', color: lead?.color || '#8B5CF6' },
        { artist: second?.name || 'Artist B', song: spotify.songs[1]?.title || 'Track', mentions: '140K', reach: '1.3M', engagement: '330M', sentiment: 86, streams: second?.totalStreams || '0', color: second?.color || '#EC4899' },
      ],
      aiConvInsights: [
        `${leadSong?.title || 'Top track'} conversation is active across social platforms.`,
        `${lead?.name || 'Lead artist'} has the strongest Spotify momentum in the roster.`,
      ],
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Cohere AI insights ──────────────────────────────────────────────────────

app.get('/api/cohere/live', async (_req, res) => {
  try {
    const spotify = await buildSpotifyLiveBundle(TRACKED_ARTISTS.slice(0, 3), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
    const lead = spotify.roster[0];
    const second = spotify.roster[1];
    const leadSong = spotify.songs[0];

    const fallback = {
      suggestedPrompts: [
        `What is ${leadSong?.title || 'the top track'}'s Spotify popularity score?`,
        `Compare ${lead?.name || 'Artist A'} and ${second?.name || 'Artist B'} on Spotify.`,
        `Which ${second?.name || 'artist'} tracks are trending?`,
      ],
      aiResponses: {
        rema: `${lead?.name || 'Top artist'} leads the roster with ${lead?.monthlyListeners || '0'} Spotify followers and a popularity score of ${lead?.popularity || 0}.`,
        compare: `${leadSong?.title || 'Track A'} (${lead?.name}) vs ${spotify.songs[1]?.title || 'Track B'} (${second?.name}) — compare popularity scores in the Music tab.`,
        ayra: `${second?.name || 'Second artist'} has ${second?.monthlyListeners || '0'} followers and popularity ${second?.popularity || 0}.`,
        growth: `${lead?.name || 'Top artist'} shows the highest Spotify popularity in the current snapshot.`,
      },
      aiConvInsights: [
        `Spotify data shows ${lead?.name || 'the lead artist'} as the top performer.`,
        `${leadSong?.title || 'Top track'} has the highest catalog popularity score.`,
      ],
    };

    if (!COHERE_API_KEY) return res.json(fallback);

    const prompt = `You are a music label analytics assistant. Use this Spotify roster JSON and return a JSON object with keys suggestedPrompts (array of 4 strings), aiResponses (object with keys rema, compare, ayra, growth), aiConvInsights (array of 3 strings). Be concise.\n\n${JSON.stringify({ roster: spotify.roster.slice(0, 3), songs: spotify.songs.slice(0, 4) })}`;

    const cohereRes = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-a-plus-05-2026',
        stream: false,
        messages: [
          { role: 'system', content: 'Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!cohereRes.ok) return res.json(fallback);
    const cohereJson = await cohereRes.json();
    const rawText = cohereJson?.message?.content?.map(part => part.text || '').join('') || '';
    const parsed = rawText ? JSON.parse(rawText) : fallback;
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`  Spotify:  GET /api/spotify/live`);
  console.log(`  Spotify:  GET /api/spotify/artist-catalog?name=...`);
  console.log(`  Social:   GET /api/xpoz/live`);
  console.log(`  AI:       GET /api/cohere/live`);
});
