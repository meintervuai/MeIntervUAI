// Halaman Masuk & Daftar MeIntervUAI (Tema Executive Orange & Zero-Scroll Single Viewport):
// Memuat penuh 1 layar tanpa scrollbar di desktop (h-screen overflow-hidden), berlatar Executive Orange brand,
// dengan autentikasi Supabase nyata, password visibility toggle, dan lokalisasi dwibahasa terpadu.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KotakInput } from '../components/ui/KotakInput';
import { Tombol } from '../components/ui/Tombol';
import { authSupabase } from '../services/supabase';
import { useBahasa } from '../i18n';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Check
} from 'lucide-react';

interface PropertiMasukDaftar {
  onLoginSukses: (pengguna: any, ingatkanSaya?: boolean) => void;
}

export const MasukDaftar: React.FC<PropertiMasukDaftar> = ({ onLoginSukses }) => {
  const navigate = useNavigate();
  const { bahasa, setBahasa, t } = useBahasa();
  const [tabAktif, setTabAktif] = useState<'masuk' | 'daftar'>('masuk');
  const [ingatkanSaya, setIngatkanSaya] = useState(true);

  // Form input state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [konfirmasiSandi, setKonfirmasiSandi] = useState('');

  // Password visibility state
  const [lihatKataSandi, setLihatKataSandi] = useState(false);
  const [lihatKonfirmasiSandi, setLihatKonfirmasiSandi] = useState(false);

  // Status loading & notifikasi
  const [memuat, setMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  const tanganiDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setPesanSukses(null);

    if (kataSandi.length < 6) {
      setPesanError(t.auth.galatSandiPendek);
      return;
    }

    if (kataSandi !== konfirmasiSandi) {
      setPesanError(t.auth.galatSandiBeda);
      return;
    }

    setMemuat(true);
    try {
      const data = await authSupabase.daftar(email, kataSandi, username);

      let userObj = data.user;
      if (!data.session) {
        const loginData = await authSupabase.masuk(email, kataSandi);
        if (loginData.user) {
          userObj = loginData.user;
        }
      }

      if (userObj) {
        const profilPengguna = {
          pengguna_id: `peng_${userObj.id.slice(0, 12)}`,
          email: userObj.email,
          nama_pengguna: username || userObj.email?.split('@')[0],
          saldo_token: 100,
        };
        onLoginSukses(profilPengguna, ingatkanSaya);
        navigate('/');
        return;
      }

      setPesanSukses(t.auth.suksesDaftar);
      setTabAktif('masuk');
    } catch (err: any) {
      const pesan = err.message || '';
      if (pesan.includes('already registered')) {
        setPesanError(t.auth.galatEmailTerdaftar);
      } else {
        setPesanError(pesan || 'Gagal melakukan pendaftaran. Silakan coba kembali.');
      }
    } finally {
      setMemuat(false);
    }
  };

  const tanganiMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setPesanSukses(null);
    setMemuat(true);

    try {
      const data = await authSupabase.masuk(email, kataSandi);
      if (data.user) {
        const namaUser = data.user.user_metadata?.nama_pengguna || email.split('@')[0];
        const profilPengguna = {
          pengguna_id: `peng_${data.user.id.slice(0, 12)}`,
          email: data.user.email,
          nama_pengguna: namaUser,
          saldo_token: 100,
        };
        onLoginSukses(profilPengguna, ingatkanSaya);
        navigate('/');
      }
    } catch (err: any) {
      const pesan = err.message || '';
      if (pesan.includes('Invalid login credentials')) {
        setPesanError(t.auth.galatKredensialSalah);
      } else {
        setPesanError(pesan || 'Gagal masuk akun. Periksa koneksi internet Anda.');
      }
    } finally {
      setMemuat(false);
    }
  };

  const tanganiGoogleOAuth = async () => {
    setPesanError(null);
    setPesanSukses(t.auth.statusGoogleArah);
    try {
      await authSupabase.masukGoogle();
    } catch (err: any) {
      setPesanError(err.message || 'Gagal membuka Google OAuth.');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:grid lg:grid-cols-2 bg-[#fdfbf7] overflow-hidden">
      {/* Sisi Kiri: Panel Visual Tema Executive Orange (Khusus Desktop & Tablet) */}
      <div className="relative hidden h-full flex-col bg-gradient-to-br from-orange-700 via-orange-800 to-orange-950 p-8 xl:p-12 text-white lg:flex justify-between overflow-hidden shadow-inner">
        {/* Brand Logo di Kiri Atas */}
        <div className="relative z-10 flex items-center gap-2.5 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-white text-orange-800 flex items-center justify-center font-black text-sm shadow-sm">
            MI
          </div>
          <span className="tracking-tight text-white font-extrabold text-xl">
            MeIntervU<span className="text-orange-200">AI</span>
          </span>
        </div>

        {/* Ilustrasi & Highlight Nilai Utama */}
        <div className="relative z-10 my-auto py-4 space-y-5 max-w-md">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/15">
            <img
              src="/illustrations/interview.svg"
              alt="Simulasi Wawancara AI"
              className="w-full max-h-44 object-contain filter drop-shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl xl:text-2xl font-bold tracking-tight text-white leading-tight">
              {t.auth.showcaseJudul}
            </h2>
            <p className="text-xs xl:text-sm text-orange-100/90 leading-relaxed max-w-[48ch]">
              {t.auth.showcaseDesc}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            {t.auth.fiturPoin.map((poin, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-orange-100">
                <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span><strong className="text-white font-semibold">{poin.judul}:</strong> {poin.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kutipan Testimonial Kandidat */}
        <div className="relative z-10 border-t border-orange-600/60 pt-4">
          <blockquote className="space-y-1">
            <p className="text-xs xl:text-sm text-orange-100 italic leading-relaxed max-w-[48ch]">
              &ldquo;Evaluasi metode STAR yang diberikan MeIntervUAI sangat objektif dan membantu saya membedah jawaban wawancara hingga lolos tahap User & HR.&rdquo;
            </p>
            <footer className="text-xs text-orange-100 font-medium">
              — Rian Sanjaya, Senior Software Engineer
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Sisi Kanan: Formulir Autentikasi (1 Layar Penuh Tanpa Scrollbar di Desktop) */}
      <div className="h-full flex flex-col justify-between p-4 sm:p-8 lg:p-8 overflow-y-auto lg:overflow-hidden relative">
        {/* Header Baris Atas: Tombol Kembali & Pemilih Bahasa */}
        <div className="flex items-center justify-between w-full max-w-[380px] mx-auto shrink-0 pb-2">
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-700 text-white flex items-center justify-center font-black text-xs">
              MI
            </div>
            <span className="tracking-tight text-stone-900 font-extrabold text-base">
              MeIntervU<span className="text-orange-700">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Switcher Bahasa Dwibahasa */}
            <div className="inline-flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
              <Globe className="w-3 h-3 text-stone-500 ml-1" />
              <button
                type="button"
                onClick={() => setBahasa('id')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded min-h-[26px] transition-colors ${
                  bahasa === 'id'
                    ? 'bg-orange-700 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-label="Pilih Bahasa Indonesia"
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setBahasa('en')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded min-h-[26px] transition-colors ${
                  bahasa === 'en'
                    ? 'bg-orange-700 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-label="Select English Language"
              >
                EN
              </button>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-orange-800 bg-white border border-stone-200 py-1 px-2.5 rounded-lg shadow-sm hover:bg-stone-50 transition-colors min-h-[30px]"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>{bahasa === 'id' ? 'Beranda' : 'Overview'}</span>
            </Link>
          </div>
        </div>

        {/* Kontainer Utama Form: Ditata Pas Muat 1 Layar */}
        <div className="w-full max-w-[380px] mx-auto my-auto space-y-4">
          {/* Form Header */}
          <div className="space-y-1 text-left">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {tabAktif === 'masuk' ? t.auth.judulMasuk : t.auth.judulDaftar}
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed max-w-[48ch]">
              {tabAktif === 'masuk' ? t.auth.subjudulMasuk : t.auth.subjudulDaftar}
            </p>
          </div>

          {/* Tab Switcher Segmented Control */}
          <div className="grid grid-cols-2 p-1 bg-stone-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => { setTabAktif('masuk'); setPesanError(null); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all min-h-[34px] flex items-center justify-center ${
                tabAktif === 'masuk'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.auth.tabMasuk}
            </button>
            <button
              type="button"
              onClick={() => { setTabAktif('daftar'); setPesanError(null); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all min-h-[34px] flex items-center justify-center ${
                tabAktif === 'daftar'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.auth.tabDaftar}
            </button>
          </div>

          {/* Feedback Notifikasi Status */}
          {pesanError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-3 py-2 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{pesanError}</span>
            </div>
          )}

          {pesanSukses && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg px-3 py-2 text-xs font-medium flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{pesanSukses}</span>
            </div>
          )}

          {/* Tombol Google OAuth */}
          <button
            type="button"
            onClick={tanganiGoogleOAuth}
            className="w-full min-h-[40px] flex items-center justify-center gap-2.5 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-orange-700"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="truncate">{t.auth.tombolGoogle}</span>
          </button>

          {/* Garis Pembatas */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full"></div>
            <span className="bg-[#fdfbf7] px-3 text-xs font-medium text-stone-600">
              {t.auth.pembatasAtau}
            </span>
          </div>

          {/* Formulir Tab Masuk */}
          {tabAktif === 'masuk' ? (
            <form onSubmit={tanganiMasuk} className="space-y-3">
              <KotakInput
                label={t.auth.labelEmail}
                type="email"
                required
                placeholder={t.auth.placeholderEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <KotakInput
                label={t.auth.labelKataSandi}
                type={lihatKataSandi ? 'text' : 'password'}
                required
                placeholder={t.auth.placeholderKataSandi}
                value={kataSandi}
                onChange={(e) => setKataSandi(e.target.value)}
                autoComplete="current-password"
                aksiKanan={
                  <button
                    type="button"
                    onClick={() => setLihatKataSandi(!lihatKataSandi)}
                    className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 rounded-md transition-colors"
                    aria-label={lihatKataSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {lihatKataSandi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between pt-0.5">
                <label className="min-h-[36px] flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ingatkanSaya}
                    onChange={(e) => setIngatkanSaya(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-orange-700 focus:ring-orange-600 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-700">
                    {t.auth.ingatkanSayaLabel}
                  </span>
                </label>

                <Link
                  to="/bantuan"
                  className="text-xs font-semibold text-orange-900 hover:underline min-h-[30px] flex items-center"
                >
                  {t.auth.lupaKataSandi}
                </Link>
              </div>

              <Tombol
                type="submit"
                varian="primer"
                ukuran="md"
                sedangMemuat={memuat}
                className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[42px]"
              >
                <span>{t.auth.tombolSubmitMasuk}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Tombol>
            </form>
          ) : (
            /* Formulir Tab Daftar */
            <form onSubmit={tanganiDaftar} className="space-y-2.5">
              <KotakInput
                label={t.auth.labelUsername}
                required
                placeholder={t.auth.placeholderUsername}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />

              <KotakInput
                label={t.auth.labelEmail}
                type="email"
                required
                placeholder={t.auth.placeholderEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <KotakInput
                label={t.auth.labelKataSandi}
                type={lihatKataSandi ? 'text' : 'password'}
                required
                placeholder={t.auth.placeholderKataSandi}
                value={kataSandi}
                onChange={(e) => setKataSandi(e.target.value)}
                autoComplete="new-password"
                aksiKanan={
                  <button
                    type="button"
                    onClick={() => setLihatKataSandi(!lihatKataSandi)}
                    className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 rounded-md transition-colors"
                    aria-label={lihatKataSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {lihatKataSandi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <KotakInput
                label={t.auth.labelKonfirmasiSandi}
                type={lihatKonfirmasiSandi ? 'text' : 'password'}
                required
                placeholder={t.auth.placeholderKonfirmasiSandi}
                value={konfirmasiSandi}
                onChange={(e) => setKonfirmasiSandi(e.target.value)}
                autoComplete="new-password"
                aksiKanan={
                  <button
                    type="button"
                    onClick={() => setLihatKonfirmasiSandi(!lihatKonfirmasiSandi)}
                    className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 rounded-md transition-colors"
                    aria-label={lihatKonfirmasiSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {lihatKonfirmasiSandi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between pt-0.5">
                <label className="min-h-[32px] flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ingatkanSaya}
                    onChange={(e) => setIngatkanSaya(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-orange-700 focus:ring-orange-600 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-700">
                    {t.auth.ingatkanSayaLabel}
                  </span>
                </label>
              </div>


              <Tombol
                type="submit"
                varian="primer"
                ukuran="md"
                sedangMemuat={memuat}
                className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[42px]"
              >
                <span>{t.auth.tombolSubmitDaftar}</span>
              </Tombol>
            </form>
          )}
        </div>

        {/* Footer Terms & Privacy Notice */}
        <div className="w-full max-w-[380px] mx-auto text-center shrink-0 pt-2">
          <p className="text-xs text-stone-500 leading-relaxed">
            {bahasa === 'id' ? (
              <>Dengan melanjutkan, Anda menyetujui <span className="underline underline-offset-2 hover:text-stone-900 cursor-pointer">Ketentuan Layanan</span> & <span className="underline underline-offset-2 hover:text-stone-900 cursor-pointer">Kebijakan Privasi</span>.</>
            ) : (
              <>By continuing, you agree to our <span className="underline underline-offset-2 hover:text-stone-900 cursor-pointer">Terms of Service</span> & <span className="underline underline-offset-2 hover:text-stone-900 cursor-pointer">Privacy Policy</span>.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
