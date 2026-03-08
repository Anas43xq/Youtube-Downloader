const QUALITIES = [
  { label: "360p", value: "360" },
  { label: "480p", value: "480" },
  { label: "720p", value: "720" },
  { label: "1080p", value: "1080" },
];

export default function QualitySelector({ quality, onChange }) {
  return (
    <>
      {QUALITIES.map((q) => (
        <button
          key={q.value}
          className={`quality-btn${quality === q.value ? " active" : ""}`}
          onClick={() => onChange(q.value)}
        >
          {q.label}
        </button>
      ))}
    </>
  );
}
