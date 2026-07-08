export interface Artist {
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

export const roster: Artist[] = [
  {
    "id": "46pWGuE3dSwY3bMMXGBvVS",
    "name": "Rema",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "11.2M",
    "totalStreams": "755.0M",
    "growth": 79,
    "release": "Calm Down (with Selena Gomez)",
    "color": "#8B5CF6",
    "initials": "R",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5ebf4626451ff59c5989a1af18d",
    "spotify_url": "https://open.spotify.com/artist/46pWGuE3dSwY3bMMXGBvVS",
    "popularity": 79,
    "followers": 11246335
  },
  {
    "id": "3ZpEKRjHaHANcpk10u6Ntq",
    "name": "Ayra Starr",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "7.3M",
    "totalStreams": "730.0M",
    "growth": 76,
    "release": "Santa",
    "color": "#EC4899",
    "initials": "AS",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb8bfd832e0547c4acabe6e67c",
    "spotify_url": "https://open.spotify.com/artist/3ZpEKRjHaHANcpk10u6Ntq",
    "popularity": 76,
    "followers": 7256403
  },
  {
    "id": "artist-3",
    "name": "Boy Spyce",
    "genre": "Music",
    "country": "Global",
    "monthlyListeners": "0M",
    "totalStreams": "0M",
    "growth": 0,
    "release": "Live catalog",
    "color": "#3B82F6",
    "initials": "BS",
    "status": "active",
    "image_url": null,
    "spotify_url": "",
    "popularity": 0,
    "followers": 0
  },
  {
    "id": "7yzmckMWwaSZdJQC5QZ7ws",
    "name": "Lovn",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "11.7M",
    "totalStreams": "310.0M",
    "growth": 37,
    "release": "OMO TI O COMMON",
    "color": "#F59E0B",
    "initials": "L",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5ebec25a174ae701bb33adea163",
    "spotify_url": "https://open.spotify.com/artist/7yzmckMWwaSZdJQC5QZ7ws",
    "popularity": 37,
    "followers": 11686
  },
  {
    "id": "150lmofYTz4i9fnVzM6AZZ",
    "name": "CupidSZN",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "36.7M",
    "totalStreams": "479.0M",
    "growth": 50,
    "release": "Ifeoma",
    "color": "#10B981",
    "initials": "C",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb57bab8e67da94644fa331941",
    "spotify_url": "https://open.spotify.com/artist/150lmofYTz4i9fnVzM6AZZ",
    "popularity": 50,
    "followers": 36721
  },
  {
    "id": "0rskhjcLm5BxjwZDRs4142",
    "name": "Magixx",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "992.9M",
    "totalStreams": "568.0M",
    "growth": 61,
    "release": "Juice & Liquor",
    "color": "#06B6D4",
    "initials": "M",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5ebc299d7de831ab915e19acfaf",
    "spotify_url": "https://open.spotify.com/artist/0rskhjcLm5BxjwZDRs4142",
    "popularity": 61,
    "followers": 992945
  },
  {
    "id": "379IT6Szv0zgnw4xrdu4mu",
    "name": "LADIPOE",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "1.2M",
    "totalStreams": "542.0M",
    "growth": 57,
    "release": "Know You",
    "color": "#1DB954",
    "initials": "L",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb68d6673fac6ffc9df4507fab",
    "spotify_url": "https://open.spotify.com/artist/379IT6Szv0zgnw4xrdu4mu",
    "popularity": 57,
    "followers": 1214195
  },
  {
    "id": "2iL8DuQkmwrpyv9YPydsZZ",
    "name": "Emijay",
    "genre": "afro r&b",
    "country": "Global",
    "monthlyListeners": "629M",
    "totalStreams": "98.0M",
    "growth": 17,
    "release": "Weakness",
    "color": "#EF4444",
    "initials": "E",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb4d12081994460fa923445c19",
    "spotify_url": "https://open.spotify.com/artist/2iL8DuQkmwrpyv9YPydsZZ",
    "popularity": 17,
    "followers": 629
  },
  {
    "id": "3r3K4zm1MOUbvkGwTFvh40",
    "name": "Real Dinoo",
    "genre": "alté",
    "country": "Global",
    "monthlyListeners": "2.9M",
    "totalStreams": "79.0M",
    "growth": 26,
    "release": "LAGADIS",
    "color": "#A855F7",
    "initials": "RD",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5ebd591d6a8f5d6a22f9726f7d3",
    "spotify_url": "https://open.spotify.com/artist/3r3K4zm1MOUbvkGwTFvh40",
    "popularity": 26,
    "followers": 2935
  },
  {
    "id": "7KbhpND4r8U28NI8jiRNgm",
    "name": "Anari",
    "genre": "alté",
    "country": "Global",
    "monthlyListeners": "77M",
    "totalStreams": "23.0M",
    "growth": 10,
    "release": "Moti",
    "color": "#8B5CF6",
    "initials": "A",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb76a0b2fcd6cba9a6f493a753",
    "spotify_url": "https://open.spotify.com/artist/7KbhpND4r8U28NI8jiRNgm",
    "popularity": 10,
    "followers": 77
  },
  {
    "id": "6FbCERtE2CKqEWihHMYjcG",
    "name": "Bayanni",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "419.6M",
    "totalStreams": "555.0M",
    "growth": 59,
    "release": "VALLAH - From “Cocktail 2”",
    "color": "#EC4899",
    "initials": "B",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5ebec9db3d4de7709c1425c9e92",
    "spotify_url": "https://open.spotify.com/artist/6FbCERtE2CKqEWihHMYjcG",
    "popularity": 59,
    "followers": 419648
  },
  {
    "id": "artist-12",
    "name": "Johnny Drille",
    "genre": "Music",
    "country": "Global",
    "monthlyListeners": "0M",
    "totalStreams": "0M",
    "growth": 0,
    "release": "Live catalog",
    "color": "#3B82F6",
    "initials": "JD",
    "status": "active",
    "image_url": null,
    "spotify_url": "",
    "popularity": 0,
    "followers": 0
  }
];
export const songs: Song[] = [
  {
    "id": "1s7oOCT8vauUh01PbJD6ps",
    "title": "Calm Down (with Selena Gomez)",
    "artist": "Rema",
    "album": "Rave & Roses Ultra",
    "released": "2023-04-27",
    "streams": "80.0M",
    "listeners": "8.0M",
    "saves": "8M",
    "playlists": "40K",
    "trend": 80,
    "type": "Track",
    "popularity": 80,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/1s7oOCT8vauUh01PbJD6ps",
    "duration_ms": 239317,
    "explicit": false
  },
  {
    "id": "4Z5KKoBGxpJo8YbDcGQXd5",
    "title": "Secondhand (feat. Rema)",
    "artist": "Rema",
    "album": "OCTANE",
    "released": "2026-01-30",
    "streams": "85.0M",
    "listeners": "8.5M",
    "saves": "9M",
    "playlists": "43K",
    "trend": 85,
    "type": "Track",
    "popularity": 85,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4Z5KKoBGxpJo8YbDcGQXd5",
    "duration_ms": 226666,
    "explicit": true
  },
  {
    "id": "3hdGyxmW0eNskNwTwmXOIQ",
    "title": "Goals",
    "artist": "Rema",
    "album": "Goals (FIFA World Cup 2026™)",
    "released": "2026-05-21",
    "streams": "82.0M",
    "listeners": "8.2M",
    "saves": "8M",
    "playlists": "41K",
    "trend": 82,
    "type": "Track",
    "popularity": 82,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/3hdGyxmW0eNskNwTwmXOIQ",
    "duration_ms": 180345,
    "explicit": false
  },
  {
    "id": "2rDtfPMI5mDJVTwYYG00QI",
    "title": "Soweto (with Don Toliver, Rema & Tempoe)",
    "artist": "Rema",
    "album": "Soweto (with Don Toliver, Rema and Tempoe)",
    "released": "2023-03-22",
    "streams": "78.0M",
    "listeners": "7.8M",
    "saves": "8M",
    "playlists": "39K",
    "trend": 78,
    "type": "Track",
    "popularity": 78,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/2rDtfPMI5mDJVTwYYG00QI",
    "duration_ms": 219500,
    "explicit": true
  },
  {
    "id": "2IwCg4vsBwWgbtSKnq38no",
    "title": "Calm Down",
    "artist": "Rema",
    "album": "Rave & Roses",
    "released": "2021-05-18",
    "streams": "68.0M",
    "listeners": "6.8M",
    "saves": "7M",
    "playlists": "34K",
    "trend": 68,
    "type": "Track",
    "popularity": 68,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/2IwCg4vsBwWgbtSKnq38no",
    "duration_ms": 219668,
    "explicit": false
  },
  {
    "id": "6a9Z1jUms915w4O7N1PxjY",
    "title": "Santa",
    "artist": "Ayra Starr",
    "album": "Santa",
    "released": "2024-04-03",
    "streams": "79.0M",
    "listeners": "7.9M",
    "saves": "8M",
    "playlists": "40K",
    "trend": 79,
    "type": "Track",
    "popularity": 79,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/6a9Z1jUms915w4O7N1PxjY",
    "duration_ms": 193038,
    "explicit": false
  },
  {
    "id": "1xs8bOvm3IzEYmcLJVOc34",
    "title": "Rush",
    "artist": "Ayra Starr",
    "album": "19 & Dangerous (Deluxe)",
    "released": "2022-10-21",
    "streams": "75.0M",
    "listeners": "7.5M",
    "saves": "8M",
    "playlists": "38K",
    "trend": 75,
    "type": "Track",
    "popularity": 75,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/1xs8bOvm3IzEYmcLJVOc34",
    "duration_ms": 185093,
    "explicit": false
  },
  {
    "id": "5c2ns82nxF2pg59M5DkuSM",
    "title": "Tornado",
    "artist": "Ayra Starr",
    "album": "Tornado",
    "released": "2026-06-12",
    "streams": "76.0M",
    "listeners": "7.6M",
    "saves": "8M",
    "playlists": "38K",
    "trend": 76,
    "type": "Track",
    "popularity": 76,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/5c2ns82nxF2pg59M5DkuSM",
    "duration_ms": 174823,
    "explicit": false
  },
  {
    "id": "4GXW3Ne1jzdORKHvHjK31V",
    "title": "Commas",
    "artist": "Ayra Starr",
    "album": "The Year I Turned 21",
    "released": "2024-05-30",
    "streams": "74.0M",
    "listeners": "7.4M",
    "saves": "7M",
    "playlists": "37K",
    "trend": 74,
    "type": "Track",
    "popularity": 74,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4GXW3Ne1jzdORKHvHjK31V",
    "duration_ms": 157089,
    "explicit": false
  },
  {
    "id": "3XOb28yG4xKwuUYlV8eKmS",
    "title": "Colorado",
    "artist": "Ayra Starr",
    "album": "Before The Morning Light",
    "released": "2026-05-15",
    "streams": "66.0M",
    "listeners": "6.6M",
    "saves": "7M",
    "playlists": "33K",
    "trend": 66,
    "type": "Track",
    "popularity": 66,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/3XOb28yG4xKwuUYlV8eKmS",
    "duration_ms": 222828,
    "explicit": false
  },
  {
    "id": "0VqMli0V4mKPu0yhN3Dc7P",
    "title": "OMO TI O COMMON",
    "artist": "Lovn",
    "album": "OMO TI O COMMON",
    "released": "2026-03-06",
    "streams": "50.0M",
    "listeners": "5.0M",
    "saves": "5M",
    "playlists": "25K",
    "trend": 50,
    "type": "Track",
    "popularity": 50,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/0VqMli0V4mKPu0yhN3Dc7P",
    "duration_ms": 174174,
    "explicit": false
  },
  {
    "id": "6LyFvZ6wvb6nac7WaO2bLC",
    "title": "Signs",
    "artist": "Lovn",
    "album": "Signs",
    "released": "2026-07-03",
    "streams": "45.0M",
    "listeners": "4.5M",
    "saves": "5M",
    "playlists": "23K",
    "trend": 45,
    "type": "Track",
    "popularity": 45,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/6LyFvZ6wvb6nac7WaO2bLC",
    "duration_ms": 186902,
    "explicit": false
  },
  {
    "id": "7dxIRBHniuTu8lKYJsTcM5",
    "title": "Available",
    "artist": "Lovn",
    "album": "Available",
    "released": "2026-04-24",
    "streams": "45.0M",
    "listeners": "4.5M",
    "saves": "5M",
    "playlists": "23K",
    "trend": 45,
    "type": "Track",
    "popularity": 45,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7dxIRBHniuTu8lKYJsTcM5",
    "duration_ms": 159444,
    "explicit": false
  },
  {
    "id": "7MsGvKF7W1W07vlp7cbEsZ",
    "title": "Sorry I'm Busy",
    "artist": "Lovn",
    "album": "Sorry I'm Busy",
    "released": "2025-11-27",
    "streams": "44.0M",
    "listeners": "4.4M",
    "saves": "4M",
    "playlists": "22K",
    "trend": 44,
    "type": "Track",
    "popularity": 44,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7MsGvKF7W1W07vlp7cbEsZ",
    "duration_ms": 142709,
    "explicit": false
  },
  {
    "id": "31sL8nRhXMo4wtBNSMtrho",
    "title": "Do Not Disturb (DND)",
    "artist": "Lovn",
    "album": "Do Not Disturb (DND)",
    "released": "2026-01-23",
    "streams": "40.0M",
    "listeners": "4.0M",
    "saves": "4M",
    "playlists": "20K",
    "trend": 40,
    "type": "Track",
    "popularity": 40,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/31sL8nRhXMo4wtBNSMtrho",
    "duration_ms": 172035,
    "explicit": false
  },
  {
    "id": "0CL8DINos7ow0xGrvR0pHD",
    "title": "Ifeoma",
    "artist": "CupidSZN",
    "album": "Ifeoma",
    "released": "2024-03-29",
    "streams": "66.0M",
    "listeners": "6.6M",
    "saves": "7M",
    "playlists": "33K",
    "trend": 66,
    "type": "Track",
    "popularity": 66,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/0CL8DINos7ow0xGrvR0pHD",
    "duration_ms": 160000,
    "explicit": true
  },
  {
    "id": "23OzpJciOsxrB2oTrWQL3W",
    "title": "Service",
    "artist": "CupidSZN",
    "album": "Service",
    "released": "2024-09-20",
    "streams": "53.0M",
    "listeners": "5.3M",
    "saves": "5M",
    "playlists": "27K",
    "trend": 53,
    "type": "Track",
    "popularity": 53,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/23OzpJciOsxrB2oTrWQL3W",
    "duration_ms": 149887,
    "explicit": true
  },
  {
    "id": "1Mqcx741E3t5MRLGRfMKA8",
    "title": "Darkest Secrets",
    "artist": "CupidSZN",
    "album": "darkest secrets / CHAKAM",
    "released": "2026-05-29",
    "streams": "52.0M",
    "listeners": "5.2M",
    "saves": "5M",
    "playlists": "26K",
    "trend": 52,
    "type": "Track",
    "popularity": 52,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/1Mqcx741E3t5MRLGRfMKA8",
    "duration_ms": 201457,
    "explicit": true
  },
  {
    "id": "5TWz9SGcGlMuVFLmtUY1v8",
    "title": "Hashtag",
    "artist": "CupidSZN",
    "album": "Hashtag",
    "released": "2026-06-05",
    "streams": "51.0M",
    "listeners": "5.1M",
    "saves": "5M",
    "playlists": "26K",
    "trend": 51,
    "type": "Track",
    "popularity": 51,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/5TWz9SGcGlMuVFLmtUY1v8",
    "duration_ms": 192941,
    "explicit": false
  },
  {
    "id": "4QHU7aQ42Hq8N0jn3H8pnN",
    "title": "Osogeme",
    "artist": "CupidSZN",
    "album": "Osogeme",
    "released": "2025-01-24",
    "streams": "45.0M",
    "listeners": "4.5M",
    "saves": "5M",
    "playlists": "23K",
    "trend": 45,
    "type": "Track",
    "popularity": 45,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4QHU7aQ42Hq8N0jn3H8pnN",
    "duration_ms": 157419,
    "explicit": false
  },
  {
    "id": "4isHpjM4xVhRI74vGjUm4R",
    "title": "Juice & Liquor",
    "artist": "Magixx",
    "album": "Juice & Liquor",
    "released": "2026-05-22",
    "streams": "71.0M",
    "listeners": "7.1M",
    "saves": "7M",
    "playlists": "36K",
    "trend": 71,
    "type": "Track",
    "popularity": 71,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4isHpjM4xVhRI74vGjUm4R",
    "duration_ms": 177087,
    "explicit": false
  },
  {
    "id": "7mOQnTNnEGVAjI0OF49GMj",
    "title": "Love Don't Cost A Dime - Re-Up",
    "artist": "Magixx",
    "album": "Love Don't Cost A Dime (Re-Up)",
    "released": "2022-02-09",
    "streams": "67.0M",
    "listeners": "6.7M",
    "saves": "7M",
    "playlists": "34K",
    "trend": 67,
    "type": "Track",
    "popularity": 67,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7mOQnTNnEGVAjI0OF49GMj",
    "duration_ms": 147600,
    "explicit": false
  },
  {
    "id": "6DP9EqCK1sPqk9v6oOP9Mo",
    "title": "Okay",
    "artist": "Magixx",
    "album": "I Dream In Color",
    "released": "2025-02-28",
    "streams": "58.0M",
    "listeners": "5.8M",
    "saves": "6M",
    "playlists": "29K",
    "trend": 58,
    "type": "Track",
    "popularity": 58,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/6DP9EqCK1sPqk9v6oOP9Mo",
    "duration_ms": 152307,
    "explicit": false
  },
  {
    "id": "64sNl4VMbqi41L80qFRw0w",
    "title": "All Over",
    "artist": "Magixx",
    "album": "ATOM",
    "released": "2022-07-22",
    "streams": "57.0M",
    "listeners": "5.7M",
    "saves": "6M",
    "playlists": "29K",
    "trend": 57,
    "type": "Track",
    "popularity": 57,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/64sNl4VMbqi41L80qFRw0w",
    "duration_ms": 175200,
    "explicit": false
  },
  {
    "id": "4nuX85V0fBqgryUbCGl94F",
    "title": "Bad Decisions & Foreplay",
    "artist": "Magixx",
    "album": "I Dream In Color",
    "released": "2025-02-28",
    "streams": "57.0M",
    "listeners": "5.7M",
    "saves": "6M",
    "playlists": "29K",
    "trend": 57,
    "type": "Track",
    "popularity": 57,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4nuX85V0fBqgryUbCGl94F",
    "duration_ms": 169572,
    "explicit": false
  },
  {
    "id": "2ruXXt5eDmdm35hTCnGy0s",
    "title": "Know You",
    "artist": "LADIPOE",
    "album": "Know You",
    "released": "2020-04-09",
    "streams": "64.0M",
    "listeners": "6.4M",
    "saves": "6M",
    "playlists": "32K",
    "trend": 64,
    "type": "Track",
    "popularity": 64,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/2ruXXt5eDmdm35hTCnGy0s",
    "duration_ms": 230020,
    "explicit": false
  },
  {
    "id": "1z567QCaLLuRE7ZxQS5oYS",
    "title": "Feeling",
    "artist": "LADIPOE",
    "album": "Feeling",
    "released": "2021-04-16",
    "streams": "62.0M",
    "listeners": "6.2M",
    "saves": "6M",
    "playlists": "31K",
    "trend": 62,
    "type": "Track",
    "popularity": 62,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/1z567QCaLLuRE7ZxQS5oYS",
    "duration_ms": 224000,
    "explicit": false
  },
  {
    "id": "33Bn3hhHkfVFKojsg41kb2",
    "title": "Many People",
    "artist": "LADIPOE",
    "album": "Many People",
    "released": "2026-06-05",
    "streams": "62.0M",
    "listeners": "6.2M",
    "saves": "6M",
    "playlists": "31K",
    "trend": 62,
    "type": "Track",
    "popularity": 62,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/33Bn3hhHkfVFKojsg41kb2",
    "duration_ms": 175448,
    "explicit": true
  },
  {
    "id": "2z13PLFl2jTiV2JLvQZtwI",
    "title": "Compose",
    "artist": "LADIPOE",
    "album": "Compose",
    "released": "2024-09-26",
    "streams": "56.0M",
    "listeners": "5.6M",
    "saves": "6M",
    "playlists": "28K",
    "trend": 56,
    "type": "Track",
    "popularity": 56,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/2z13PLFl2jTiV2JLvQZtwI",
    "duration_ms": 144000,
    "explicit": false
  },
  {
    "id": "6858xmZthZ7jEe06VyZxbN",
    "title": "Running",
    "artist": "LADIPOE",
    "album": "Running",
    "released": "2021-10-21",
    "streams": "54.0M",
    "listeners": "5.4M",
    "saves": "5M",
    "playlists": "27K",
    "trend": 54,
    "type": "Track",
    "popularity": 54,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/6858xmZthZ7jEe06VyZxbN",
    "duration_ms": 214615,
    "explicit": true
  },
  {
    "id": "4DCGXBsfNYol60mGZVdbCL",
    "title": "Weakness",
    "artist": "Emijay",
    "album": "Weakness",
    "released": "2026-03-06",
    "streams": "32.0M",
    "listeners": "3.2M",
    "saves": "3M",
    "playlists": "16K",
    "trend": 32,
    "type": "Track",
    "popularity": 32,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4DCGXBsfNYol60mGZVdbCL",
    "duration_ms": 151836,
    "explicit": false
  },
  {
    "id": "7sWd3N517bb9YzcCblv7n6",
    "title": "Papilo",
    "artist": "Emijay",
    "album": "Papilo",
    "released": "2026-05-13",
    "streams": "31.0M",
    "listeners": "3.1M",
    "saves": "3M",
    "playlists": "16K",
    "trend": 31,
    "type": "Track",
    "popularity": 31,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7sWd3N517bb9YzcCblv7n6",
    "duration_ms": 170955,
    "explicit": false
  },
  {
    "id": "754alDN6QFnoaLzxE3xLTQ",
    "title": "BETTER",
    "artist": "Emijay",
    "album": "BETTER",
    "released": "2025-01-23",
    "streams": "6.0M",
    "listeners": "600.0M",
    "saves": "1M",
    "playlists": "3K",
    "trend": 6,
    "type": "Track",
    "popularity": 6,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/754alDN6QFnoaLzxE3xLTQ",
    "duration_ms": 123135,
    "explicit": true
  },
  {
    "id": "6deMtHtntycpGZRwh9AG9z",
    "title": "2GEDA",
    "artist": "Emijay",
    "album": "2GEDA",
    "released": "2023-06-11",
    "streams": "6.0M",
    "listeners": "600.0M",
    "saves": "1M",
    "playlists": "3K",
    "trend": 6,
    "type": "Track",
    "popularity": 6,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/6deMtHtntycpGZRwh9AG9z",
    "duration_ms": 82872,
    "explicit": true
  },
  {
    "id": "3eLEkxn3OSEbxWLYXEGYMa",
    "title": "SERMON",
    "artist": "Emijay",
    "album": "SERMON X FYI",
    "released": "2024-11-07",
    "streams": "5.0M",
    "listeners": "500.0M",
    "saves": "1M",
    "playlists": "3K",
    "trend": 5,
    "type": "Track",
    "popularity": 5,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/3eLEkxn3OSEbxWLYXEGYMa",
    "duration_ms": 179188,
    "explicit": false
  },
  {
    "id": "6WjSmmffjDssQGXBJqmqKR",
    "title": "LAGADIS",
    "artist": "Real Dinoo",
    "album": "LAGADIS",
    "released": "2026-02-27",
    "streams": "45.0M",
    "listeners": "4.5M",
    "saves": "5M",
    "playlists": "23K",
    "trend": 45,
    "type": "Track",
    "popularity": 45,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/6WjSmmffjDssQGXBJqmqKR",
    "duration_ms": 127182,
    "explicit": true
  },
  {
    "id": "4OmUGnKDIkAmpckffBzAG3",
    "title": "DEAN",
    "artist": "Real Dinoo",
    "album": "DEAN",
    "released": "2026-05-01",
    "streams": "34.0M",
    "listeners": "3.4M",
    "saves": "3M",
    "playlists": "17K",
    "trend": 34,
    "type": "Track",
    "popularity": 34,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4OmUGnKDIkAmpckffBzAG3",
    "duration_ms": 152799,
    "explicit": false
  },
  {
    "id": "7KlUb2HV1yfiuSufjgNePS",
    "title": "Moti",
    "artist": "Anari",
    "album": "Moti",
    "released": "2026-06-26",
    "streams": "23.0M",
    "listeners": "2.3M",
    "saves": "2M",
    "playlists": "12K",
    "trend": 23,
    "type": "Track",
    "popularity": 23,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7KlUb2HV1yfiuSufjgNePS",
    "duration_ms": 136843,
    "explicit": false
  },
  {
    "id": "1lJBdydojsPz1fENl87l44",
    "title": "VALLAH - From “Cocktail 2”",
    "artist": "Bayanni",
    "album": "Cocktail 2 (Original Motion Picture Soundtrack)",
    "released": "2026-06-25",
    "streams": "54.0M",
    "listeners": "5.4M",
    "saves": "5M",
    "playlists": "27K",
    "trend": 54,
    "type": "Track",
    "popularity": 54,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/1lJBdydojsPz1fENl87l44",
    "duration_ms": 193591,
    "explicit": false
  },
  {
    "id": "1WQqCHy77aGHFK96qrsEEG",
    "title": "Ta Ta Ta",
    "artist": "Bayanni",
    "album": "Bayanni",
    "released": "2022-08-24",
    "streams": "64.0M",
    "listeners": "6.4M",
    "saves": "6M",
    "playlists": "32K",
    "trend": 64,
    "type": "Track",
    "popularity": 64,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/1WQqCHy77aGHFK96qrsEEG",
    "duration_ms": 159425,
    "explicit": true
  },
  {
    "id": "1pl4lrQsJgA9vy0bvU4IeY",
    "title": "Ta Ta Ta - with Jason Derulo",
    "artist": "Bayanni",
    "album": "Ta Ta Ta (with Jason Derulo)",
    "released": "2023-04-14",
    "streams": "51.0M",
    "listeners": "5.1M",
    "saves": "5M",
    "playlists": "26K",
    "trend": 51,
    "type": "Track",
    "popularity": 51,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/1pl4lrQsJgA9vy0bvU4IeY",
    "duration_ms": 159500,
    "explicit": true
  },
  {
    "id": "4HuciJ6VfCUkwoX4YFYj3f",
    "title": "Goddess",
    "artist": "Bayanni",
    "album": "Goddess",
    "released": "2024-08-30",
    "streams": "59.0M",
    "listeners": "5.9M",
    "saves": "6M",
    "playlists": "30K",
    "trend": 59,
    "type": "Track",
    "popularity": 59,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4HuciJ6VfCUkwoX4YFYj3f",
    "duration_ms": 150927,
    "explicit": false
  },
  {
    "id": "7gPfcWLq41GtuvwHNWGnZe",
    "title": "MENU",
    "artist": "Bayanni",
    "album": "MENU",
    "released": "2025-10-03",
    "streams": "59.0M",
    "listeners": "5.9M",
    "saves": "6M",
    "playlists": "30K",
    "trend": 59,
    "type": "Track",
    "popularity": 59,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7gPfcWLq41GtuvwHNWGnZe",
    "duration_ms": 159183,
    "explicit": true
  }
];
export const kpis: Kpi[] = [
  {
    "idx": 0,
    "label": "Monthly Streams",
    "value": "4.1B",
    "change": 79,
    "iconKey": "Play",
    "data": [
      {
        "i": 0,
        "v": 1.11
      },
      {
        "i": 1,
        "v": 1.21
      },
      {
        "i": 2,
        "v": 1.18
      },
      {
        "i": 3,
        "v": 1.15
      },
      {
        "i": 4,
        "v": 1.1
      },
      {
        "i": 5,
        "v": 1.19
      },
      {
        "i": 6,
        "v": 1.25
      },
      {
        "i": 7,
        "v": 1.29
      },
      {
        "i": 8,
        "v": 1.21
      }
    ]
  },
  {
    "idx": 1,
    "label": "Monthly Listeners",
    "value": "2.2M",
    "change": 76,
    "iconKey": "Users",
    "data": [
      {
        "i": 0,
        "v": 11.09
      },
      {
        "i": 1,
        "v": 12.14
      },
      {
        "i": 2,
        "v": 11.82
      },
      {
        "i": 3,
        "v": 11.49
      },
      {
        "i": 4,
        "v": 10.98
      },
      {
        "i": 5,
        "v": 11.89
      },
      {
        "i": 6,
        "v": 12.47
      },
      {
        "i": 7,
        "v": 12.93
      },
      {
        "i": 8,
        "v": 12.1
      }
    ]
  },
  {
    "idx": 2,
    "label": "Playlist Adds",
    "value": "1.2K",
    "change": 80,
    "iconKey": "Layers",
    "data": [
      {
        "i": 0,
        "v": 49.5
      },
      {
        "i": 1,
        "v": 54.18
      },
      {
        "i": 2,
        "v": 52.79
      },
      {
        "i": 3,
        "v": 51.31
      },
      {
        "i": 4,
        "v": 49.03
      },
      {
        "i": 5,
        "v": 53.06
      },
      {
        "i": 6,
        "v": 55.66
      },
      {
        "i": 7,
        "v": 57.72
      },
      {
        "i": 8,
        "v": 54.02
      }
    ]
  },
  {
    "idx": 3,
    "label": "TikTok Mentions",
    "value": "0",
    "change": 16,
    "iconKey": "Flame",
    "data": [
      {
        "i": 0,
        "v": 79.2
      },
      {
        "i": 1,
        "v": 87.26
      },
      {
        "i": 2,
        "v": 85.61
      },
      {
        "i": 3,
        "v": 83.83
      },
      {
        "i": 4,
        "v": 80.75
      },
      {
        "i": 5,
        "v": 87.78
      },
      {
        "i": 6,
        "v": 92.51
      },
      {
        "i": 7,
        "v": 96.39
      },
      {
        "i": 8,
        "v": 91.04
      }
    ]
  },
  {
    "idx": 4,
    "label": "Revenue Est.",
    "value": "$--",
    "change": 79,
    "iconKey": "DollarSign",
    "data": [
      {
        "i": 0,
        "v": 19.8
      },
      {
        "i": 1,
        "v": 21.67
      },
      {
        "i": 2,
        "v": 21.11
      },
      {
        "i": 3,
        "v": 20.52
      },
      {
        "i": 4,
        "v": 19.61
      },
      {
        "i": 5,
        "v": 21.22
      },
      {
        "i": 6,
        "v": 22.26
      },
      {
        "i": 7,
        "v": 23.09
      },
      {
        "i": 8,
        "v": 21.61
      }
    ]
  },
  {
    "idx": 5,
    "label": "Audience Growth",
    "value": "+47.2M",
    "change": 472,
    "iconKey": "TrendingUp",
    "data": [
      {
        "i": 0,
        "v": 39.6
      },
      {
        "i": 1,
        "v": 43.7
      },
      {
        "i": 2,
        "v": 42.95
      },
      {
        "i": 3,
        "v": 42.13
      },
      {
        "i": 4,
        "v": 40.67
      },
      {
        "i": 5,
        "v": 44.25
      },
      {
        "i": 6,
        "v": 46.69
      },
      {
        "i": 7,
        "v": 48.7
      },
      {
        "i": 8,
        "v": 46.09
      }
    ]
  }
];
export const campaigns: Campaign[] = [
  {
    "id": 1,
    "artist": "Rema",
    "song": "Calm Down (with Selena Gomez)",
    "status": "Active",
    "budget": "$170,000",
    "start": "Jun 1",
    "end": "Jun 30",
    "goal": "87M streams",
    "progress": 100,
    "daysLeft": 0
  },
  {
    "id": 2,
    "artist": "Ayra Starr",
    "song": "Secondhand (feat. Rema)",
    "status": "Planning",
    "budget": "$165,500",
    "start": "Jul 1",
    "end": "Jul 30",
    "goal": "84M streams",
    "progress": 100,
    "daysLeft": 0
  },
  {
    "id": 3,
    "artist": "Boy Spyce",
    "song": "Goals",
    "status": "Active",
    "budget": "$15,000",
    "start": "Aug 1",
    "end": "Aug 30",
    "goal": "8M streams",
    "progress": 48,
    "daysLeft": 18
  },
  {
    "id": 4,
    "artist": "Lovn",
    "song": "Soweto (with Don Toliver, Rema & Tempoe)",
    "status": "Draft",
    "budget": "$90,500",
    "start": "Sep 1",
    "end": "Sep 30",
    "goal": "45M streams",
    "progress": 100,
    "daysLeft": 0
  },
  {
    "id": 5,
    "artist": "CupidSZN",
    "song": "Calm Down",
    "status": "Completed",
    "budget": "$118,000",
    "start": "Oct 1",
    "end": "Oct 30",
    "goal": "58M streams",
    "progress": 100,
    "daysLeft": 0
  }
];
export const timelineActivities: TimelineDay[] = [
  {
    "date": "Jun 17",
    "day": 17,
    "items": [
      {
        "label": "Rema DSP Editorial Pitch",
        "type": "dsp",
        "color": "#3B82F6"
      },
      {
        "label": "Ayra Starr Creator Push",
        "type": "social",
        "color": "#EC4899"
      }
    ]
  },
  {
    "date": "Jun 18",
    "day": 18,
    "items": [
      {
        "label": "Ayra Starr Campaign Live",
        "type": "social",
        "color": "#EC4899"
      },
      {
        "label": "Meta Ads Launch",
        "type": "ads",
        "color": "#F59E0B"
      }
    ]
  },
  {
    "date": "Jun 19",
    "day": 19,
    "items": [
      {
        "label": "Boy Spyce Press Reviews",
        "type": "press",
        "color": "#6B6B6B"
      },
      {
        "label": "Email Blast – Fan CRM",
        "type": "crm",
        "color": "#10B981"
      }
    ]
  },
  {
    "date": "Jun 20",
    "day": 20,
    "items": [
      {
        "label": "Rema Radio Push",
        "type": "radio",
        "color": "#8B5CF6"
      },
      {
        "label": "Calm Down (with Selena Gomez) Creator Rollout",
        "type": "creator",
        "color": "#EC4899"
      },
      {
        "label": "YouTube Ads Live",
        "type": "ads",
        "color": "#EF4444"
      }
    ]
  },
  {
    "date": "Jun 21",
    "day": 21,
    "items": [
      {
        "label": "Lovn Release Day",
        "type": "release",
        "color": "#1DB954"
      },
      {
        "label": "Influencer Activations",
        "type": "influencer",
        "color": "#F59E0B"
      }
    ]
  },
  {
    "date": "Jun 22",
    "day": 22,
    "items": [
      {
        "label": "Reaction Video Campaign",
        "type": "creator",
        "color": "#EC4899"
      },
      {
        "label": "Secondhand (feat. Rema) Playlist Follow-up",
        "type": "dsp",
        "color": "#3B82F6"
      }
    ]
  },
  {
    "date": "Jun 23",
    "day": 23,
    "items": [
      {
        "label": "Community Engagement",
        "type": "community",
        "color": "#10B981"
      },
      {
        "label": "Streaming Report – Week 3",
        "type": "report",
        "color": "#6B6B6B"
      }
    ]
  }
];
export const calendarEvents: Record<number, { label: string; color: string }[]> = {
  "7": [
    {
      "label": "Rema Release",
      "color": "#1DB954"
    }
  ],
  "10": [
    {
      "label": "Emijay Promo Start",
      "color": "#F59E0B"
    }
  ],
  "12": [
    {
      "label": "Rema Radio Push",
      "color": "#8B5CF6"
    }
  ],
  "17": [
    {
      "label": "Today – CupidSZN TikTok",
      "color": "#EC4899"
    }
  ],
  "19": [
    {
      "label": "Magixx Interview",
      "color": "#6B6B6B"
    }
  ],
  "21": [
    {
      "label": "Calm Down (with Selena Gomez) Drop",
      "color": "#1DB954"
    }
  ],
  "24": [
    {
      "label": "Meta Ads Review",
      "color": "#3B82F6"
    }
  ],
  "28": [
    {
      "label": "Q3 Planning",
      "color": "#121212"
    }
  ]
};
export const suggestedPrompts: string[] = [
  "What streams did Calm Down (with Selena Gomez) generate yesterday?",
  "Compare Goals and Secondhand (feat. Rema) as of today.",
  "Which Ayra Starr songs gained most listeners in the UK?",
  "Generate a release strategy for Emijay.",
  "Summarize social sentiment for LADIPOE this week.",
  "Which artist had the highest audience growth this month?"
];
export const aiResponses: Record<string, string> = {
  "rema": "Rema is currently the strongest streaming signal in the label snapshot.\n\nThe most recent track-level signal is Calm Down (with Selena Gomez), which is being used as the anchor for live campaign planning.",
  "compare": "Calm Down (with Selena Gomez) and Secondhand (feat. Rema) are being compared using the live Chartmetric snapshot.\n\nCurrent leaders: Rema and Ayra Starr.",
  "ayra": "Ayra Starr has the clearest momentum signal in the live data, with 7.3M monthly listeners reported.",
  "cupid": "Use the live roster and track snapshot to build the release plan around Ayra Starr and Tornado.",
  "bayanni": "Live social context is not available from Chartmetric alone, so this section should be connected to XPOZ or another social source.",
  "growth": "Rema is the highest live-growth profile in this snapshot, followed by Ayra Starr."
};
export const streamingHistory: { month: string; streams: number; listeners: number }[] = [
  {
    "month": "Jan",
    "streams": 632,
    "listeners": 158
  },
  {
    "month": "Feb",
    "streams": 649,
    "listeners": 163
  },
  {
    "month": "Mar",
    "streams": 663,
    "listeners": 169
  },
  {
    "month": "Apr",
    "streams": 676,
    "listeners": 173
  },
  {
    "month": "May",
    "streams": 685,
    "listeners": 177
  },
  {
    "month": "Jun",
    "streams": 693,
    "listeners": 180
  },
  {
    "month": "Jul",
    "streams": 700,
    "listeners": 182
  },
  {
    "month": "Aug",
    "streams": 709,
    "listeners": 185
  },
  {
    "month": "Sep",
    "streams": 720,
    "listeners": 188
  },
  {
    "month": "Oct",
    "streams": 734,
    "listeners": 191
  },
  {
    "month": "Nov",
    "streams": 750,
    "listeners": 195
  },
  {
    "month": "Dec",
    "streams": 766,
    "listeners": 200
  }
];
export const searchIndex: SearchSection[] = [
  {
    "type": "ARTISTS",
    "items": [
      "Rema",
      "Ayra Starr",
      "Boy Spyce",
      "Lovn",
      "CupidSZN",
      "Magixx",
      "LADIPOE",
      "Emijay",
      "Real Dinoo",
      "Anari"
    ]
  },
  {
    "type": "SONGS",
    "items": [
      "Calm Down (with Selena Gomez)",
      "Secondhand (feat. Rema)",
      "Goals",
      "Soweto (with Don Toliver, Rema & Tempoe)",
      "Calm Down",
      "Santa",
      "Rush",
      "Tornado",
      "Commas",
      "Colorado"
    ]
  },
  {
    "type": "CAMPAIGNS",
    "items": [
      "Rema – Calm Down (with Selena Gomez)",
      "Ayra Starr – Secondhand (feat. Rema)",
      "Boy Spyce – Goals",
      "Lovn – Soweto (with Don Toliver, Rema & Tempoe)",
      "CupidSZN – Calm Down"
    ]
  },
  {
    "type": "SOCIAL LISTENING",
    "items": [
      "#Rema",
      "#AyraStarr",
      "#BoySpyce",
      "#Lovn"
    ]
  }
];
export const tornadoTimelineData: Record<string, { t: string; v: number }[]> = {
  "24h": [
    {
      "t": "0:00",
      "v": 1000
    },
    {
      "t": "1:00",
      "v": 1142
    },
    {
      "t": "2:00",
      "v": 1248
    },
    {
      "t": "3:00",
      "v": 1295
    },
    {
      "t": "4:00",
      "v": 1282
    },
    {
      "t": "5:00",
      "v": 1225
    },
    {
      "t": "6:00",
      "v": 1160
    },
    {
      "t": "7:00",
      "v": 1123
    },
    {
      "t": "8:00",
      "v": 1141
    },
    {
      "t": "9:00",
      "v": 1221
    },
    {
      "t": "10:00",
      "v": 1350
    },
    {
      "t": "11:00",
      "v": 1496
    },
    {
      "t": "12:00",
      "v": 1623
    },
    {
      "t": "13:00",
      "v": 1700
    },
    {
      "t": "14:00",
      "v": 1714
    },
    {
      "t": "15:00",
      "v": 1674
    },
    {
      "t": "16:00",
      "v": 1609
    },
    {
      "t": "17:00",
      "v": 1554
    },
    {
      "t": "18:00",
      "v": 1543
    },
    {
      "t": "19:00",
      "v": 1595
    },
    {
      "t": "20:00",
      "v": 1703
    },
    {
      "t": "21:00",
      "v": 1846
    },
    {
      "t": "22:00",
      "v": 1987
    },
    {
      "t": "23:00",
      "v": 2090
    }
  ],
  "7d": [
    {
      "t": "Mon",
      "v": 14000
    },
    {
      "t": "Tue",
      "v": 17444
    },
    {
      "t": "Wed",
      "v": 20585
    },
    {
      "t": "Thu",
      "v": 23263
    },
    {
      "t": "Fri",
      "v": 25535
    },
    {
      "t": "Sat",
      "v": 27649
    },
    {
      "t": "Sun",
      "v": 29928
    }
  ],
  "28d": [
    {
      "t": "1",
      "v": 7000
    },
    {
      "t": "2",
      "v": 9057
    },
    {
      "t": "3",
      "v": 10978
    },
    {
      "t": "4",
      "v": 12650
    },
    {
      "t": "5",
      "v": 13999
    },
    {
      "t": "6",
      "v": 15000
    },
    {
      "t": "7",
      "v": 15686
    },
    {
      "t": "8",
      "v": 16137
    },
    {
      "t": "9",
      "v": 16472
    },
    {
      "t": "10",
      "v": 16826
    },
    {
      "t": "11",
      "v": 17335
    },
    {
      "t": "12",
      "v": 18106
    },
    {
      "t": "13",
      "v": 19208
    },
    {
      "t": "14",
      "v": 20656
    },
    {
      "t": "15",
      "v": 22411
    },
    {
      "t": "16",
      "v": 24385
    },
    {
      "t": "17",
      "v": 26456
    },
    {
      "t": "18",
      "v": 28487
    },
    {
      "t": "19",
      "v": 30346
    },
    {
      "t": "20",
      "v": 31929
    },
    {
      "t": "21",
      "v": 33177
    },
    {
      "t": "22",
      "v": 34080
    },
    {
      "t": "23",
      "v": 34687
    },
    {
      "t": "24",
      "v": 35090
    },
    {
      "t": "25",
      "v": 35416
    },
    {
      "t": "26",
      "v": 35803
    },
    {
      "t": "27",
      "v": 36379
    },
    {
      "t": "28",
      "v": 37242
    }
  ],
  "90d": [
    {
      "t": "W1",
      "v": 25000
    },
    {
      "t": "W2",
      "v": 33418
    },
    {
      "t": "W3",
      "v": 41366
    },
    {
      "t": "W4",
      "v": 48490
    },
    {
      "t": "W5",
      "v": 54637
    },
    {
      "t": "W6",
      "v": 59894
    },
    {
      "t": "W7",
      "v": 64564
    },
    {
      "t": "W8",
      "v": 69097
    },
    {
      "t": "W9",
      "v": 73973
    },
    {
      "t": "W10",
      "v": 79590
    },
    {
      "t": "W11",
      "v": 86164
    },
    {
      "t": "W12",
      "v": 93678
    }
  ]
};
export const platformBreakdown: { name: string; posts: string; creators: string; engagement: string; reach: string; views: string; growth: number; color: string }[] = [
  {
    "name": "TikTok",
    "posts": "380.0K",
    "creators": "60.8K",
    "engagement": "608.0M",
    "reach": "1.4M",
    "views": "2.4M",
    "growth": 76,
    "color": "#121212"
  },
  {
    "name": "Instagram",
    "posts": "237.0K",
    "creators": "39.5K",
    "engagement": "158.0M",
    "reach": "474.0M",
    "views": "632.0M",
    "growth": 79,
    "color": "#E1306C"
  },
  {
    "name": "X / Twitter",
    "posts": "39.0K",
    "creators": "7.0K",
    "engagement": "140.0M",
    "reach": "220.0M",
    "views": "470.0M",
    "growth": 0,
    "color": "#1DA1F2"
  }
];
export const topCreators: { name: string; platform: string; followers: string; posts: number; engagement: string; reach: string; score: number }[] = [
  {
    "name": "@ayrastarr_fan",
    "platform": "TikTok",
    "followers": "1.2M",
    "posts": 3,
    "engagement": "240K",
    "reach": "2.1M",
    "score": 99
  },
  {
    "name": "@ladipoe_creator",
    "platform": "Instagram",
    "followers": "860K",
    "posts": 5,
    "engagement": "180K",
    "reach": "1.4M",
    "score": 99
  },
  {
    "name": "@afrobeatsdaily",
    "platform": "TikTok",
    "followers": "920K",
    "posts": 8,
    "engagement": "620K",
    "reach": "4.8M",
    "score": 87
  }
];
export const topConversations: { author: string; platform: string; followers: string; preview: string; engagement: string; reach: string; score: number; date: string }[] = [
  {
    "author": "@ayrastarr_fan",
    "platform": "TikTok",
    "followers": "1.2M",
    "preview": "Calm Down (with Selena Gomez) is the record everyone keeps replaying.",
    "engagement": "240K",
    "reach": "2.1M",
    "score": 92,
    "date": "Jun 14"
  },
  {
    "author": "@musicNG",
    "platform": "X/Twitter",
    "followers": "680K",
    "preview": "Ayra Starr is gaining momentum across core markets.",
    "engagement": "210K",
    "reach": "2.4M",
    "score": 82,
    "date": "Jun 15"
  }
];
export const competitors: { artist: string; song: string; mentions: string; reach: string; engagement: string; sentiment: number; streams: string; color: string }[] = [
  {
    "artist": "Ayra Starr",
    "song": "Calm Down (with Selena Gomez)",
    "mentions": "1.1K",
    "reach": "15.2M",
    "engagement": "932.0M",
    "sentiment": 99,
    "streams": "730.0M",
    "color": "#EC4899"
  },
  {
    "artist": "LADIPOE",
    "song": "Secondhand (feat. Rema)",
    "mentions": "824.0K",
    "reach": "11.6M",
    "engagement": "729.0M",
    "sentiment": 99,
    "streams": "542.0M",
    "color": "#1DB954"
  }
];
export const aiConvInsights: string[] = [
  "Calm Down (with Selena Gomez) conversation is outpacing recent streaming growth by a clear margin.",
  "Ayra Starr is carrying the strongest live momentum in the current roster snapshot.",
  "Creator content and short-form video remain the primary conversation drivers.",
  "Market activity is concentrating around Nigeria, the UK, and South Africa."
];
export const slSuggestions: { label: string; type: string }[] = [
  {
    "label": "Ayra Starr — Calm Down (with Selena Gomez)",
    "type": "Song"
  },
  {
    "label": "Ayra Starr — Live momentum",
    "type": "Artist"
  },
  {
    "label": "LADIPOE — Audience growth",
    "type": "Artist"
  },
  {
    "label": "#CalmDown(withSelenaGomez)",
    "type": "Hashtag"
  },
  {
    "label": "Ayra Starr",
    "type": "Artist"
  },
  {
    "label": "Rave & Roses Ultra",
    "type": "Album"
  },
  {
    "label": "LADIPOE",
    "type": "Artist"
  },
  {
    "label": "Afrobeats",
    "type": "Keyword"
  }
];
