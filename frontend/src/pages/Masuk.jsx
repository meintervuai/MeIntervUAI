import { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import IkonLogo from '../components/icons/IkonLogo';
import IkonGoogle from '../components/icons/IkonGoogle';
import IkonPerisai from '../components/icons/IkonPerisai';
import IkonKeluar from '../components/icons/IkonKeluar';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiBahasa } from '../contexts/KonteksBahasa';
import { masukDenganGoogle } from '../services/api_otentikasi';

/** Halaman masuk (rute `/masuk`) — Google OAuth via Supabase Auth (FR-01). */
export default function Masuk() {
  const { pengguna, memuat } = pakaiOtentikasi();
  const { t } = pakaiBahasa();
  const lokasi = useLocation();
  const [memproses, setMemproses] = useState(false);
  const [galat, setGalat] = useState(null);

  const tujuan = lokasi.state?.dari || '/home';

  if (!memuat && pengguna) {
    return <Navigate to={tujuan} replace />;
  }

  async function tanganiMasuk() {
    setGalat(null);
    setMemproses(true);
    try {
      const { error } = await masukDenganGoogle();
      if (error) throw error;
      // Browser akan dialihkan ke Google; state tetap "memproses".
    } catch (e) {
      setGalat(t.masuk.gagal);
      setMemproses(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-latar">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10 md:max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <IkonLogo className="h-14 w-14" />
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-batu-900">
            {t.umum.appName}
          </h1>
          <p className="mt-1 text-sm text-batu-500">{t.umum.tagline}</p>
        </div>

        <div className="kartu p-5">
          <h2 className="font-display text-lg font-bold text-batu-800">{t.masuk.judul}</h2>
          <p className="mt-1 text-sm leading-relaxed text-batu-500">{t.masuk.deskripsi}</p>

          <button
            type="button"
            onClick={tanganiMasuk}
            disabled={memproses}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-3 rounded-tombol border border-batu-300 bg-white px-4 text-sm font-semibold text-batu-800 shadow-kartu transition-colors hover:bg-batu-100 active:bg-batu-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IkonGoogle className="h-5 w-5" />
            {memproses ? t.masuk.sedangProses : t.masuk.tombolGoogle}
          </button>

          {galat && (
            <p
              role="alert"
              className="mt-3 rounded-tombol border border-bahaya/30 bg-red-50 px-3 py-2 text-xs font-medium text-bahaya"
            >
              {galat}
            </p>
          )}
        </div>

        <p className="mt-5 flex items-start justify-center gap-1.5 px-2 text-center text-xs leading-relaxed text-batu-400">
          <IkonPerisai className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t.masuk.catatanPrivasi}
        </p>

        <p className="mt-6 text-center text-xs text-batu-400">
          <Link to="/" className="inline-flex items-center gap-1 font-semibold text-oranye-700 hover:underline">
            <IkonKeluar className="h-3.5 w-3.5 rotate-180" />
            {t.umum.kembali}
          </Link>
        </p>
      </main>
    </div>
  );
}