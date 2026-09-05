/** Logo MENTERVU AI — mark oranye khas (bukan emoji/ikon font). */
export default function IkonLogo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Logo MENTERVU AI">
      <rect width="32" height="32" rx="8" fill="#EA580C" />
      <path
        d="M8 22V11l4.5 6L17 11v11"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="23.5" cy="20.5" r="1.6" fill="#FED7AA" />
    </svg>
  );
}