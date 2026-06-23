const API_URL = (import.meta.env.VITE_CHARTMETRIC_API_URL as string) || 'https://api.chartmetric.com/api';
const REFRESH_TOKEN = (import.meta.env.VITE_CHARTMETRIC_REFRESH_TOKEN as string) || '';

let accessToken: string | null = null;
let expiresAt = 0;

export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < expiresAt - 30000) return accessToken;
  if (!REFRESH_TOKEN) throw new Error('Missing VITE_CHARTMETRIC_REFRESH_TOKEN');

  const res = await fetch(`${API_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshtoken: REFRESH_TOKEN }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Chartmetric token: ${res.status} ${text}`);
  }

  const data = await res.json();
  accessToken = data.token;
  expiresAt = Date.now() + ((data.expires_in || 3600) as number) * 1000;
  return accessToken as string;
}

export async function search(q: string, params: Record<string, any> = {}) {
  const token = await getAccessToken();
  const url = new URL(`${API_URL}/search`);
  url.searchParams.set('q', q);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Chartmetric search error: ${res.status} ${txt}`);
  }
  return res.json();
}
