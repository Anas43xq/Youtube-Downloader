const AUDIO_FORMATS = [
  { label: "MP3",  value: "mp3",  hint: "Universal"   },
  { label: "M4A",  value: "m4a",  hint: "Best quality" },
  { label: "OPUS", value: "opus", hint: "Smallest size" },
  { label: "FLAC", value: "flac", hint: "Lossless"     },
];

const SOCIAL_SUBS = [
  {
    value: "social_video",
    icon: "📱",
    label: "Universal Video",
    hint: "H.264 + AAC · All platforms",
  },
  {
    value: "social_audio",
    icon: "🎵",
    label: "Universal Audio",
    hint: "MP3 320kbps · All platforms",
  },
];

export default function ModeSelector({ mode, onModeChange, audioFormat, onFormatChange }) {
  const isSocial = mode === "social_video" || mode === "social_audio";
  const topMode = isSocial ? "social" : mode;

  const handleTopClick = (value) => {
    if (value === "social") {
      // Default to social_video when switching to social
      onModeChange("social_video");
    } else {
      onModeChange(value);
    }
  };

  return (
    <div className="mode-selector-wrap">
      <div className="mode-selector-row">
        <span className="quality-label">Mode</span>
        {["video", "audio", "social"].map((val) => (
          <button
            key={val}
            className={`mode-btn${
              topMode === val
                ? val === "social"
                  ? " social-active"
                  : " active"
                : ""
            }`}
            onClick={() => handleTopClick(val)}
          >
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </button>
        ))}
      </div>

      {mode === "audio" && (
        <div className="audio-format-row">
          <span className="quality-label">Format</span>
          {AUDIO_FORMATS.map((f) => (
            <div key={f.value} className="format-btn-wrap">
              <button
                className={`quality-btn${audioFormat === f.value ? " active" : ""}`}
                onClick={() => onFormatChange(f.value)}
              >
                {f.label}
              </button>
              {audioFormat === f.value && (
                <div className="format-hint">{f.hint}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {isSocial && (
        <div className="social-sub-row">
          <span className="quality-label">Share to</span>
          {SOCIAL_SUBS.map((s) => (
            <button
              key={s.value}
              className={`social-sub-btn${mode === s.value ? " active" : ""}`}
              onClick={() => onModeChange(s.value)}
            >
              <span className="social-sub-icon">{s.icon}</span>
              <span>
                <span className="social-sub-label">{s.label}</span>
                <span className="social-sub-hint">{s.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
