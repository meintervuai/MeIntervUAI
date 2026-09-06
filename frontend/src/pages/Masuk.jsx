import { useState } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import IkonLogo from '../components/icons/IkonLogo';
import IkonGoogle from '../components/icons/IkonGoogle';
import IkonAmplop from '../components/icons/IkonAmplop';
import IkonGembok from '../components/icons/IkonGembok';
import IkonMata from '../components/icons/IkonMata';
import IkonMataTutup from '../components/icons/IkonMataTutup';
import IkonKado from '../components/icons/IkonKado';
import IkonPanahKanan from '../components/icons/IkonPanahKanan';
import IkonTanganMenyapa from '../components/icons/IkonTanganMenyapa';
import IkonSimulasiFitur from '../components/icons/IkonSimulasiFitur';
import IkonTemplateFitur from '../components/icons/IkonTemplateFitur';
import IkonLowonganFitur from '../components/icons/IkonLowonganFitur';
import IkonPerisai from '../components/icons/IkonPerisai';
import { pakaiOtentikasi } from '../contexts/KonteksOtentikasi';
import { pakaiBahasa } from '../contexts/KonteksBahasa';
import { masukDenganGoogle, masukDenganEmail } from '../services/api_otentikasi';

/**
 * Halaman Masuk / Login (rute `/masuk` — FR-01):
 * - Mobile-first: single column rapi pada layar ponsel
 * - Desktop: split-screen 50/50 dengan panel presentasi fitur & privasi
 * - 1-Klik Masuk Demo untuk pengujian instan
 * - Google OAuth & Email/Kata Sandi dengan validasi lengkap
 */
