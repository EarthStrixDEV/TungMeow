export default function Spinner() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 96 96"
      fill="none"
      className="animate-spin"
    >
      <circle cx="48" cy="48" r="38" stroke="var(--color-blue-soft)" strokeWidth="9" />
      <path
        d="M48 10 A38 38 0 0 1 86 48"
        stroke="var(--color-blue)"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}
