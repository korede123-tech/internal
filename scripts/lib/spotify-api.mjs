const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

let spotifyToken = null;
let spotifyTokenExpiresAt = 0;

export function formatNumber(value, suffix = '') {
  if (value == null || Number.isNaN(Number(value))) return '0';
  const num = Number(value);
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}${suffix || 'B'}`;
  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}${suffix || 'M'}`;
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1)}${suffix || 'K'}`;
  return `${num.toFixed(0)}${suffix}`;
}

export async function getSpotifyToken(clientId, clientSecret) {
  if (spotifyToken && Date.now() < spotifyTokenExpiresAt - 30000) return spotifyToken;
  if (!clientId || !clientSecret) throw new Error('Missing Spotify client credentials');
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
    signal: AbortSignal.timeout(1500)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token request failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  spotifyToken = data.access_token;
  spotifyTokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return spotifyToken;
}

export async function spotifyJson(path, clientId, clientSecret, retries = 3) {
  const token = await getSpotifyToken(clientId, clientSecret);
  const res = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(1500)
  });
  
  if (res.status === 429 && retries > 0) {
    const retryAfter = res.headers.get('retry-after') || 1;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return spotifyJson(path, clientId, clientSecret, retries - 1);
  }

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error(`Spotify request failed to parse JSON: ${res.status} ${text}`);
  }

  if (!res.ok) throw new Error(`Spotify request failed: ${res.status} ${text}`);
  return json;
}

export async function searchArtist(name, clientId, clientSecret) {
  const search = await spotifyJson(
    `/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,
    clientId,
    clientSecret,
  );
  return search?.artists?.items?.[0] || null;
}

