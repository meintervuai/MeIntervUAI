// Komponen NotifikasiToast (FE-02, UX-03, UX-16):
// Standar UI Toast/Snackbar Mengambang (Floating) Reusable
// Mencegah Layout Shift, posisi adaptif (mobile: melayang di atas bottom navigation bar, desktop: top right),
// auto-dismiss dengan timer, dan mendukung aksi tutup manual.

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type TipeToast = 'sukses' | 'gagal' | 'info';

export interface PropertiToast {
  tipe: TipeToast;
  pesan: string;
  onTutup: () => void;
  durasiMs?: number;
}

export const NotifikasiToast: React.FC<PropertiToast> = ({
  tipe,
  pesan,
  onTutup,
  durasiMs = 4000,
}) => {
  useEffect(() => {
    if (durasiMs <= 0) return;
    const timer = setTimeout(() => {
      onTutup();
    }, durasiMs);
    return () => clearTimeout(timer);
  }, [durasiMs, onTutup]);

  const konfigurasiVarian = {
    sukses: {
      warnaBg: 'bg-stone-900 text-white border-stone-800',
      warnaIkon: 'text-emerald-400',
      Ikon: CheckCircle2,
    },
    gagal: {
      warnaBg: 'bg-rose-950 text-white border-rose-800',
      warnaIkon: 'text-rose-400',
      Ikon: AlertCircle,
    },
    info: {
      warnaBg: 'bg-stone-900 text-white border-stone-800',
      warnaIkon: 'text-orange-400',
      Ikon: Info,
    },
  }[tipe];

  const { warnaBg, warnaIkon, Ikon } = konfigurasiVarian;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-50 pointer-events-none inset-x-0 top-16 md:top-auto md:bottom-6 md:right-6 md:left-auto flex justify-center md:justify-end px-4"
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 py-3 px-4 rounded-xl border shadow-xl max-w-sm w-full sm:w-auto transition-all animate-bounce-subtle ${warnaBg}`}
      >
        <Ikon className={`w-5 h-5 shrink-0 ${warnaIkon}`} />
        <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
          {pesan}
        </span>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup notifikasi"
          className="text-stone-400 hover:text-white p-1 -mr-1 rounded-lg transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
