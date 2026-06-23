import { useEffect, useState } from 'react';

const PROXY = (import.meta.env.VITE_CHARTMETRIC_PROXY_URL as string) || 'http://localhost:4000';

export default function ArtistProfileExample({ name = 'Rema' }: { name?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${PROXY}/artist?name=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(json => { if (mounted) setData(json); })
      .catch(e => { if (mounted) setError(String(e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [name]);

  if (loading) return <div>Loading artist profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const artist = data.obj?.artists?.[0] || null;

  return (
    <div className="p-3 border border-border rounded-lg bg-card">
      <h4 className="text-[13px] font-bold mb-2">Chartmetric Artist (example)</h4>
      {artist ? (
        <div className="flex items-center gap-3">
          {artist.image_url ? <img src={artist.image_url} alt={artist.name} className="w-12 h-12 rounded-full object-cover" /> : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">{(artist.name||'')[0]}</div>
          )}
          <div>
            <div className="text-[14px] font-semibold">{artist.name}</div>
            <div className="text-[12px] text-muted-foreground">Spotify followers: {artist.sp_followers ?? '—'}</div>
            <div className="text-[12px] text-muted-foreground">Monthly listeners: {artist.sp_monthly_listeners ?? '—'}</div>
          </div>
        </div>
      ) : (
        <div>No artist found</div>
      )}
    </div>
  );
}
