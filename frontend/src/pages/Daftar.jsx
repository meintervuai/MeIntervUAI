import { useState, useMemo } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import IkonLogo from '../components/icons/IkonLogo';
import IkonOrang from '../components/icons/IkonOrang';
import IkonAmplop from '../components/icons/IkonAmplop';
import IkonGembok from '../components/icons/IkonGembok';
import IkonMata from '../components/icons/IkonMata';
import IkonMataTutup from '../components/icons/IkonMataTutup';
import IkonTambahPengguna from '../components/icons/IkonTambahPengguna';
import IkonTanganMenyapa from '../components/icons/IkonTanganMenyapa';
import IkonSimulasiFitur from '../components/icons/IkonSimulasiFitur';
import IkonTemplateFitur from '../components/icons/IkonTemplateFitur';
import IkonLowonganFitur from '../components/icons/IkonLowonganFitur';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiBahasa } from '../contexts/KonteksBahasa';
import { daftarDenganEmail } from '../services/api_otentikasi';

export default function Daftar() {
  const { pengguna, memuat } = pakaiOtentikasi();
  const { t } = pakaiBahasa();
  const lokasi = useLocation();
  const navigate = useNavigate();
  const [memproses, setMemproses] = useState(false);
  const [galat, setGalat] = useState(null);
  const [sukses, setSukses] = useState(false);
  const [tampilSandi, setTampilSandi] = useState(false);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const tujuan = lokasi.state?.dari || '/home';

  if (!memuat && pengguna) {
    return <Navigate to={tujuan} replace />;
  }

  const kekuatanSandi = useMemo(() => {
    if (password.length === 0) return { skor: 0, label: '', kelas: '' };
    let skor = 0;
    if (password.length >= 6) skor++;
    if (password.length >= 10) skor++;
    if (/[A-Z]/.test(password)) skor++;
    if (/[0-9]/.test(password)) skor++;
    if (/[^A-Za-z0-9]/.test(password)) skor++;
    if (skor <= 2) return { skor, label: t.daftar.kekuatanLemah, kelas: 'bg-bahaya' };
    if (skor <= 3) return { skor, label: t.daftar.kekuatanSedang, kelas: 'bg-oranye-500' };
    return { skor, label: t.daftar.kekuatanKuat, kelas: 'bg-sukses' };
  }, [password, t]);

  async function tanganiDaftar(e) {
    e.preventDefault();
    setGalat(null);
    setMemproses(true);
    try {
      const { error } = await daftarDenganEmail(email, password, nama);
      if (error) throw error;
      setSukses(true);
    } catch (err) {
      setGalat(err.message || t.daftar.gagal);
      setMemproses(false);
    }
  }

  const panelKiri = (
    <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-oranye-600 via-oranye-500 to-oranye-700 p-8 text-white md:p-12">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white" />
      </div>
      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-2">
          <IkonLogo className="h-9 w-9" />
          <span className="font-display text-lg font-extrabold tracking-tight">{t.umum.appName}</span>
        </Link>
      </div>
      <div className="relative z-10 my-10">
        <div className="mb-5 flex items-center gap-2">
          <IkonTanganMenyapa className="h-7 w-7 text-oranye-200" />
          <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{t.daftar.sapaan}</h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-oranye-100 md:text-base">{t.daftar.deskripsiPanel}</p>
        <div className="mt-8 space-y-3">
          {[{ Ikon: IkonSimulasiFitur, label: t.daftar.fitur1 }, { Ikon: IkonTemplateFitur, label: t.daftar.fitur2 }, { Ikon: IkonLowonganFitur, label: t.daftar.fitur3 }].map(({ Ikon, label }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <Ikon className="h-5 w-5 shrink-0 text-oranye-200" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="relative z-10 text-xs text-oranye-200">{t.daftar.hakCipta}</p>
    </div>
  );

  if (sukses) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-latar px-5">
        <div className="kartu max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sukses/10">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-sukses" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold text-batu-900">{t.daftar.sukses}</h2>
          <button type="button" onClick={() => navigate('/masuk', { replace: true })} className="mt-4 min-h-[44px] w-full rounded-tombol bg-oranye-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-oranye-500">{t.masuk.tombolMasuk}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white md:flex-row">
      <div className="hidden md:block md:w-1/2">{panelKiri}</div>
      <main className="flex flex-1 flex-col justify-center px-5 py-8 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-batu-500 transition-colors hover:text-oranye-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M19 12H5M12 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t.daftar.tombolKembali}
          </Link>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-batu-900">{t.daftar.judul}</h1>
          <p className="mt-1 text-sm text-batu-500">{t.daftar.deskripsi}</p>

          <form onSubmit={tanganiDaftar} className="mt-6 space-y-4">
            <div>
              <label htmlFor="daftar-nama" className="label-form">{t.daftar.labelNama}</label>
              <div className="relative">
                <IkonOrang className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-batu-400" />
                <input id="daftar-nama" type="text" autoComplete="name" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder={t.daftar.placeholderNama} className="bidang-masukan pl-9" />
              </div>
            </div>
            <div>
              <label htmlFor="daftar-email" className="label-form">{t.daftar.labelEmail}</label>
              <div className="relative">
                <IkonAmplop className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-batu-400" />
                <input id="daftar-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.daftar.placeholderEmail} className="bidang-masukan pl-9" />
              </div>
            </div>
            <div>
              <label htmlFor="daftar-sandi" className="label-form">{t.daftar.labelPassword}</label>
              <div className="relative">
                <IkonGembok className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-batu-400" />
                <input id="daftar-sandi" type={tampilSandi ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.daftar.placeholderPassword} className="bidang-masukan pl-9 pr-10" />
                <button type="button" onClick={() => setTampilSandi((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-batu-400 hover:text-batu-600" aria-label="toggle">
                  {tampilSandi ? <IkonMataTutup className="h-4 w-4" /> : <IkonMata className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (<div key={i} className={`h-1 flex-1 rounded-full ${i <= kekuatanSandi.skor ? kekuatanSandi.kelas : 'bg-batu-200'}`} />))}
                  </div>
                  <p className="mt-1 text-xs text-batu-500">{t.daftar.kekuatanSandi} <span className="font-semibold">{kekuatanSandi.label}</span></p>
                </div>
              )}
            </div>
            {galat && (<p role="alert" className="rounded-tombol border border-bahaya/30 bg-red-50 px-3 py-2 text-xs font-medium text-bahaya">{galat}</p>)}
            <button type="submit" disabled={memproses} className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-tombol bg-oranye-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-oranye-500 active:bg-oranye-700 disabled:cursor-not-allowed disabled:opacity-50">
              <IkonTambahPengguna className="h-4 w-4" />
              {memproses ? t.daftar.tombolMemproses : t.daftar.tombolDaftar}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-batu-500">{t.daftar.sudahPunyaAkun} <Link to="/masuk" className="font-semibold text-oranye-700 hover:underline">{t.daftar.tautanMasuk}</Link></p>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-batu-400">{t.daftar.syaratKetentuan}</p>
        </div>
      </main>
    </div>
  );
}
