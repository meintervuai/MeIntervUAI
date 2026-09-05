import IkonKuota from './icons/IkonKuota';
import { pakaiBahasa } from '../contexts/KonteksBahasa';

/**
 * Kartu sisa kuota AI hari ini (database.md §9):
 * batas efektif = batas_panggilan_harian + kuota_tambahan; sisa = batas − terpakai.
 */
export default function KartuKuota({ kuota, memuat }) {
  const { t } = pakaiBahasa();

  if (memuat || !kuota) {
    return (
      <div className="kartu p-4" aria-busy="true">
        <div className="h-3 w-28 animate-pulse rounded-full bg-batu-200" />
        <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-batu-200" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded-full bg-batu-200" />
      </div>
    );
  }

  const { batas, terpakai, sisa } = kuota;
  const persen = batas > 0 ? Math.min(100, Math.round((terpakai / batas) * 100)) : 0;
  const habis = sisa <= 0;

  return (
    <section className="kartu p-4" aria-label={t.home.kuotaJudul}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-oranye-50 text-oranye-600">
            <IkonKuota className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-sm font-bold text-batu-800">
              {t.home.kuotaJudul}
            </h2>
            <p className="text-xs text-batu-500">
              {habis
                ? 'Kuota hari ini telah habis — coba lagi besok.'
                : `${sisa} ${t.home.kuotaSisa}`}
            </p>
          </div>
        </div>
        <p className="font-display text-lg font-extrabold tabular-nums text-batu-800">
          <span className={habis ? 'text-bahaya' : 'text-oranye-600'}>{sisa}</span>
          <span className="text-sm text-batu-400">/{batas}</span>
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-batu-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={batas}
        aria-valuenow={terpakai}
        aria-label={t.home.kuotaJudul}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            habis ? 'bg-bahaya' : 'bg-oranye-600'
          }`}
          style={{ width: `${persen}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-batu-400">
        Terpakai {terpakai} dari {batas} panggilan AI — direset setiap hari.
      </p>
    </section>
  );
}