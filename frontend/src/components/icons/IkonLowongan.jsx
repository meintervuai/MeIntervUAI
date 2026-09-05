/** Ikon Lowongan — tas kerja. */
export default function IkonLowongan({ className = 'h-6 w-6', ...prop }) {
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
      <rect x="4" y="8" width="16" height="11.5" rx="2" />
      <path d="M9.5 8V6.5A2 2 0 0 1 11.5 4.5h1a2 2 0 0 1 2 2V8" />
      <path d="M4 12.5h16" />
      <path d="M10.5 12.5v2h3v-2" />
    </svg>
  );
}