import { useNavigate } from 'react-router-dom';
import IkonLogo from '../components/icons/IkonLogo';
import { pakaiBahasa } from '../contexts/KonteksBahasa';

/** Halaman generik "Segera Hadir" untuk modul di luar lingkup M1 saat ini. */
export default function Segera({ judul = 'Modul' }) {
  const { t } = pakaiBahasa();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-oranye-50">
        <IkonLogo className="h-9 w-9" />
      </span>
      <div>
        <h1 className="font-display text-lg font-extrabold text-batu-900">{judul}</h1>
        <p className="mt-1 inline-flex rounded-full bg-oranye-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-oranye-700">
          {t.segera.judul}
        </p>
      </div>
      <p className="max-w-xs text-sm leading-relaxed text-batu-500">{t.segera.deskripsi}</p>
      <button type="button" className="tombol-netral" onClick={() => navigate(-1)}>
        {t.umum.kembali}
      </button>
    </div>
  );
}