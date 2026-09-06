/** Ikon kado — untuk tombol demo gratis. */
export default function IkonKado({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v13" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 6c-1.5-1-3 0-2 1.5L12 12M15 6c1.5-1 3 0 2 1.5L12 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
