// --- FILE: frontend/src/components/download/ProgressBar.jsx ---

/**
 * Stage label text per download stage.
 * @type {Record<string, string>}
 */
const STAGE_LABELS = {
  downloading: "Downloading…",
  merging:     "Merging video + audio…",
  finalizing:  "Saving to device…",
  fetching:    "Fetching…",
};

/**
 * Download progress bar with stage-aware display.
 *
 * Renders nothing when stage is null.
 *
 * @param {{
 *   percent?: number,
 *   filesize?: string|null,
 *   speed?: string|null,
 *   eta?: string|null,
 *   stage?: "downloading"|"merging"|"finalizing"|"fetching"|null
 * }} props
 */
export default function ProgressBar({ percent = 0, filesize, speed, eta, stage = null }) {
  if (!stage) return null;

  const pct            = Math.min(100, Math.max(0, percent || 0));
  const isIndeterminate = stage === "merging" || stage === "fetching";
  const showStats      = stage === "downloading" && (filesize || speed || eta);

  return (
    <div className="progress-wrap">
      {/* Track + fill */}
      <div className="progress-track">
        <div
          className={`progress-fill${isIndeterminate ? " progress-fill--indeterminate" : ""}`}
          style={isIndeterminate ? undefined : { width: `${pct}%`, transition: "width 0.3s ease" }}
        />
      </div>

      {/* Stage label + percent */}
      <div className="progress-labels">
        <span className="progress-stage">{STAGE_LABELS[stage] || stage}</span>
        {!isIndeterminate && (
          <span
            className="progress-pct"
            style={{ color: "var(--accent)", fontWeight: "bold", marginLeft: "auto" }}
          >
            {Math.round(pct)}%
          </span>
        )}
      </div>

      {/* Stats: filesize · speed · ETA — hidden during merging/fetching */}
      {showStats && (
        <div className="progress-stats">
          {filesize && <span className="progress-stat">{filesize}</span>}
          {speed    && <span className="progress-stat">{speed}</span>}
          {eta      && <span className="progress-stat">ETA {eta}</span>}
        </div>
      )}
    </div>
  );
}