export default function Masuk() {
  const { pengguna, memuat } = pakaiOtentikasi();
  const { t, bahasa, gantiBahasa } = pakaiBahasa();
  const lokasi = useLocation();
  const navigate = useNavigate();

  const [memproses, setMemproses] = useState(false);
  const [memprosesDemo, setMemprosesDemo] = useState(false);
  const [memprosesGoogle, setMemprosesGoogle] = useState(false);
  const [galat, setGalat] = useState(null);
  const [tampilSandi, setTampilSandi] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const tujuan = lokasi.state?.dari || '/home';

  // Jika sesi sudah ada, langsung arahkan ke tujuan (default /home)
  if (!memuat && pengguna) {
    return <Navigate to={tujuan} replace />;
  }

  async function tanganiMasukGoogle() {
    setGalat(null);
    setMemprosesGoogle(true);
    try {
      const { error } = await masukDenganGoogle();
      if (error) throw error;
    } catch (e) {
      setGalat(e.message || t.masuk.gagal);
      setMemprosesGoogle(false);
    }
  }

  async function tanganiMasukEmail(e) {
    e.preventDefault();
    if (!email || !password) return;
    setGalat(null);
    setMemproses(true);
    try {
      const { error } = await masukDenganEmail(email.trim(), password);
      if (error) throw error;
      navigate(tujuan, { replace: true });
    } catch (err) {
      const pesan =
        err.message === 'Invalid login credentials'
          ? 'Email atau kata sandi tidak cocok. Silakan periksa kembali atau gunakan Akun Demo.'
          : err.message || t.masuk.gagal;
      setGalat(pesan);
      setMemproses(false);
    }
  }

  // 1-Klik masuk dengan akun demo yang sudah disiapkan
  async function tanganiDemo() {
    setGalat(null);
    setEmail('demo@meintervu.ai');
    setPassword('demo12345');
    setTampilSandi(false);
    setMemprosesDemo(true);
    try {
      const { error } = await masukDenganEmail('demo@meintervu.ai', 'demo12345');
      if (error) throw error;
      navigate(tujuan, { replace: true });
    } catch (err) {
      setGalat('Gagal masuk akun demo. Coba isi manual atau klik lagi.');
      setMemprosesDemo(false);
    }
  }

  // Panel Kiri untuk Desktop (≥md)
  const panelKiri = (
    <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-oranye-600 via-oranye-500 to-oranye-700 p-8 text-white lg:p-14">
      {/* Aksen geometris lembut (anti AI-slop: tanpa glow neon) */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-2 border-white" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full border-2 border-white" />
        <div className="absolute left-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/10" />
      </div>

      {/* Header Logo Brand */}
      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-90">
          <IkonLogo className="h-10 w-10 text-white" />
          <div>
            <span className="font-display text-xl font-extrabold tracking-tight">
              {t.umum.appName}
            </span>
            <p className="text-xs text-oranye-100">{t.umum.tagline}</p>
          </div>
        </Link>
      </div>

      {/* Konten Utama Panel */}
      <div className="relative z-10 my-auto py-10">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-oranye-100">
            <IkonTanganMenyapa className="h-6 w-6" />
          </span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight lg:text-3xl">
            {t.masuk.sapaan}
          </h2>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-oranye-50 lg:text-base">
          {t.masuk.deskripsiPanel}
        </p>

        {/* 3 Fitur Pilar Utama */}
        <div className="mt-8 space-y-3.5">
          {[
            {
              Ikon: IkonSimulasiFitur,
              judul: t.masuk.fitur1,
              keterangan: 'Teks, audio, dan video dengan umpan balik STAR.',
            },
            {
              Ikon: IkonTemplateFitur,
              judul: t.masuk.fitur2,
              keterangan: 'Template ATS-friendly siap unduh PDF.',
            },
            {
              Ikon: IkonLowonganFitur,
              judul: t.masuk.fitur3,
              keterangan: 'Pencocokan lowongan kerja berdasarkan profil keahlian.',
            },
          ].map(({ Ikon, judul, keterangan }) => (
            <div
              key={judul}
              className="flex items-start gap-3.5 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm"
            >
              <Ikon className="mt-0.5 h-5 w-5 shrink-0 text-oranye-200" />
              <div>
                <p className="text-sm font-bold text-white">{judul}</p>
                <p className="text-xs text-oranye-100/90">{keterangan}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Jaminan Privasi */}
        <div className="mt-7 flex items-center gap-2 text-xs text-oranye-100/90">
          <IkonPerisai className="h-4 w-4 shrink-0 text-oranye-200" />
          <span>Privasi utama: Sesi wawancara dievaluasi langsung dan tidak pernah disimpan.</span>
        </div>
      </div>

      {/* Footer Hak Cipta */}
      <div className="relative z-10 pt-4 text-xs text-oranye-200">
        <p>{t.masuk.hakCipta}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-latar md:flex-row">
      {/* Panel Kiri (Desktop) */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2">{panelKiri}</div>

      {/* Main Content (Mobile-First & Desktop Form) */}
      <main className="flex flex-1 flex-col justify-between px-5 py-6 sm:px-8 md:px-12 lg:px-16">
        {/* Top Header Mobile / Navigasi Cepat */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-batu-500 transition-colors hover:text-oranye-600 focus-visible:ring-2"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path
                d="M19 12H5M12 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t.masuk.tombolKembali}</span>
          </Link>

          {/* Pengalih Bahasa (ID / EN) */}
          <div className="flex items-center rounded-full border border-batu-200 bg-white p-0.5 text-xs font-semibold text-batu-600 shadow-sm">
            <button
              type="button"
              onClick={() => gantiBahasa('id')}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                bahasa === 'id' ? 'bg-oranye-600 text-white shadow-xs' : 'hover:text-batu-900'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => gantiBahasa('en')}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                bahasa === 'en' ? 'bg-oranye-600 text-white shadow-xs' : 'hover:text-batu-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Kontainer Form Masuk */}
        <div className="mx-auto my-auto w-full max-w-sm py-6 sm:max-w-md">
          {/* Logo brand khusus tampilan mobile */}
          <div className="mb-6 flex items-center gap-2.5 md:hidden">
            <IkonLogo className="h-9 w-9 text-oranye-600" />
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight text-batu-900">
                {t.umum.appName}
              </p>
              <p className="text-[11px] text-batu-500">{t.umum.tagline}</p>
            </div>
          </div>

          <header className="mb-6">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-batu-900 md:text-3xl">
              {t.masuk.judul}
            </h1>
            <p className="mt-1 text-sm text-batu-500">{t.masuk.deskripsi}</p>
          </header>

          {/* Tombol Demo Cepat (1-Klik Masuk) */}
          <button
            type="button"
            onClick={tanganiDemo}
            disabled={memprosesDemo || memproses}
            className="group relative flex min-h-[50px] w-full items-center justify-between rounded-tombol border-2 border-dashed border-oranye-300 bg-oranye-50/60 px-4 py-2.5 text-left transition-all hover:border-oranye-500 hover:bg-oranye-50 active:scale-[0.99] disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-oranye-500 text-white shadow-xs transition-transform group-hover:scale-105">
                <IkonKado className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-oranye-900">
                  {memprosesDemo ? 'Masuk dengan Akun Demo…' : t.masuk.tombolDemo}
                </p>
                <p className="text-[11px] text-oranye-700">
                  Coba instan tanpa perlu mendaftar (kuota 20/hari)
                </p>
              </div>
            </div>
            <span className="rounded-full bg-oranye-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              {t.masuk.badgeGratis}
            </span>
          </button>

          {/* Pemisah Garis */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-batu-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-batu-400">
              {t.masuk.atauMasukDengan}
            </span>
            <div className="h-px flex-1 bg-batu-200" />
          </div>

          {/* Formulir Email & Kata Sandi */}
          <form onSubmit={tanganiMasukEmail} className="space-y-4">
            <div>
              <label htmlFor="masuk-email" className="label-form">
                {t.masuk.labelEmail}
              </label>
              <div className="relative">
                <IkonAmplop className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-batu-400" />
                <input
                  id="masuk-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.masuk.placeholderEmail}
                  className="bidang-masukan pl-10 pr-3 focus:ring-2 focus:ring-oranye-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="masuk-sandi" className="label-form">
                  {t.masuk.labelPassword}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert('Silakan gunakan Akun Demo GRATIS atau hubungi tim pengembang.')
                  }
                  className="text-xs font-semibold text-oranye-700 hover:underline"
                >
                  {t.masuk.lupaPassword}
                </button>
              </div>
              <div className="relative">
                <IkonGembok className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-batu-400" />
                <input
                  id="masuk-sandi"
                  type={tampilSandi ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.masuk.placeholderPassword}
                  className="bidang-masukan pl-10 pr-11 focus:ring-2 focus:ring-oranye-500"
                />
                <button
                  type="button"
                  onClick={() => setTampilSandi((s) => !s)}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-batu-400 transition-colors hover:text-batu-700"
                  aria-label={tampilSandi ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {tampilSandi ? (
                    <IkonMataTutup className="h-4 w-4" />
                  ) : (
                    <IkonMata className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Kotak Pesan Galat */}
            {galat && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-tombol border border-bahaya/30 bg-red-50 p-3 text-xs font-medium text-bahaya"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="flex-1">
                  <span>{galat}</span>
                </div>
              </div>
            )}

            {/* Tombol Masuk Email */}
            <button
              type="submit"
              disabled={memproses || memprosesDemo}
              className="tombol-utama w-full"
            >
              <span>{memproses ? t.masuk.tombolMemproses : t.masuk.tombolMasuk}</span>
              {!memproses && <IkonPanahKanan className="h-4 w-4" />}
            </button>
          </form>

          {/* Tombol Masuk Google */}
          <button
            type="button"
            onClick={tanganiMasukGoogle}
            disabled={memprosesGoogle || memproses}
            className="mt-3.5 flex min-h-[44px] w-full items-center justify-center gap-3 rounded-tombol border border-batu-300 bg-white px-4 text-sm font-semibold text-batu-700 shadow-xs transition-colors hover:bg-batu-50 active:bg-batu-100 disabled:opacity-60"
          >
            <IkonGoogle className="h-5 w-5" />
            <span>{memprosesGoogle ? t.masuk.sedangProses : t.masuk.tombolGoogle}</span>
          </button>

          {/* Tautan Daftar Akun Baru */}
          <p className="mt-6 text-center text-xs text-batu-500">
            {t.masuk.belumPunyaAkun}{' '}
            <Link to="/daftar" className="font-bold text-oranye-700 hover:underline">
              {t.masuk.tautanDaftar}
            </Link>
          </p>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-batu-400">
            {t.masuk.syaratKetentuan}
          </p>
        </div>

        {/* Footer Aman Mobile */}
        <div className="pt-2 text-center text-[11px] text-batu-400 md:hidden">
          <p>{t.masuk.hakCipta}</p>
        </div>
      </main>
    </div>
  );
}