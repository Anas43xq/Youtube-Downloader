// --- FILE: frontend/src/App.jsx ---

import { useState, useCallback, useMemo } from "react";

// ── Hooks ─────────────────────────────────────────────────────────────────────
import useVideoInfo      from "./hooks/useVideoInfo.js";
import usePlayer        from "./hooks/usePlayer.js";
import useSettings      from "./hooks/useSettings.js";
import useDownloadQueue  from "./hooks/useDownloadQueue.js";
import useDownloadHistory from "./hooks/useDownloadHistory.js";

// ── Utils / constants ─────────────────────────────────────────────────────────
import { extractVideoId }               from "./utils/extractVideoId.js";
import { resolveFilename }              from "./utils/resolveFilename.js";
import { MODES, isSocialMode }          from "./constants/modes.js";
import { DEFAULT_QUALITY }              from "./constants/qualities.js";
import { DEFAULT_VIDEO_FORMAT, DEFAULT_AUDIO_FORMAT } from "./constants/formats.js";

// ── Components ────────────────────────────────────────────────────────────────
import UrlInputBar         from "./components/controls/UrlInputBar.jsx";
import VideoMetaBar        from "./components/player/VideoMetaBar.jsx";
import VideoPlayer         from "./components/VideoPlayer.jsx";
import TimelineSlider      from "./components/TimelineSlider.jsx";
import ClipRangeSelector   from "./components/clip/ClipRangeSelector.jsx";
import QualitySelector     from "./components/controls/QualitySelector.jsx";
import VideoFormatSelector from "./components/controls/VideoFormatSelector.jsx";
import ModeSelector        from "./components/controls/ModeSelector.jsx";
import FilenameInput       from "./components/controls/FilenameInput.jsx";
import DownloadButton      from "./components/download/DownloadButton.jsx";
import Divider             from "./components/common/Divider.jsx";
import QueuePanel          from "./components/queue/QueuePanel.jsx";
import HistoryPanel        from "./components/history/HistoryPanel.jsx";

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  // Controlled URL field — lives here so UrlInputBar + hooks can share it
  const [url, setUrl] = useState("");

  // ── Domain hooks ─────────────────────────────────────────────────────────
  const {
    videoInfo, status: infoStatus, errorMsg, loadVideo,
  } = useVideoInfo();

  const {
    currentTime, duration, startTime, endTime,
    playerRef, updateCurrentTime, setDuration, setStartTime, setEndTime, seek,
  } = usePlayer();

  const {
    quality, mode, videoFormat, audioFormat, filenameTemplate,
    setQuality, setMode, setVideoFormat, setAudioFormat, setFilenameTemplate,
  } = useSettings();

  // History must be declared before queue so addEntry is available for onItemComplete
  const {
    history, addEntry, removeEntry, clearHistory, reDownload,
  } = useDownloadHistory();

  const {
    queue, isRunning, addToQueue, removeFromQueue, clearDone, downloadAll,
  } = useDownloadQueue({
    onItemComplete: (item) => {
      addEntry({
        id:           item.id,
        url:          item.url,
        title:        item.title,
        filename:     item.filename   || null,
        quality:      item.quality,
        mode:         item.mode,
        videoFormat:  item.videoFormat,
        audioFormat:  item.audioFormat,
        filesize:     item.filesize   || null,
        downloadedAt: Date.now(),
      });
    },
  });

  // ── Derived state ─────────────────────────────────────────────────────────

  // videoId is only valid while the info fetch succeeded for the current url
  const videoId = infoStatus === "ok" && videoInfo ? extractVideoId(url) : null;

  // Live filename preview (empty when no template)
  const filenamePreview = useMemo(() => {
    if (!filenameTemplate.trim()) return "";
    return resolveFilename(filenameTemplate, {
      title:  videoInfo?.title || "",
      quality,
      format: mode === MODES.AUDIO ? audioFormat : videoFormat,
      mode,
      url,
    });
  }, [filenameTemplate, quality, mode, videoFormat, audioFormat, videoInfo, url]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLoad = useCallback(() => {
    // Reset settings before loading so controls start fresh
    setMode(MODES.VIDEO);
    setQuality(DEFAULT_QUALITY);
    setVideoFormat(DEFAULT_VIDEO_FORMAT);
    setAudioFormat(DEFAULT_AUDIO_FORMAT);
    setFilenameTemplate("");
    setStartTime(0);
    setEndTime(0);

    loadVideo(url.trim());
  }, [
    url, loadVideo,
    setMode, setQuality, setVideoFormat, setAudioFormat,
    setFilenameTemplate, setStartTime, setEndTime,
  ]);

  function handleAddToQueue() {
    addToQueue(videoInfo, url, {
      quality,
      mode,
      videoFormat,
      audioFormat,
      startTime,
      endTime,
      fileDuration:     duration,
      filenameTemplate,
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isLoading = infoStatus === "loading";
  const hasVideo  = !!videoId;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">YT<span>DL</span></div>
        <div className="app-tagline">YouTube Video Downloader</div>
      </header>

      <main className="app-main">

        {/* ── Panel 1: URL input ─────────────────────────────────────────── */}
        <div className="panel">
          <UrlInputBar
            url={url}
            onChange={setUrl}
            onLoad={handleLoad}
            loading={isLoading}
          />

          {(infoStatus === "error" || infoStatus === "ok") && (
            <div className={`status-bar ${infoStatus === "error" ? "error" : "ok"}`}>
              <span className="status-dot" />
              {infoStatus === "error"
                ? errorMsg
                : `Loaded: ${videoInfo?.title}`}
            </div>
          )}
        </div>

        {/* ── Panel 2: Player + controls ─────────────────────────────────── */}
        <div className="panel">
          <VideoMetaBar videoInfo={videoInfo} />

          <VideoPlayer
            videoId={videoId}
            playerRef={playerRef}
            onTimeUpdate={updateCurrentTime}
            onDurationChange={setDuration}
          />

          <div className="controls-strip">
            {/* Timeline scrubber */}
            <TimelineSlider
              currentTime={currentTime}
              duration={duration}
              startTime={startTime}
              endTime={endTime}
              onSeek={seek}
            />

            <Divider />

            {/* Clip range inputs */}
            <ClipRangeSelector
              startTime={startTime}
              endTime={endTime}
              duration={duration}
              onStartChange={setStartTime}
              onEndChange={setEndTime}
            />

            <Divider />

            {/* Quality — hidden in social modes */}
            <QualitySelector
              quality={quality}
              onChange={setQuality}
              hidden={isSocialMode(mode)}
            />

            {/* Video format — visible only in video mode */}
            <VideoFormatSelector
              videoFormat={videoFormat}
              onChange={setVideoFormat}
              hidden={mode !== MODES.VIDEO}
            />

            <Divider />

            {/* Mode + format sub-row */}
            <ModeSelector
              mode={mode}
              onModeChange={setMode}
              audioFormat={audioFormat}
              onFormatChange={setAudioFormat}
            />

            {/* Filename template */}
            <FilenameInput
              template={filenameTemplate}
              onChange={setFilenameTemplate}
              preview={filenamePreview}
              mode={mode}
            />

            <Divider />

            {/* Download / Add-to-queue */}
            <DownloadButton
              disabled={!hasVideo}
              mode={mode}
              videoFormat={videoFormat}
              audioFormat={audioFormat}
              quality={quality}
              onAddToQueue={handleAddToQueue}
            />
          </div>
        </div>

        {/* ── Queue ──────────────────────────────────────────────────────── */}
        <QueuePanel
          items={queue}
          isRunning={isRunning}
          onRemove={removeFromQueue}
          onClearDone={clearDone}
          onDownloadAll={downloadAll}
        />

        {/* ── History ────────────────────────────────────────────────────── */}
        <HistoryPanel
          history={history}
          onRemove={removeEntry}
          onClear={clearHistory}
          onReDownload={(item) => reDownload(item, addToQueue)}
        />

      </main>
    </div>
  );
}
