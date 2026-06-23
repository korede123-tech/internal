export type ArtistSummary = {
  id: string | number;
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
};

export type SongSummary = {
  id: string | number;
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
};

export type SpotifyTrackSummary = {
  id: string;
  name: string;
  album: string;
  release_date: string;
  track_number: number;
  popularity: number;
  duration_ms?: number;
  explicit?: boolean;
  preview_url?: string | null;
  external_url?: string;
  artists?: string[];
};

export type CampaignSummary = {
  id: string;
  artist: string;
  song: string;
  status: string;
  budget: string;
  start: string;
  end: string;
  goal: string;
  progress: number;
  daysLeft: number;
};

export type LiveDataBundle = {
  kpis?: Kpi[];
  roster: ArtistSummary[];
  songs: SongSummary[];
  campaigns: CampaignSummary[];
  streamingHistory: { month: string; streams: number; listeners: number }[];
  searchIndex?: { type: string; items: string[] }[];
  suggestedPrompts?: string[];
  aiResponses?: Record<string, string>;
  timelineActivities?: {
    date: string;
    day: number;
    items: { label: string; type: string; color: string }[];
  }[];
  calendarEvents?: Record<number, { label: string; color: string }[]>;
  platformBreakdown?: { name: string; posts: string; creators: string; engagement: string; reach: string; views: string; growth: number; color: string }[];
  topCreators?: { name: string; platform: string; followers: string; posts: number; engagement: string; reach: string; score: number }[];
  topConversations?: { author: string; platform: string; followers: string; preview: string; engagement: string; reach: string; score: number; date: string }[];
  competitors?: { artist: string; song: string; mentions: string; reach: string; engagement: string; sentiment: number; streams: string; color: string }[];
  aiConvInsights?: string[];
};

