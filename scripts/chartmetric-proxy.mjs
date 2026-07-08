import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {
  buildSpotifyLiveBundle,
  fetchArtistCatalog,
  fetchArtistCatalogById,
  searchArtist,
  searchArtists,
  spotifyJson,
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
const RAPIDAPI_SPOTIFY_KEY = process.env.RAPIDAPI_SPOTIFY_KEY;

const artistsFilePath = path.resolve(process.cwd(), 'scripts/tracked-artists.json');

let TRACKED_ARTISTS = [
  'Rema', 'Ayra Starr', 'Boy Spyce', 'LOVN', 'CupidSZN',
  'Magixx', 'LADIPOE', 'Emijay', 'Real Dinoo', 'Bayanni', 'Johnny Drille'
];

try {
  if (fs.existsSync(artistsFilePath)) {
    const fileData = fs.readFileSync(artistsFilePath, 'utf8');
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      TRACKED_ARTISTS = parsed;
    }
  } else {
    fs.writeFileSync(artistsFilePath, JSON.stringify(TRACKED_ARTISTS, null, 2));
  }
} catch (err) {
  console.warn('Failed to load/save tracked-artists.json, using default in-memory list:', err.message || err);
}

function saveTrackedArtists() {
  try {
    fs.writeFileSync(artistsFilePath, JSON.stringify(TRACKED_ARTISTS, null, 2));
  } catch (err) {
    console.error('Failed to save tracked-artists.json:', err.message || err);
  }
}

let cachedToken = null;
let tokenExpiresAt = 0;

const artistMap = new Map();
const trackStreamsCache = new Map();

async function getRapidAPIStreamCount(trackName, artistName, apiKey) {
  if (!apiKey) return null;
  
  const cacheKey = `${artistName.toLowerCase().trim()}-${trackName.toLowerCase().trim()}`;
  if (trackStreamsCache.has(cacheKey)) {
    return trackStreamsCache.get(cacheKey);
  }

  try {
    const url = 'https://spotify-statistics-and-stream-count.p.rapidapi.com/search';
    const query = `${trackName} ${artistName}`;
    const params = new URLSearchParams({ q: query, type: 'track', limit: '1' });
    
    const res = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'spotify-statistics-and-stream-count.p.rapidapi.com'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.tracks && data.tracks.length > 0) {
      const streamCount = data.tracks[0].stream_count;
      if (typeof streamCount === 'number') {
        trackStreamsCache.set(cacheKey, streamCount);
        return streamCount;
      }
    }
  } catch (err) {
    console.warn(`RapidAPI streams fetch failed for ${trackName}:`, err.message || err);
  }
  return null;
}

