import { useState, useRef, useCallback, useEffect } from "react";
import VideoInput from "./components/VideoInput.jsx";
import VideoPlayer from "./components/VideoPlayer.jsx";
import TimelineSlider from "./components/TimelineSlider.jsx";
import QualitySelector from "./components/QualitySelector.jsx";
import DownloadButton from "./components/DownloadButton.jsx";

// In production the frontend is served by the backend on the same origin.
// In dev, Vite runs on a separate port so we point explicitly to the backend.
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "";

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    return u.searchParams.get("v") || null;
  } catch {
    return null;
  }
}

export default function App() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [quality, setQuality] = useState("720");
  const [status, setStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [outputDir, setOutputDir] = useState("");
  const [defaultOutputDir, setDefaultOutputDir] = useState("");
  const playerRef = useRef(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/config`)
      .then((r) => r.json())
      .then((d) => setDefaultOutputDir(d.defaultOutputDir || ""))
      .catch(() => {});
  }, [BACKEND]);

  const handleLoad = useCallback(async () => {
    const id = extractVideoId(url.trim());
    if (!id) {
      setStatus({ type: "error", msg: "Invalid YouTube URL — paste a valid link." });
      return;
    }

    setStatus({ type: "loading", msg: "Fetching video info…" });
    setVideoId(null);
    setVideoInfo(null);
    setCurrentTime(0);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);

    try {
      const res = await fetch(`${BACKEND}/api/info?url=${encodeURIComponent(url.trim())}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setVideoInfo(data);
      setVideoId(id);
      setStatus({ type: "ok", msg: `Loaded: ${data.title}` });
    } catch (err) {
      setStatus({ type: "error", msg: `Failed to fetch info: ${err.message}` });
    }
  }, [url]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">YT<span>DL</span></div>
        <div className="app-tagline">YouTube Video Downloader</div>
      </header>

      <main className="app-main">
        {/* Input Panel */}
        <div className="panel">
          <div className="panel-label">Video Source</div>
          <VideoInput
            url={url}
            onChange={setUrl}
            onLoad={handleLoad}
            loading={status?.type === "loading"}
          />
          {status && (
            <div className={`status-bar ${status.type}`}>
              <span className="status-dot" />
              {status.type === "loading" && <span className="spinner" style={{ marginRight: 4 }} />}
              {status.msg}
            </div>
          )}
        </div>

        {/* Player Panel */}
        <div className="panel">
          {videoInfo && (
            <div className="video-meta">
              <span className="video-title">{videoInfo.title}</span>
              {videoInfo.duration && (
                <span className="video-badge">{videoInfo.duration}</span>
              )}
            </div>
          )}
          <VideoPlayer
            videoId={videoId}
            playerRef={playerRef}
            onTimeUpdate={setCurrentTime}
            onDurationChange={(d) => { setDuration(d); setEndTime(d); }}
          />
          <div className="controls-strip">
            <TimelineSlider
              currentTime={currentTime}
              duration={duration}
              startTime={startTime}
              endTime={endTime}
              onStartChange={setStartTime}
              onEndChange={setEndTime}
              onSeek={(t) => {
                setCurrentTime(t);
                if (playerRef.current?.seekTo) {
                  playerRef.current.seekTo(t, true);
                }
              }}
            />
            <div className="controls-divider" />
            <div className="quality-row">
              <span className="quality-label">Quality</span>
              <QualitySelector quality={quality} onChange={setQuality} />
            </div>
            <div className="controls-divider" />
            <div className="folder-row">
              <span className="quality-label">Output Folder</span>
              <FolderIcon />
              <input
                className="folder-input"
                type="text"
                value={outputDir}
                onChange={(e) => setOutputDir(e.target.value)}
                placeholder={defaultOutputDir || "Default downloads folder"}
                spellCheck={false}
              />
            </div>
            <div className="controls-divider" />
            <div className="download-row">
              <DownloadButton
                disabled={!videoId}
                url={url}
                quality={quality}
                backendUrl={BACKEND}
                startTime={startTime}
                endTime={endTime}
                duration={duration}
                outputDir={outputDir.trim()}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
