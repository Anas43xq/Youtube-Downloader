// --- FILE: frontend/src/components/common/Button.jsx ---

const VARIANT_STYLES = {
  primary: {
    background:  "var(--bg-elevated)",
    border:      "1px solid var(--border-active)",
    color:       "var(--text-primary)",
  },
  secondary: {
    background:  "transparent",
    border:      "1px solid var(--border)",
    color:       "var(--text-secondary)",
  },
  accent: {
    background:  "var(--accent)",
    border:      "none",
    color:       "#000",
  },
  social: {
    background:  "linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045)",
    border:      "none",
    color:       "#fff",
  },
  danger: {
    background:  "var(--red)",
    border:      "none",
    color:       "#fff",
  },
};

const BASE_STYLE = {
  fontFamily:    "var(--font-display)",
  fontWeight:    700,
  fontSize:      "13px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding:       "8px 20px",
  borderRadius:  "var(--radius)",
  cursor:        "pointer",
  transition:    "opacity 0.15s, background 0.15s",
  display:       "inline-flex",
  alignItems:    "center",
  gap:           "8px",
  whiteSpace:    "nowrap",
};

const DISABLED_STYLE = {
  opacity:       0.35,
  cursor:        "not-allowed",
  pointerEvents: "none",
};

/**
 * Generic button component.
 *
 * @param {{ label: React.ReactNode, onClick?: () => void, disabled?: boolean,
 *           variant?: "primary"|"secondary"|"accent"|"social"|"danger",
 *           type?: string, title?: string }} props
 */
export default function Button({ label, onClick, disabled = false, variant = "primary", type = "button", title }) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const style = {
    ...BASE_STYLE,
    ...variantStyle,
    ...(disabled ? DISABLED_STYLE : {}),
  };

  return (
    <button
      type={type}
      style={style}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {label}
    </button>
  );
}
