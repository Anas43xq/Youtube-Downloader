// --- FILE: frontend/src/components/common/Spinner.jsx ---

/**
 * @param {{ size?: number }} props
 */
export default function Spinner({ size = 16 }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  );
}
