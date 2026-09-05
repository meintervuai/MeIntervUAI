/** Ikon Profil — kepala + bahu dalam lingkaran. */
export default function IkonProfil({ className = 'h-6 w-6', ...prop }) {
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
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.2 18.2c1.3-2 3.4-3.2 5.8-3.2s4.5 1.2 5.8 3.2" />
    </svg>
  );
}