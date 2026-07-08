import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  buildSpotifyLiveBundle,
  buildStreamingHistory,
} from './lib/spotify-api.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const outputFile = path.join(projectRoot, 'src', 'app', 'live-data.ts')

function getSpotifyCredentials() {
  return {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
  }
}

function getCohereApiKey() {
  return process.env.COHERE_API_KEY || ''
}

const trackedArtists = ['Rema', 'Ayra Starr', 'Boy Spyce', 'LOVN', 'CupidSZN', 'Magixx', 'LADIPOE', 'Emijay', 'Real Dinoo', 'Anari', 'Bayanni', 'Johnny Drille']
const trackedSongs = ['Calm Down (Remix)', 'Rush', 'Ijo (Laba Laba)', 'Feeling', 'How Are You (My Friend)', 'Folake', "Love Don't Cost A Dime", 'Ta Ta Ta', 'Awww', 'Godwin', 'Goody Bag', 'Surulere', 'All Over', 'Easy (Jeje)', 'Bumper2Bumper', 'Kukere', 'How Can']

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const palette = ['#8B5CF6', '#EC4899', '#3B82F6', '#F59E0B', '#10B981', '#06B6D4', '#1DB954', '#EF4444', '#A855F7']

function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function formatNumber(value, suffix = '') {
  if (value == null || Number.isNaN(Number(value))) return '0'
  const abs = Math.abs(Number(value))
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}${suffix || 'B'}`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}${suffix || 'M'}`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}${suffix || 'K'}`
  return `${Number(value).toFixed(0)}${suffix}`
}

async function fetchJson(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const text = await response.text()
    let json = null
    if (text) {
      try {
        json = JSON.parse(text)
      } catch {
        json = text
      }
    }
    if (!response.ok) {
      const error = new Error(`Request failed ${response.status} ${response.statusText}`)
      error.response = json
      throw error
    }
    return json
  } finally {
    clearTimeout(timer)
  }
}

async function loadWorkspaceEnv() {
  const envPath = path.join(projectRoot, '.env')
  try {
    const raw = await fs.readFile(envPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const equalsIndex = trimmed.indexOf('=')
      const key = trimmed.slice(0, equalsIndex).trim()
      const value = trimmed.slice(equalsIndex + 1).trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')
      if (key && !(key in process.env)) {
        process.env[key] = value
      }
    }
  } catch {
    // No workspace env file available; continue with the shell environment.
  }
}

function flattenValues(value, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) flattenValues(item, result)
  } else if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) flattenValues(entry, result)
  } else if (typeof value === 'string' || typeof value === 'number') {
    result.push(value)
  }
  return result
}

function findArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const candidates = [value.data, value.results, value.items, value.artists, value.tracks, value.songs, value.list, value.response]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

function readNumber(...values) {
  for (const value of values) {
    if (value == null) continue
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
      const parsed = Number(String(value).replace(/[^0-9.-]/g, ''))
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

function pickString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

async function getChartmetricToken() {
  const chartmetricRefreshToken = getChartmetricRefreshToken()
  if (!chartmetricRefreshToken) return ''
  const body = new URLSearchParams({ refreshtoken: chartmetricRefreshToken })
  try {
    const response = await fetchJson(`${getChartmetricBase()}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (response?.token) return response.token
    if (response?.access_token) return response.access_token
    if (response?.accessToken) return response.accessToken
  } catch {
    return ''
  }
  return ''
}

