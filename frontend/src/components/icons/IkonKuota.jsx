/** Ikon Kuota — petir dalam busur (energi pemakaian AI). */
export default function IkonKuota({ className = 'h-6 w-6', ...prop }) {
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
      <path d="M13 3 6.5 13h4L11 21l6.5-10h-4L13 3Z" />
    </svg>
  );
}