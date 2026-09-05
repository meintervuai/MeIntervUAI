/** Ikon Keluar — panah keluar dari pintu. */
export default function IkonKeluar({ className = 'h-5 w-5', ...prop }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...prop}
    >
      <path d="M14 4.5H7.5A2 2 0 0 0 5.5 6.5v11a2 2 0 0 0 2 2H14" />
      <path d="M16 8.5 19.5 12 16 15.5" />
      <path d="M19.5 12H10" />
    </svg>
  );
}