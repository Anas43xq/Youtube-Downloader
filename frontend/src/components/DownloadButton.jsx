function QueueAddIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3" cy="6" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="3" cy="18" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function DownloadButton({ disabled, onAddToQueue, mode = "video", audioFormat = "mp3", videoFormat = "mp4", quality = "720" }) {
  const isSocial = mode === "social_video" || mode === "social_audio";

  const label = isSocial
    ? mode === "social_audio"
      ? "Add Audio for Social  🎵"
      : "Add for Social  📱"
    : mode === "audio"
      ? `Add ${audioFormat.toUpperCase()} to Queue`
      : `Add ${videoFormat.toUpperCase()} ${quality}p to Queue`;

  return (
    <button
      className={`download-btn${isSocial ? " social" : ""}`}
      onClick={() => !disabled && onAddToQueue()}
      disabled={disabled}
    >
      <QueueAddIcon />
      {label}
    </button>
  );
}
