/**
 * Ubin tindakan cepat (grid 2 kolom di Home).
 * `segera` = modul belum dibuka (M1) → tampil badge "Segera" & tetap bisa diklik
 * menuju halaman Segera agar nav tidak terasa mati.
 */
export default function KartuTindakan({ judul, deskripsi, Ikon, segera = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="kartu group relative flex min-h-[44px] flex-col items-start gap-2 p-3.5 text-left transition-transform active:scale-[0.98]"
      aria-label={judul}
    >
      {segera && (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-oranye-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-oranye-700">
          Segera
        </span>
      )}
      <span className="flex h-10 w-10 items-center justify-center rounded-tombol bg-oranye-50 text-oranye-600 transition-colors group-hover:bg-oranye-100">
        <Ikon className="h-[22px] w-[22px]" />
      </span>
      <span className="font-display text-sm font-bold text-batu-800">{judul}</span>
      {deskripsi && <span className="text-xs leading-snug text-batu-500">{deskripsi}</span>}
    </button>
  );
}