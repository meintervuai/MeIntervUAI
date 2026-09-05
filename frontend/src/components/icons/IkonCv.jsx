/** Ikon CV — lembar dokumen + garis isi + tanda centang kecil. */
export default function IkonCv({ className = 'h-6 w-6', ...prop }) {
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
      <path d="M7 3.5h7L18.5 8v10a2 2 0 0 1-2 2h-9.5a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" />
      <path d="M13.5 3.5V8h5" />
      <path d="M8.5 12.5h7M8.5 16h4.5" />
    </svg>
  );
}