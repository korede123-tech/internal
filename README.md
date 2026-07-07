
  # INTERNAL — Mavin Intelligence Platform

  Artist and music data is powered by the **Spotify Web API**. Social listening uses XPOZ. AI insights use Cohere.

  ## Setup

  ```bash
  npm install
  ```

  Ensure `.env` contains your API keys (at minimum `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`).

  ## Running locally

  Start the API server and Vite dev server together:

  ```bash
  npm run dev
  ```

This will:
1. Generate static seed data from Spotify (`src/app/live-data.ts`)
2. Start the API server on port **4000**
3. Start the Vite dev server (proxies `/api` → port 4000)

Open the URL shown by Vite (typically `http://localhost:5173`).

## Deployment note

The frontend expects the Spotify/Chartmetric proxy to be available at the same origin under `/api` by default. If you deploy the UI separately from the Express API, set `VITE_API_BASE_URL`, `VITE_SPOTIFY_PROXY_URL`, and `VITE_CHARTMETRIC_PROXY_URL` to the real backend origin so catalog and release requests keep working on iOS and other mobile browsers.

  ### Run services separately

  ```bash
  npm run start:api      # API server only (port 4000)
  npm run dev:vite       # Vite only (requires API server running)
  npm run generate:data  # Refresh static Spotify seed data
  ```

  ## API endpoints

  | Endpoint | Source | Description |
  |----------|--------|-------------|
  | `GET /api/spotify/live` | Spotify | Full roster, songs, KPIs, streaming history |
  | `GET /api/spotify/artist-catalog?name=...` | Spotify | Artist profile + full catalog |
  | `GET /api/spotify/artist?name=...` | Spotify | Same as artist-catalog |
  | `GET /api/xpoz/live` | XPOZ | Social listening data |
  | `GET /api/cohere/live` | Cohere | AI prompts and insights |

  ## Spotify data notes

  The Spotify Web API provides **followers**, **popularity scores** (0–100), **top tracks**, and **catalog metadata**. Raw stream counts and monthly listeners are not available via the public API — popularity scores are used as the streaming proxy throughout the UI.

  ## Security

  Never commit `.env` or expose API secrets in frontend builds. The API server keeps credentials server-side during local development.
