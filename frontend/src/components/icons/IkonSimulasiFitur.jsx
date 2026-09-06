/** Ikon simulasi — fitur wawancara AI. */
export default function IkonSimulasiFitur({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m9 21 3-2 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 11h6M9 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