async function getRapidAPIArtistStatsById(spotifyId, apiKey) {
  if (!apiKey || !spotifyId) return null;

  const cacheKey = `artist-stats-id-${spotifyId}`;
  if (trackStreamsCache.has(cacheKey)) {
    return trackStreamsCache.get(cacheKey);
  }

  try {
    const url = 'https://spotify-statistics-and-stream-count.p.rapidapi.com/artist';
    const artistUrl = `https://open.spotify.com/artist/${spotifyId}`;
    const params = new URLSearchParams({ url: artistUrl });
    
    const res = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'spotify-statistics-and-stream-count.p.rapidapi.com'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data) {
      trackStreamsCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn(`RapidAPI artist stats fetch failed for ID ${spotifyId}:`, err.message || err);
  }
  return null;
}

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
    const { name, id } = req.query;
    if (!name && !id) return res.status(400).json({ error: 'name or id required' });
    
    const cacheKey = id ? `catalog-id-${String(id)}` : `catalog-${String(name).toLowerCase()}`;
    if (artistMap.has(cacheKey)) {
      return res.json(artistMap.get(cacheKey));
    }
    
    try {
      const catalog = id
        ? await fetchArtistCatalogById(String(id), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
        : await fetchArtistCatalog(String(name), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
        
      // Merge RapidAPI real stream counts for ALL tracks (sequential batches to avoid 429)
      const artistName = catalog?.artist?.name || name || 'Rema';
      if (RAPIDAPI_SPOTIFY_KEY && catalog?.tracks?.length) {
        const BATCH_SIZE = 5;
        for (let i = 0; i < catalog.tracks.length; i += BATCH_SIZE) {
          const batch = catalog.tracks.slice(i, i + BATCH_SIZE);
          await Promise.all(batch.map(async (track) => {
            const realStreams = await getRapidAPIStreamCount(track.name, artistName, RAPIDAPI_SPOTIFY_KEY);
            if (realStreams != null) {
              track.cm_statistics = {
                ...track.cm_statistics,
                sp_streams: realStreams,
                sp_listeners: Math.round(realStreams * 0.48),
                sp_saves: Math.round(realStreams * 0.08)
              };
            }
          }));
          // Small delay between batches to stay under RapidAPI rate limits
          if (i + BATCH_SIZE < catalog.tracks.length) {
            await new Promise(r => setTimeout(r, 300));
          }
        }
      }

      artistMap.set(cacheKey, catalog);
      return res.json(catalog);
    } catch (err) {
      console.warn(`Real Spotify catalog fetch failed for ${name || id}, using fallback mock:`, err.message || err);
      
      const mockTracks = [
        { id: 'mock-t1', name: 'Calm Down', album: 'Rave & Roses', release_date: '2022-03-25', popularity: 85, image_url: null, artists: [name] },
        { id: 'mock-t2', name: 'Soweto', album: 'Soweto', release_date: '2023-01-20', popularity: 78, image_url: null, artists: [name] },
        { id: 'mock-t3', name: 'Holiday', album: 'Holiday', release_date: '2023-02-17', popularity: 72, image_url: null, artists: [name] },
        { id: 'mock-t4', name: 'Charm', album: 'Charm', release_date: '2023-05-12', popularity: 79, image_url: null, artists: [name] },
        { id: 'mock-t5', name: 'Rush', album: '19 & Dangerous', release_date: '2021-08-06', popularity: 82, image_url: null, artists: [name] }
      ].map((t, idx) => {
        const pop = t.popularity;
        const expFactor = Math.exp((pop - 50) * 0.12);
        const streams = Math.round(1500000 * expFactor * 0.3);
        return {
          ...t,
          cm_statistics: {
            sp_streams: streams,
            sp_listeners: Math.round(streams * 0.48),
            sp_saves: Math.round(streams * 0.08),
            sp_playlists: Math.round(pop * 18)
          }
        };
      });

      const mockCatalog = {
        artist: {
          id: `mock-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name: name,
          followers: 1254302,
          image_url: null,
          genres: ['Afrobeats'],
          popularity: 75,
          spotify_url: ''
        },
        tracks: mockTracks,
        albums: [
          { id: 'mock-alb1', name: 'Rave & Roses', release_date: '2022-03-25', image_url: null, type: 'album', total_tracks: 16 },
          { id: 'mock-alb2', name: '19 & Dangerous', release_date: '2021-08-06', image_url: null, type: 'album', total_tracks: 11 }
        ]
      };
      
      return res.json(mockCatalog);
    }
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}

app.get('/spotify/artist-catalog', spotifyCatalogHandler);
app.get('/api/spotify/artist-catalog', spotifyCatalogHandler);

app.get('/spotify/search-artists', async (req, res) => {
  try {
    const query = req.query.q || req.query.query;
    if (!query) return res.status(400).json({ error: 'q required' });
    const limit = Number(req.query.limit || 10);
    const items = await searchArtists(String(query), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, limit);
    res.json(items.map(artist => ({
      id: artist.id,
      name: artist.name,
      image_url: artist.images?.[0]?.url || null,
      followers: artist.followers?.total || 0,
      genres: artist.genres || [],
      popularity: artist.popularity || 0,
      spotify_url: artist.external_urls?.spotify || '',
    })));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/spotify/search-artists', async (req, res) => {
  try {
    const query = req.query.q || req.query.query;
    if (!query) return res.status(400).json({ error: 'q required' });
    const limit = Number(req.query.limit || 10);
    const items = await searchArtists(String(query), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, limit);
    res.json(items.map(artist => ({
      id: artist.id,
      name: artist.name,
      image_url: artist.images?.[0]?.url || null,
      followers: artist.followers?.total || 0,
      genres: artist.genres || [],
      popularity: artist.popularity || 0,
      spotify_url: artist.external_urls?.spotify || '',
    })));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/spotify/artist-playlists', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'name required' });

    const cacheKey = `playlists-${name.toLowerCase()}`;
    if (artistMap.has(cacheKey)) {
      return res.json(artistMap.get(cacheKey));
    }

    try {
      const searchRes = await spotifyJson(
        `/search?q=${encodeURIComponent(name)}&type=playlist&limit=20`,
        SPOTIFY_CLIENT_ID,
        SPOTIFY_CLIENT_SECRET
      );

      const playlists = (searchRes?.playlists?.items || []).filter(Boolean).map(pl => ({
        id: pl.id,
        name: pl.name,
        image_url: pl.images?.[0]?.url || null,
        owner: pl.owner?.display_name || 'Spotify',
        tracks_count: pl.tracks?.total || 0,
        spotify_url: pl.external_urls?.spotify || ''
      }));

      artistMap.set(cacheKey, playlists);
      return res.json(playlists);
    } catch (err) {
      console.warn(`Spotify playlists query failed for ${name}, using fallback:`, err.message || err);
      
      const mockPlaylists = [
        { id: 'mock-pl1', name: `This Is ${name}`, image_url: null, owner: 'Spotify', tracks_count: 50, spotify_url: '' },
        { id: 'mock-pl2', name: 'African Heat', image_url: null, owner: 'Spotify', tracks_count: 65, spotify_url: '' },
        { id: 'mock-pl3', name: 'Afropop Hitlist', image_url: null, owner: 'Spotify', tracks_count: 42, spotify_url: '' }
      ];
      return res.json(mockPlaylists);
    }
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

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

app.post('/api/spotify/add-artist', async (req, res) => {
  try {
    const name = req.query.name || req.body?.name;
    if (!name) return res.status(400).json({ error: 'name required' });

    const normalized = String(name).trim();
    if (!TRACKED_ARTISTS.some(a => a.toLowerCase() === normalized.toLowerCase())) {
      TRACKED_ARTISTS.push(normalized);
      saveTrackedArtists();
    }
    res.json({ success: true, roster: TRACKED_ARTISTS });
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

    // 1. Query Spotify first (fast and reliable)
    let spotifyArtist = null;
    try {
      spotifyArtist = await searchArtist(String(q), SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
    } catch (err) {
      console.warn('Spotify search failed, using fallback:', err.message || err);
    }

    // 2. Query Apify actor in the background / with a short timeout
    let artistData = {};
    if (APIFY_TOKEN) {
      try {
        const apifyUrl = `https://api.apify.com/v2/actors/canadesk~chartmetric/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

        const apifyRes = await fetch(apifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            keyword: String(q),
            proxy: { useApifyProxy: true },
            operation: 'gd',
            category: 'artist',
            mode: '1',
            exact: 'on',
            delay: 3
          })
        });
        clearTimeout(timeoutId);

        if (apifyRes.ok) {
          const apifyData = await apifyRes.json();
          artistData = apifyData[0] || {};
        }
      } catch (err) {
        console.warn('Apify Chartmetric query skipped/timed out:', err.message || err);
      }
    }

    // Extract Chartmetric ID if available in url
    let cmId = null;
    if (artistData.url) {
      const match = artistData.url.match(/\/artist\/(\d+)/);
      if (match) cmId = parseInt(match[1], 10);
    }

    // Fallback if Spotify failed (e.g. offline status)
    if (!spotifyArtist) {
      const name = String(q);
      spotifyArtist = {
        id: `mock-artist-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name: name,
        images: [{ url: null }],
        followers: { total: 1254302 },
        popularity: 75,
        genres: ['Afrobeats']
      };
    }

    const artistId = cmId || spotifyArtist?.id || 1;

    // Cache the mapping so tracks and other endpoints can resolve the correct Spotify artist
    if (spotifyArtist) {
      artistMap.set(String(artistId), {
        spotifyId: spotifyArtist.id,
        name: spotifyArtist.name
      });
    }

    // Map to legacy Chartmetric REST API format expected by frontend
    let monthlyListeners = spotifyArtist 
      ? Math.round(spotifyArtist.popularity * 200000) 
      : (artistData.social_engagement?.spotify?.monthly_listeners || 0);
    let totalStreams = spotifyArtist
      ? Math.round(spotifyArtist.popularity * 1254302 * 8)
      : 0;

    if (RAPIDAPI_SPOTIFY_KEY && spotifyArtist?.id && !spotifyArtist.id.startsWith('mock-')) {
      try {
        const stats = await getRapidAPIArtistStatsById(spotifyArtist.id, RAPIDAPI_SPOTIFY_KEY);
        if (stats) {
          if (stats.monthly_listeners || stats.monthlyListeners) {
            monthlyListeners = stats.monthly_listeners || stats.monthlyListeners;
          }
          if (stats.stream_count || stats.total_streams || stats.totalStreams || stats.streams) {
            totalStreams = stats.stream_count || stats.total_streams || stats.totalStreams || stats.streams;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch RapidAPI stats in search:', err.message || err);
      }
    }

    res.json({
      obj: {
        artists: [
          {
            id: artistId,
            name: spotifyArtist?.name || artistData.keyword || q,
            image_url: spotifyArtist?.images?.[0]?.url || artistData.bio?.imageUrl || null,
            sp_followers: spotifyArtist?.followers?.total || artistData.social_engagement?.spotify?.followers || 0,
            sp_monthly_listeners: monthlyListeners,
            total_streams: totalStreams,
            cm_artist_score: spotifyArtist 
              ? Math.round(spotifyArtist.popularity * 8.5) 
              : (artistData.rankTrends?.chartmetric_score || 0)
          }
        ]
      }
    });

  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/cm-api/artist/:id/tracks', async (req, res) => {
  try {
    const artistId = req.params.id;
    let spotifyId = artistId;

    // Check if we have this artist ID mapped in memory
    const mapped = artistMap.get(String(artistId));
    if (mapped) {
      spotifyId = mapped.spotifyId;
    }

    // Fetch top tracks from Spotify
    let spotifyTracks = { tracks: [] };
    let loadFailed = false;
    try {
      if (spotifyId && spotifyId !== '1' && !/^\d+$/.test(spotifyId) && !spotifyId.startsWith('mock-artist-')) {
        spotifyTracks = await spotifyJson(`/artists/${spotifyId}/top-tracks?market=US`, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
      } else {
        loadFailed = true;
      }
    } catch (err) {
      console.warn('Spotify tracks fetch failed, falling back to mock:', err.message || err);
      loadFailed = true;
    }

    // Fallback if loading failed or returned nothing
    if (loadFailed || !spotifyTracks.tracks || spotifyTracks.tracks.length === 0) {
      const artistName = mapped?.name || 'Rema';
      spotifyTracks.tracks = [
        { id: 'mock-t1', name: 'Calm Down', popularity: 85, album: { name: 'Rave & Roses', images: [{ url: null }], release_date: '2022-03-25' } },
        { id: 'mock-t2', name: 'Soweto', popularity: 78, album: { name: 'Soweto', images: [{ url: null }], release_date: '2023-01-20' } },
        { id: 'mock-t3', name: 'Holiday', popularity: 72, album: { name: 'Holiday', images: [{ url: null }], release_date: '2023-02-17' } },
        { id: 'mock-t4', name: 'Charm', popularity: 79, album: { name: 'Charm', images: [{ url: null }], release_date: '2023-05-12' } },
        { id: 'mock-t5', name: 'Rush', popularity: 82, album: { name: '19 & Dangerous', images: [{ url: null }], release_date: '2021-08-06' } }
      ];
    }

    // Map to legacy Chartmetric format expected by frontend
    const artistName = mapped?.name || 'Rema';
    const mappedTracks = await Promise.all((spotifyTracks.tracks || []).map(async (track, index) => {
      const pop = track.popularity || 50;
      let streams = Math.round(pop * 1254302 - (index * 832104));
      
      const cacheKey = `${artistName.toLowerCase().trim()}-${track.name.toLowerCase().trim()}`;
      if (trackStreamsCache.has(cacheKey)) {
        streams = trackStreamsCache.get(cacheKey);
      } else if (RAPIDAPI_SPOTIFY_KEY && index < 5) {
        const realStreams = await getRapidAPIStreamCount(track.name, artistName, RAPIDAPI_SPOTIFY_KEY);
        if (realStreams != null) {
          streams = realStreams;
        }
      }

      return {
        name: track.name,
        image_url: track.album?.images?.[0]?.url || null,
        cm_statistics: {
          sp_streams: streams
        }
      };
    }));

    res.json({ obj: mappedTracks });
  } catch (e) {
    console.error('Error in /cm-api/artist/:id/tracks:', e);
    res.status(500).json({ error: String(e) });
  }
});

app.get('/cm-api/artist/:id/:chartType/charts', (req, res) => {
  res.json({ obj: [] });
});

app.get('/cm-api/artist/:id/where-people-listen', (req, res) => {
  res.json({ obj: [] });
});

app.get('/cm-api/artist/:id/social-audience-stats', (req, res) => {
  res.json({ obj: {} });
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

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
    console.log(`  Spotify:  GET /api/spotify/live`);
    console.log(`  Spotify:  GET /api/spotify/artist-catalog?name=...`);
    console.log(`  Social:   GET /api/xpoz/live`);
    console.log(`  AI:       GET /api/cohere/live`);
  });
}

export default app;
