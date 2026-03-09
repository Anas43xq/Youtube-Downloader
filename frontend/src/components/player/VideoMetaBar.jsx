// --- FILE: frontend/src/components/player/VideoMetaBar.jsx ---

import Badge from "../common/Badge.jsx";

/**
 * Renders a bar showing the video title and duration.
 * Returns null when videoInfo is null (nothing loaded yet).
 *
 * @param {{ videoInfo: import("../../types/shapes.js").VideoInfo|null }} props
 */
export default function VideoMetaBar({ videoInfo }) {
  if (!videoInfo) return null;

  return (
    <div
      className="video-meta"
      style={{ borderBottom: "2px solid var(--accent)" }}
    >
      <span className="video-title" title={videoInfo.title}>
        {videoInfo.title}
      </span>
      {videoInfo.duration && (
        <Badge label={videoInfo.duration} />
      )}
      {videoInfo.uploader && (
        <Badge label={videoInfo.uploader} />
      )}
    </div>
  );
}
