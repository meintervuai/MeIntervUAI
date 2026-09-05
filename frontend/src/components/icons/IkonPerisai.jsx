/** Ikon Perisai — privasi & keamanan (video tidak disimpan). */
export default function IkonPerisai({ className = 'h-5 w-5', ...prop }) {
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
      <path d="M12 3.5 5.5 6v5.5c0 4.2 2.7 7.4 6.5 9 3.8-1.6 6.5-4.8 6.5-9V6L12 3.5Z" />
      <path d="m9.2 11.8 2 2 3.6-3.9" />
    </svg>
  );
}