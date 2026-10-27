// Halaman Error 404 & Penanganan Galat MeIntervUAI dengan estetika executive warm orange.
// Memenuhi pedoman antislop: tipografi jelas, kontras tinggi, tombol aksi cepat, tanpa metrik palsu.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBahasa } from '../i18n';

interface PropsHalamanGalat {
  kodeStatus?: number | string;
  judul?: string;
  deskripsi?: string;
}

export const HalamanGalat: React.FC<PropsHalamanGalat> = ({
  kodeStatus = '404',
  judul,
  deskripsi,
}) => {
  const navigate = useNavigate();
  const { t } = useBahasa();

  const judulTampil = judul || t.galat.judul404;
  const deskripsiTampil = deskripsi || t.galat.deskripsi404;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#fdfbf7]">
      <div className="w-full max-w-lg text-center space-y-6">
        {/* Lencana Status */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
          <span>{t.galat.statusLabel} {kodeStatus}</span>
        </div>

        {/* Angka Kode Visual */}
        <div className="relative select-none">
          <h1 className="text-8xl sm:text-9xl font-black text-orange-950/15 tracking-tighter">
            {kodeStatus}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-700 text-white flex items-center justify-center shadow-lg shadow-orange-900/20">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Teks Penjelasan */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {judulTampil}
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
            {deskripsiTampil}
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-100 hover:text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600"
          >
            {t.galat.kembali}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold shadow-md shadow-orange-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
          >
            {t.galat.menujuBeranda}
          </button>
        </div>

        {/* Bantuan */}
        <p className="text-xs text-stone-500 pt-4">
          {t.galat.bantuanTeks}{' '}
          <a href="/csm" className="font-semibold text-orange-700 hover:underline">
            {t.galat.tautanBantuan}
          </a>
        </p>
      </div>
    </div>
  );
};
