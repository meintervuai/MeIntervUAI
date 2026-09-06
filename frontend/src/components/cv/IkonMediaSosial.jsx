import React from 'react';

/**
 * Ikon SVG Kustom untuk Platform Media Sosial CV (Sesuai AGENTS.md §5 - Ikon memakai SVG kustom).
 * Mendukung: LinkedIn, GitHub, Portofolio/Website, Twitter/X, Instagram, Facebook.
 */

export function IkonLinkedIn({ className = 'w-2.5 h-2.5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 1.45 1.45c0-.8-.65-1.45-1.45-1.45Z" />
    </svg>
  );
}

export function IkonGitHub({ className = 'w-2.5 h-2.5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function IkonWebsite({ className = 'w-2.5 h-2.5 shrink-0' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function IkonTwitterX({ className = 'w-2.5 h-2.5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function IkonInstagram({ className = 'w-2.5 h-2.5 shrink-0' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function IkonFacebook({ className = 'w-2.5 h-2.5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/**
 * Dispatcher untuk merender ikon sesuai nama platform
 */
export default function IkonMediaSosial({ platform = '', className = 'w-2.5 h-2.5 shrink-0' }) {
  const p = (platform || '').toLowerCase();
  if (p.includes('linkedin')) return <IkonLinkedIn className={className} />;
  if (p.includes('github')) return <IkonGitHub className={className} />;
  if (p.includes('instagram')) return <IkonInstagram className={className} />;
  if (p.includes('facebook')) return <IkonFacebook className={className} />;
  if (p.includes('twitter') || p.includes(' x') || p === 'x') {
    return <IkonTwitterX className={className} />;
  }
  return <IkonWebsite className={className} />;
}

export const DAFTAR_OPSI_SOSMED = [
  { value: 'LinkedIn', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
  { value: 'GitHub', label: 'GitHub', placeholder: 'github.com/username' },
  { value: 'Portofolio', label: 'Portofolio / Website', placeholder: 'portfolioanda.com' },
  { value: 'Twitter', label: 'Twitter / X', placeholder: 'x.com/username' },
  { value: 'Instagram', label: 'Instagram', placeholder: 'instagram.com/username' },
  { value: 'Facebook', label: 'Facebook', placeholder: 'facebook.com/username' },
];