export type Kpi = {
  idx: number;
  label: string;
  value: string;
  change: number;
  iconKey: string;
  data: { i: number; v: number }[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchSpotifyLiveData(artists?: string[]) {
  const url = new URL(`${API_BASE}/spotify/live`, location.origin);
  if (artists?.length) url.searchParams.set('artists', artists.join(','));
  return safeJson<Partial<LiveDataBundle>>(url.toString());
}

async function fetchChartmetricData() {
  return fetchSpotifyLiveData();
}

async function fetchChartmetricDataRange(_since?: string | null, _until?: string | null) {
  return fetchSpotifyLiveData();
}

const CHARTMETRIC_PROXY = (import.meta.env.VITE_CHARTMETRIC_PROXY_URL as string) || API_BASE;
const SPOTIFY_PROXY = (import.meta.env.VITE_SPOTIFY_PROXY_URL as string) || API_BASE;

type ChartmetricArtist = {
  id?: number;
  name?: string;
  image_url?: string | null;
  sp_followers?: number;
  sp_monthly_listeners?: number;
  cm_artist_score?: number;
};

let cmToken: string | null = null;
let cmTokenExpiry: number = 0;

export async function getChartmetricToken(): Promise<string | null> {
  if (cmToken && Date.now() < cmTokenExpiry) return cmToken;
  try {
    const refreshToken = import.meta.env.VITE_CHARTMETRIC_REFRESH_TOKEN;
    if (!refreshToken) return null;
    const res = await fetch('/cm-api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshtoken: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    cmToken = data.token;
    cmTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
    return cmToken;
  } catch (err) {
    console.error('Failed to get Chartmetric token:', err);
    return null;
  }
}

export async function fetchChartmetricArtistByName(name: string): Promise<ChartmetricArtist | null> {
  try {
    const token = await getChartmetricToken();
    if (!token) return null;
    const url = new URL('/cm-api/search', location.origin);
    url.searchParams.set('q', name);
    url.searchParams.set('type', 'artists');
    url.searchParams.set('limit', '1');
    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.obj?.artists?.[0] || null;
  } catch (err) {
    console.error('Failed to search Chartmetric artist:', err);
    return null;
  }
}

export async function searchChartmetricArtists(query: string): Promise<ChartmetricArtist[]> {
  try {
    const token = await getChartmetricToken();
    if (!token) return [];
    const url = new URL('/cm-api/search', location.origin);
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'artists');
    url.searchParams.set('limit', '5');
    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.obj?.artists || [];
  } catch (err) {
    console.error('Failed to search Chartmetric artists:', err);
    return [];
  }
}

export async function fetchChartmetricArtistTracks(id: number | string): Promise<any[]> {
  try {
    const token = await getChartmetricToken();
    if (!token) return [];
    const res = await fetch(`/cm-api/artist/${id}/tracks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.obj || [];
  } catch (err) {
    console.error('Failed to fetch Chartmetric tracks:', err);
    return [];
  }
}

export async function fetchArtistChartSeries(name: string, chartType = 'spotify_top_daily', since?: string | null, until?: string | null) {
  const artist = await fetchChartmetricArtistByName(name);
  if (!artist?.id) return null;
  const token = await getChartmetricToken();
  if (!token) return null;
  const url = new URL(`/cm-api/artist/${artist.id}/${chartType}/charts`, location.origin);
  if (since) url.searchParams.set('since', since);
  if (until) url.searchParams.set('until', until);
  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchArtistWherePeopleListen(name: string, since?: string | null, until?: string | null) {
  const artist = await fetchChartmetricArtistByName(name);
  if (!artist?.id) return null;
  const token = await getChartmetricToken();
  if (!token) return null;
  const url = new URL(`/cm-api/artist/${artist.id}/where-people-listen`, location.origin);
  if (since) url.searchParams.set('since', since);
  if (until) url.searchParams.set('until', until);
  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchArtistSocialAudienceStats(name: string, domain: 'instagram' | 'youtube' | 'tiktok', audienceType: 'followers' | 'likes' | 'commenters', statsType: 'stat' | 'demographic' | 'country' | 'city' | 'language' | 'brand' | 'interest', since?: string | null, until?: string | null) {
  const artist = await fetchChartmetricArtistByName(name);
  if (!artist?.id) return null;
  const token = await getChartmetricToken();
  if (!token) return null;
  const url = new URL(`/cm-api/artist/${artist.id}/social-audience-stats`, location.origin);
  url.searchParams.set('domain', domain);
  url.searchParams.set('audienceType', audienceType);
  url.searchParams.set('statsType', statsType);
  if (since) url.searchParams.set('since', since);
  if (until) url.searchParams.set('until', until);
  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSpotifyArtistCatalog(name: string): Promise<{ artist: { id: string; name: string; followers: number; image_url: string | null; genres: string[]; popularity: number; spotify_url: string; } | null; tracks: SpotifyTrackSummary[] } | null> {
  try {
    const url = new URL(`${SPOTIFY_PROXY}/spotify/artist-catalog`, location.origin);
    url.searchParams.set('name', name);
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchSpotifyArtist(name: string) {
  const url = new URL(`${API_BASE}/spotify/artist`, location.origin);
  url.searchParams.set('name', name);
  return safeJson<{ artist: { id: string; name: string; followers: number; image_url: string | null; genres: string[]; popularity: number; spotify_url: string; } | null; tracks: SpotifyTrackSummary[] }>(url.toString());
}

export async function fetchSpotifyArtistProfile(name: string) {
  const url = new URL(`${SPOTIFY_PROXY}/spotify/artist-profile`, location.origin);
  url.searchParams.set('name', name);
  return safeJson<{ artist: { id: string; name: string; followers?: { total: number }; images?: { url: string }[]; genres?: string[]; popularity?: number; external_urls?: { spotify: string }; } | null }>(url.toString());
}

async function fetchXpozData() {
  return {}; // try { return await safeJson<Partial<LiveDataBundle>>(`${API_BASE}/xpoz/live`); } catch { return {}; }
}

async function fetchCohereInsights() {
  return {}; // try { return await safeJson<{ aiResponses?: Record<string, string>; suggestedPrompts?: string[]; aiConvInsights?: string[] }>(`${API_BASE}/cohere/live`); } catch { return {}; }
}

export async function loadLiveData(since?: string | null, until?: string | null): Promise<Partial<LiveDataBundle>> {
  const spotifyPromise = since || until ? fetchChartmetricDataRange(since, until) : fetchSpotifyLiveData();
  const [spotify, xpoz, cohere] = await Promise.all([
    spotifyPromise,
    fetchXpozData(),
    fetchCohereInsights(),
  ]);

  const { roster } = await import('../live-data');
  const enrichedRoster = await Promise.all(roster.map(async (a) => {
    const cmArtist = await fetchChartmetricArtistByName(a.name);
    if (cmArtist?.id) {
      const tracks = await fetchChartmetricArtistTracks(cmArtist.id);
      return {
        ...a,
        monthlyListeners: cmArtist.sp_monthly_listeners ? `${(cmArtist.sp_monthly_listeners / 1_000_000).toFixed(1)}M` : a.monthlyListeners,
        totalStreams: tracks.length && tracks[0].cm_statistics?.sp_streams ? `${Math.round(tracks[0].cm_statistics.sp_streams / 1000)}k+` : a.totalStreams,
        growth: cmArtist.cm_artist_score ? Math.round(cmArtist.cm_artist_score) : a.growth,
        release: tracks.length > 0 ? tracks[0].name : a.release,
        popularity: cmArtist.cm_artist_score,
        followers: cmArtist.sp_followers,
        image_url: cmArtist.image_url || a.image_url,
      };
    }
    return a;
  }));

  return {
    ...spotify,
    ...xpoz,
    ...cohere,
    roster: enrichedRoster as any,
  };
}