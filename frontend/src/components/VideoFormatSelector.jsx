const VIDEO_FORMATS = [
  { label: "MP4",  value: "mp4",  hint: "Universal"          },
  { label: "WEBM", value: "webm", hint: "Smallest size"       },
  { label: "MKV",  value: "mkv",  hint: "Best compatibility"  },
  { label: "MOV",  value: "mov",  hint: "Apple / Final Cut"   },
];

export default function VideoFormatSelector({ videoFormat, onChange, hidden }) {
  if (hidden) return null;

  return (
    <div className="video-format-row">
      <span className="quality-label">Format</span>
      {VIDEO_FORMATS.map((f) => (
        <div key={f.value} className="format-btn-wrap">
          <button
            className={`quality-btn${videoFormat === f.value ? " active" : ""}`}
            onClick={() => onChange(f.value)}
          >
            {f.label}
          </button>
          {videoFormat === f.value && (
            <div className="format-hint">{f.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}