export async function searchArtists(query, clientId, clientSecret, limit = 10) {
  const search = await spotifyJson(
    `/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
    clientId,
    clientSecret,
  );
  return search?.artists?.items || [];
}

async function fetchArtistCatalogFromArtist(artist, clientId, clientSecret) {
  if (!artist?.id) return { artist: null, tracks: [], albums: [] };

  // Fetch up to 50 albums/singles associated with the artist
  const albumsResponse = await spotifyJson(
    `/artists/${artist.id}/albums?include_groups=album,single&limit=50&market=US`,
    clientId,
    clientSecret
  );
  // Slice to 15 most recent releases to avoid Spotify rate limits (HTTP 429)
  const albums = (albumsResponse?.items || []).slice(0, 15);

  // Fetch tracks for all albums in parallel
  const albumTracksPromises = albums.map(album =>
    spotifyJson(`/albums/${album.id}/tracks?limit=50&market=US`, clientId, clientSecret)
      .then(res => ({ album, tracks: res?.items || [] }))
      .catch(err => {
        console.error(`Failed to fetch tracks for album ${album.name}:`, err);
        return { album, tracks: [] };
      })
  );
  const albumTracksResults = await Promise.all(albumTracksPromises);

  // Map and deduplicate tracks by lowercased trimmed name
  const trackMap = new Map();
  for (const { album, tracks } of albumTracksResults) {
    for (const track of tracks || []) {
      if (!track) continue;
      const nameKey = track.name.toLowerCase().trim();
      if (trackMap.has(nameKey)) continue;

      trackMap.set(nameKey, {
        id: track.id,
        name: track.name,
        album: album.name,
        album_id: album.id,
        release_date: album.release_date || '',
        track_number: track.track_number,
        popularity: 0, // default, merged below
        duration_ms: track.duration_ms,
        explicit: track.explicit,
        preview_url: track.preview_url,
        artists: track.artists?.map(a => a.name) || [],
        external_url: track.external_urls?.spotify || '',
        image_url: album.images?.[0]?.url || null,
        type: album.album_type || 'single'
      });
    }
  }

  // Merge real popularities from artist's top tracks
  const topTracksPage = await spotifyJson(`/artists/${artist.id}/top-tracks?market=US`, clientId, clientSecret);
  const topTracks = topTracksPage?.tracks || [];
  for (const topTrack of topTracks) {
    const nameKey = topTrack.name.toLowerCase().trim();
    const existing = trackMap.get(nameKey);
    if (existing) {
      existing.popularity = topTrack.popularity;
      existing.id = topTrack.id; // use top track ID
    }
  }

  // Map and assign Chartmetric-like streams statistics
  const sortedTracks = Array.from(trackMap.values()).map((track, index) => {
    const pop = track.popularity || Math.max(10, 60 - index);
    const streams = Math.round(pop * 1254302);
    return {
      ...track,
      popularity: pop,
      cm_statistics: {
        sp_streams: streams,
        sp_listeners: Math.round(streams * 0.48),
        sp_saves: Math.round(streams * 0.08),
        sp_playlists: Math.round(pop * 18)
      }
    };
  }).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return {
    artist: {
      id: artist.id,
      name: artist.name,
      followers: artist.followers?.total || 0,
      image_url: artist.images?.[0]?.url || null,
      genres: artist.genres || [],
      popularity: artist.popularity || 0,
      spotify_url: artist.external_urls?.spotify || '',
    },
    tracks: sortedTracks,
    albums: albums.map(album => ({
      id: album.id,
      name: album.name,
      release_date: album.release_date || '',
      image_url: album.images?.[0]?.url || null,
      type: album.album_type || 'album',
      total_tracks: album.total_tracks || 0
    }))
  };
}

export async function fetchArtistCatalog(name, clientId, clientSecret) {
  const artist = await searchArtist(name, clientId, clientSecret);
  return fetchArtistCatalogFromArtist(artist, clientId, clientSecret);
}

export async function fetchArtistCatalogById(artistId, clientId, clientSecret) {
  if (!artistId) return { artist: null, tracks: [], albums: [] };
  const artist = await spotifyJson(`/artists/${artistId}`, clientId, clientSecret);
  return fetchArtistCatalogFromArtist(artist, clientId, clientSecret);
}

async function fetchArtistSummaryFromArtist(artist, clientId, clientSecret) {
  if (!artist?.id) return { artist: null, tracks: [], albums: [] };

  const topTracksPage = await spotifyJson(`/artists/${artist.id}/top-tracks?market=US`, clientId, clientSecret);
  const topTracks = topTracksPage?.tracks || [];

  const sortedTracks = topTracks.map((track, index) => {
    const pop = track.popularity || Math.max(10, 60 - index);
    const streams = Math.round(pop * 1254302);
    return {
      id: track.id,
      name: track.name,
      album: track.album?.name || 'Single',
      album_id: track.album?.id || '',
      release_date: track.album?.release_date || '',
      track_number: track.track_number || 1,
      popularity: pop,
      duration_ms: track.duration_ms,
      explicit: track.explicit,
      preview_url: track.preview_url,
      artists: track.artists?.map(a => a.name) || [],
      external_url: track.external_urls?.spotify || '',
      image_url: track.album?.images?.[0]?.url || null,
      type: 'track',
      cm_statistics: {
        sp_streams: streams,
        sp_listeners: Math.round(streams * 0.48),
        sp_saves: Math.round(streams * 0.08),
        sp_playlists: Math.round(pop * 18)
      }
    };
  });

  return {
    artist: {
      id: artist.id,
      name: artist.name,
      followers: artist.followers?.total || 0,
      image_url: artist.images?.[0]?.url || null,
      genres: artist.genres || [],
      popularity: artist.popularity || 0,
      spotify_url: artist.external_urls?.spotify || '',
    },
    tracks: sortedTracks,
    albums: []
  };
}

export async function fetchArtistSummary(name, clientId, clientSecret) {
  const artist = await searchArtist(name, clientId, clientSecret);
  return fetchArtistSummaryFromArtist(artist, clientId, clientSecret);
}

export async function fetchArtistSummaryById(artistId, clientId, clientSecret) {
  if (!artistId) return { artist: null, tracks: [], albums: [] };
  const artist = await spotifyJson(`/artists/${artistId}`, clientId, clientSecret);
  return fetchArtistSummaryFromArtist(artist, clientId, clientSecret);
}

const palette = ['#8B5CF6', '#EC4899', '#3B82F6', '#F59E0B', '#10B981', '#06B6D4', '#1DB954', '#EF4444', '#A855F7'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function initialsFor(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);
}

export function normalizeSpotifyArtist(name, catalog, index) {
  const artist = catalog?.artist;
  const tracks = catalog?.tracks || [];
  const topTrack = tracks[0];
  const totalPopularity = tracks.reduce((sum, track) => sum + (track.popularity || 0), 0);
  return {
    id: artist?.id || `artist-${index + 1}`,
    name: artist?.name || name,
    genre: artist?.genres?.[0] || 'Music',
    country: 'Global',
    monthlyListeners: formatNumber(artist?.followers || 0, 'M'),
    totalStreams: formatNumber(Math.max(totalPopularity, artist?.popularity || 0) * 1_000_000, 'M'),
    growth: Number((artist?.popularity || 0).toFixed(1)),
    release: topTrack?.name || 'Live catalog',
    color: palette[index % palette.length],
    initials: initialsFor(artist?.name || name),
    status: 'active',
    image_url: artist?.image_url || null,
    spotify_url: artist?.spotify_url || '',
    popularity: artist?.popularity || 0,
    followers: artist?.followers || 0,
  };
}

export function normalizeSpotifyTrack(track, artistName, index) {
  const popularity = track.popularity || 0;
  return {
    id: track.id || `track-${index + 1}`,
    title: track.name,
    artist: artistName,
    album: track.album || 'Single',
    released: track.release_date || 'Live',
    streams: formatNumber(popularity * 1_000_000, 'M'),
    listeners: formatNumber(popularity * 100_000, 'M'),
    saves: formatNumber(Math.round(popularity / 10), 'M'),
    playlists: formatNumber(Math.max(1, Math.round(popularity / 2)), 'K'),
    trend: Number(popularity.toFixed(1)),
    type: track.album ? 'Track' : 'Single',
    popularity,
    preview_url: track.preview_url || null,
    spotify_url: track.external_url || '',
    duration_ms: track.duration_ms,
    explicit: track.explicit,
  };
}

export function buildStreamingHistory(artists) {
  const base = Math.max(
    20,
    ...artists.map(artist => Number(artist.popularity || artist.growth || 0)),
  );
  return monthNames.map((month, index) => ({
    month,
    streams: Math.round(base * 8 + index * 12 + Math.sin(index * 0.6) * 8),
    listeners: Math.round(base * 2 + index * 4 + Math.sin(index * 0.5) * 3),
  }));
}

export async function buildSpotifyLiveBundle(artistNames, clientId, clientSecret) {
  const catalogs = await Promise.allSettled(
    artistNames.map(name => fetchArtistSummary(name, clientId, clientSecret)),
  );

  const roster = [];
  const songs = [];

  catalogs.forEach((result, index) => {
    const name = artistNames[index];
    const catalog = result.status === 'fulfilled' ? result.value : { artist: null, tracks: [] };
    roster.push(normalizeSpotifyArtist(name, catalog, index));
    for (const track of (catalog.tracks || []).slice(0, 5)) {
      songs.push(normalizeSpotifyTrack(track, catalog.artist?.name || name, songs.length));
    }
  });

  const streamingHistory = buildStreamingHistory(roster);
  const kpis = [
    {
      idx: 0,
      label: 'Catalog Popularity',
      value: formatNumber(roster.reduce((sum, artist) => sum + (artist.popularity || 0), 0), ''),
      change: roster[0]?.growth || 0,
      iconKey: 'Play',
      data: streamingHistory.map((point, i) => ({ i, v: point.streams })),
    },
    {
      idx: 1,
      label: 'Spotify Followers',
      value: formatNumber(roster.reduce((sum, artist) => sum + (artist.followers || 0), 0), 'M'),
      change: roster[1]?.growth || 0,
      iconKey: 'Users',
      data: streamingHistory.map((point, i) => ({ i, v: point.listeners })),
    },
    {
      idx: 2,
      label: 'Tracks Indexed',
      value: String(songs.length),
      change: songs[0]?.trend || 0,
      iconKey: 'Layers',
      data: streamingHistory.map((point, i) => ({ i, v: point.streams / 4 })),
    },
    {
      idx: 3,
      label: 'Top Track Score',
      value: String(songs[0]?.popularity || 0),
      change: songs[0]?.trend || 0,
      iconKey: 'Flame',
      data: streamingHistory.map((point, i) => ({ i, v: point.streams / 2 })),
    },
    {
      idx: 4,
      label: 'Avg Popularity',
      value: roster.length
        ? String(Math.round(roster.reduce((sum, artist) => sum + (artist.popularity || 0), 0) / roster.length))
        : '0',
      change: roster[0]?.growth || 0,
      iconKey: 'DollarSign',
      data: streamingHistory.map((point, i) => ({ i, v: point.listeners / 2 })),
    },
    {
      idx: 5,
      label: 'Audience Growth',
      value: `+${formatNumber(roster.reduce((sum, artist) => sum + (artist.growth || 0), 0), '')}`,
      change: roster.reduce((sum, artist) => sum + (artist.growth || 0), 0),
      iconKey: 'TrendingUp',
      data: streamingHistory.map((point, i) => ({ i, v: point.listeners })),
    },
  ];

  return { roster, songs, streamingHistory, kpis };
}
