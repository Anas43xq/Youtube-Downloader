# YTDL — Technical Documentation

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Backend](#2-backend)
   - [server.js](#21-serverjs)
   - [routes/info.js](#22-routesinfojs)
   - [routes/download.js](#23-routesdownloadjs)
   - [services/youtubeService.js](#24-servicesyoutubeservicejs)
3. [Frontend](#3-frontend)
   - [App.jsx](#31-appjsx)
   - [VideoInput.jsx](#32-videoinputjsx)
   - [VideoPlayer.jsx](#33-videoplayerjsx)
   - [TimelineSlider.jsx](#34-timelinesliderjsx)
   - [QualitySelector.jsx](#35-qualityselectorjsx)
   - [DownloadButton.jsx](#36-downloadbuttonjsx)
4. [Data Flow](#4-data-flow)
5. [API Reference](#5-api-reference)
6. [Configuration](#6-configuration)
7. [yt-dlp Integration](#7-yt-dlp-integration)
8. [Build & Deployment](#8-build--deployment)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────┐
│              Browser (localhost:3001)        │
│                                             │
│  React SPA (Vite build served by Express)  │
│                                             │
│  VideoInput → App state → VideoPlayer       │
│                        → TimelineSlider     │
│                        → QualitySelector    │
│                        → DownloadButton     │
└──────────────┬──────────────────────────────┘
               │  fetch /api/info
               │  fetch /api/download
               ▼
┌─────────────────────────────────────────────┐
│        Express Backend (port 3001)          │
│                                             │
│  routes/info.js    → youtubeService.getVideoInfo()  │
│  routes/download.js → youtubeService.downloadVideo() │
└──────────────┬──────────────────────────────┘
               │  spawns process
               ▼
┌─────────────────────────────────────────────┐
│           yt-dlp (system binary)            │
│  Downloads video/audio fragments            │
│  Merges with ffmpeg (if clip mode)          │
│  Saves to C:\Users\Anas\Downloads\          │
└─────────────────────────────────────────────┘
```

**Key design decisions:**
- The backend does **not stream** video data through Express — yt-dlp writes directly to the Downloads folder. The frontend only receives a JSON response with the saved filename.
- In production, Express statically serves the Vite build from `frontend/dist`, so only **one server** is needed.
- In development, Vite runs its own dev server on port 5173 with HMR, and the backend is on 3001 with CORS enabled.

---

## 2. Backend

### 2.1 `server.js`

Entry point for the Express app.

**Responsibilities:**
- Registers API routers (`/api/info`, `/api/download`)
- In **production** (`NODE_ENV=production`): serves `frontend/dist` as static files and returns `index.html` for all non-API routes (SPA fallback). `index.html` is served with `Cache-Control: no-store` to prevent browser caching stale builds.
- In **development**: enables CORS for `http://localhost:5173`
- Global error handler converts unhandled errors to JSON `500` responses

**Environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port the server listens on |
| `NODE_ENV` | `development` | Set to `production` to serve frontend static files |

---

### 2.2 `routes/info.js`

Handles `GET /api/info?url=<youtube_url>`

**Flow:**
1. Validates `url` query param is present
2. Calls `youtubeService.getVideoInfo(url)`
3. Returns metadata JSON
4. Any error is forwarded to the global error handler → `500`

---

### 2.3 `routes/download.js`

Handles `GET /api/download?url=<youtube_url>&quality=<q>[&startTime=<s>][&endTime=<s>]`

**Parameters:**

| Param | Required | Values | Description |
|-------|----------|--------|-------------|
| `url` | Yes | YouTube URL | Video to download |
| `quality` | No | `360`, `480`, `720`, `1080` | Defaults to `720` |
| `startTime` | No | Seconds (float) | Clip start point |
| `endTime` | No | Seconds (float) | Clip end point |

**Flow:**
1. Validates `url` and `quality`
2. Parses `startTime` / `endTime` as floats (clamped to `>= 0`)
3. Calls `youtubeService.downloadVideo(url, quality, startTime, endTime)`
4. Returns `{ success: true, filename: "..." }`

---

### 2.4 `services/youtubeService.js`

Core logic. All yt-dlp interaction lives here.

#### `getVideoInfo(url)`

Calls `ytDlp.getVideoInfo(url)` (yt-dlp-wrap wrapper around `yt-dlp --dump-json`).

Returns:
```js
{
  title: string,
  duration: "HH:MM:SS",
  durationSeconds: number,
  thumbnail: string | null,
  uploader: string | null,
  viewCount: number | null,
  availableQualities: string[]   // filtered to [360, 480, 720, 1080]
}
```

#### `downloadVideo(url, quality, startTime, endTime)`

Builds yt-dlp arguments and executes the download.

**Format selector** (tries each in order, most preferred first):
```
bestvideo[height<=Q][ext=mp4]+bestaudio[ext=m4a]
bestvideo[height<=Q]+bestaudio
best[height<=Q][ext=mp4]
best[height<=Q]
best[ext=mp4]
best
```

**Filename logic:**
- Full video: `<title>_<quality>p.mp4`
- Clip: `<title>_<quality>p_<HH-MM-SS>_<HH-MM-SS>.mp4`

Clip filenames include start/end timestamps to avoid collision with previously downloaded full videos of the same title.

**yt-dlp flags used:**

| Flag | Value | Purpose |
|------|-------|---------|
| `-f` | format selector | Pick best video+audio stream |
| `--merge-output-format` | `mp4` | Always produce `.mp4` |
| `-o` | output path | Save directly to Downloads |
| `--no-playlist` | — | Never download whole playlist |
| `--force-overwrites` | — | Re-download even if file exists |
| `--concurrent-fragments` | `8` | Parallel fragment downloads |
| `--buffer-size` | `16K` | Larger I/O buffer |
| `--http-chunk-size` | `10M` | Fewer HTTP requests per fragment |
| `--download-sections` | `*HH:MM:SS-HH:MM:SS` | Clip range (only when trimming) |
| `--force-keyframes-at-cuts` | — | Accurate cut points (requires ffmpeg) |

**Output directory:** `C:\Users\Anas\Downloads`

---

## 3. Frontend

Built with **React 18** + **Vite 5**. No external UI library — custom CSS only.

### 3.1 `App.jsx`

Root component. Owns all shared state:

| State | Type | Description |
|-------|------|-------------|
| `url` | string | Current YouTube URL input |
| `videoId` | string\|null | Extracted YouTube video ID |
| `videoInfo` | object\|null | Metadata from `/api/info` |
| `quality` | string | Selected quality (`"720"` default) |
| `status` | object\|null | `{ type: "loading"\|"ok"\|"error", msg }` |
| `currentTime` | number | Playback position in seconds |
| `duration` | number | Video total duration in seconds |
| `startTime` | number | Clip start in seconds (default `0`) |
| `endTime` | number | Clip end in seconds (default = full duration on load) |

**`handleLoad()`** — called when user clicks Load:
1. Extracts video ID from URL (supports `youtube.com/watch?v=`, `youtu.be/`)
2. Resets all state (currentTime, duration, startTime, endTime → 0)
3. Fetches `/api/info`
4. On success: sets `videoInfo`, `videoId`, `endTime = duration`

**`onDurationChange`** — when YouTube player reports its duration, sets both `duration` and `endTime` so the default clip covers the full video.

---

### 3.2 `VideoInput.jsx`

Simple URL text field + Load button. Accepts:
- `url` / `onChange` — controlled input
- `onLoad` — called on button click or Enter key
- `loading` — shows spinner on button while fetching

---

### 3.3 `VideoPlayer.jsx`

Embeds the YouTube IFrame API player.

- Uses `youtube-iframe-api` or equivalent to load the video by `videoId`
- Reports `currentTime` via `onTimeUpdate` callback (polling)
- Reports `duration` via `onDurationChange` once player is ready
- Exposes `playerRef.seekTo(seconds)` for timeline seek
- The `origin=http://localhost:3001` parameter in the iframe URL is required by YouTube's postMessage security — the `postMessage` warnings in the console are from YouTube's ad system and are harmless

---

### 3.4 `TimelineSlider.jsx`

Visual timeline scrubber + editable START/END time inputs.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `currentTime` | number | Current playback position (seconds) |
| `duration` | number | Total video duration (seconds) |
| `startTime` | number | Clip start (seconds) |
| `endTime` | number | Clip end (seconds) |
| `onSeek` | fn(seconds) | Called when user drags the scrubber |
| `onStartChange` | fn(seconds) | Called when START input is committed |
| `onEndChange` | fn(seconds) | Called when END input is committed |

**`TimeInput` subcomponent:**
- Always visible text box — no click-to-edit pattern
- Accepts only digits and `:` characters (letters/symbols blocked on input)
- Max 2 digits per segment (`HH`, `MM`, `SS`), max 8 characters total
- Shows red border if the typed value is outside `[min, max]`
- On blur/Enter: clamps silently to valid range and commits
- On Escape: reverts to last valid value

**Track visuals:**
- Grey track = full duration
- Yellow-tinted `timeline-range` region = selected clip (start → end)
- Bright yellow fill = playback progress (0 → currentTime)
- Yellow circle thumb = current position handle

---

### 3.5 `QualitySelector.jsx`

Row of buttons: `360p`, `480p`, `720p`, `1080p`.
- Active button is highlighted with accent color
- Calls `onChange(quality)` on click

---

### 3.6 `DownloadButton.jsx`

Triggers the download and shows status feedback.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `url` | string | YouTube URL |
| `quality` | string | Selected quality |
| `disabled` | boolean | True when no video is loaded |
| `backendUrl` | string | API base URL (empty string in production) |
| `startTime` | number | Clip start seconds |
| `endTime` | number | Clip end seconds |
| `duration` | number | Total video duration |

**Download logic:**
- `startTime` is sent only if `> 0`
- `endTime` is sent only if `< duration` (i.e. user trimmed the end)
- If both are default (0 and full duration) → full video download, no clip args
- Response is JSON `{ success, filename }` — no blob, no browser download
- Shows `Saved: <filename>` on success, error message on failure (5s timeout)

---

## 4. Data Flow

### Load Video

```
User types URL → setUrl()
User clicks Load → handleLoad()
  → fetch /api/info?url=...
  → youtubeService.getVideoInfo()
    → yt-dlp --dump-json <url>
    → parse formats, title, duration
  → setVideoInfo(), setVideoId(), setEndTime(duration)
  → VideoPlayer loads YouTube iframe
  → onDurationChange fires → setDuration(), setEndTime()
```

### Download (full video)

```
User clicks Download
  → fetch /api/download?url=...&quality=720
  → youtubeService.downloadVideo(url, "720", 0, null)
    → yt-dlp ... -o C:\Users\Anas\Downloads\Title_720p.mp4
  → { success: true, filename: "Title_720p.mp4" }
  → UI shows "Saved: Title_720p.mp4"
```

### Download (clip)

```
User sets START=00:00:05, END=00:00:30
User clicks Download
  → fetch /api/download?url=...&quality=720&startTime=5&endTime=30
  → youtubeService.downloadVideo(url, "720", 5, 30)
    → yt-dlp ... --download-sections "*00:00:05-00:00:30"
                 --force-keyframes-at-cuts
               -o C:\Users\Anas\Downloads\Title_720p_00-00-05_00-00-30.mp4
  → { success: true, filename: "Title_720p_00-00-05_00-00-30.mp4" }
```

---

## 5. API Reference

### `GET /api/info`

**Query params:**
- `url` (required) — YouTube video URL

**Success response `200`:**
```json
{
  "title": "Video Title",
  "duration": "00:03:32",
  "durationSeconds": 212,
  "thumbnail": "https://i.ytimg.com/vi/xxxx/maxresdefault.jpg",
  "uploader": "Channel Name",
  "viewCount": 1234567,
  "availableQualities": ["360", "720", "1080"]
}
```

**Error response `400`:**
```json
{ "error": "Missing required query parameter: url" }
```

**Error response `500`:**
```json
{ "error": "yt-dlp failed to fetch info: ..." }
```

---

### `GET /api/download`

**Query params:**
- `url` (required) — YouTube video URL
- `quality` (optional, default `720`) — one of `360`, `480`, `720`, `1080`
- `startTime` (optional) — clip start in seconds (float)
- `endTime` (optional) — clip end in seconds (float)

**Success response `200`:**
```json
{ "success": true, "filename": "Title_720p.mp4" }
```

Clip example:
```json
{ "success": true, "filename": "Title_720p_00-00-05_00-00-30.mp4" }
```

**Error response `400`:**
```json
{ "error": "Invalid quality. Must be one of: 360, 480, 720, 1080" }
```

**Error response `500` (no ffmpeg):**
```json
{ "error": "ffmpeg is required for clipping. Install it from https://ffmpeg.org/download.html ..." }
```

### `GET /health`

```json
{ "status": "ok", "time": "2026-03-08T12:00:00.000Z" }
```

---

## 6. Configuration

### Download output directory

In `backend/services/youtubeService.js`:
```js
const DOWNLOADS_DIR = "C:\\Users\\Anas\\Downloads";
```
Change this path to redirect all downloads to a different folder.

### Backend port

Set `PORT` environment variable, or change the default in `server.js`:
```js
const PORT = process.env.PORT || 3001;
```

### Frontend API base URL

Controlled by the `VITE_BACKEND_URL` env variable:
- **Dev** (`.env.development`): `VITE_BACKEND_URL=http://localhost:3001`
- **Production**: variable is unset → empty string → same-origin requests

To change the backend URL in dev, edit `frontend/.env.development`.

### Concurrent download fragments

In `youtubeService.js`, `--concurrent-fragments` controls parallel fragment downloads:
```js
"--concurrent-fragments", "8",
```
Increase to `16` for faster connections, decrease to `1` if you get errors.

---

## 7. yt-dlp Integration

The app uses the [`yt-dlp-wrap`](https://www.npmjs.com/package/yt-dlp-wrap) npm package, which is a Node.js wrapper that spawns the **system yt-dlp binary** as a child process.

### Binary path

By default `new YTDlpWrap()` uses whatever `yt-dlp` resolves to in `PATH`. To use a custom path:
```js
const ytDlp = new YTDlpWrap("C:\\tools\\yt-dlp.exe");
```

### Methods used

| Method | Description |
|--------|-------------|
| `ytDlp.getVideoInfo(url)` | Runs `yt-dlp --dump-json <url>`, returns parsed object |
| `ytDlp.execPromise(args[])` | Runs `yt-dlp <args>`, resolves on success, rejects on non-zero exit |

### ffmpeg requirement

yt-dlp requires ffmpeg for:
- **Merging** separate video+audio streams (`bestvideo+bestaudio` format)
- **Clip trimming** (`--download-sections` + `--force-keyframes-at-cuts`)

Without ffmpeg, only pre-merged streams can be downloaded (lower quality fallback). The app detects the `ffmpeg is not installed` error string and returns a descriptive message to the UI.

### JavaScript runtime warning

yt-dlp may print:
```
WARNING: No supported JavaScript runtime could be found.
```
This is a warning, not an error. Downloads still work. To suppress it, install [Deno](https://deno.com) and ensure it's in PATH.

---

## 8. Build & Deployment

### Development

```
start.bat
```
- Opens two terminal windows
- Backend: `nodemon server.js` (auto-restarts on file change)
- Frontend: `vite` dev server with Hot Module Replacement

### Production

```
start-prod.bat
```

**Logic:**
1. Checks if `frontend/dist` exists
2. Uses PowerShell to compare last-modified timestamps of all files in `frontend/src` against the `dist` folder
3. If any source file is newer → runs `npm run build` (Vite production build)
4. Starts `node server.js` with `NODE_ENV=production`
5. Opens `http://localhost:3001` in the default browser

**What Vite build produces:**
- `frontend/dist/index.html` — entry point
- `frontend/dist/assets/index-[hash].js` — bundled React app
- `frontend/dist/assets/index-[hash].css` — all styles

Hashed asset filenames allow long-term caching. `index.html` is served with `Cache-Control: no-store` so the browser always fetches the latest shell.

### Manual build only

```
cd frontend
npm run build
```

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `yt-dlp: command not found` | yt-dlp not in PATH | Add yt-dlp folder to system PATH, restart terminal |
| `ffmpeg is not installed` error in UI | ffmpeg not in PATH | Install ffmpeg, add to PATH, restart server |
| Downloaded file contains JSON text | Old browser cache from previous code | Delete the bad file, hard-refresh with Ctrl+Shift+R |
| UI shows old version after code change | Stale production build | Run `start-prod.bat` — it auto-detects changes and rebuilds |
| `React is not defined` error | Missing `vite.config.js` or outdated build | Ensure `vite.config.js` exists with `react()` plugin; rebuild |
| `postMessage` errors in browser console | YouTube ad system on localhost | Harmless, ignore |
| `googleads` network errors in console | YouTube ads can't reach ad servers on localhost | Harmless, ignore |
| Clip download not found in Downloads | Same filename as full video → yt-dlp skipped | Fixed: clips now include timestamps in filename |
| Download fails silently / 500 error | yt-dlp crashed (check server console) | Check server terminal for full yt-dlp error output |
| `Some android_vr formats missing` warning | YouTube SABR experiment | Harmless warning, download still works |
