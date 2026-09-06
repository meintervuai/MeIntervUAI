/** Ikon tangan menyapa — sambutan hangat. */
export default function IkonTanganMenyapa({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 4c1-1 2.5-1 3.5 0l4 4c1 1 1 2.5 0 3.5l-3 3c-1 1-2.5 1-3.5 0l-1-1-1 1c-1 1-2.5 1-3.5 0l-2-2c-1-1-1-2.5 0-3.5l5-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 11V4M12 11V3M16 11V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
