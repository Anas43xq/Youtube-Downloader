<div align="center">

# Youtube-Downloader

**A self-hosted YouTube video downloader with a clean web UI.**
Paste a URL, pick quality, trim a clip, choose an output folder — done.

![Platform](https://img.shields.io/badge/platform-Windows-blue?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)
![yt-dlp](https://img.shields.io/badge/powered%20by-yt--dlp-red?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

</div>

---

## Overview

Youtube-Downloader is a locally-run web application built with **React + Vite** on the frontend and **Node.js + Express** on the backend. It uses `yt-dlp` under the hood to fetch and save videos, and `ffmpeg` for precise clip trimming.

No data leaves your machine. Everything runs on `localhost`.

---

## Features

| | Feature |
|---|---|
| 🎬 | Download videos at **360p, 480p, 720p, or 1080p** |
| ✂️ | **Clip trimming** — set a start and end time to save only a segment |
| 📁 | **Custom output folder** — type any path or use the default Downloads folder |
| 🖥️ | **Live preview player** — watch inside the app before downloading |
| ⚡ | **Auto-rebuild** — production launcher detects changes and rebuilds automatically |

---

## Requirements

| Tool | Version | Role |
|------|---------|------|
| [Node.js](https://nodejs.org) | v18+ | Runs the backend server |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Latest | Downloads YouTube videos |
| [ffmpeg](https://ffmpeg.org/download.html) | Any | Required for clip trimming only |

> Both `yt-dlp` and `ffmpeg` must be accessible in your system `PATH`.

Verify with:
```bash
yt-dlp --version
ffmpeg -version
```

---

## Installation

Clone the repo and install dependencies for both packages:

```bash
git clone https://github.com/Anas43xq/Youtube-Downloader.git
cd Youtube-Downloader

cd backend && npm install
cd ../frontend && npm install
```

---

## Usage

### Production *(recommended)*

Double-click **`start-prod.bat`** in the project root.

- Rebuilds the frontend only when source files have changed
- Serves everything from a single server at `http://localhost:3001`
- Opens the browser automatically

### Development

Double-click **`start.bat`** to run two servers simultaneously:

| Process | URL |
|---------|-----|
| Backend (Express) | `http://localhost:3001` |
| Frontend (Vite HMR) | `http://localhost:5173` |

---

## Downloading a Video

1. Paste a YouTube URL and click **Load**
2. The video preview loads with title and duration metadata
3. Choose a quality — **360p / 480p / 720p / 1080p**
4. *(Optional)* Set **START** and **END** times to extract a clip
   - Format: `HH:MM:SS` — press Enter or click away to confirm
   - The selected range is highlighted on the timeline
5. *(Optional)* Enter a custom **Output Folder** (e.g. `D:\Videos\YouTube`)
   - Leave blank to use the system Downloads folder
   - The directory is created automatically if it does not exist
6. Click **Download**

> Clip trimming requires `ffmpeg`. Full-video downloads work without it.

---

## Project Structure

```
Youtube-Downloader/
├── backend/
│   ├── server.js               # Express app, static file serving in production
│   ├── routes/
│   │   ├── info.js             # GET /api/info
│   │   └── download.js         # GET /api/download
│   └── services/
│       └── youtubeService.js   # yt-dlp wrapper, format selection, clipping logic
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Root component, state management
│   │   ├── styles.css          # Global styles
│   │   └── components/
│   │       ├── VideoInput.jsx       # URL input + Load button
│   │       ├── VideoPlayer.jsx      # Embedded YouTube player
│   │       ├── TimelineSlider.jsx   # Scrubber + START / END time inputs
│   │       ├── QualitySelector.jsx  # Quality toggle buttons
│   │       └── DownloadButton.jsx   # Download trigger + status feedback
│   └── vite.config.js
├── start.bat                   # Dev launcher
├── start-prod.bat              # Production launcher
└── .gitignore
```

---

## API Reference

### `GET /api/config`
Returns the server's default output directory.
```json
{ "defaultOutputDir": "C:\\Users\\Username\\Downloads" }
```

### `GET /api/info?url=<youtube_url>`
Returns metadata for the given video.
```json
{
  "title": "Video Title",
  "duration": "00:03:32",
  "thumbnail": "https://...",
  "uploader": "Channel Name",
  "availableQualities": ["360", "720", "1080"]
}
```

### `GET /api/download`

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `url` | ✅ | string | YouTube video URL |
| `quality` | ✅ | string | `360` `480` `720` `1080` |
| `startTime` | ❌ | number | Clip start in seconds |
| `endTime` | ❌ | number | Clip end in seconds |
| `outputDir` | ❌ | string | Absolute path to output folder |

**Response**
```json
{ "success": true, "filename": "Video_Title_720p.mp4" }
```

---

## Troubleshooting

| Symptom | Solution |
|---------|----------|
| `yt-dlp: command not found` | Add yt-dlp to system PATH and restart the terminal |
| `ffmpeg is not installed` | Install ffmpeg, add to PATH, restart the server |
| `Output directory must be an absolute path` | Use a full path, e.g. `C:\Users\You\Videos` |
| `React is not defined` | Hard-refresh the browser with `Ctrl + Shift + R` |
| UI looks outdated after an update | Re-run `start-prod.bat` to trigger a rebuild |

---

## Tech Stack

- **Frontend** — React 18, Vite, plain CSS
- **Backend** — Node.js, Express
- **Downloader** — yt-dlp, ffmpeg
- **IPC** — REST (JSON over HTTP)

---

<div align="center">
  Made for local use. No accounts, no cloud, no tracking.
</div>
