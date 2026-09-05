import { useNavigate } from 'react-router-dom';
import KartuKuota from '../components/KartuKuota';
import KartuTindakan from '../components/KartuTindakan';
import IkonAnalisis from '../components/icons/IkonAnalisis';
import IkonPlus from '../components/icons/IkonPlus';
import IkonSimulasi from '../components/icons/IkonSimulasi';
import IkonLowongan from '../components/icons/IkonLowongan';
import IkonPerisai from '../components/icons/IkonPerisai';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiBahasa } from '../contexts/KonteksBahasa';
import { pakaiKuota } from '../hooks/pakai_kuota';
import { sapaanWaktu, namaDepan } from '../utils/pemformat';

/**
 * Home / dashboard (FR-19): sapaan, kuota AI, tindakan cepat,
 * dan bagian Analisis CV (kosong-state sampai CV dibuat).
 */
export default function Home() {
  const { profil } = pakaiOtentikasi();
  const { t } = pakaiBahasa();
  const { kuota, memuat } = pakaiKuota();
  const navigate = useNavigate();

  const nama = namaDepan(profil?.nama_lengkap);

  const tindakan = [
    { judul: t.home.tindakan.analisis, Ikon: IkonAnalisis, ke: '/analisis-cv' },
    { judul: t.home.tindakan.buatCv, Ikon: IkonPlus, ke: '/pembuat-cv' },
    { judul: t.home.tindakan.simulasi, Ikon: IkonSimulasi, ke: '/simulasi' },
    { judul: t.home.tindakan.lowongan, Ikon: IkonLowongan, ke: '/lowongan' },
  ];

  return (
    <div className="space-y-5">
      {/* Sapaan */}
      <section>
        <h1 className="font-display text-xl font-extrabold tracking-tight text-batu-900">
          {sapaanWaktu()}
          {nama ? `, ${nama}` : ''}
        </h1>
        <p className="mt-1 text-sm text-batu-500">
          {profil?.posisi_target
            ? `Target Anda: ${profil.posisi_target}`
            : 'Atur posisi target Anda di halaman Profil.'}
        </p>
      </section>

      {/* Kuota AI harian */}
      <KartuKuota kuota={kuota} memuat={memuat} />

      {/* Tindakan cepat */}
      <section aria-label={t.home.tindakanJudul}>
        <h2 className="mb-2.5 font-display text-sm font-bold uppercase tracking-wide text-batu-500">
          {t.home.tindakanJudul}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {tindakan.map(({ judul, Ikon, ke }) => (
            <KartuTindakan
              key={ke}
              judul={judul}
              Ikon={Ikon}
              segera={ke !== '/pembuat-cv'}
              onClick={() => navigate(ke)}
            />
          ))}
        </div>
      </section>

      {/* Bagian Analisis CV (FR-19) — kosong-state sebelum ada CV */}
      <section aria-label={t.home.analisisJudul}>
        <h2 className="mb-2.5 font-display text-sm font-bold uppercase tracking-wide text-batu-500">
          {t.home.analisisJudul}
        </h2>
        <div className="kartu flex flex-col items-center gap-3 px-5 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-oranye-50 text-oranye-600">
            <IkonAnalisis className="h-6 w-6" />
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-batu-500">
            {t.home.analisisKosong}
          </p>
          <button type="button" className="tombol-utama" onClick={() => navigate('/pembuat-cv')}>
            <IkonPlus className="h-4 w-4" />
            {t.home.analisisBuat}
          </button>
        </div>
      </section>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-batu-400">
        <IkonPerisai className="h-3.5 w-3.5 shrink-0" />
        {t.masuk.catatanPrivasi}
      </p>
    </div>
  );
}