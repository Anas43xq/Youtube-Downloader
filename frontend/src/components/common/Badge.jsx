// --- FILE: frontend/src/components/common/Badge.jsx ---

const COLOR_MAP = {
  default: { color: "var(--text-muted)",      border: "var(--border)"   },
  green:   { color: "var(--green)",            border: "var(--green)"    },
  red:     { color: "var(--red)",              border: "var(--red)"      },
  accent:  { color: "var(--accent)",           border: "var(--accent)"   },
};

/**
 * Small pill badge.
 *
 * @param {{ label: string, color?: "default"|"green"|"red"|"accent" }} props
 */
export default function Badge({ label, color = "default" }) {
  const { color: textColor, border } = COLOR_MAP[color] || COLOR_MAP.default;
  return (
    <span
      style={{
        fontFamily:    "var(--font-mono)",
        fontSize:      "10px",
        padding:       "2px 7px",
        border:        `1px solid ${border}`,
        borderRadius:  "2px",
        color:         textColor,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace:    "nowrap",
        display:       "inline-block",
      }}
    >
      {label}
    </span>
  );
}
