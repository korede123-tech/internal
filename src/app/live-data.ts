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
    "id": "artist-1",
    "name": "Rema",
    "genre": "Music",
    "country": "Global",
    "monthlyListeners": "0M",
    "totalStreams": "0M",
    "growth": 0,
    "release": "Live catalog",
    "color": "#8B5CF6",
    "initials": "R",
    "status": "active",
    "image_url": null,
    "spotify_url": "",
    "popularity": 0,
    "followers": 0
  },
  {
    "id": "artist-2",
    "name": "Ayra Starr",
    "genre": "Music",
    "country": "Global",
    "monthlyListeners": "0M",
    "totalStreams": "0M",
    "growth": 0,
    "release": "Live catalog",
    "color": "#EC4899",
    "initials": "AS",
    "status": "active",
    "image_url": null,
    "spotify_url": "",
    "popularity": 0,
    "followers": 0
  },
  {
    "id": "6DUbLg2GQ7Dd7G9v6uwoPT",
    "name": "Boy Spyce",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "856.7M",
    "totalStreams": "1.5M",
    "growth": 54,
    "release": "Carry Me Go",
    "color": "#3B82F6",
    "initials": "BS",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb197bbae6b5439d5998812a75",
    "spotify_url": "https://open.spotify.com/artist/6DUbLg2GQ7Dd7G9v6uwoPT",
    "popularity": 54,
    "followers": 856716
  },
  {
    "id": "2XHk8hsNkttV09BnFR7rTG",
    "name": "Lov'nee",
    "genre": "shatta",
    "country": "Global",
    "monthlyListeners": "4.9M",
    "totalStreams": "911.0M",
    "growth": 39,
    "release": "Anonymat",
    "color": "#F59E0B",
    "initials": "L",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb9fa41e46545d3a0f949cca0e",
    "spotify_url": "https://open.spotify.com/artist/2XHk8hsNkttV09BnFR7rTG",
    "popularity": 39,
    "followers": 4885
  },
  {
    "id": "150lmofYTz4i9fnVzM6AZZ",
    "name": "CupidSZN",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "35.2M",
    "totalStreams": "853.0M",
    "growth": 49,
    "release": "Ifeoma",
    "color": "#10B981",
    "initials": "C",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb57bab8e67da94644fa331941",
    "spotify_url": "https://open.spotify.com/artist/150lmofYTz4i9fnVzM6AZZ",
    "popularity": 49,
    "followers": 35172
  },
  {
    "id": "artist-6",
    "name": "Magixx",
    "genre": "Music",
    "country": "Global",
    "monthlyListeners": "0M",
    "totalStreams": "0M",
    "growth": 0,
    "release": "Live catalog",
    "color": "#06B6D4",
    "initials": "M",
    "status": "active",
    "image_url": null,
    "spotify_url": "",
    "popularity": 0,
    "followers": 0
  },
  {
    "id": "artist-7",
    "name": "LADIPOE",
    "genre": "Music",
    "country": "Global",
    "monthlyListeners": "0M",
    "totalStreams": "0M",
    "growth": 0,
    "release": "Live catalog",
    "color": "#1DB954",
    "initials": "L",
    "status": "active",
    "image_url": null,
    "spotify_url": "",
    "popularity": 0,
    "followers": 0
  },
  {
    "id": "2iL8DuQkmwrpyv9YPydsZZ",
    "name": "Emijay",
    "genre": "Music",
    "country": "Global",
    "monthlyListeners": "590M",
    "totalStreams": "99.0M",
    "growth": 16,
    "release": "Weakness",
    "color": "#EF4444",
    "initials": "E",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5eb4d12081994460fa923445c19",
    "spotify_url": "https://open.spotify.com/artist/2iL8DuQkmwrpyv9YPydsZZ",
    "popularity": 16,
    "followers": 590
  },
  {
    "id": "3r3K4zm1MOUbvkGwTFvh40",
    "name": "Real Dinoo",
    "genre": "alté",
    "country": "Global",
    "monthlyListeners": "2.4M",
    "totalStreams": "78.0M",
    "growth": 25,
    "release": "LAGADIS",
    "color": "#A855F7",
    "initials": "RD",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5ebd591d6a8f5d6a22f9726f7d3",
    "spotify_url": "https://open.spotify.com/artist/3r3K4zm1MOUbvkGwTFvh40",
    "popularity": 25,
    "followers": 2418
  },
  {
    "id": "6FbCERtE2CKqEWihHMYjcG",
    "name": "Bayanni",
    "genre": "afrobeats",
    "country": "Global",
    "monthlyListeners": "414.8M",
    "totalStreams": "1.4M",
    "growth": 57,
    "release": "VALLAH - From “Cocktail 2”",
    "color": "#8B5CF6",
    "initials": "B",
    "status": "active",
    "image_url": "https://i.scdn.co/image/ab6761610000e5ebec9db3d4de7709c1425c9e92",
    "spotify_url": "https://open.spotify.com/artist/6FbCERtE2CKqEWihHMYjcG",
    "popularity": 57,
    "followers": 414752
  },
  {
    "id": "artist-11",
    "name": "Johnny Drille",
    "genre": "Music",
    "country": "Global",
    "monthlyListeners": "0M",
    "totalStreams": "0M",
    "growth": 0,
    "release": "Live catalog",
    "color": "#EC4899",
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
    "id": "7qxtOyjZ2zSaxBPH8fLyNi",
    "title": "Carry Me Go",
    "artist": "Boy Spyce",
    "album": "Carry Me Go",
    "released": "2023-03-13",
    "streams": "59.0M",
    "listeners": "5.9M",
    "saves": "6M",
    "playlists": "30K",
    "trend": 59,
    "type": "Track",
    "popularity": 59,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7qxtOyjZ2zSaxBPH8fLyNi",
    "duration_ms": 136464,
    "explicit": true
  },
  {
    "id": "0Vf5YS7dS9xABKnfvzGf1T",
    "title": "Super Woman",
    "artist": "Boy Spyce",
    "album": "Super Woman",
    "released": "2026-05-14",
    "streams": "57.0M",
    "listeners": "5.7M",
    "saves": "6M",
    "playlists": "29K",
    "trend": 57,
    "type": "Track",
    "popularity": 57,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/0Vf5YS7dS9xABKnfvzGf1T",
    "duration_ms": 198709,
    "explicit": true
  },
  {
    "id": "4qFxZKXdRJoN8fzMFlvNli",
    "title": "Achalugo",
    "artist": "Boy Spyce",
    "album": "Achalugo",
    "released": "2025-04-25",
    "streams": "56.0M",
    "listeners": "5.6M",
    "saves": "6M",
    "playlists": "28K",
    "trend": 56,
    "type": "Track",
    "popularity": 56,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4qFxZKXdRJoN8fzMFlvNli",
    "duration_ms": 156889,
    "explicit": false
  },
  {
    "id": "6p1qrgCy5epVwjlbUXdps4",
    "title": "ARISE",
    "artist": "Boy Spyce",
    "album": "Arise",
    "released": "2026-03-27",
    "streams": "56.0M",
    "listeners": "5.6M",
    "saves": "6M",
    "playlists": "28K",
    "trend": 56,
    "type": "Track",
    "popularity": 56,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/6p1qrgCy5epVwjlbUXdps4",
    "duration_ms": 166736,
    "explicit": true
  },
  {
    "id": "2cWvscloCXBZGJUUpDiXyH",
    "title": "Relationship",
    "artist": "Boy Spyce",
    "album": "Relationship",
    "released": "2023-05-10",
    "streams": "54.0M",
    "listeners": "5.4M",
    "saves": "5M",
    "playlists": "27K",
    "trend": 54,
    "type": "Track",
    "popularity": 54,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/2cWvscloCXBZGJUUpDiXyH",
    "duration_ms": 172800,
    "explicit": false
  },
  {
    "id": "7rUXCDPVaXL02EKvSiuwl9",
    "title": "Anonymat",
    "artist": "Lov'nee",
    "album": "Anonymat",
    "released": "2026-05-15",
    "streams": "52.0M",
    "listeners": "5.2M",
    "saves": "5M",
    "playlists": "26K",
    "trend": 52,
    "type": "Track",
    "popularity": 52,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7rUXCDPVaXL02EKvSiuwl9",
    "duration_ms": 144000,
    "explicit": true
  },
  {
    "id": "1sKbGxxkqAxHeuxrRvabOO",
    "title": "Shatta Rédhibitoire",
    "artist": "Lov'nee",
    "album": "Shatta Rédhibitoire",
    "released": "2026-05-01",
    "streams": "50.0M",
    "listeners": "5.0M",
    "saves": "5M",
    "playlists": "25K",
    "trend": 50,
    "type": "Track",
    "popularity": 50,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/1sKbGxxkqAxHeuxrRvabOO",
    "duration_ms": 135445,
    "explicit": true
  },
  {
    "id": "0JYGs8gV2lgc48Mu9e1ptI",
    "title": "Reality",
    "artist": "Lov'nee",
    "album": "Reality",
    "released": "2024-10-20",
    "streams": "40.0M",
    "listeners": "4.0M",
    "saves": "4M",
    "playlists": "20K",
    "trend": 40,
    "type": "Track",
    "popularity": 40,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/0JYGs8gV2lgc48Mu9e1ptI",
    "duration_ms": 180312,
    "explicit": true
  },
  {
    "id": "7G6Af0gzbQ69kCcsm7w99f",
    "title": "MAL TET'",
    "artist": "Lov'nee",
    "album": "MAL TET'",
    "released": "2024-07-19",
    "streams": "40.0M",
    "listeners": "4.0M",
    "saves": "4M",
    "playlists": "20K",
    "trend": 40,
    "type": "Track",
    "popularity": 40,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/7G6Af0gzbQ69kCcsm7w99f",
    "duration_ms": 114343,
    "explicit": true
  },
  {
    "id": "5JVY2jqxOUUtPPDtMw3yP4",
    "title": "FESTIN",
    "artist": "Lov'nee",
    "album": "LUNAR",
    "released": "2024-07-25",
    "streams": "38.0M",
    "listeners": "3.8M",
    "saves": "4M",
    "playlists": "19K",
    "trend": 38,
    "type": "Track",
    "popularity": 38,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/5JVY2jqxOUUtPPDtMw3yP4",
    "duration_ms": 93525,
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
    "streams": "50.0M",
    "listeners": "5.0M",
    "saves": "5M",
    "playlists": "25K",
    "trend": 50,
    "type": "Track",
    "popularity": 50,
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
    "streams": "50.0M",
    "listeners": "5.0M",
    "saves": "5M",
    "playlists": "25K",
    "trend": 50,
    "type": "Track",
    "popularity": 50,
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
    "streams": "29.0M",
    "listeners": "2.9M",
    "saves": "3M",
    "playlists": "15K",
    "trend": 29,
    "type": "Track",
    "popularity": 29,
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
    "streams": "8.0M",
    "listeners": "800.0M",
    "saves": "1M",
    "playlists": "4K",
    "trend": 8,
    "type": "Track",
    "popularity": 8,
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
    "streams": "7.0M",
    "listeners": "700.0M",
    "saves": "1M",
    "playlists": "4K",
    "trend": 7,
    "type": "Track",
    "popularity": 7,
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
    "streams": "6.0M",
    "listeners": "600.0M",
    "saves": "1M",
    "playlists": "3K",
    "trend": 6,
    "type": "Track",
    "popularity": 6,
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
    "explicit": false
  },
  {
    "id": "4OmUGnKDIkAmpckffBzAG3",
    "title": "DEAN",
    "artist": "Real Dinoo",
    "album": "DEAN",
    "released": "2026-05-01",
    "streams": "33.0M",
    "listeners": "3.3M",
    "saves": "3M",
    "playlists": "17K",
    "trend": 33,
    "type": "Track",
    "popularity": 33,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4OmUGnKDIkAmpckffBzAG3",
    "duration_ms": 152799,
    "explicit": false
  },
  {
    "id": "4ghNyHEWBeYan20mwSWDQ8",
    "title": "VALLAH - From “Cocktail 2”",
    "artist": "Bayanni",
    "album": "VALLAH (From “Cocktail 2”)",
    "released": "2026-06-09",
    "streams": "65.0M",
    "listeners": "6.5M",
    "saves": "7M",
    "playlists": "33K",
    "trend": 65,
    "type": "Track",
    "popularity": 65,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/4ghNyHEWBeYan20mwSWDQ8",
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
    "id": "3rmqNsOiGqqvFNTmGlzl4R",
    "title": "Ta Ta Ta",
    "artist": "Bayanni",
    "album": "Bayanni",
    "released": "2022-08-24",
    "streams": "63.0M",
    "listeners": "6.3M",
    "saves": "6M",
    "playlists": "32K",
    "trend": 63,
    "type": "Track",
    "popularity": 63,
    "preview_url": null,
    "spotify_url": "https://open.spotify.com/track/3rmqNsOiGqqvFNTmGlzl4R",
    "duration_ms": 159425,
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
    "streams": "58.0M",
    "listeners": "5.8M",
    "saves": "6M",
    "playlists": "29K",
    "trend": 58,
    "type": "Track",
    "popularity": 58,
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
    "value": "1.9B",
    "change": 0,
    "iconKey": "Play",
    "data": [
      {
        "i": 0,
        "v": 0
      },
      {
        "i": 1,
        "v": 0
      },
      {
        "i": 2,
        "v": 0
      },
      {
        "i": 3,
        "v": 0
      },
      {
        "i": 4,
        "v": 0
      },
      {
        "i": 5,
        "v": 0
      },
      {
        "i": 6,
        "v": 0
      },
      {
        "i": 7,
        "v": 0
      },
      {
        "i": 8,
        "v": 0
      }
    ]
  },
  {
    "idx": 1,
    "label": "Monthly Listeners",
    "value": "1.9M",
    "change": 0,
    "iconKey": "Users",
    "data": [
      {
        "i": 0,
        "v": 0
      },
      {
        "i": 1,
        "v": 0
      },
      {
        "i": 2,
        "v": 0
      },
      {
        "i": 3,
        "v": 0
      },
      {
        "i": 4,
        "v": 0
      },
      {
        "i": 5,
        "v": 0
      },
      {
        "i": 6,
        "v": 0
      },
      {
        "i": 7,
        "v": 0
      },
      {
        "i": 8,
        "v": 0
      }
    ]
  },
  {
    "idx": 2,
    "label": "Playlist Adds",
    "value": "623K",
    "change": 59,
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
    "change": 0,
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
    "value": "+24.0M",
    "change": 240,
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
    "song": "Carry Me Go",
    "status": "Active",
    "budget": "$12,000",
    "start": "Jun 1",
    "end": "Jun 30",
    "goal": "8M streams",
    "progress": 0,
    "daysLeft": 30
  },
  {
    "id": 2,
    "artist": "Ayra Starr",
    "song": "Super Woman",
    "status": "Planning",
    "budget": "$13,500",
    "start": "Jul 1",
    "end": "Jul 30",
    "goal": "8M streams",
    "progress": 24,
    "daysLeft": 24
  },
  {
    "id": 3,
    "artist": "Boy Spyce",
    "song": "Achalugo",
    "status": "Active",
    "budget": "$123,000",
    "start": "Aug 1",
    "end": "Aug 30",
    "goal": "62M streams",
    "progress": 100,
    "daysLeft": 0
  },
  {
    "id": 4,
    "artist": "Lov'nee",
    "song": "ARISE",
    "status": "Draft",
    "budget": "$94,500",
    "start": "Sep 1",
    "end": "Sep 30",
    "goal": "47M streams",
    "progress": 100,
    "daysLeft": 0
  },
  {
    "id": 5,
    "artist": "CupidSZN",
    "song": "Relationship",
    "status": "Completed",
    "budget": "$116,000",
    "start": "Oct 1",
    "end": "Oct 30",
    "goal": "57M streams",
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
        "label": "Carry Me Go Creator Rollout",
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
        "label": "Lov'nee Release Day",
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
        "label": "Super Woman Playlist Follow-up",
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
      "label": "Carry Me Go Drop",
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
  "What streams did Carry Me Go generate yesterday?",
  "Compare Achalugo and Super Woman as of today.",
  "Which Ayra Starr songs gained most listeners in the UK?",
  "Generate a release strategy for Emijay.",
  "Summarize social sentiment for LADIPOE this week.",
  "Which artist had the highest audience growth this month?"
];
export const aiResponses: Record<string, string> = {
  "rema": "Rema is currently the strongest streaming signal in the label snapshot.\n\nThe most recent track-level signal is Carry Me Go, which is being used as the anchor for live campaign planning.",
  "compare": "Carry Me Go and Super Woman are being compared using the live Chartmetric snapshot.\n\nCurrent leaders: Rema and Ayra Starr.",
  "ayra": "Ayra Starr has the clearest momentum signal in the live data, with 0M monthly listeners reported.",
  "cupid": "Use the live roster and track snapshot to build the release plan around Ayra Starr and Reality.",
  "bayanni": "Live social context is not available from Chartmetric alone, so this section should be connected to XPOZ or another social source.",
  "growth": "Rema is the highest live-growth profile in this snapshot, followed by Ayra Starr."
};
export const streamingHistory: { month: string; streams: number; listeners: number }[] = [
  {
    "month": "Jan",
    "streams": 456,
    "listeners": 114
  },
  {
    "month": "Feb",
    "streams": 473,
    "listeners": 119
  },
  {
    "month": "Mar",
    "streams": 487,
    "listeners": 125
  },
  {
    "month": "Apr",
    "streams": 500,
    "listeners": 129
  },
  {
    "month": "May",
    "streams": 509,
    "listeners": 133
  },
  {
    "month": "Jun",
    "streams": 517,
    "listeners": 136
  },
  {
    "month": "Jul",
    "streams": 524,
    "listeners": 138
  },
  {
    "month": "Aug",
    "streams": 533,
    "listeners": 141
  },
  {
    "month": "Sep",
    "streams": 544,
    "listeners": 144
  },
  {
    "month": "Oct",
    "streams": 558,
    "listeners": 147
  },
  {
    "month": "Nov",
    "streams": 574,
    "listeners": 151
  },
  {
    "month": "Dec",
    "streams": 590,
    "listeners": 156
  }
];
export const searchIndex: SearchSection[] = [
  {
    "type": "ARTISTS",
    "items": [
      "Rema",
      "Ayra Starr",
      "Boy Spyce",
      "Lov'nee",
      "CupidSZN",
      "Magixx",
      "LADIPOE",
      "Emijay",
      "Real Dinoo",
      "Bayanni"
    ]
  },
  {
    "type": "SONGS",
    "items": [
      "Carry Me Go",
      "Super Woman",
      "Achalugo",
      "ARISE",
      "Relationship",
      "Anonymat",
      "Shatta Rédhibitoire",
      "Reality",
      "MAL TET'",
      "FESTIN"
    ]
  },
  {
    "type": "CAMPAIGNS",
    "items": [
      "Rema – Carry Me Go",
      "Ayra Starr – Super Woman",
      "Boy Spyce – Achalugo",
      "Lov'nee – ARISE",
      "CupidSZN – Relationship"
    ]
  },
  {
    "type": "SOCIAL LISTENING",
    "items": [
      "#Rema",
      "#AyraStarr",
      "#BoySpyce",
      "#Lov'nee"
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
    "posts": "120.0K",
    "creators": "12.0K",
    "engagement": "500.0M",
    "reach": "1.0M",
    "views": "3.5M",
    "growth": 0,
    "color": "#121212"
  },
  {
    "name": "Instagram",
    "posts": "54.0K",
    "creators": "9.0K",
    "engagement": "180.0M",
    "reach": "320.0M",
    "views": "680.0M",
    "growth": 0,
    "color": "#E1306C"
  },
  {
    "name": "X / Twitter",
    "posts": "97.2K",
    "creators": "21.6K",
    "engagement": "64.8M",
    "reach": "194.4M",
    "views": "334.8M",
    "growth": 54,
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
    "score": 78
  },
  {
    "name": "@ladipoe_creator",
    "platform": "Instagram",
    "followers": "860K",
    "posts": 5,
    "engagement": "180K",
    "reach": "1.4M",
    "score": 74
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
    "preview": "Carry Me Go is the record everyone keeps replaying.",
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
    "song": "Carry Me Go",
    "mentions": "150.0K",
    "reach": "1.5M",
    "engagement": "400.0M",
    "sentiment": 84,
    "streams": "0M",
    "color": "#EC4899"
  },
  {
    "artist": "LADIPOE",
    "song": "Super Woman",
    "mentions": "140.0K",
    "reach": "1.3M",
    "engagement": "330.0M",
    "sentiment": 86,
    "streams": "0M",
    "color": "#1DB954"
  }
];
export const aiConvInsights: string[] = [
  "Carry Me Go conversation is outpacing recent streaming growth by a clear margin.",
  "Ayra Starr is carrying the strongest live momentum in the current roster snapshot.",
  "Creator content and short-form video remain the primary conversation drivers.",
  "Market activity is concentrating around Nigeria, the UK, and South Africa."
];
export const slSuggestions: { label: string; type: string }[] = [
  {
    "label": "Ayra Starr — Carry Me Go",
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
    "label": "#CarryMeGo",
    "type": "Hashtag"
  },
  {
    "label": "Ayra Starr",
    "type": "Artist"
  },
  {
    "label": "Carry Me Go",
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
