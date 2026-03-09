// --- FILE: frontend/src/components/download/DownloadButton.jsx ---

import { MODES, isSocialMode } from "../../constants/modes.js";
import ProgressBar from "./ProgressBar.jsx";

// ── Icons ─────────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLabel({ mode, videoFormat, audioFormat, quality }) {
  switch (mode) {
    case MODES.SOCIAL_AUDIO: return "Download Audio for Social 🎵";
    case MODES.SOCIAL_VIDEO: return "Download for Social 📱";
    case MODES.AUDIO:        return `Download ${(audioFormat || "mp3").toUpperCase()}`;
    default:                 return `Download ${(videoFormat || "mp4").toUpperCase()} ${quality || "720"}p`;
  }
}

function getIcon(mode) {
  if (isSocialMode(mode)) return null;
  if (mode === MODES.AUDIO) return <WaveformIcon />;
  return <DownloadIcon />;
}

// ── DownloadButton ────────────────────────────────────────────────────────────

/**
 * Add-to-queue button for the current download settings.
 *
 * @param {{
 *   disabled?: boolean,
 *   mode?: string,
 *   videoFormat?: string,
 *   audioFormat?: string,
 *   quality?: string,
 *   onAddToQueue?: () => void
 * }} props
 */
export default function DownloadButton({
  disabled = false,
  mode = MODES.VIDEO,
  videoFormat = "mp4",
  audioFormat = "mp3",
  quality = "720",
  onAddToQueue,
  downloadJob = { status: "idle" },
}) {
  const social = isSocialMode(mode);
  const label  = getLabel({ mode, videoFormat, audioFormat, quality });
  const icon   = getIcon(mode);

  return (
    <div className="download-row">
      <button
        className={`download-btn${social ? " social" : ""}`}
        onClick={() => !disabled && onAddToQueue?.()}
        disabled={disabled}
        type="button"
        aria-label={label}
      >
        {icon && <span className="download-btn__icon">{icon}</span>}
        {label}
      </button>

      {downloadJob.status !== "idle" && (
        <ProgressBar
          percent={downloadJob.progress}
          filesize={downloadJob.filesize}
          speed={downloadJob.speed}
          eta={downloadJob.eta}
          stage={downloadJob.status}
        />
      )}
    </div>
  );
}