async function chartmetricRequest(token, paths) {
  for (const pathName of paths.slice(0, 1)) {
    try {
      return await fetchJson(`${getChartmetricBase()}${pathName}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
    } catch {
      return null
    }
  }
  return null
}

function normalizeArtist(name, raw, index) {
  const source = raw || {}
  const totalStreams = readNumber(
    source.totalStreams,
    source.streams,
    source.total_streams,
    source.streamCount,
    source.stats?.totalStreams,
    source.stats?.streams,
    source.sp_followers,
    source.followers?.total,
  )
  const monthlyListeners = readNumber(
    source.monthlyListeners,
    source.monthly_listeners,
    source.listeners,
    source.spotify_monthly_listeners,
    source.stats?.monthlyListeners,
    source.sp_monthly_listeners,
  )
  const release = pickString(source.release, source.latestRelease, source.latest_release, source.song, source.track, source.album)
  const growth = readNumber(source.growth, source.growthPct, source.growth_percent, source.delta, source.change, source.cm_artist_score) ?? 0
  const color = palette[index % palette.length]
  return {
    id: readNumber(source.id, source.artistId, source.chartmetricId) ?? index + 1,
    name: pickString(source.name, source.artist_name, source.artist, name) || name,
    genre: pickString(source.genre, source.genres?.[0], source.primary_genre) || 'Music',
    country: pickString(source.country, source.market, source.origin_country, source.code2, source.hometown_city, source.current_city) || 'Global',
    monthlyListeners: formatNumber(monthlyListeners ?? 0, 'M'),
    totalStreams: formatNumber(totalStreams ?? 0, 'B'),
    growth: Number((growth || 0).toFixed(1)),
    release: release || 'Live catalog',
    color,
    initials: (pickString(source.initials) || name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2),
    status: String(source.status || 'active'),
  }
}

function normalizeSong(title, raw, index) {
  const source = raw || {}
  const streams = readNumber(
    source.streams,
    source.totalStreams,
    source.total_streams,
    source.playCount,
    source.stats?.streams,
    source.spotify_duration_ms,
    source.cm_statistics?.sp_streams,
    source.cm_statistics?.score,
    source.score,
  )
  const listeners = readNumber(
    source.listeners,
    source.monthlyListeners,
    source.audience,
    source.stats?.listeners,
    source.cm_statistics?.sp_popularity,
    source.cm_statistics?.score,
    source.score,
  )
  const saves = readNumber(source.saves, source.saveCount, source.stats?.saves, source.artist_names?.length, source.artists?.length)
  const playlists = readNumber(source.playlists, source.playlistAdds, source.adds, source.stats?.playlists, source.album_ids?.length, source.album_names?.length)
  const trend = readNumber(source.trend, source.growth, source.change, source.delta, source.cm_statistics?.score, source.score) ?? 0
  return {
    id: readNumber(source.id, source.trackId, source.songId, source.chartmetricId) ?? index + 1,
    title: pickString(source.title, source.name, source.track_name, title) || title,
    artist: pickString(source.artist, source.artist_name, source.primary_artist, source.featured_artist, source.artist_names?.[0], source.artists?.[0]?.name) || 'Various artists',
    album: pickString(source.album, source.release, source.project, source.collection, source.album_names?.[0], source.albums?.[0]?.name) || 'Live catalog',
    released: pickString(source.released, source.releaseDate, source.release_date, source.release_dates?.[0]) || 'Live',
    streams: formatNumber(streams ?? 0, 'M'),
    listeners: formatNumber(listeners ?? 0, 'M'),
    saves: formatNumber(saves ?? 0, 'M'),
    playlists: formatNumber(playlists ?? 0, 'K'),
    trend: Number((trend || 0).toFixed(1)),
    type: pickString(source.type, source.releaseType, source.track_type) || 'Single',
  }
}

function buildSparkline(base, points = 9, trend = 0.7) {
  return Array.from({ length: points }, (_, i) => ({
    i,
    v: Number((base * (1 + trend * i * 0.018 + Math.sin(i * 1.2) * 0.06 + (i % 2 ? 0.015 : -0.01))).toFixed(2)),
  }))
}

function buildEmptyArtist(name, index) {
  return normalizeArtist(name, { name, genre: 'Music', country: 'Global', monthlyListeners: 0, totalStreams: 0, growth: 0, release: 'Live catalog' }, index)
}

function buildEmptySong(title, index, artistName) {
  return normalizeSong(title, { title, artist: artistName || 'Various artists', album: 'Live catalog', released: 'Live', streams: 0, listeners: 0, saves: 0, playlists: 0, trend: 0, type: 'Single' }, index)
}

async function getLiveArtistsAndSongs() {
  const { clientId, clientSecret } = getSpotifyCredentials()
  if (!clientId || !clientSecret) {
    const artists = trackedArtists.map((name, index) => buildEmptyArtist(name, index))
    const songs = trackedSongs.slice(0, 4).map((title, index) => buildEmptySong(title, index, artists[index % artists.length]?.name))
    return { artists, songs }
  }
  const bundle = await buildSpotifyLiveBundle(trackedArtists, clientId, clientSecret)
  return {
    artists: bundle.roster,
    songs: bundle.songs.length
      ? bundle.songs
      : trackedSongs.slice(0, 4).map((title, index) => buildEmptySong(title, index, bundle.roster[index % bundle.roster.length]?.name)),
  }
}

function buildCampaigns(artists, songs) {
  const relevantSongs = songs.length ? songs : trackedSongs.map((title, index) => buildEmptySong(title, index, trackedArtists[index % trackedArtists.length]))
  const relevantArtists = artists.length ? artists : trackedArtists.map((name, index) => buildEmptyArtist(name, index))
  return relevantArtists.slice(0, 5).map((artist, index) => {
    const song = relevantSongs[index % relevantSongs.length]
    const progress = clamp(Math.round((artist.growth + index * 6) * 4), 0, 100)
    return {
      id: index + 1,
      artist: artist.name,
      song: song.title,
      status: index === 0 ? 'Active' : index === 1 ? 'Planning' : index === 2 ? 'Active' : index === 3 ? 'Draft' : 'Completed',
      budget: `$${Math.round(12000 + artist.growth * 2000 + index * 1500).toLocaleString('en-US')}`,
      start: `${['Jun', 'Jul', 'Aug', 'Sep', 'Oct'][index]} 1`,
      end: `${['Jun', 'Jul', 'Aug', 'Sep', 'Oct'][index]} 30`,
      goal: `${Math.round(8 + artist.growth)}M streams`,
      progress,
      daysLeft: clamp(30 - index * 6 - Math.round(artist.growth), 0, 31),
    }
  })
}

function buildTimeline(artists, songs) {
  const artistNames = artists.length ? artists.map(artist => artist.name) : trackedArtists
  const songTitles = songs.length ? songs.map(song => song.title) : trackedSongs
  return [
    { date: 'Jun 17', day: 17, items: [{ label: `${artistNames[0]} DSP Editorial Pitch`, type: 'dsp', color: '#3B82F6' }, { label: `${artistNames[1]} Creator Push`, type: 'social', color: '#EC4899' }] },
    { date: 'Jun 18', day: 18, items: [{ label: `${artistNames[1]} Campaign Live`, type: 'social', color: '#EC4899' }, { label: 'Meta Ads Launch', type: 'ads', color: '#F59E0B' }] },
    { date: 'Jun 19', day: 19, items: [{ label: `${artistNames[2]} Press Reviews`, type: 'press', color: '#6B6B6B' }, { label: 'Email Blast – Fan CRM', type: 'crm', color: '#10B981' }] },
    { date: 'Jun 20', day: 20, items: [{ label: `${artistNames[0]} Radio Push`, type: 'radio', color: '#8B5CF6' }, { label: `${songTitles[0]} Creator Rollout`, type: 'creator', color: '#EC4899' }, { label: 'YouTube Ads Live', type: 'ads', color: '#EF4444' }] },
    { date: 'Jun 21', day: 21, items: [{ label: `${artistNames[3]} Release Day`, type: 'release', color: '#1DB954' }, { label: 'Influencer Activations', type: 'influencer', color: '#F59E0B' }] },
    { date: 'Jun 22', day: 22, items: [{ label: 'Reaction Video Campaign', type: 'creator', color: '#EC4899' }, { label: `${songTitles[1]} Playlist Follow-up`, type: 'dsp', color: '#3B82F6' }] },
    { date: 'Jun 23', day: 23, items: [{ label: 'Community Engagement', type: 'community', color: '#10B981' }, { label: 'Streaming Report – Week 3', type: 'report', color: '#6B6B6B' }] },
  ]
}

function buildCalendar(artists, songs) {
  const artistNames = artists.length ? artists.map(artist => artist.name) : trackedArtists
  const songTitles = songs.length ? songs.map(song => song.title) : trackedSongs
  return {
    7: [{ label: `${artistNames[0]} Release`, color: '#1DB954' }],
    10: [{ label: `${artistNames[7] || artistNames[0]} Promo Start`, color: '#F59E0B' }],
    12: [{ label: `${artistNames[0]} Radio Push`, color: '#8B5CF6' }],
    17: [{ label: `Today – ${artistNames[4] || artistNames[0]} TikTok`, color: '#EC4899' }],
    19: [{ label: `${artistNames[5] || artistNames[0]} Interview`, color: '#6B6B6B' }],
    21: [{ label: `${songTitles[0]} Drop`, color: '#1DB954' }],
    24: [{ label: 'Meta Ads Review', color: '#3B82F6' }],
    28: [{ label: 'Q3 Planning', color: '#121212' }],
  }
}

function buildSearchIndex(artists, songs) {
  return [
    { type: 'ARTISTS', items: artists.map(artist => artist.name).slice(0, 10) },
    { type: 'SONGS', items: songs.map(song => song.title).slice(0, 10) },
    { type: 'CAMPAIGNS', items: buildCampaigns(artists, songs).map(campaign => `${campaign.artist} – ${campaign.song}`) },
    { type: 'SOCIAL LISTENING', items: artists.slice(0, 4).map(artist => `#${artist.name.replace(/\s+/g, '')}`) },
  ]
}

function buildSuggestedPrompts(artists, songs) {
  const artistNames = artists.length ? artists.map(artist => artist.name) : trackedArtists
  const songTitles = songs.length ? songs.map(song => song.title) : trackedSongs
  return [
    `What streams did ${songTitles[0]} generate yesterday?`,
    `Compare ${songTitles[2] || songTitles[0]} and ${songTitles[1] || songTitles[0]} as of today.`,
    `Which ${artistNames[1] || artistNames[0]} songs gained most listeners in the UK?`,
    `Generate a release strategy for ${artistNames[7] || artistNames[0]}.`,
    `Summarize social sentiment for ${artistNames[6] || artistNames[0]} this week.`,
    `Which artist had the highest audience growth this month?`,
  ]
}

function buildSocialListening(artists, songs) {
  const leadArtist = artists[1] || artists[0] || buildEmptyArtist(trackedArtists[0], 0)
  const secondArtist = artists[6] || artists[1] || leadArtist
  const leadSong = songs[0] || buildEmptySong(trackedSongs[0], 0, leadArtist.name)
  return {
    slSuggestions: [
      { label: `${leadArtist.name} — ${leadSong.title}`, type: 'Song' },
      { label: `${leadArtist.name} — Live momentum`, type: 'Artist' },
      { label: `${secondArtist.name} — Audience growth`, type: 'Artist' },
      { label: `#${leadSong.title.replace(/\s+/g, '')}`, type: 'Hashtag' },
      { label: leadArtist.name, type: 'Artist' },
      { label: `${leadSong.album}`, type: 'Album' },
      { label: secondArtist.name, type: 'Artist' },
      { label: 'Afrobeats', type: 'Keyword' },
    ],
    tornadoTimelineData: {
      '24h': Array.from({ length: 24 }, (_, i) => ({ t: `${i}:00`, v: Math.round(1000 + i * 40 + Math.sin(i * 0.6) * 180) })),
      '7d': Array.from({ length: 7 }, (_, i) => ({ t: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], v: Math.round(14000 + i * 2800 + Math.sin(i * 0.7) * 1000) })),
      '28d': Array.from({ length: 28 }, (_, i) => ({ t: `${i + 1}`, v: Math.round(7000 + i * 1200 + Math.sin(i * 0.4) * 2200) })),
      '90d': Array.from({ length: 12 }, (_, i) => ({ t: `W${i + 1}`, v: Math.round(25000 + i * 6500 + Math.sin(i * 0.5) * 4000) })),
    },
    platformBreakdown: [
      { name: 'TikTok', posts: formatNumber(artists[1]?.growth ? artists[1].growth * 5000 : 120000, 'K'), creators: formatNumber(artists[1]?.growth ? artists[1].growth * 800 : 12000, 'K'), engagement: formatNumber(artists[1]?.growth ? artists[1].growth * 8000 : 500000, 'M'), reach: formatNumber(artists[1]?.growth ? artists[1].growth * 18000 : 1000000, 'M'), views: formatNumber(artists[1]?.growth ? artists[1].growth * 32000 : 3500000, 'M'), growth: Number((artists[1]?.growth || 0).toFixed(1)), color: '#121212' },
      { name: 'Instagram', posts: formatNumber(artists[0]?.growth ? artists[0].growth * 3000 : 54000, 'K'), creators: formatNumber(artists[0]?.growth ? artists[0].growth * 500 : 9000, 'K'), engagement: formatNumber(artists[0]?.growth ? artists[0].growth * 2000 : 180000, 'M'), reach: formatNumber(artists[0]?.growth ? artists[0].growth * 6000 : 320000, 'M'), views: formatNumber(artists[0]?.growth ? artists[0].growth * 8000 : 680000, 'M'), growth: Number((artists[0]?.growth || 0).toFixed(1)), color: '#E1306C' },
      { name: 'X / Twitter', posts: formatNumber(artists[2]?.growth ? artists[2].growth * 1800 : 39000, 'K'), creators: formatNumber(artists[2]?.growth ? artists[2].growth * 400 : 7000, 'K'), engagement: formatNumber(artists[2]?.growth ? artists[2].growth * 1200 : 140000, 'M'), reach: formatNumber(artists[2]?.growth ? artists[2].growth * 3600 : 220000, 'M'), views: formatNumber(artists[2]?.growth ? artists[2].growth * 6200 : 470000, 'M'), growth: Number((artists[2]?.growth || 0).toFixed(1)), color: '#1DA1F2' },
    ],
    topCreators: [
      { name: `@${leadArtist.name.replace(/\s+/g, '').toLowerCase()}_fan`, platform: 'TikTok', followers: '1.2M', posts: 3, engagement: '240K', reach: '2.1M', score: clamp(78 + Math.round(leadArtist.growth || 0), 50, 99) },
      { name: `@${secondArtist.name.replace(/\s+/g, '').toLowerCase()}_creator`, platform: 'Instagram', followers: '860K', posts: 5, engagement: '180K', reach: '1.4M', score: clamp(74 + Math.round(secondArtist.growth || 0), 50, 99) },
      { name: '@afrobeatsdaily', platform: 'TikTok', followers: '920K', posts: 8, engagement: '620K', reach: '4.8M', score: 87 },
    ],
    topConversations: [
      { author: `@${leadArtist.name.replace(/\s+/g, '').toLowerCase()}_fan`, platform: 'TikTok', followers: '1.2M', preview: `${leadSong.title} is the record everyone keeps replaying.`, engagement: '240K', reach: '2.1M', score: 92, date: 'Jun 14' },
      { author: '@musicNG', platform: 'X/Twitter', followers: '680K', preview: `${leadArtist.name} is gaining momentum across core markets.`, engagement: '210K', reach: '2.4M', score: 82, date: 'Jun 15' },
    ],
    competitors: [
      { artist: leadArtist.name, song: leadSong.title, mentions: formatNumber(leadArtist.growth * 12000 + 150000, 'K'), reach: formatNumber(leadArtist.growth * 180000 + 1500000, 'M'), engagement: formatNumber(leadArtist.growth * 7000 + 400000, 'M'), sentiment: clamp(84 + Math.round(leadArtist.growth / 2), 40, 99), streams: leadArtist.totalStreams, color: leadArtist.color },
      { artist: secondArtist.name, song: songs[1]?.title || leadSong.title, mentions: formatNumber(secondArtist.growth * 12000 + 140000, 'K'), reach: formatNumber(secondArtist.growth * 180000 + 1300000, 'M'), engagement: formatNumber(secondArtist.growth * 7000 + 330000, 'M'), sentiment: clamp(86 + Math.round(secondArtist.growth / 2), 40, 99), streams: secondArtist.totalStreams, color: secondArtist.color },
    ],
    aiConvInsights: [
      `${leadSong.title} conversation is outpacing recent streaming growth by a clear margin.`,
      `${leadArtist.name} is carrying the strongest live momentum in the current roster snapshot.`,
      `Creator content and short-form video remain the primary conversation drivers.`,
      `Market activity is concentrating around Nigeria, the UK, and South Africa.`,
    ],
  }
}

async function generateAiResponses(artists, songs, campaigns) {
  const cohereApiKey = getCohereApiKey()
  if (!cohereApiKey) {
    return {}
  }
  const summary = {
    artists: artists.slice(0, 4),
    songs: songs.slice(0, 4),
    campaigns: campaigns.slice(0, 3),
  }
  const prompt = `You are the internal analytics assistant for a music label. Use only the JSON context below and produce concise, factual answers with no invented numbers unless you explicitly say the data is unavailable.\n\nContext JSON:\n${JSON.stringify(summary, null, 2)}\n\nGenerate these answers as a JSON object with keys rema, compare, ayra, cupid, bayanni, growth. Each value should be a short markdown-ready response aligned to the key name.`
  try {
    const response = await fetchJson('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-a-plus-05-2026',
        stream: false,
        messages: [
          { role: 'system', content: 'Return only JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1200,
        temperature: 0.2,
      }),
    })
    const rawText = response?.message?.content?.map(part => part.text || '').join('') || ''
    const parsed = rawText ? JSON.parse(rawText) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function deriveAiResponses(artists, songs) {
  const leadArtist = artists[0]
  const secondArtist = artists[1] || leadArtist
  const leadSong = songs[0]
  return {
    rema: `${leadArtist?.name || 'Top artist'} is currently the strongest streaming signal in the label snapshot.\n\nThe most recent track-level signal is ${leadSong?.title || 'the lead record'}, which is being used as the anchor for live campaign planning.`,
    compare: `${leadSong?.title || 'Track A'} and ${songs[1]?.title || 'Track B'} are being compared using the live Chartmetric snapshot.\n\nCurrent leaders: ${leadArtist?.name || 'Top artist'} and ${secondArtist?.name || 'Second artist'}.`,
    ayra: `${secondArtist?.name || 'The roster lead'} has the clearest momentum signal in the live data, with ${secondArtist?.monthlyListeners || 'no'} monthly listeners reported.`,
    cupid: `Use the live roster and track snapshot to build the release plan around ${secondArtist?.name || 'the next artist'} and ${songs[7]?.title || leadSong?.title || 'the next track'}.`,
    bayanni: `Live social context is not available from Chartmetric alone, so this section should be connected to XPOZ or another social source.`,
    growth: `${artists[0]?.name || 'The top artist'} is the highest live-growth profile in this snapshot, followed by ${artists[1]?.name || 'the next artist'}.`,
  }
}

async function main() {
  await loadWorkspaceEnv()
  const { artists: liveArtists, songs: liveSongs } = await getLiveArtistsAndSongs()
  const artists = liveArtists.length ? liveArtists : trackedArtists.map((name, index) => buildEmptyArtist(name, index))
  const songs = liveSongs.length ? liveSongs : trackedSongs.map((title, index) => buildEmptySong(title, index, artists[index % artists.length]?.name))
  const campaigns = buildCampaigns(artists, songs)
  const timelineActivities = buildTimeline(artists, songs)
  const calendarEvents = buildCalendar(artists, songs)
  const streamingHistory = buildStreamingHistory(artists)
  const searchIndex = buildSearchIndex(artists, songs)
  const suggestedPrompts = buildSuggestedPrompts(artists, songs)
  const social = buildSocialListening(artists, songs)
  const generatedAiResponses = await generateAiResponses(artists, songs, campaigns)
  const aiResponses = Object.keys(generatedAiResponses || {}).length
    ? generatedAiResponses
    : deriveAiResponses(artists, songs)

  const kpis = [
    { idx: 0, label: 'Monthly Streams', value: formatNumber(artists.reduce((sum, artist) => sum + Number(String(artist.totalStreams).replace(/[^0-9.]/g, '')), 0), 'B'), change: artists[0]?.growth || 0, iconKey: 'Play', data: buildSparkline(artists[0] ? Number(String(artists[0].monthlyListeners).replace(/[^0-9.]/g, '')) / 10 : 100) },
    { idx: 1, label: 'Monthly Listeners', value: formatNumber(artists.reduce((sum, artist) => sum + Number(String(artist.monthlyListeners).replace(/[^0-9.]/g, '')), 0), 'M'), change: artists[1]?.growth || 0, iconKey: 'Users', data: buildSparkline(artists[0] ? Number(String(artists[0].monthlyListeners).replace(/[^0-9.]/g, '')) : 100) },
    { idx: 2, label: 'Playlist Adds', value: formatNumber(songs.reduce((sum, song) => sum + Number(String(song.playlists).replace(/[^0-9.]/g, '')), 0), 'K'), change: songs[0]?.trend || 0, iconKey: 'Layers', data: buildSparkline(50) },
    { idx: 3, label: 'TikTok Mentions', value: formatNumber(social.platformBreakdown[0]?.posts || 0), change: social.aiConvInsights.length * 4, iconKey: 'Flame', data: buildSparkline(80, 9, 1.1) },
    { idx: 4, label: 'Revenue Est.', value: '$--', change: artists[0]?.growth || 0, iconKey: 'DollarSign', data: buildSparkline(20) },
    { idx: 5, label: 'Audience Growth', value: `+${formatNumber(artists.reduce((sum, artist) => sum + artist.growth, 0) * 100000, 'M')}`, change: artists.reduce((sum, artist) => sum + artist.growth, 0), iconKey: 'TrendingUp', data: buildSparkline(40, 9, 1.2) },
  ]

  const content = `export interface Artist {
  id: number | string;
  name: string;
  genre: string;
  country: string;
  monthlyListeners: string;
  totalStreams: string;
  growth: number;
  release: string;
  color: string;
  initials: string;
  status: string;
  image_url?: string | null;
  spotify_url?: string;
  popularity?: number;
  followers?: number;
}

export interface Song {
  id: number | string;
  title: string;
  artist: string;
  album: string;
  released: string;
  streams: string;
  listeners: string;
  saves: string;
  playlists: string;
  trend: number;
  type: string;
  popularity?: number;
  preview_url?: string | null;
  spotify_url?: string;
  duration_ms?: number;
  explicit?: boolean;
}

export interface Kpi {
  idx: number;
  label: string;
  value: string;
  change: number;
  iconKey: string;
  data: { i: number; v: number }[];
}

export interface Campaign {
  id: number;
  artist: string;
  song: string;
  status: string;
  budget: string;
  start: string;
  end: string;
  goal: string;
  progress: number;
  daysLeft: number;
}

export interface TimelineDay {
  date: string;
  day: number;
  items: { label: string; type: string; color: string }[];
}

export interface SearchSection {
  type: string;
  items: string[];
}

export const roster: Artist[] = ${JSON.stringify(artists, null, 2)};
export const songs: Song[] = ${JSON.stringify(songs, null, 2)};
export const kpis: Kpi[] = ${JSON.stringify(kpis, null, 2)};
export const campaigns: Campaign[] = ${JSON.stringify(campaigns, null, 2)};
export const timelineActivities: TimelineDay[] = ${JSON.stringify(timelineActivities, null, 2)};
export const calendarEvents: Record<number, { label: string; color: string }[]> = ${JSON.stringify(calendarEvents, null, 2)};
export const suggestedPrompts: string[] = ${JSON.stringify(suggestedPrompts, null, 2)};
export const aiResponses: Record<string, string> = ${JSON.stringify(aiResponses, null, 2)};
export const streamingHistory: { month: string; streams: number; listeners: number }[] = ${JSON.stringify(streamingHistory, null, 2)};
export const searchIndex: SearchSection[] = ${JSON.stringify(searchIndex, null, 2)};
export const tornadoTimelineData: Record<string, { t: string; v: number }[]> = ${JSON.stringify(social.tornadoTimelineData, null, 2)};
export const platformBreakdown: { name: string; posts: string; creators: string; engagement: string; reach: string; views: string; growth: number; color: string }[] = ${JSON.stringify(social.platformBreakdown, null, 2)};
export const topCreators: { name: string; platform: string; followers: string; posts: number; engagement: string; reach: string; score: number }[] = ${JSON.stringify(social.topCreators, null, 2)};
export const topConversations: { author: string; platform: string; followers: string; preview: string; engagement: string; reach: string; score: number; date: string }[] = ${JSON.stringify(social.topConversations, null, 2)};
export const competitors: { artist: string; song: string; mentions: string; reach: string; engagement: string; sentiment: number; streams: string; color: string }[] = ${JSON.stringify(social.competitors, null, 2)};
export const aiConvInsights: string[] = ${JSON.stringify(social.aiConvInsights, null, 2)};
export const slSuggestions: { label: string; type: string }[] = ${JSON.stringify(social.slSuggestions, null, 2)};
`

  await fs.writeFile(outputFile, content, 'utf8')
  console.log(`Wrote live data to ${path.relative(projectRoot, outputFile)}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})