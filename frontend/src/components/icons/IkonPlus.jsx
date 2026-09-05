/** Ikon Plus — tambah. */
export default function IkonPlus({ className = 'h-5 w-5', ...prop }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...prop}
    >
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}