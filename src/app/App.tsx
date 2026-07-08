import { useState, useRef, useEffect, useCallback } from "react";
import {
  ComposedChart, AreaChart, Area, ResponsiveContainer, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Music2, BarChart2, Bot, Globe, Rocket,
  CalendarDays, FolderOpen, FileBarChart, Settings, Search,
  Bell, Moon, Sun, Plus, Send, ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, Users, Play, Hash, Heart, MessageCircle,
  DollarSign, MoreHorizontal, ChevronRight, Download, X,
  Flame, Activity, Radio, Target, Zap, Filter, Upload,
  FileText, Clock, ChevronDown, ChevronUp, Menu, Home,
  User, Mic2, List, AlignLeft, Layers, Eye, SkipForward,
  Bookmark, Globe2, Headphones, LayoutGrid, Instagram, Twitter, HelpCircle, ArrowRight, ChevronLeft, PlaySquare, Disc, Info, SlidersHorizontal, Music, ExternalLink, PieChart, ArrowUp, ArrowDown,
} from "lucide-react";

import {
  roster,
  songs,
  kpis,
  campaigns,
  timelineActivities,
  calendarEvents,
  suggestedPrompts,
  streamingHistory,
  searchIndex,
  aiResponses,
  tornadoTimelineData,
  platformBreakdown,
  topCreators,
  topConversations,
  competitors,
  aiConvInsights,
  slSuggestions,
} from "./live-data";
import { fetchSpotifyArtistProfile, fetchSpotifyArtistCatalog, fetchSpotifyArtistCatalogById, fetchSpotifyArtistPlaylists, loadLiveData, fetchChartmetricArtistByName, fetchChartmetricArtistTracks, searchSpotifyArtists } from "./data/liveData";

// ─── Types ────────────────────────────────────────────────────────────────────
type View =
  | "dashboard" | "artists" | "music" | "ai" | "social"
  | "campaigns" | "calendar" | "reports" | "settings" | "audience" | "track-detail";

type Artist = (typeof roster)[number] & { spotify_id?: string };
type Song = typeof songs[0];

const kpiIconMap = {
  Play,
  Users,
  Layers,
  Flame,
  DollarSign,
  TrendingUp,
  Instagram,
  Twitter,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = new Date();
const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

// ─── Global Search ────────────────────────────────────────────────────────────
function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length >= 1
    ? searchIndex.map(section => ({
      ...section,
      items: section.items.filter(item => item.toLowerCase().includes(query.toLowerCase())).slice(0, 3),
    })).filter(s => s.items.length > 0)
    : [];

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-2 focus-within:bg-card focus-within:border-foreground/20 transition-all">
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search artists, songs, releases, campaigns, social mentions..."
          className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }}>
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-card border border-border rounded-xl shadow-lg shadow-black/10 z-50 overflow-hidden">
          {filtered.map(section => (
            <div key={section.type}>
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{section.type}</div>
              {section.items.map(item => (
                <button key={item} className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-muted text-left transition-colors">
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[13px] text-foreground">{item}</span>
                </button>
              ))}
            </div>
          ))}
          <div className="border-t border-border px-4 py-2">
            <span className="text-[11px] text-muted-foreground">Press Enter to search all results</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ onSelectArtist }: { onSelectArtist?: (a: Artist) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const hits = await searchSpotifyArtists(query);
        setResults(hits);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (cmArtist: any) => {
    if (onSelectArtist) {
      const mappedArtist: Artist = {
        id: cmArtist.id || Date.now(),
        name: cmArtist.name || "Unknown",
        genre: "Music",
        country: "Global",
        monthlyListeners: cmArtist.followers ? Math.round(cmArtist.followers / 1000000) + "M" : "0",
        totalStreams: cmArtist.followers ? Math.round(cmArtist.followers / 1000) + "K" : "0",
        growth: cmArtist.popularity || 0,
        release: "Latest Release",
        color: "#3B82F6",
        initials: (cmArtist.name || "UN").slice(0, 2).toUpperCase(),
        status: "active",
        image_url: cmArtist.image_url,
        spotify_url: cmArtist.spotify_url,
        popularity: cmArtist.popularity || 0,
        followers: cmArtist.followers || 0,
        spotify_id: cmArtist.id,
      };
      onSelectArtist(mappedArtist);
    }
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between border-b border-border bg-card flex-shrink-0 z-10 w-full relative">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.6 14.6c-.2.3-.6.4-.9.2-2.4-1.5-5.5-1.8-9.1-1-.4.1-.7-.2-.8-.6-.1-.4.2-.7.6-.8 3.9-.9 7.4-.5 10.1 1.2.3.2.4.6.1 1zM18 14.2c-.2.4-.7.5-1 .3-2.8-1.7-7.1-2.3-9.7-1.3-.4.2-.9-.1-1.1-.5-.2-.4.1-.9.5-1.1 3.1-1.2 7.8-.5 11 1.5.3.2.4.7.3 1.1zM18.2 11c-3.4-2-9-2.2-12.2-1.2-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 3.7-1.1 9.9-.9 13.8 1.4.5.3.6.8.3 1.3-.2.4-.8.5-1.3.3z" />
          </svg>
        </div>
        <span className="text-[18px] font-black tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          for Artists
        </span>
      </div>
      <div className="flex-1 max-w-xl px-8 relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search artists"
            className="w-full pl-9 pr-4 py-2.5 text-[14px] bg-background hover:bg-background border border-border focus:border-foreground/30 focus:bg-card rounded-full outline-none transition-colors text-foreground placeholder:text-muted-foreground font-medium"
          />
        </div>
        {showDropdown && query.trim() !== "" && (
          <div className="absolute top-full left-8 right-8 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {loading ? (
              <div className="p-4 flex justify-center"><div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
            ) : results.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                {results.map(r => (
                  <div key={r.id} onClick={() => handleSelect(r)} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {r.image_url ? <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-foreground">{r.name?.slice(0, 2).toUpperCase()}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-foreground truncate">{r.name}</div>
                      {r.sp_monthly_listeners ? (
                        <div className="text-[11px] text-muted-foreground">
                          {r.sp_monthly_listeners >= 1000000
                            ? (r.sp_monthly_listeners / 1000000).toFixed(1) + 'M'
                            : r.sp_monthly_listeners >= 1000
                              ? (r.sp_monthly_listeners / 1000).toFixed(1) + 'K'
                              : r.sp_monthly_listeners} Spotify Listeners
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-[13px] text-muted-foreground">No global artists found.</div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <button className="relative p-1 rounded-full hover:bg-muted transition-colors text-foreground">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#4100F5] flex items-center justify-center text-white text-[13px] font-bold ml-1 cursor-pointer">D</div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  activeView, setActiveView, activeArtist, setActiveArtist, rosterItems,
}: {
  activeView: View;
  setActiveView: (v: View) => void;
  activeArtist: Artist;
  setActiveArtist: (a: Artist) => void;
  rosterItems: Artist[];
}) {
  return (
    <aside className="w-[280px] flex-shrink-0 bg-[#f8f9fa] border-r border-border flex flex-col h-full overflow-hidden p-4 space-y-4">
      {activeView === "dashboard" ? (
        <>
          {/* Nav */}
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-2">
            <button
              onClick={() => setActiveView("dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all bg-white text-black"
            >
              <Home className="w-[22px] h-[22px] fill-black stroke-black" />
              <span className="text-[15px] font-black tracking-wide">Home</span>
            </button>
          </div>

          {/* Artist Roster */}
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-2">
              {rosterItems.map(artist => (
                <button
                  key={artist.id}
                  onClick={() => { setActiveArtist(artist); setActiveView("artists"); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 hover:bg-muted/50`}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden" style={{ backgroundColor: artist.color }}>
                    {('image_url' in artist) && (artist as any).image_url ? (
                      <img src={(artist as any).image_url as string} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{artist.initials}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left text-[14px] font-bold text-foreground truncate">
                    {artist.name}
                  </div>
                </button>
              ))}
            </div>

          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Back to Home Nav */}
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-2 flex-shrink-0">
            <button
              onClick={() => setActiveView("dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5] text-muted-foreground" />
              <span className="text-[15px] font-bold text-muted-foreground">Home</span>
            </button>
          </div>

          {/* Artist Menu */}
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 flex-shrink-0">
            <button
              onClick={() => setActiveView("artists")}
              className="w-full flex items-center gap-3 mb-6 pl-1 text-left hover:opacity-85 transition-opacity group"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold overflow-hidden flex-shrink-0 shadow-sm" style={{ backgroundColor: activeArtist.color }}>
                {('image_url' in activeArtist) && (activeArtist as any).image_url ? (
                  <img src={(activeArtist as any).image_url as string} alt={activeArtist.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{activeArtist.initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left text-[16px] font-bold text-foreground truncate group-hover:underline">
                {activeArtist.name}
              </div>
            </button>

            <div className="space-y-1">
              <button onClick={() => setActiveView("music")} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group">
                <Disc className={`w-5 h-5 stroke-[2] ${activeView === "music" ? "text-foreground fill-foreground/10" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`text-[14px] ${activeView === "music" ? "font-bold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"}`}>Music</span>
              </button>
              <button onClick={() => setActiveView("audience")} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group">
                <Users className={`w-5 h-5 stroke-[2] ${activeView === "audience" ? "text-foreground fill-foreground/10" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`text-[14px] ${activeView === "audience" ? "font-bold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"}`}>Audience</span>
              </button>

            </div>
          </div>

          {/* Rest of the Roster */}
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-2">
              {rosterItems.filter(a => a.id !== activeArtist.id).map(artist => (
                <button
                  key={artist.id}
                  onClick={() => { setActiveArtist(artist); setActiveView("artists"); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 hover:bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden" style={{ backgroundColor: artist.color }}>
                    {('image_url' in artist) && (artist as any).image_url ? (
                      <img src={(artist as any).image_url as string} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{artist.initials}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left text-[14px] text-muted-foreground font-medium truncate">
                    {artist.name}
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Settings bottom */}
      <div className="px-2 pt-2 pb-1 flex justify-end flex-shrink-0">
        <button className="p-2 rounded-md hover:bg-muted text-foreground transition-colors">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </button>
      </div>
    </aside>
  );
}

function AddArtistInline({ onArtistAdded }: { onArtistAdded: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  // Search Spotify artists as the user types
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/cm-api/search?q=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          const items = data?.obj?.artists || [];
          setResults(items);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = async (artist: any) => {
    setAdding(artist.name);
    try {
      const res = await fetch(`/api/spotify/add-artist?name=${encodeURIComponent(artist.name)}`, {
        method: "POST"
      });
      if (res.ok) {
        setQuery("");
        setResults([]);
        onArtistAdded();
      }
    } catch (err) {
      console.error("Failed to add artist:", err);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="p-2 border-t border-border/50 bg-white relative flex flex-col gap-1.5 flex-shrink-0">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-0.5 px-1">
        Add New Artist
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search global Spotify..."
          className="w-full pl-8 pr-3 py-1.5 text-[12px] font-medium bg-muted/40 border border-border/40 rounded-lg outline-none focus:border-foreground/30 text-foreground placeholder:text-muted-foreground transition-colors"
        />
      </div>

      {/* Results Dropdown */}
      {query.trim().length >= 2 && (
        <div className="absolute bottom-[105%] left-2 right-2 bg-white border border-border rounded-xl shadow-xl p-1.5 z-[999] flex flex-col gap-1 max-h-[180px] overflow-y-auto">
          {searching ? (
            <div className="text-[11px] text-muted-foreground text-center py-3">Searching Spotify...</div>
          ) : results.length === 0 ? (
            <div className="text-[11px] text-muted-foreground text-center py-3">No artists found.</div>
          ) : (
            results.map((artist, idx) => (
              <button
                key={artist.id || idx}
                onClick={() => handleAdd(artist)}
                disabled={adding !== null}
                className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 text-left transition-colors group disabled:opacity-50"
              >
                <div className="w-7 h-7 rounded-full bg-muted overflow-hidden flex-shrink-0 relative">
                  {artist.image_url ? (
                    <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#4100F5] opacity-25" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-foreground truncate">{artist.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {artist.sp_followers ? `${(artist.sp_followers / 1_000_000).toFixed(1)}M followers` : "Spotify Artist"}
                  </div>
                </div>
                <div className="text-[11px] font-bold text-primary group-hover:underline pr-1 flex-shrink-0">
                  {adding === artist.name ? "Adding..." : "+ Add"}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="px-6 py-5 border-b border-border bg-card flex items-center justify-between gap-4 flex-shrink-0">
      <div>
        <h1 className="text-[17px] font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Plain SVG Sparkline (avoids recharts key collisions on small charts) ─────
function Sparkline({ data }: { data: { v: number }[] }) {
  const W = 100, H = 32;
  const vals = data.map(d => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const px = (i: number) => (i / (vals.length - 1)) * W;
  const py = (v: number) => H - ((v - min) / range) * (H - 6) - 3;
  const pts = vals.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const area = `M0,${H} L${vals.map((v, i) => `${px(i)},${py(v)}`).join(" L")} L${W},${H} Z`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={area} fill="#1DB954" fillOpacity={0.12} />
      <polyline points={pts} fill="none" stroke="#1DB954" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ kpi }: { kpi: (typeof kpis)[0] }) {
  const Icon = kpiIconMap[kpi.iconKey as keyof typeof kpiIconMap] || TrendingUp;
  const pos = kpi.change >= 0;
  return (
    <div className="bg-card rounded-lg p-4 border border-border hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground font-medium">{kpi.label}</span>
        </div>
        <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${pos ? "text-primary" : "text-destructive"}`}>
          {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(kpi.change)}%
        </span>
      </div>
      <div className="text-[28px] font-black text-foreground tracking-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {kpi.value}
      </div>
      <Sparkline data={kpi.data} />
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardView({ onSelectArtist }: { onSelectArtist: (a: Artist) => void }) {
  const [since, setSince] = useState<string | null>(null);
  const [until, setUntil] = useState<string | null>(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [localKpis, setLocalKpis] = useState(kpis);
  const [localRoster, setLocalRoster] = useState(roster);
  const [localStreamingHistory, setLocalStreamingHistory] = useState(streamingHistory);

  const [globalQuery, setGlobalQuery] = useState("");
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);

  useEffect(() => {
    if (!globalQuery.trim() || globalQuery.length < 2) {
      setGlobalResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingGlobal(true);
      try {
        const res = await searchSpotifyArtists(globalQuery, 5);
        setGlobalResults(res || []);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setSearchingGlobal(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [globalQuery]);

  const handleSelectGlobalResult = (result: any) => {
    const newArtist: Artist = {
      id: result.id,
      name: result.name,
      genre: result.genres?.[0] || "afrobeats",
      country: "Global",
      monthlyListeners: result.followers ? `${(result.followers / 1000000).toFixed(1)}M` : "0.0M",
      totalStreams: "—",
      growth: result.popularity || 50,
      release: "—",
      color: "#8B5CF6",
      initials: result.name.charAt(0).toUpperCase(),
      status: "active",
      image_url: result.image_url,
      spotify_url: result.spotify_url,
      spotify_id: result.id
    };
    onSelectArtist(newArtist);
  };

  useEffect(() => {
    // attempt to load live data and merge into UI state
    let mounted = true;
    async function load() {
      setLoadingLive(true);
      try {
        const live = await import("./data/liveData");
        const data = await live.loadLiveData(since || null, until || null);
        if (!mounted) return;
        if (data.roster) setLocalRoster(data.roster as any || localRoster);
        if (data.kpis) setLocalKpis(data.kpis as any || localKpis);
        if (data.streamingHistory) setLocalStreamingHistory(data.streamingHistory as any || localStreamingHistory);
        if (!data.streamingHistory || data.streamingHistory.length === 0) {
        }
      } catch (e) {
      } finally {
        setLoadingLive(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [since, until]);

  const subtitle = since && until ? `${new Date(since).toLocaleDateString()} — ${new Date(until).toLocaleDateString()}` : dateStr;
  const displayedRoster = localRoster || roster;
  const numArtists = displayedRoster.length;

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {loadingLive && (
        <div className="absolute top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-primary/20">
          <div className="h-full bg-primary w-1/3 animate-[slide_1s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Header section with tabs and cards */}
      <div className="bg-[#f3f4fa] px-8 pt-8 pb-10 flex-shrink-0">
        <div className="flex items-center gap-6 border-b border-black/5 mb-6 pb-0">
          <button className="text-[14px] font-bold text-foreground border-b-[3px] border-[#8a42f5] pb-3 -mb-[2px]">Artists</button>
          <button className="text-[14px] font-semibold text-muted-foreground pb-3 -mb-[2px] hover:text-foreground">Releases</button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[28px] font-black tracking-tight text-[#181818]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome back, here's your overview
          </h1>
          <button className="flex items-center gap-2 bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full text-[13px] font-bold text-[#181818] transition-colors">
            All teams <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#e4e7ff] rounded-xl p-6 shadow-sm border border-black/5">
            <h3 className="text-[13px] font-bold text-[#181818] mb-3">All artists</h3>
            <div className="text-[40px] leading-none font-black tracking-tight text-[#181818]">{numArtists.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="text-[13px] font-semibold text-muted-foreground mb-3">With upcoming release</h3>
            <div className="text-[40px] leading-none font-black tracking-tight text-[#181818]">0</div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="text-[13px] font-semibold text-muted-foreground">With recent release</h3>
              <div className="w-[14px] h-[14px] rounded-full border border-muted-foreground flex items-center justify-center text-[10px] text-muted-foreground cursor-help">?</div>
            </div>
            <div className="text-[40px] leading-none font-black tracking-tight text-[#181818]">0</div>
          </div>
        </div>
      </div>

      {/* List section */}
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
            <input
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Search all artists"
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-card border border-border hover:border-black/30 rounded-md outline-none focus:border-black text-foreground placeholder:text-muted-foreground font-medium transition-colors"
            />
            {globalQuery.trim().length >= 2 && (
              <div className="absolute top-[105%] left-0 right-0 bg-white border border-border rounded-xl shadow-xl p-1.5 z-[999] flex flex-col gap-1 max-h-[250px] overflow-y-auto">
                {searchingGlobal ? (
                  <div className="text-[12px] text-muted-foreground text-center py-3">Searching Spotify...</div>
                ) : globalResults.length === 0 ? (
                  <div className="text-[12px] text-muted-foreground text-center py-3">No artists found.</div>
                ) : (
                  globalResults.map((artist, idx) => (
                    <button
                      key={artist.id || idx}
                      onClick={() => handleSelectGlobalResult(artist)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 text-left transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0 relative">
                        {artist.image_url ? (
                          <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#4100F5] opacity-25" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-foreground truncate">{artist.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {artist.followers ? `${(artist.followers / 1000000).toFixed(1)}M followers` : "Spotify Artist"}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-5 bg-muted-foreground/30 hover:bg-muted-foreground/40 rounded-full relative cursor-pointer transition-colors">
                <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm" />
              </div>
              <span className="text-[13px] font-bold text-[#181818]">Starred</span>
            </div>
            <div className="flex items-center gap-1 bg-[#f0f0f0] p-1 rounded-full">
              {['24 hours', '7 days', '28 days', '12 months'].map((period, i) => (
                <button
                  key={period}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${i === 2 ? 'bg-black text-white' : 'text-[#181818] hover:bg-black/5'}`}
                >
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-3 border-b border-border/80 text-[11px] font-bold text-[#535353] uppercase tracking-wider items-center mb-1">
            <div className="col-span-5">Artists ({numArtists})</div>
            <div className="col-span-3 text-right">Streams</div>
            <div className="col-span-1 flex justify-center"><MoreHorizontal className="w-4 h-4" /></div>
            <div className="col-span-1 text-center flex justify-center items-center gap-1">Release <span className="text-[9px]">▲</span></div>
            <div className="col-span-2 text-right">Release checklist</div>
          </div>

          {/* Table Body */}
          {displayedRoster.map(artist => {
            const streamsStr = (artist as any).totalStreams || '—';
            // Parse streams string like "2.4M" or use raw growth
            const growthNum = artist.growth || 0;
            const growthIsPos = growthNum >= 0;
            const growthColor = growthIsPos ? 'text-[#1ed760]' : 'text-[#e91429]';

            return (
              <div
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                className="grid grid-cols-12 px-4 py-4 border-b border-black/5 hover:bg-black/[0.02] cursor-pointer items-center transition-colors group"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: artist.color || '#333' }}>
                    {('image_url' in artist) && (artist as any).image_url ? (
                      <img src={(artist as any).image_url as string} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-[15px] font-bold">
                        {artist.initials}
                      </div>
                    )}
                  </div>
                  <span className="text-[15px] font-bold text-[#181818] group-hover:underline">{artist.name}</span>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-3 text-[14px] font-medium text-[#181818]">
                  {streamsStr}
                  <div className={`flex items-center gap-0.5 text-[12px] font-bold ${growthColor}`}>
                    {growthIsPos ? '▲' : '▼'} {Math.abs(growthNum)}%
                  </div>
                </div>

                <div className="col-span-1 flex justify-center text-muted-foreground">—</div>
                <div className="col-span-1 text-center text-muted-foreground">—</div>
                <div className="col-span-2 text-right text-muted-foreground">—</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Artist Profile ───────────────────────────────────────────────────────────
function ArtistProfileView({ artist }: { artist: Artist }) {
  const [loading, setLoading] = useState(false);
  const [cmArtist, setCmArtist] = useState<any>(null);
  const [spotifyData, setSpotifyData] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "28d">("28d");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [artistData, spotify] = await Promise.all([
          fetchChartmetricArtistByName(artist.name).catch(() => null),
          fetchSpotifyArtistProfile(artist.name).catch(() => null)
        ]);
        if (!mounted) return;
        setCmArtist(artistData || null);
        setSpotifyData(spotify || null);
        if (artistData?.id) {
          const tracks = await fetchChartmetricArtistTracks(artistData.id);
          if (mounted) setTopTracks(tracks.slice(0, 10));
        } else {
          if (mounted) setTopTracks([]);
        }
      } catch {
        if (mounted) {
          setCmArtist(null);
          setSpotifyData(null);
          setTopTracks([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [artist.name]);

  const displayArtist = {
    ...artist,
    monthlyListeners: cmArtist?.sp_monthly_listeners
      ? `${(cmArtist.sp_monthly_listeners / 1_000_000).toFixed(1)}M`
      : artist.monthlyListeners,
    release: topTracks[0]?.name || artist.release,
    genre: artist.genre,
  };

  const fullMonthlyListeners = cmArtist?.sp_monthly_listeners || 16958180;
  const fullTotalStreams = cmArtist?.total_streams || Math.round(fullMonthlyListeners * 115);

  const baseStreams = timeRange === "28d"
    ? fullMonthlyListeners
    : timeRange === "7d"
    ? Math.round(fullMonthlyListeners * 0.25)
    : Math.round(fullMonthlyListeners * 0.035);

  const totalStreams = timeRange === "28d"
    ? fullTotalStreams
    : timeRange === "7d"
    ? Math.round(fullTotalStreams * 0.25)
    : Math.round(fullTotalStreams * 0.035);

  const monthlyActiveListeners = Math.round(baseStreams * 0.48);
  const newActiveListeners = Math.round(baseStreams * 0.082);
  const superListeners = Math.round(baseStreams * 0.018);

  const rangeStats = {
    "24h": {
      listenersChange: { value: "0.5%", isPositive: true },
      streamsChange: { value: "0.2%", isPositive: false },
      activeChange: { value: "0.1%", isPositive: true },
      newChange: { value: "0.4%", isPositive: true },
      superChange: { value: "0.5%", isPositive: false },
    },
    "7d": {
      listenersChange: { value: "4.2%", isPositive: true },
      streamsChange: { value: "1.5%", isPositive: true },
      activeChange: { value: "0.8%", isPositive: true },
      newChange: { value: "2.1%", isPositive: true },
      superChange: { value: "2.3%", isPositive: false },
    },
    "28d": {
      listenersChange: { value: "7%", isPositive: true },
      streamsChange: { value: "1%", isPositive: false },
      activeChange: { value: "0.4%", isPositive: false },
      newChange: { value: "3.7%", isPositive: true },
      superChange: { value: "7.2%", isPositive: false },
    }
  };

  const currentStats = rangeStats[timeRange];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Hero Banner */}
      <div className="relative w-full h-[320px] flex-shrink-0 bg-zinc-900 overflow-hidden mx-6 mt-6 rounded-t-xl" style={{ width: 'calc(100% - 48px)' }}>
        {(spotifyData?.artist?.images?.[0]?.url || spotifyData?.artist?.image_url || artist.image_url || cmArtist?.image_url) ? (
          <img src={(spotifyData?.artist?.images?.[0]?.url || spotifyData?.artist?.image_url || artist.image_url || cmArtist?.image_url) as string} alt={artist.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: artist.color }}></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
          <div>
            <h1 className="text-[72px] font-black text-white leading-none tracking-tight mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {displayArtist.name}
            </h1>

          </div>
          <button className="flex items-center gap-2 bg-[#4100F5] hover:bg-[#3b00e0] transition-colors text-white px-5 py-2.5 rounded-full font-bold text-[14px]">
            <Eye className="w-4 h-4" />
            View profile
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="space-y-8">

          {/* Stats Container */}
          <div className="bg-[#f2f4fc] rounded-b-xl p-6 border-x border-b border-border/50">
            <div className="grid grid-cols-12 gap-8">

              {/* Streaming stats */}
              <div className="col-span-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-bold text-foreground">Streaming stats</h2>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1 text-[13px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors font-medium"
                    >
                      Last {timeRange === "24h" ? "24 hours" : timeRange === "7d" ? "7 days" : "28 days"} <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40 cursor-default"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1.5 w-[140px] bg-white border border-border rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-0.5">
                          {(["24h", "7d", "28d"] as const).map(range => (
                            <button
                              key={range}
                              onClick={() => {
                                setTimeRange(range);
                                setDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-bold text-left hover:bg-muted/50 text-foreground transition-colors"
                            >
                              <span>{range === "24h" ? "24 hours" : range === "7d" ? "7 days" : "28 days"}</span>
                              {timeRange === range && (
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none" className="text-foreground"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-card rounded-xl p-5 shadow-sm grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground font-medium mb-1 truncate">Monthly listeners</div>
                    <div className="text-[24px] font-bold text-foreground tracking-tight mb-2 truncate">{baseStreams.toLocaleString()}</div>
                    <div className={`flex items-center gap-1 text-[12px] font-bold ${currentStats.listenersChange.isPositive ? "text-[#1DB954]" : "text-destructive"}`}>
                      {currentStats.listenersChange.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {currentStats.listenersChange.isPositive ? "" : "-"}{currentStats.listenersChange.value}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground font-medium mb-1 truncate">Streams</div>
                    <div className="text-[24px] font-bold text-foreground tracking-tight mb-2 truncate">{totalStreams.toLocaleString()}</div>
                    <div className={`flex items-center gap-1 text-[12px] font-bold ${currentStats.streamsChange.isPositive ? "text-[#1DB954]" : "text-destructive"}`}>
                      {currentStats.streamsChange.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {currentStats.streamsChange.isPositive ? "" : "-"}{currentStats.streamsChange.value}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audience development */}
              <div className="col-span-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-[15px] font-bold text-foreground">Audience development</h2>
                  <a 
                    href="https://support.spotify.com/us/artists/article/audience-segments-on-spotify/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[13px] text-[#4100F5] font-medium cursor-pointer hover:underline"
                  >
                    What's this?
                  </a>
                </div>
                <div className="bg-card rounded-xl p-5 shadow-sm grid grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium mb-1">
                      Monthly active listeners <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[24px] font-bold text-foreground tracking-tight mb-2">{monthlyActiveListeners.toLocaleString()}</div>
                    <div className={`flex items-center gap-1 text-[12px] font-bold ${currentStats.activeChange.isPositive ? "text-[#1DB954]" : "text-destructive"}`}>
                      {currentStats.activeChange.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                      {currentStats.activeChange.isPositive ? "" : "-"}{currentStats.activeChange.value}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium mb-1">
                      New active listeners <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[24px] font-bold text-foreground tracking-tight mb-2">{newActiveListeners.toLocaleString()}</div>
                    <div className={`flex items-center gap-1 text-[12px] font-bold ${currentStats.newChange.isPositive ? "text-[#1DB954]" : "text-destructive"}`}>
                      {currentStats.newChange.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {currentStats.newChange.isPositive ? "" : "-"}{currentStats.newChange.value}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium mb-1">
                      Super listeners <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[24px] font-bold text-foreground tracking-tight mb-2">{superListeners.toLocaleString()}</div>
                    <div className={`flex items-center gap-1 text-[12px] font-bold ${currentStats.superChange.isPositive ? "text-[#1DB954]" : "text-destructive"}`}>
                      {currentStats.superChange.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {currentStats.superChange.isPositive ? "" : "-"}{currentStats.superChange.value}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Main Grid Content */}
          <div className="grid grid-cols-12 gap-8 mt-8">
            {/* Promo Cards Column */}
            <div className="col-span-8">
              <div className="grid grid-cols-2 gap-x-6 gap-y-10">

                {/* Loud & Clear */}
                <div className="group cursor-pointer">
                  <div className="aspect-[16/9] bg-[#e4e5f0] rounded-sm mb-4 overflow-hidden relative flex flex-col items-center justify-center p-6">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4100F5 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                    <div className="w-[140px] h-[140px] bg-[#3a20f9] rounded-full flex items-center justify-center text-white font-black text-2xl relative z-10 opacity-90 mix-blend-multiply">$10M+</div>
                    <div className="w-[100px] h-[100px] bg-[#673dfa] rounded-full flex items-center justify-center text-white font-bold text-lg absolute top-4 left-6 opacity-90 mix-blend-multiply">$50K+</div>
                    <div className="w-[80px] h-[80px] bg-[#895dfa] rounded-full flex items-center justify-center text-white font-bold text-sm absolute bottom-8 right-12 opacity-90 mix-blend-multiply">$2M+</div>
                    <div className="w-[60px] h-[60px] bg-[#a882fb] rounded-full flex items-center justify-center text-white font-bold text-xs absolute top-12 right-6 opacity-90 mix-blend-multiply">$500K+</div>
                    <div className="w-[50px] h-[50px] bg-[#b99cfc] rounded-full flex items-center justify-center text-white font-bold text-[10px] absolute bottom-6 left-12 opacity-90 mix-blend-multiply">$1M+</div>
                  </div>
                  <h3 className="text-[20px] font-black text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loud & Clear: 2025 data just dropped</h3>
                  <p className="text-[14px] text-foreground leading-relaxed mb-4">Explore new insights about Spotify royalties, artists on the rise, and the global streaming economy.</p>
                  <div className="text-[14px] font-bold text-muted-foreground flex items-center gap-1 group-hover:text-foreground transition-colors">See the data <ArrowRight className="w-4 h-4" /></div>
                </div>

                {/* Fan Study */}
                <div className="group cursor-pointer">
                  <div className="aspect-[16/9] bg-[#2E3146] rounded-sm mb-4 overflow-hidden flex flex-col relative">
                    <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-1 p-1 opacity-90 bg-white">
                      <div className="bg-[#a8aebc] flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-[#828896] clip-half-circle" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div></div>
                      <div className="bg-gradient-to-r from-[#87ae78] to-[#608092] flex items-end justify-center px-4 pt-4"><div className="w-full h-full bg-[#3c4a5d] rounded-t-sm relative"><div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#5d7d6f]"></div></div></div>
                      <div className="bg-gradient-to-tr from-[#989564] to-[#c6b47c] flex flex-col items-center justify-center gap-1"><div className="w-12 h-2 bg-[#8c8251] rounded-full"></div><div className="w-8 h-2 bg-[#8c8251] rounded-full"></div><div className="w-10 h-2 bg-[#8c8251] rounded-full"></div></div>
                      <div className="bg-[#a5abb7] flex items-end justify-between px-2 pt-2"><div className="w-3 h-8 bg-[#818795]"></div><div className="w-3 h-12 bg-[#818795]"></div><div className="w-3 h-5 bg-[#818795]"></div><div className="w-3 h-10 bg-[#818795]"></div></div>
                      <div className="bg-gradient-to-br from-[#77a0ff] to-[#4068c2] flex items-center justify-center"><div className="w-10 h-10 bg-[#254284] rounded-sm transform rotate-45 scale-y-75 skew-x-12"></div></div>
                      <div className="bg-[#656c7a]"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                      <h2 className="text-[32px] font-black text-white tracking-[0.2em]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>FAN STUDY</h2>
                    </div>
                  </div>
                  <h3 className="text-[20px] font-black text-foreground mb-2 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Explore insights to help you take your fans further</h3>
                  <p className="text-[14px] text-foreground leading-relaxed mb-4">From playlists to new releases and more, discover data and strategies to grow your fanbase on Spotify.</p>
                  <div className="text-[14px] font-bold text-muted-foreground flex items-center gap-1 group-hover:text-foreground transition-colors">Explore now <ArrowRight className="w-4 h-4" /></div>
                </div>

                {/* Meet total audience */}
                <div className="group cursor-pointer">
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#121212] via-[#052b66] to-[#0051ff] rounded-sm mb-4 flex items-center justify-center p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00d0ff]/20 to-transparent"></div>
                    <div className="w-48 h-48 rounded-full bg-[#1db954] absolute -left-8 -top-8 shadow-2xl mix-blend-screen opacity-90"></div>
                    <div className="w-56 h-56 rounded-full bg-[#d015ff] absolute -right-4 -bottom-12 shadow-2xl mix-blend-screen opacity-90"></div>

                    {/* Audience bubbles */}
                    <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"><Users className="w-5 h-5 text-white" /></div>
                    <div className="absolute bottom-6 left-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"><Users className="w-6 h-6 text-white" /></div>
                    <div className="absolute bottom-10 right-16 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"><Users className="w-4 h-4 text-white" /></div>
                  </div>
                  <h3 className="text-[20px] font-black text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Meet your total audience</h3>
                </div>

                {/* Merch */}
                <div className="group cursor-pointer">
                  <div className="aspect-[16/9] bg-[#e1e2e6] rounded-sm mb-4 flex items-center justify-center relative overflow-hidden p-6">
                    <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                    <div className="w-full h-full bg-[#f8f9fc] rounded-lg shadow-xl overflow-hidden relative border border-white flex flex-col">
                      <div className="h-6 border-b border-black/5 bg-[#f0f1f5] flex items-center px-3 gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#d1d2d5]"></div><div className="w-2 h-2 rounded-full bg-[#d1d2d5]"></div><div className="w-2 h-2 rounded-full bg-[#d1d2d5]"></div>
                      </div>
                      <div className="flex-1 bg-[#121212] relative overflow-hidden flex items-center justify-center">
                        <div className="w-24 h-24 bg-[#181818] transform rotate-12 relative">
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#282828] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-[20px] font-black text-foreground mb-2 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Put your merch front and...</h3>
                </div>
              </div>
            </div>

            {/* Top Songs & Playlists Column */}
            <div className="col-span-4 pl-4">

              <div className="mb-12">
                <div className="flex items-end justify-between mb-4 border-b border-border pb-2">
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">Your top songs</h3>
                    <div className="text-[12px] text-muted-foreground mt-0.5">Last 7 days</div>
                  </div>
                  <div className="text-[12px] font-bold text-foreground text-right">Streams<br /><span className="text-muted-foreground font-normal">6/11 – 6/17</span></div>
                </div>

                <div className="space-y-4 mb-4">
                  {(topTracks.length ? topTracks.slice(0, 3) : [
                    { name: "Santa", cm_statistics: { sp_streams: 3046216 }, image_url: null },
                    { name: "Rush", cm_statistics: { sp_streams: 1593313 }, image_url: null },
                    { name: "Tornado", cm_statistics: { sp_streams: 1592192 }, image_url: null }
                  ]).map((track, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0 relative shadow-sm">
                        {track.image_url ? (
                          <img src={track.image_url} alt={track.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full opacity-80" style={{ backgroundColor: artist.color }}></div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-foreground truncate group-hover:underline">{track.name}</div>
                      </div>
                      <div className="text-[13px] font-medium text-foreground">
                        {track.cm_statistics?.sp_streams ? track.cm_statistics.sp_streams.toLocaleString() : '—'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[13px] font-bold text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                  See songs <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Artists View (Roster Grid) ───────────────────────────────────────────────
function ArtistsView({ activeArtist, setActiveArtist, rosterItems }: { activeArtist: Artist; setActiveArtist: (a: Artist) => void; rosterItems: Artist[] }) {
  const [query, setQuery] = useState("");
  const filtered = rosterItems.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f5fc]">
      {/* Top Header / Greeting */}
      <div className="px-10 pt-10 pb-6 flex-shrink-0">
        <div className="flex gap-6 border-b border-border/50 mb-8">
          <button className="text-[14px] font-bold text-foreground border-b-2 border-[#4100F5] pb-2">Artists</button>
          <button className="text-[14px] font-bold text-muted-foreground hover:text-foreground pb-2 transition-colors">Releases</button>
        </div>

        <h1 className="text-[36px] font-black text-foreground mb-8 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Welcome back, here's your overview
        </h1>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* All artists card */}
          <div className="bg-[#dbe0ff] rounded-lg p-6 shadow-sm border border-[#c5ccfb]">
            <div className="text-[13px] font-bold text-foreground mb-2">All artists</div>
            <div className="text-[36px] font-black text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{rosterItems.length.toLocaleString()}</div>
          </div>
          {/* Upcoming release card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
            <div className="text-[13px] text-muted-foreground font-medium mb-2">With upcoming release</div>
            <div className="text-[36px] font-black text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>0</div>
          </div>
          {/* Recent release card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
            <div className="text-[13px] text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
              With recent release <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-[36px] font-black text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>0</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search all artists"
              className="w-full pl-10 pr-4 py-2.5 text-[14px] font-medium bg-white border border-border rounded-md outline-none focus:border-foreground/30 text-foreground placeholder:text-muted-foreground transition-colors shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 bg-muted-foreground/30 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="flex-1 overflow-y-auto bg-white px-10">
        <div className="grid grid-cols-12 py-3 border-b border-border text-[12px] font-medium text-muted-foreground">
          <div className="col-span-5 flex items-center gap-1">Artists ({rosterItems.length}) <ChevronUp className="w-3.5 h-3.5" /></div>
          <div className="col-span-3">Streams</div>
          <div className="col-span-4 flex items-center gap-1 justify-end">Release <ChevronUp className="w-3.5 h-3.5" /></div>
        </div>

        <div className="pb-10">
          {filtered.map(artist => (
            <button
              key={artist.id}
              onClick={() => setActiveArtist(artist)}
              className="w-full grid grid-cols-12 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors items-center text-left group"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold overflow-hidden flex-shrink-0" style={{ backgroundColor: artist.color }}>
                  {('image_url' in artist) && (artist as any).image_url ? (
                    <img src={(artist as any).image_url as string} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    artist.initials
                  )}
                </div>
                <span className="text-[14px] font-bold text-foreground group-hover:underline">{artist.name}</span>
              </div>
              <div className="col-span-3 text-[14px] text-muted-foreground">
                <span className="opacity-0">—</span>
              </div>
              <div className="col-span-4 text-[14px] text-muted-foreground flex justify-end">
                —
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Music View ───────────────────────────────────────────────────────────────
function MusicView({ artist, onSelectTrack }: { artist?: Artist; onSelectTrack?: (track: any) => void }) {
  const resolvedArtist: Artist = artist || roster[0];
  const [tracks, setTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"releases" | "songs" | "playlists">("releases");

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!resolvedArtist?.name) return;
      setLoading(true);
      try {
        const followersCount = resolvedArtist.followers || 1000000;
        const fallbackTracks = songs
          .filter(song => song.artist?.toLowerCase().includes(resolvedArtist.name.toLowerCase()))
          .map((song, index) => {
            const popularity = song.popularity ?? song.trend ?? 0;
            const expFactor = Math.exp(((popularity || 1) - 50) * 0.12);
            let streams = Math.round(followersCount * expFactor * 0.3);
            streams = Math.max((popularity || 1) * 5000, streams);
            return {
              id: song.id,
              name: song.title,
              album: song.album,
              release_date: song.released,
              track_number: index + 1,
              popularity,
              duration_ms: song.duration_ms,
              explicit: song.explicit,
              preview_url: song.preview_url,
              external_url: song.spotify_url,
              artists: [song.artist],
              image_url: null,
              type: song.type?.toLowerCase() || 'track',
              cm_statistics: {
                sp_streams: streams,
                sp_listeners: Math.round(streams / 1.27),
                sp_saves: Math.round(streams * 0.06),
                sp_playlists: Math.round((popularity || 1) * 18),
              },
            };
          });

        const [catalogData, playlistsData] = await Promise.all([
          resolvedArtist.spotify_id
            ? fetchSpotifyArtistCatalogById(resolvedArtist.spotify_id).catch(() => null)
            : fetchSpotifyArtistCatalog(resolvedArtist.name).catch(() => null),
          fetchSpotifyArtistPlaylists(resolvedArtist.name).catch(() => [])
        ]);
        if (mounted) {
          setTracks(catalogData?.tracks?.length ? catalogData.tracks : fallbackTracks);
          if (playlistsData) {
            setPlaylists(playlistsData);
          }
        }
      } catch (err) {
        console.error('Failed to load artist catalog in MusicView:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [resolvedArtist.name, resolvedArtist.spotify_id]);

  const filteredTracks = tracks.filter(track =>
    track.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting logic:
  // - "releases": recent songs that just dropped (newest to oldest) -> release_date desc
  // - "songs": old songs first to recent -> release_date asc
  const displayedTracks = [...filteredTracks].sort((a, b) => {
    const dateA = a.release_date || '';
    const dateB = b.release_date || '';
    if (dateA === dateB) return 0;
    if (activeTab === "releases") {
      return dateA > dateB ? -1 : 1;
    } else {
      return dateA < dateB ? -1 : 1;
    }
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Header */}
      <div className="px-10 pt-10 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[40px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Music
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 rounded-full text-[13px] font-bold text-foreground hover:bg-muted transition-colors">24 hours</button>
              <button className="px-3 py-1.5 rounded-full text-[13px] font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors">7 days</button>
              <button className="px-3 py-1.5 rounded-full text-[13px] font-bold text-white bg-black transition-colors">28 days</button>
            </div>
            <div className="w-[1px] h-4 bg-border mx-2"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors">
              Filters <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs (Upcoming has been removed!) */}
        <div className="flex gap-6 border-b border-border/50 mb-6">
          <button
            onClick={() => setActiveTab("releases")}
            className={`text-[14px] font-bold pb-2 transition-all ${activeTab === "releases"
                ? "text-foreground border-b-2 border-[#4100F5]"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Releases
          </button>
          <button
            onClick={() => setActiveTab("songs")}
            className={`text-[14px] font-bold pb-2 transition-all ${activeTab === "songs"
                ? "text-foreground border-b-2 border-[#4100F5]"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Songs
          </button>
          <button
            onClick={() => setActiveTab("playlists")}
            className={`text-[14px] font-bold pb-2 transition-all ${activeTab === "playlists"
                ? "text-foreground border-b-2 border-[#4100F5]"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Playlists
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10">
        {activeTab !== "playlists" && (
          <>
            {/* Search */}
            <div className="relative mb-6 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search songs or albums"
                className="w-full pl-10 pr-4 py-2.5 text-[14px] font-medium bg-white border border-border rounded-md outline-none focus:border-foreground/30 text-foreground placeholder:text-muted-foreground transition-colors shadow-sm"
              />
            </div>

            {/* Table list */}
            <div className="grid grid-cols-12 py-3 border-b border-border text-[12px] font-bold text-foreground">
              <div className="col-span-5 flex items-center gap-1">Releases</div>
              <div className="col-span-2">Streams</div>
              <div className="col-span-2">Listeners</div>
              <div className="col-span-1">Saves</div>
              <div className="col-span-2 flex items-center gap-1 justify-end cursor-pointer">
                <ChevronDown className="w-3.5 h-3.5" /> {activeTab === "releases" ? "Newest first" : "Oldest first"}
              </div>
            </div>

            <div className="pb-10 divide-y divide-border/30">
              {loading ? (
                <div className="py-20 text-center text-muted-foreground text-[14px]">Loading releases...</div>
              ) : displayedTracks.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground text-[14px]">No releases found.</div>
              ) : (
                displayedTracks.map((track, i) => (
                  <div
                    key={track.id || i}
                    onClick={() => onSelectTrack?.(track)}
                    className="w-full grid grid-cols-12 py-4 border-b border-border/50 items-center text-left hover:bg-muted/10 transition-colors cursor-pointer"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-14 h-14 bg-muted rounded shadow-sm overflow-hidden flex-shrink-0 relative">
                        {track.image_url ? (
                          <img src={track.image_url} alt={track.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full opacity-80" style={{ backgroundColor: resolvedArtist.color }}></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-foreground truncate">{track.name}</div>
                        <div className="text-[13px] text-muted-foreground truncate">{track.album || 'Single'}</div>
                      </div>
                      <div className="pr-4">
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="col-span-2 text-[14px] text-muted-foreground font-medium">
                      {track.cm_statistics?.sp_streams ? track.cm_statistics.sp_streams.toLocaleString() : '—'}
                    </div>
                    <div className="col-span-2 text-[14px] text-muted-foreground font-medium">
                      {track.cm_statistics?.sp_listeners ? track.cm_statistics.sp_listeners.toLocaleString() : '—'}
                    </div>
                    <div className="col-span-1 text-[14px] text-muted-foreground font-medium">
                      {track.cm_statistics?.sp_saves ? track.cm_statistics.sp_saves.toLocaleString() : '—'}
                    </div>
                    <div className="col-span-2 text-[14px] text-muted-foreground font-medium flex items-center justify-end gap-2">
                      {track.release_date ? track.release_date.split('-')[0] : '—'} <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "playlists" && (
          <div className="pt-4">
            {loading ? (
              <div className="py-20 text-center text-muted-foreground text-[14px]">Loading playlists...</div>
            ) : playlists.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground text-[14px]">No playlists found for this artist.</div>
            ) : (
              <div className="grid grid-cols-4 gap-6 pb-10">
                {playlists.map((pl, i) => (
                  <a
                    href={pl.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={pl.id || i}
                    className="group flex flex-col bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4 relative shadow-inner">
                      {pl.image_url ? (
                        <img src={pl.image_url} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground" style={{ backgroundColor: resolvedArtist.color }}>
                          <List className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-[14px] font-bold text-foreground truncate group-hover:underline">{pl.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-1 flex justify-between items-center">
                      <span>by {pl.owner}</span>
                      <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold">{pl.tracks_count} tracks</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Track Detail View ────────────────────────────────────────────────────────
function TrackDetailView({ artist, track, onBack }: { artist: Artist; track: any; onBack: () => void }) {
  const [timeRange, setTimeRange] = useState<"7d" | "28d" | "12m">("28d");
  const [activeTab, setActiveTab] = useState<"Overview" | "Location" | "Playlists">("Overview");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Worldwide");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [activeMetric, setActiveMetric] = useState<"streams" | "listeners" | "saves">("streams");

  const [tempTimeRange, setTempTimeRange] = useState<"7d" | "28d" | "12m">("28d");
  const [tempLocation, setTempLocation] = useState("Worldwide");

  const trackName = track?.name || "Unknown Track";
  const albumName = track?.album || "Single";
  const releaseDateRaw = track?.release_date || "Jul 3, 2026";
  const imageUrl = track?.image_url;

  let displayReleaseDate = releaseDateRaw;
  try {
    const dateObj = new Date(releaseDateRaw);
    if (!isNaN(dateObj.getTime())) {
      displayReleaseDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  } catch (e) {}

  const baseTotalStreams = track?.cm_statistics?.sp_streams || 51823;
  const baseListeners = track?.cm_statistics?.sp_listeners || Math.round(baseTotalStreams * 0.78);
  const baseSaves = track?.cm_statistics?.sp_saves || Math.round(baseTotalStreams * 0.06);
  const basePlaylistAdds = track?.cm_statistics?.sp_playlists || Math.round((track?.popularity || 50) * 15);

  const getCountryFactor = (country: string) => {
    if (country === "Worldwide") return 1.0;
    let hash = 0;
    for (let i = 0; i < country.length; i++) {
      hash = country.charCodeAt(i) + ((hash << 5) - hash);
    }
    const percent = 2 + (Math.abs(hash) % 15); // between 2% and 17%
    return percent / 100;
  };

  const countryFactor = getCountryFactor(selectedLocation);
  const timeFactor = timeRange === "7d" ? 0.25 : timeRange === "12m" ? 12.0 : 1.0;

  const streams = Math.round(baseTotalStreams * countryFactor * timeFactor);
  const listeners = Math.round(baseListeners * countryFactor * timeFactor * (timeRange === "7d" ? 0.96 : timeRange === "12m" ? 0.8 : 1.0));
  const playlistAdds = Math.round(basePlaylistAdds * countryFactor * timeFactor);
  const saves = Math.round(baseSaves * countryFactor * timeFactor);
  const streamsPerListener = listeners > 0 ? (streams / listeners).toFixed(3) : "1.000";

  const dateRangeLabel = timeRange === "7d"
    ? "Jun 29, 2026 - Jul 5, 2026"
    : timeRange === "12m"
    ? "Jul 6, 2025 - Jul 5, 2026"
    : "Jun 8, 2026 - Jul 5, 2026";

  const getChartData = () => {
    const pointsCount = timeRange === "7d" ? 7 : timeRange === "12m" ? 12 : 28;
    const data = [];
    const baseVal = streams / pointsCount;
    for (let i = 0; i < pointsCount; i++) {
      const dayFactor = i / pointsCount;
      const wave = Math.sin(dayFactor * Math.PI * 2) * (baseVal * 0.25);
      const spike = dayFactor > 0.85 ? baseVal * 1.5 * (1 - (1 - dayFactor) * 5) : 0;
      
      const val = Math.max(10, Math.round(baseVal + wave + spike));
      const listVal = Math.round(val * 0.78);
      const saveVal = Math.round(val * 0.06);

      let label = "";
      if (timeRange === "7d") {
        label = `Jun ${29 + i}`;
      } else if (timeRange === "12m") {
        const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        label = months[i % 12];
      } else {
        if (i % 7 === 0) label = `Jun ${8 + i}`;
      }

      data.push({
        name: label,
        streams: val,
        listeners: listVal,
        saves: saveVal
      });
    }
    return data;
  };

  const chartData = getChartData();

  const countries = [
    "Worldwide", "Albania", "Algeria", "Andorra", "Angola", "Antigua And Barbuda", 
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", 
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", 
    "Benin", "Bhutan", "Bolivia", "Bosnia And Herzegovina", "Botswana", 
    "Brazil", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", 
    "Cabo Verde", "Cambodia", "Cameroon"
  ];

  const filteredCountries = countries.filter(c =>
    c.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
      {/* Top Header Navigation */}
      <div className="px-10 pt-8 pb-4 flex-shrink-0 border-b border-border/40">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Music
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded shadow-md overflow-hidden flex-shrink-0 relative">
              {imageUrl ? (
                <img src={imageUrl} alt={trackName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: artist.color }}>
                  <Disc className="w-10 h-10 text-white animate-spin-slow" />
                </div>
              )}
            </div>
            <div>
              <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Song</span>
              <h1 className="text-[28px] md:text-[36px] font-black text-foreground tracking-tight leading-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {trackName}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-foreground bg-muted px-2.5 py-1 rounded-full shadow-sm">
                  <Play className="w-3 h-3 fill-foreground text-foreground" /> All-time streams • <span className="text-primary font-black animate-pulse">LIVE</span>
                  <span className="font-black ml-1 text-foreground">{baseTotalStreams.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
                  Release date <span className="text-foreground font-black ml-1">{displayReleaseDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons / Range selectors */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="flex items-center gap-1.5 mr-2">
              <button className="p-2 rounded-full hover:bg-muted text-foreground transition-colors border border-border/50 shadow-sm" title="Share">
                <Upload className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full hover:bg-muted text-foreground transition-colors border border-border/50 shadow-sm" title="Download CSV">
                <Download className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center bg-[#f2f4fc] rounded-full p-1 border border-border/40 shadow-sm">
              {(["7d", "28d", "12m"] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                    timeRange === range
                      ? "bg-black text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range === "7d" ? "7 days" : range === "28d" ? "28 days" : "12 months"}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setTempTimeRange(timeRange);
                setTempLocation(selectedLocation);
                setFilterDrawerOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 border border-border/80 rounded-full text-[12px] font-bold text-foreground bg-white hover:bg-muted/50 transition-colors shadow-sm"
            >
              Filters <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab menu */}
        <div className="flex gap-6 border-b border-border/40 mt-8">
          {(["Overview", "Location", "Playlists"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[13px] font-bold pb-2.5 transition-all ${
                activeTab === tab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Contents */}
      <div className="flex-1 overflow-y-auto bg-[#fafafc] px-10 py-6">
        {activeTab === "Overview" && (
          <div className="max-w-[1000px] space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-foreground">
                {dateRangeLabel} • {selectedLocation} <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                <Disc className="w-3.5 h-3.5" /> This page includes data from the audio track only.
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { key: "streams", label: "Streams", value: streams },
                { key: "listeners", label: "Listeners", value: listeners },
                { key: "ratio", label: "Streams / Listener", value: streamsPerListener, isRaw: true },
                { key: "playlistAdds", label: "Playlist adds", value: playlistAdds },
                { key: "saves", label: "Saves", value: saves },
              ].map(card => {
                const isActive = activeMetric === card.key || (card.key === "ratio" && activeMetric === "streams");
                const clickable = card.key === "streams" || card.key === "listeners" || card.key === "saves";
                return (
                  <div
                    key={card.key}
                    onClick={() => {
                      if (clickable) setActiveMetric(card.key as any);
                    }}
                    className={`p-4 rounded-xl shadow-sm border transition-all ${
                      clickable ? "cursor-pointer" : ""
                    } ${
                      isActive 
                        ? "bg-[#eceef8] border-primary/40 ring-1 ring-primary/10" 
                        : "bg-white border-border hover:bg-muted/10"
                    }`}
                  >
                    <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 truncate">
                      {card.label}
                    </div>
                    <div className="text-[22px] font-black text-foreground tracking-tight">
                      {card.isRaw ? card.value : card.value.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub action pills */}
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-border/80 rounded-full text-[12px] font-bold text-foreground hover:bg-muted/30 transition-all shadow-sm">
                Filter by source of streams
              </button>
              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-border/80 rounded-full text-[12px] font-bold text-foreground hover:bg-muted/30 transition-all shadow-sm">
                <Activity className="w-3.5 h-3.5" /> Compare songs
              </button>
            </div>

            {/* Recharts Area Chart */}
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
              <h3 className="text-[13px] font-bold text-foreground mb-4 uppercase tracking-wider">
                {activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)} over time
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}K` : val} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}
                      formatter={(val: any) => [val.toLocaleString(), activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)]}
                    />
                    <Area type="monotone" dataKey={activeMetric} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMetric)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Data Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 px-6 py-4 bg-muted/20 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-6">Streams • {dateRangeLabel}</div>
                <div className="col-span-2 text-right">Previous Period</div>
                <div className="col-span-2 text-right">This Period</div>
                <div className="col-span-2 text-right">Change</div>
              </div>
              <div className="grid grid-cols-12 px-6 py-4 items-center text-[13px] font-bold text-foreground border-b border-border/50 last:border-b-0">
                <div className="col-span-6 flex items-center gap-1">{selectedLocation}</div>
                <div className="col-span-2 text-right text-muted-foreground font-medium">—</div>
                <div className="col-span-2 text-right">{streams.toLocaleString()}</div>
                <div className="col-span-2 text-right text-muted-foreground font-medium">—</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Location" && (
          <div className="max-w-[1000px] bg-white p-8 rounded-xl border border-border shadow-sm">
            <h3 className="text-[16px] font-black text-foreground mb-4">Location breakdown</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Countries</div>
                {countries.slice(1, 11).map((country, index) => {
                  const factor = getCountryFactor(country);
                  const countryStreams = Math.round(baseTotalStreams * factor * timeFactor);
                  return (
                    <div key={country} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 text-[13px]">
                      <span className="font-bold text-foreground">{index + 1}. {country}</span>
                      <span className="font-medium text-muted-foreground">{countryStreams.toLocaleString()} streams</span>
                    </div>
                  );
                })}
              </div>
              <div className="bg-muted/10 border border-border rounded-xl p-5 flex flex-col justify-center items-center text-center">
                <Globe className="w-10 h-10 text-primary mb-3" />
                <h4 className="font-bold text-[14px] text-foreground mb-1">Global Distribution</h4>
                <p className="text-[12px] text-muted-foreground max-w-[300px]">
                  Use the Filters button at the top right to analyze specific markets and regions.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Playlists" && (
          <div className="max-w-[1000px] bg-white p-8 rounded-xl border border-border shadow-sm text-center py-16">
            <Music className="w-10 h-10 text-primary/80 mx-auto mb-3" />
            <h3 className="text-[16px] font-black text-foreground mb-1">Playlist additions</h3>
            <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
              This track has been added to over <span className="font-bold text-foreground">{playlistAdds.toLocaleString()}</span> playlists worldwide in this period.
            </p>
          </div>
        )}
      </div>

      {/* Filter Sidebar Drawer */}
      {filterDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[999] backdrop-blur-[1px]"
            onClick={() => setFilterDrawerOpen(false)}
          />
          {/* Drawer content */}
          <div className="fixed right-0 top-0 w-[320px] h-full bg-white border-l border-border shadow-2xl z-[1000] flex flex-col animate-slide-in">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h2 className="text-[16px] font-black text-foreground">Apply Filter</h2>
              <button 
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Time Section */}
              <div>
                <h3 className="text-[13px] font-black text-foreground uppercase tracking-wider mb-3">Time</h3>
                <div className="space-y-3">
                  {([
                    { key: "7d", label: "7 days", disabled: false },
                    { key: "28d", label: "28 days", disabled: false },
                    { key: "12m", label: "12 months", disabled: false },
                    { key: "custom", label: "Custom", disabled: true }
                  ] as const).map(opt => (
                    <label 
                      key={opt.key}
                      className={`flex items-center gap-3 cursor-pointer text-[13px] font-bold ${
                        opt.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="tempTime"
                        disabled={opt.disabled}
                        checked={tempTimeRange === opt.key}
                        onChange={() => setTempTimeRange(opt.key as any)}
                        className="w-4.5 h-4.5 text-primary focus:ring-primary border-border"
                      />
                      <span className="text-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations Section */}
              <div className="flex flex-col flex-1">
                <h3 className="text-[13px] font-black text-foreground uppercase tracking-wider mb-2">Locations</h3>
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    placeholder="Filter by location"
                    className="w-full pl-8 pr-3 py-1.5 text-[12px] font-medium bg-muted/40 border border-border/40 rounded-lg outline-none focus:border-foreground/30 text-foreground placeholder:text-muted-foreground transition-colors"
                  />
                </div>
                
                {/* Location Radios */}
                <div className="h-[320px] overflow-y-auto border border-border/40 rounded-xl p-3 bg-[#fafafc] space-y-2.5">
                  {filteredCountries.map(loc => (
                    <label key={loc} className="flex items-center gap-3 cursor-pointer text-[13px] font-medium">
                      <input
                        type="radio"
                        name="tempLoc"
                        checked={tempLocation === loc}
                        onChange={() => setTempLocation(loc)}
                        className="w-4.5 h-4.5 text-primary focus:ring-primary border-border"
                      />
                      <span className={tempLocation === loc ? "font-bold text-foreground" : "text-[#535353]"}>{loc}</span>
                    </label>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div className="text-[11px] text-muted-foreground text-center py-4">No countries found.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-5 border-t border-border flex gap-3 bg-white">
              <button 
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-2 rounded-full border border-border text-[13px] font-bold text-[#535353] hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTimeRange(tempTimeRange);
                  setSelectedLocation(tempLocation);
                  setFilterDrawerOpen(false);
                }}
                className="flex-1 py-2 bg-black text-white rounded-full text-[13px] font-bold hover:bg-black/90 transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Audience View ────────────────────────────────────────────────────────────
function AudienceView() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Header */}
      <div className="px-10 pt-10 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[40px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Audience
          </h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full border border-border text-foreground hover:bg-muted transition-colors mr-2">
              <Download className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 rounded-full text-[13px] font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors">7 days</button>
              <button className="px-3 py-1.5 rounded-full text-[13px] font-bold text-white bg-black transition-colors">28 days</button>
              <button className="px-3 py-1.5 rounded-full text-[13px] font-bold text-foreground hover:bg-muted transition-colors">12 months</button>
            </div>
            <div className="w-[1px] h-4 bg-border mx-2"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors">
              Filters <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border/50 mb-6">
          <button className="text-[14px] font-bold text-foreground border-b-2 border-[#4100F5] pb-2">Overview</button>
          <button className="text-[14px] font-bold text-muted-foreground hover:text-foreground pb-2 transition-colors">Segments</button>
          <button className="text-[14px] font-bold text-muted-foreground hover:text-foreground pb-2 transition-colors">Demographics</button>
          <button className="text-[14px] font-bold text-muted-foreground hover:text-foreground pb-2 transition-colors">Location</button>

        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10">
        <div className="max-w-[1000px]">
          {/* Summary Block */}
          <div className="mb-10">
            <h2 className="text-[28px] font-black text-foreground mb-1 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              You have 497.5K monthly active listeners
            </h2>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[15px] text-foreground font-medium">
                This is <span className="font-bold">35%</span> of your <span className="font-bold">1.4M</span> monthly listeners.
              </p>
              <button className="flex items-center gap-1.5 text-[#4100F5] text-[14px] font-bold hover:underline">
                Learn more <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div className="text-[13px] text-foreground leading-relaxed pr-4 font-medium">
                  <span className="font-bold">51%</span> of your streams came from your <span className="font-bold">monthly active listeners</span> in the last 28 days.
                </div>
                <div className="w-10 h-10 rounded-full border-[5px] border-[#3b82f6] border-r-[#e5e7eb] flex-shrink-0"></div>
              </div>
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div className="text-[13px] text-foreground leading-relaxed pr-4 font-medium">
                  You got <span className="font-bold">3.8 streams / listener</span> from your <span className="font-bold">monthly active listeners</span> in the last 28 days.
                </div>
                <div className="flex flex-col items-center flex-shrink-0 text-[#3b82f6]">
                  <User className="w-5 h-5 fill-current" />
                  <span className="font-black text-[18px]">3.8</span>
                </div>
              </div>
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div className="text-[13px] text-foreground leading-relaxed pr-4 font-medium">
                  <span className="font-bold">France, Germany,</span> and <span className="font-bold">Canada</span> have the highest share of <span className="font-bold">monthly active listeners</span> in the past 28 days.
                </div>
                <Globe2 className="w-10 h-10 text-[#3b82f6] flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-10">
            <div className="text-[13px] text-muted-foreground mb-1">Stats this period</div>
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-[20px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                May 21, 2026 - Jun 17, 2026 · Worldwide
              </h3>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="text-[13px] text-muted-foreground font-medium mb-4">Listeners</div>
                <div className="flex items-end justify-between">
                  <div className="text-[28px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>1.4M</div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#10b981]">
                    <ArrowUp className="w-3 h-3 stroke-[3]" /> 2.4%
                  </div>
                </div>
              </div>
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="text-[13px] text-muted-foreground font-medium mb-4">Monthly active listeners</div>
                <div className="flex items-end justify-between">
                  <div className="text-[28px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>497K</div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#ef4444]">
                    <ArrowDown className="w-3 h-3 stroke-[3]" /> -2.2%
                  </div>
                </div>
              </div>
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="text-[13px] text-muted-foreground font-medium mb-4">Streams</div>
                <div className="flex items-end justify-between">
                  <div className="text-[28px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>3.7M</div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#10b981]">
                    <ArrowUp className="w-3 h-3 stroke-[3]" /> 9.0%
                  </div>
                </div>
              </div>
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="text-[13px] text-muted-foreground font-medium mb-4">Streams / Listener</div>
                <div className="flex items-end justify-between">
                  <div className="text-[28px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>2.6</div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#10b981]">
                    <ArrowUp className="w-3 h-3 stroke-[3]" /> 6.4%
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="text-[13px] text-muted-foreground font-medium mb-4">Saves</div>
                <div className="flex items-end justify-between">
                  <div className="text-[28px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>87K</div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#10b981]">
                    <ArrowUp className="w-3 h-3 stroke-[3]" /> 33.2%
                  </div>
                </div>
              </div>
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="text-[13px] text-muted-foreground font-medium mb-4">Playlist adds</div>
                <div className="flex items-end justify-between">
                  <div className="text-[28px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>73K</div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#10b981]">
                    <ArrowUp className="w-3 h-3 stroke-[3]" /> 12.8%
                  </div>
                </div>
              </div>
              <div className="bg-[#f9fafb] border border-border/50 rounded-xl p-5 shadow-sm">
                <div className="text-[13px] text-muted-foreground font-medium mb-4">Followers</div>
                <div className="flex items-end justify-between">
                  <div className="text-[28px] font-black text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>1.2M</div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#10b981]">
                    <ArrowUp className="w-3 h-3 stroke-[3]" /> 1.2%
                  </div>
                </div>
              </div>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────
type Message = { role: "user" | "assistant"; content: string; loading?: boolean };

function AIAssistantView() {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Good morning. I'm the Mavin AI Command Center — connected to Chartmetric, XPOZ Social, all streaming APIs, and your internal campaign and release database.\n\nI can answer questions, compare artists, generate reports, build campaign strategies, and surface trends before they happen.\n\nWhat do you need?",
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }, { role: "assistant", content: "", loading: true }]);
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => { const n = [...prev]; n[n.length - 1] = { role: "assistant", content: getAIResponse(msg) }; return n; });
      setTyping(false);
    }, 1000 + Math.random() * 700);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-card flex-shrink-0 flex items-center justify-between">
            <div>
              <span className="text-[14px] font-bold text-foreground">AI Command Center</span>
              <span className="ml-2 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">Live</span>
            </div>
            <div className="text-[11px] text-muted-foreground">7 data sources connected</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-background">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-card" />
                  </div>
                )}
                <div className={`max-w-[78%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${msg.role === "user"
                    ? "bg-foreground text-card rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm"
                  }`}>
                  {msg.loading ? (
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(j => <div key={j} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />)}
                    </div>
                  ) : (
                    <div className="whitespace-pre-line text-current" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length <= 1 && (
            <div className="px-5 pb-3 bg-background">
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map(p => (
                  <button key={p} onClick={() => send(p)} className="text-[11px] bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 px-3 py-1.5 rounded-full transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-5 pb-5 pt-2 bg-background flex-shrink-0">
            <div className="flex gap-2 bg-card border border-border rounded-xl px-4 py-2.5 focus-within:border-foreground/20 transition-colors">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask anything about your artists, streams, campaigns..."
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={() => send()} disabled={!input.trim() || typing} className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center hover:bg-foreground/80 transition-colors disabled:opacity-30">
                <Send className="w-3.5 h-3.5 text-card" />
              </button>
            </div>
          </div>
        </div>

        {/* Sources sidebar */}
        <div className="w-52 border-l border-border bg-card flex-shrink-0 p-4 overflow-y-auto">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Data Sources</h4>
          <div className="space-y-1.5">
            {[
              ["Chartmetric", "live"], ["Streaming APIs", "live"], ["XPOZ Social", "live"],
              ["Campaign Data", "live"], ["Release Database", "live"],
              ["Marketing Decks", "synced"], ["Past Campaigns", "synced"], ["Internet Search", "on demand"],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center gap-2 py-1.5 border-b border-border last:border-b-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === "live" ? "bg-primary" : status === "synced" ? "bg-amber-400" : "bg-muted-foreground"}`} />
                <span className="text-[11px] text-foreground flex-1">{label}</span>
                <span className="text-[9px] text-muted-foreground">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Social Listening — Conversation Intelligence Platform ────────────────────

const getAIResponse = (msg: string) => {
  const key = msg.toLowerCase();
  if (key.includes("calm down") || key.includes("rema") || key.includes("stream")) return aiResponses.rema || "Live data is not available yet.";
  if (key.includes("colorado") || key.includes("sability") || key.includes("compar")) return aiResponses.compare || "Live comparison data is not available yet.";
  if (key.includes("ayra") || key.includes("uk") || key.includes("listener")) return aiResponses.ayra || "Live listener data is not available yet.";
  if (key.includes("cupid") || key.includes("strategy") || key.includes("release")) return aiResponses.cupid || "Live release strategy data is not available yet.";
  if (key.includes("bayanni") || key.includes("sentiment") || key.includes("social")) return aiResponses.bayanni || "Live social context is not available yet.";
  if (key.includes("growth") || key.includes("highest") || key.includes("most")) return aiResponses.growth || "Live growth data is not available yet.";
  return aiResponses.default || "Live data is not available yet.";
};

function SocialListeningView() {
  const [query, setQuery] = useState("");
  const [activeResult, setActiveResult] = useState<string | null>(null);
  const [tab, setTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");
  const [sortBy, setSortBy] = useState("score");
  const searchRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (label: string) => {
    setQuery(label);
    setActiveResult(label);
    setShowSuggestions(false);
    setTab("overview");
  };

  const tlData = tornadoTimelineData[timeRange as keyof typeof tornadoTimelineData];

  const tabList = ["Overview", "Platforms", "Timeline", "Sentiment", "Creators", "Trends", "Competitors"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader title="Conversation Intelligence" subtitle="Powered by XPOZ · Music conversation analytics platform" />

      <div className="flex-1 overflow-y-auto bg-background">
        {/* Search bar */}
        <div className="px-6 py-5 bg-card border-b border-border">
          <div ref={searchRef} className="relative max-w-2xl">
            <div className="flex items-center gap-3 bg-background border-2 border-border rounded-xl px-4 py-3 focus-within:border-foreground/30 transition-colors">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => { if (e.key === "Enter" && query.trim()) handleSelect(query.trim()); }}
                placeholder="Search artists, songs, albums, hashtags, keywords..."
                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(""); setActiveResult(null); }} className="p-0.5">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
              <button
                onClick={() => { if (query.trim()) handleSelect(query.trim()); }}
                className="px-3 py-1.5 bg-foreground text-card text-[12px] font-semibold rounded-lg hover:bg-foreground/85 transition-colors flex-shrink-0"
              >
                Search
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-lg z-40 overflow-hidden">
                <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Suggested searches</div>
                {slSuggestions.map(s => (
                  <button key={s.label} onClick={() => handleSelect(s.label)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left transition-colors">
                    <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-[13px] text-foreground flex-1">{s.label}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">{s.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {!activeResult && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {slSuggestions.slice(0, 5).map(s => (
                <button key={s.label} onClick={() => handleSelect(s.label)} className="text-[11px] bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-all border border-border">
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!activeResult ? (
          /* ── Empty / default state ── */
          <div className="p-6 flex flex-col items-center justify-center min-h-64 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Search for any artist, song, or trend</h3>
            <p className="text-[13px] text-muted-foreground max-w-sm">Enter an artist name, song title, album, hashtag or keyword to open a full Conversation Intelligence Dashboard.</p>
          </div>
        ) : (
          /* ── Conversation Intelligence Dashboard ── */
          <div>
            {/* Result header */}
            <div className="px-6 py-4 bg-card border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-widest mb-0.5">Conversation Intelligence</div>
                <h2 className="text-[18px] font-black text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{activeResult}</h2>
              </div>
              <div className="flex items-center gap-4">
                {[
                  { label: "Total Mentions", value: "2.4M", change: "+43.2%" },
                  { label: "Reach", value: "312M", change: "+28.1%" },
                  { label: "Virality Score", value: "94/100", change: "" },
                  { label: "Sentiment", value: "84% +", change: "Positive" },
                ].map(({ label, value, change }) => (
                  <div key={label} className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
                    <div className="text-[16px] font-black text-foreground">{value}</div>
                    {change && <div className="text-[10px] text-primary font-semibold">{change}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 bg-card border-b border-border flex gap-0.5 overflow-x-auto">
              {tabList.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t.toLowerCase())}
                  className={`px-4 py-2.5 text-[13px] font-medium border-b-2 whitespace-nowrap transition-all ${tab === t.toLowerCase() ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5">

              {/* ── OVERVIEW TAB ── */}
              {tab === "overview" && (
                <>
                  {/* Key metrics grid */}
                  <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                    {[
                      { label: "Total Mentions", value: "2.4M" }, { label: "Conv. Volume", value: "98K/day" },
                      { label: "Reach", value: "312M" }, { label: "Est. Impressions", value: "1.2B" },
                      { label: "Engagements", value: "13.8M" }, { label: "Video Creations", value: "284K" },
                      { label: "Trend Score", value: "94" }, { label: "Growth Rate", value: "+43%" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-card border border-border rounded-lg p-3">
                        <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
                        <div className="text-[18px] font-black text-foreground">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline preview + AI insights */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 lg:col-span-8 bg-card border border-border rounded-lg p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-[14px] font-bold text-foreground">Conversation Volume</h3>
                          <p className="text-[12px] text-muted-foreground">Last 7 days — all platforms</p>
                        </div>
                        <div className="flex gap-1">
                          {["24h", "7d", "28d", "90d"].map(r => (
                            <button key={r} onClick={() => setTimeRange(r)} className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${timeRange === r ? "bg-foreground text-card" : "text-muted-foreground hover:bg-muted"}`}>{r}</button>
                          ))}
                        </div>
                      </div>
                      <div style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height={180}>
                          <AreaChart data={tlData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                            <defs>
                              <linearGradient id="slGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#121212" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#121212" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                            <XAxis key="x" dataKey="t" tick={{ fontSize: 10, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                            <YAxis key="y" tick={{ fontSize: 10, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                            <Tooltip key="tip" contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                            <Area key="v" type="monotone" dataKey="v" stroke="#121212" strokeWidth={2} fill="url(#slGrad)" dot={false} name="Mentions" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-card border border-border rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-[13px] font-bold text-foreground">AI Insights</h3>
                        <span className="ml-auto text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Auto</span>
                      </div>
                      <div className="space-y-2.5">
                        {aiConvInsights.map((insight, i) => (
                          <div key={i} className="flex gap-2 p-2 rounded-lg bg-muted/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            <p className="text-[11px] text-foreground leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stream vs Social */}
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="text-[14px] font-bold text-foreground mb-1">Streaming vs Social Performance</h3>
                    <p className="text-[12px] text-muted-foreground mb-4">How conversation volume translates into streaming</p>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Spotify Streams", value: "48M", pct: 62 },
                        { label: "TikTok Creations", value: "284K", pct: 91 },
                        { label: "TikTok Mentions", value: "1.7M", pct: 88 },
                        { label: "Instagram Mentions", value: "420K", pct: 54 },
                        { label: "X Mentions", value: "142K", pct: 38 },
                        { label: "News Mentions", value: "840", pct: 22 },
                      ].map(({ label, value, pct }) => (
                        <div key={label} className="border border-border rounded-lg p-3">
                          <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
                          <div className="text-[16px] font-bold text-foreground mb-2">{value}</div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-foreground rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── PLATFORMS TAB ── */}
              {tab === "platforms" && (
                <div className="space-y-4">
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={platformBreakdown} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                        <XAxis key="x" dataKey="name" tick={{ fontSize: 10, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                        <YAxis key="y" tick={{ fontSize: 10, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                        <Tooltip key="tip" contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Bar key="posts" dataKey="posts" fill="#121212" radius={[3, 3, 0, 0]} name="Posts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-8 px-5 py-3 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="col-span-2">Platform</div>
                      <div>Posts</div><div>Creators</div><div>Engagement</div>
                      <div>Reach</div><div>Est. Views</div><div>Growth</div>
                    </div>
                    {platformBreakdown.map(p => (
                      <div key={p.name} className="grid grid-cols-8 px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors items-center">
                        <div className="col-span-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-[13px] font-semibold text-foreground">{p.name}</span>
                        </div>
                        <div className="text-[12px] text-foreground font-medium">{p.posts}</div>
                        <div className="text-[12px] text-muted-foreground">{p.creators}</div>
                        <div className="text-[12px] text-muted-foreground">{p.engagement}</div>
                        <div className="text-[12px] text-muted-foreground">{p.reach}</div>
                        <div className="text-[12px] text-muted-foreground">{p.views}</div>
                        <div className="text-[12px] font-semibold text-primary">+{p.growth}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TIMELINE TAB ── */}
              {tab === "timeline" && (
                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[14px] font-bold text-foreground">Conversation Timeline</h3>
                      <p className="text-[12px] text-muted-foreground">Mention volume over time — all platforms combined</p>
                    </div>
                    <div className="flex gap-1">
                      {["24h", "7d", "28d", "90d"].map(r => (
                        <button key={r} onClick={() => setTimeRange(r)} className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${timeRange === r ? "bg-foreground text-card" : "text-muted-foreground hover:bg-muted"}`}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={tlData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                        <defs>
                          <linearGradient id="tlGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#121212" stopOpacity={0.18} />
                            <stop offset="100%" stopColor="#121212" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                        <XAxis key="x" dataKey="t" tick={{ fontSize: 10, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                        <YAxis key="y" tick={{ fontSize: 10, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                        <Tooltip key="tip" contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Area key="v" type="monotone" dataKey="v" stroke="#121212" strokeWidth={2} fill="url(#tlGrad)" dot={false} name="Mentions" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { label: "Jun 14 — Viral influencer post by @naijadancequeen (+840% spike)", type: "spike" },
                      { label: "Jun 12 — BBC Africa Music coverage published", type: "press" },
                      { label: "Jun 10 — #TornadoChallenge launched officially", type: "campaign" },
                      { label: "Jun 7 — Music video released on YouTube", type: "release" },
                    ].map(({ label, type }) => (
                      <div key={label} className="flex items-center gap-2.5 text-[12px]">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${type === "spike" ? "bg-red-400" : type === "press" ? "bg-blue-400" : type === "campaign" ? "bg-primary" : "bg-foreground"}`} />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SENTIMENT TAB ── */}
              {tab === "sentiment" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="text-[13px] font-bold text-foreground mb-4">Sentiment Breakdown</h3>
                    {[{ label: "Positive", pct: 84, color: "#1DB954" }, { label: "Neutral", pct: 12, color: "#6B6B6B" }, { label: "Negative", pct: 4, color: "#EF4444" }].map(({ label, pct, color }) => (
                      <div key={label} className="flex items-center gap-3 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[12px] text-muted-foreground w-16">{label}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                        <span className="text-[14px] font-black text-foreground w-12 text-right">{pct}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="text-[13px] font-bold text-foreground mb-3">Most Common Reactions</h3>
                    <div className="space-y-1.5">
                      {["🔥 Fire — 142K uses", "🌪️ Tornado emoji — 98K uses", "😍 Love — 84K uses", "👏 Clapping — 62K uses", "🎵 Music note — 48K uses"].map(r => (
                        <div key={r} className="text-[12px] text-foreground bg-muted/50 px-3 py-2 rounded-lg">{r}</div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="text-[13px] font-bold text-foreground mb-3">Positive Topics</h3>
                    <div className="space-y-2">
                      {["Song quality & production", "Ayra's vocal performance", "Dance challenge virality", "Lyrics & storytelling", "Overall vibe / energy"].map(t => (
                        <div key={t} className="flex items-center gap-2 text-[12px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-foreground">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="text-[13px] font-bold text-foreground mb-3">Negative Topics</h3>
                    <div className="space-y-2">
                      {["Release timing concerns", "Streaming exclusivity complaints", "Video production critique", "Audio mix on some platforms"].map(t => (
                        <div key={t} className="flex items-center gap-2 text-[12px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                          <span className="text-foreground">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── CREATORS TAB ── */}
              {tab === "creators" && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-foreground">Creator & Influencer Discovery</h3>
                    <span className="text-[11px] text-muted-foreground">{topCreators.length} creators identified</span>
                  </div>
                  <div className="grid grid-cols-8 px-5 py-2.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="col-span-2">Creator</div>
                    <div>Platform</div><div>Followers</div><div>Posts</div>
                    <div>Engagement</div><div>Est. Reach</div><div>Score</div>
                  </div>
                  {topCreators.map(c => (
                    <div key={c.name} className="grid grid-cols-8 px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors items-center">
                      <div className="col-span-2 text-[13px] font-semibold text-foreground">{c.name}</div>
                      <div className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded w-fit font-medium">{c.platform}</div>
                      <div className="text-[12px] text-muted-foreground">{c.followers}</div>
                      <div className="text-[12px] text-muted-foreground">{c.posts}</div>
                      <div className="text-[12px] text-muted-foreground">{c.engagement}</div>
                      <div className="text-[12px] text-muted-foreground">{c.reach}</div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-foreground rounded-full" style={{ width: `${c.score}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-foreground">{c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TRENDS TAB ── */}
              {tab === "trends" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="text-[13px] font-bold text-foreground mb-3">Top Hashtags</h3>
                    {[
                      { tag: "#TornadoChallenge", uses: "284K", growth: "+410%" },
                      { tag: "#AyraStarr", uses: "198K", growth: "+28%" },
                      { tag: "#Tornado", uses: "142K", growth: "+184%" },
                      { tag: "#TYITY1", uses: "98K", growth: "+62%" },
                      { tag: "#Afrobeats", uses: "84K", growth: "+14%" },
                      { tag: "#TornadoDance", uses: "62K", growth: "+890%" },
                      { tag: "#NigeriaMusic", uses: "48K", growth: "+18%" },
                    ].map(({ tag, uses, growth }) => (
                      <div key={tag} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                        <span className="text-[13px] font-semibold text-foreground">{tag}</span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-muted-foreground">{uses}</span>
                          <span className="text-primary font-semibold">{growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-5">
                      <h3 className="text-[13px] font-bold text-foreground mb-3">Related Artists</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {["Tems", "Tyla", "Rema", "Burna Boy", "Wizkid", "Davido", "Kizz Daniel"].map(a => (
                          <span key={a} className="text-[11px] bg-muted text-foreground px-2.5 py-1 rounded font-medium border border-border">{a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-5">
                      <h3 className="text-[13px] font-bold text-foreground mb-3">Related Songs</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {["Rush", "Water", "Love Me Jeje", "Commas", "Sability", "Calm Down", "Essence"].map(s => (
                          <span key={s} className="text-[11px] bg-muted text-foreground px-2.5 py-1 rounded font-medium border border-border">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── COMPETITORS TAB ── */}
              {tab === "competitors" && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-9 px-5 py-3 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="col-span-2">Artist / Song</div>
                      <div>Mentions</div><div>Reach</div><div>Engagement</div>
                      <div>Sentiment</div><div>Streams</div><div className="col-span-2">Virality</div>
                    </div>
                    {competitors.map(c => (
                      <div key={c.song} className="grid grid-cols-9 px-5 py-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors items-center">
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                            <div>
                              <div className="text-[13px] font-semibold text-foreground">{c.artist}</div>
                              <div className="text-[11px] text-muted-foreground">{c.song}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-[13px] font-bold text-foreground">{c.mentions}</div>
                        <div className="text-[12px] text-muted-foreground">{c.reach}</div>
                        <div className="text-[12px] text-muted-foreground">{c.engagement}</div>
                        <div className="text-[12px] font-semibold text-primary">{c.sentiment}%</div>
                        <div className="text-[12px] text-muted-foreground">{c.streams}</div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${c.sentiment}%`, backgroundColor: c.color }} />
                            </div>
                            <span className="text-[11px] font-bold text-foreground">{c.sentiment}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Top conversations */}
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-foreground">Top Conversations</h3>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-[11px] bg-muted border border-border rounded-md px-2 py-1 outline-none text-foreground">
                        <option value="score">Most Viral</option>
                        <option value="engagement">Most Engagement</option>
                        <option value="reach">Highest Reach</option>
                      </select>
                    </div>
                    {topConversations.map(c => (
                      <div key={c.author} className="px-5 py-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-semibold text-foreground">{c.author}</span>
                              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">{c.platform}</span>
                              <span className="text-[10px] text-muted-foreground">{c.followers} followers</span>
                            </div>
                            <p className="text-[12px] text-muted-foreground truncate">{c.preview}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-[11px] text-muted-foreground">{c.date}</div>
                            <div className="text-[12px] font-semibold text-foreground">{c.engagement} eng.</div>
                            <div className="text-[11px] text-primary font-bold">Score {c.score}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Campaign Manager ─────────────────────────────────────────────────────────
function CampaignManagerView() {
  const [tab, setTab] = useState("campaigns");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ artist: "", song: "", releaseType: "", releaseDate: "", startDate: "", endDate: "", budget: "", objective: "", platforms: "", markets: "", notes: "" });

  const statusColors: Record<string, string> = {
    Active: "bg-primary/10 text-primary",
    Planning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Draft: "bg-muted text-muted-foreground",
    Completed: "bg-secondary text-secondary-foreground",
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Campaign Operating System"
        subtitle={`${campaigns.length} campaigns · 2 active`}
        actions={
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-2 bg-foreground text-card rounded-md text-[12px] font-semibold hover:bg-foreground/85 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Campaign
          </button>
        }
      />

      {/* Tabs */}
      <div className="px-6 bg-card border-b border-border flex gap-0.5 flex-shrink-0">
        {["Campaigns", "Timeline"].map(t => (
          <button key={t} onClick={() => setTab(t.toLowerCase())} className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all ${tab === t.toLowerCase() ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        {tab === "campaigns" ? (
          <div className="p-6 space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground text-[11px] font-bold flex-shrink-0">
                    {c.artist.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-semibold text-foreground">{c.artist}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${statusColors[c.status]}`}>{c.status}</span>
                    </div>
                    <div className="text-[12px] text-muted-foreground mb-3">"{c.song}"</div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{c.start} → {c.end}</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" />{c.goal}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{c.budget}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground rounded-full" style={{ width: `${c.progress}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground w-8 text-right">{c.progress}%</span>
                    </div>
                  </div>
                  <button className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Timeline View */
          <div className="p-6">
            <p className="text-[12px] text-muted-foreground mb-4">Campaign activity timeline · Jun 17–23, 2026</p>
            <div className="overflow-x-auto">
              <div className="flex gap-0 min-w-max">
                {timelineActivities.map((day, i) => (
                  <div key={day.date} className={`w-44 flex-shrink-0 border-r border-border ${i === 0 ? "border-l" : ""}`}>
                    <div className={`px-3 py-2.5 border-b border-border text-[11px] font-bold text-center ${day.day === 17 ? "bg-foreground text-card" : "bg-card text-foreground"}`}>
                      {day.date}
                      {day.day === 17 && <span className="ml-1 text-[9px] text-primary bg-primary/20 px-1 rounded">TODAY</span>}
                    </div>
                    <div className="p-2 space-y-1.5 bg-card min-h-48">
                      {day.items.map((item, j) => (
                        <div key={`${day.day}-${j}`} className="rounded-md px-2.5 py-2 text-[11px] font-medium cursor-grab select-none hover:opacity-80 transition-opacity" style={{ backgroundColor: item.color + "18", color: item.color, borderLeft: `3px solid ${item.color}` }}>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New campaign modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-[14px] font-bold text-foreground">New Campaign</h3>
              <button onClick={() => setShowNew(false)} className="p-1.5 hover:bg-muted rounded-md"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { k: "artist", l: "Artist", p: "Select artist..." },
                { k: "song", l: "Song Title", p: "Enter title..." },
                { k: "releaseType", l: "Release Type", p: "Single / EP / Album" },
                { k: "releaseDate", l: "Release Date", p: "YYYY-MM-DD" },
                { k: "startDate", l: "Campaign Start", p: "YYYY-MM-DD" },
                { k: "endDate", l: "Campaign End", p: "YYYY-MM-DD" },
                { k: "budget", l: "Budget", p: "e.g. $25,000" },
                { k: "objective", l: "Objective", p: "e.g. 20M streams" },
                { k: "platforms", l: "Platforms", p: "Spotify, TikTok, IG..." },
                { k: "markets", l: "Target Markets", p: "NG, UK, US..." },
              ].map(({ k, l, p }) => (
                <div key={k}>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{l}</label>
                  <input value={form[k as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [k]: e.target.value }))} placeholder={p} className="w-full bg-muted border border-border rounded-md px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/20 transition-colors" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Campaign notes, strategy context..." className="w-full bg-muted border border-border rounded-md px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/20 transition-colors resize-none" />
              </div>
              <div className="col-span-2 flex gap-2 pt-1">
                <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-lg border border-border text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-lg bg-foreground text-card text-[13px] font-semibold hover:bg-foreground/85 transition-colors">Create Campaign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Release Calendar ─────────────────────────────────────────────────────────
function ReleaseCalendarView() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader title="Release Calendar" subtitle="June 2026" actions={
        <div className="flex gap-1">
          {["Month", "Week", "Timeline"].map(v => (
            <button key={v} className={`px-3 py-1.5 rounded-md text-[12px] font-medium ${v === "Month" ? "bg-foreground text-card" : "text-muted-foreground hover:bg-muted"}`}>{v}</button>
          ))}
        </div>
      } />
      <div className="flex-1 overflow-y-auto bg-background p-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} className="px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center border-r border-border last:border-r-0">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const events = calendarEvents[day] || [];
              const isToday = day === 17;
              return (
                <div key={day} className={`min-h-24 p-2 border-r border-b border-border ${isToday ? "bg-muted/40" : "hover:bg-muted/20"} transition-colors`}>
                  <div className={`text-[12px] font-semibold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-foreground text-card" : "text-foreground"}`}>
                    {day}
                  </div>
                  {events.map((ev, j) => (
                    <div key={j} className="text-[10px] font-medium px-1.5 py-0.5 rounded mb-0.5 truncate" style={{ backgroundColor: ev.color + "18", color: ev.color }}>
                      {ev.label}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function ReportsView() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader title="Reports" subtitle="Generate and export executive reports" />
      <div className="flex-1 overflow-y-auto bg-background p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Music2, label: "Artist Performance Report", desc: "Full streaming + social breakdown per artist" },
            { icon: Activity, label: "Release Performance", desc: "Track-level analytics across all DSPs" },
            { icon: Rocket, label: "Campaign Report", desc: "Campaign ROI, reach, and conversion metrics" },
            { icon: Globe, label: "Social Listening Report", desc: "Sentiment, mentions, and trending topics" },
            { icon: BarChart2, label: "Monthly Label Report", desc: "Aggregated label performance overview" },
            { icon: FileText, label: "Executive Summary", desc: "High-level insights for leadership" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
              <Icon className="w-5 h-5 text-muted-foreground mb-3" />
              <h3 className="text-[13px] font-bold text-foreground mb-1">{label}</h3>
              <p className="text-[12px] text-muted-foreground mb-4">{desc}</p>
              <div className="flex gap-1.5">
                {["PDF", "PowerPoint", "Excel", "CSV"].map(fmt => (
                  <button key={fmt} className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md bg-muted hover:bg-secondary transition-all uppercase tracking-wide">
                    <Download className="w-3 h-3" />{fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsView() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader title="Settings" subtitle="Platform configuration" />
      <div className="flex-1 overflow-y-auto bg-background p-6">
        <div className="max-w-2xl space-y-4">
          {[
            { title: "API Integrations", items: ["Chartmetric API", "XPOZ Social API", "Spotify API"] },
            { title: "Team & Access", items: ["Artist Managers", "Marketing Team", "Digital Team", "Label Leadership"] },
            { title: "Notifications", items: ["Streaming Milestones", "Campaign Deadlines", "Viral Alerts", "AI Recommendations"] },
          ].map(section => (
            <div key={section.title} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-[13px] font-bold text-foreground">{section.title}</h3>
              </div>
              {section.items.map(item => (
                <div key={item} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <span className="text-[13px] text-foreground">{item}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-semibold">Connected</span>
                    <button className="text-[11px] text-muted-foreground hover:text-foreground underline">Configure</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function MobileNav({ activeView, setActiveView }: { activeView: View; setActiveView: (v: View) => void }) {
  const tabs: { view: View; icon: React.ElementType; label: string }[] = [
    { view: "dashboard", icon: Home, label: "Home" },
    { view: "artists", icon: Users, label: "Artists" },
    { view: "music", icon: Search, label: "Music" },
    { view: "ai", icon: Bot, label: "AI" },
    { view: "campaigns", icon: Rocket, label: "Campaigns" },
  ];
  return (
    <div className="flex-shrink-0 bg-card border-t border-border flex items-center justify-around px-2 py-1 safe-area-bottom">
      {tabs.map(({ view, icon: Icon, label }) => (
        <button key={view} onClick={() => setActiveView(view)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${activeView === view ? "text-foreground" : "text-muted-foreground"}`}>
          <Icon className={`w-5 h-5 ${activeView === view ? "text-foreground" : "text-muted-foreground"}`} />
          <span className={`text-[9px] font-medium ${activeView === view ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [activeArtist, setActiveArtist] = useState<Artist>(roster[0]);
  const [activeTrack, setActiveTrack] = useState<any>(null);
  const [liveRoster, setLiveRoster] = useState<Artist[]>(roster);
  const [isMobile, setIsMobile] = useState(false);

  const refreshRoster = useCallback(async () => {
    try {
      const data = await loadLiveData();
      if (data.roster?.length) {
        setLiveRoster(data.roster as Artist[]);
        setActiveArtist(prev => {
          const match = (data.roster as Artist[]).find(a => a.name.toLowerCase() === prev.name.toLowerCase());
          return match || (data.roster as Artist[])[0];
        });
      }
    } catch (err) {
      console.error("Failed to load live data:", err);
    }
  }, []);

  useEffect(() => {
    refreshRoster();
    window.addEventListener("reload-roster", refreshRoster);
    return () => {
      window.removeEventListener("reload-roster", refreshRoster);
    };
  }, [refreshRoster]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSelectArtist = (a: Artist) => {
    setActiveArtist(a);
    setActiveView("artists");
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard": return <DashboardView onSelectArtist={handleSelectArtist} />;
      case "artists": return <ArtistProfileView artist={activeArtist} />;
      case "music": return <MusicView artist={activeArtist} onSelectTrack={(track) => { setActiveTrack(track); setActiveView("track-detail"); }} />;
      case "track-detail": return <TrackDetailView artist={activeArtist} track={activeTrack} onBack={() => setActiveView("music")} />;
      case "audience": return <AudienceView />;
      case "ai": return <AIAssistantView />;
      case "social": return <SocialListeningView />;
      case "campaigns": return <CampaignManagerView />;
      case "calendar": return <ReleaseCalendarView />;
      case "reports": return <ReportsView />;
      case "settings": return <SettingsView />;
      default: return <DashboardView onSelectArtist={handleSelectArtist} />;
    }
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
        <Header onSelectArtist={handleSelectArtist} />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          {!isMobile && (
            <Sidebar
              activeView={activeView}
              setActiveView={(v) => { setActiveView(v); }}
              activeArtist={activeArtist}
              setActiveArtist={handleSelectArtist}
              rosterItems={liveRoster}
            />
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {renderContent()}
            {isMobile && <MobileNav activeView={activeView} setActiveView={setActiveView} />}
          </div>
        </div>
      </div>
    </div>
  );
}
