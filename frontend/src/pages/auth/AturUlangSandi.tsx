// Halaman Atur Ulang Kata Sandi (Reset Password) MeIntervUAI
// Dipindahkan ke dalam modul pages/auth untuk kemudahan pemeliharaan dan perbaikan.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useBahasa } from '../../i18n';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export const AturUlangSandi: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useBahasa();
  const [sandiBaru, setSandiBaru] = useState('');
  const [konfirmasiSandi, setKonfirmasiSandi] = useState('');
  const [lihatSandiBaru, setLihatSandiBaru] = useState(false);
  const [lihatKonfirmasi, setLihatKonfirmasi] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const [sesiValid, setSesiValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Periksa apakah URL memiliki sesi pemulihan atau token aktif
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSesiValid(true);
      } else {
        const hash = window.location.hash;
        if (hash.includes('access_token') || hash.includes('type=recovery')) {
          setSesiValid(true);
        } else {
          setSesiValid(false);
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSesiValid(true);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Hitung kekuatan kata sandi dinamis
  const hitungKekuatanSandi = () => {
    if (!sandiBaru) return 0;
    let skor = 0;
    if (sandiBaru.length >= 6) skor += 1;
    if (sandiBaru.length >= 8) skor += 1;
    if (/[A-Z]/.test(sandiBaru) && /[a-z]/.test(sandiBaru)) skor += 1;
    if (/[0-9]/.test(sandiBaru) || /[^A-Za-z0-9]/.test(sandiBaru)) skor += 1;
    return skor;
  };

  const skorKekuatan = hitungKekuatanSandi();
  const warnaKekuatan = [
    'bg-stone-200',
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-600',
  ][skorKekuatan];

  const labelKekuatan = t.auth.kekuatanSandiLevel[skorKekuatan] || t.auth.kekuatanSandiLevel[0];

  const tanganiSimpanSandi = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setPesanSukses(null);

    if (sandiBaru.length < 6) {
      setPesanError(t.auth.galatSandiPendek);
      return;
    }

    if (sandiBaru !== konfirmasiSandi) {
      setPesanError(t.auth.galatSandiBeda);
      return;
    }

    setMemuat(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: sandiBaru,
      });

      if (error) {
        throw error;
      }

      // Bersihkan sesi aktif pemulihan kata sandi agar tidak langsung login otomatis
      try {
        await supabase.auth.signOut();
      } catch (_) {}
      localStorage.removeItem('intervu_pengguna');
      localStorage.removeItem('intervu_waktu_login');
      localStorage.removeItem('intervu_ingatkan_saya');

      setPesanSukses(t.auth.suksesPerbaruiSandi);
      setTimeout(() => {
        navigate('/masuk', { replace: true });
      }, 2000);
    } catch (err: any) {
      setPesanError(err.message || 'Gagal memperbarui kata sandi. Tautan pemulihan mungkin sudah kedaluwarsa.');
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2 bg-[#fdfbf7] select-none">
      {/* 1. Header Visual Khusus Mobile */}
      <div className="lg:hidden relative bg-gradient-to-br from-orange-700 via-orange-800 to-orange-950 text-white px-6 pt-7 pb-8 rounded-b-[2rem] shadow-lg shadow-orange-950/15 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white text-orange-900 flex items-center justify-center font-black text-xs shadow-sm">
              MI
            </div>
            <span className="font-extrabold tracking-tight text-white text-base">
              MeIntervU<span className="text-orange-200">AI</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/masuk')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold text-orange-100 hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
        </div>

        {/* Hero Card di Mobile dengan Ilustrasi */}
        <div className="relative z-10 flex items-center gap-4 bg-orange-900/60 p-4 rounded-2xl border border-orange-600/50">
          <div className="w-20 h-20 shrink-0 bg-white/10 rounded-xl p-2 flex items-center justify-center">
            <img
              src="/illustrations/forgot-password.svg"
              alt="Keamanan Akun"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/30 text-[10px] font-bold text-orange-200">
              <ShieldCheck className="w-3 h-3 text-orange-200" />
              Terenkripsi Aman
            </div>
            <h2 className="text-sm font-bold text-white leading-tight">
              Atur Kata Sandi Baru
            </h2>
            <p className="text-[11px] text-orange-100/80 leading-snug">
              Buat kata sandi baru untuk melanjutkan persiapan simulasi wawancara Anda.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Visual Showcase Khusus Desktop (Layar Besar) */}
      <div className="relative hidden lg:flex h-full flex-col bg-gradient-to-br from-orange-700 via-orange-800 to-orange-950 p-8 xl:p-12 text-white justify-between overflow-hidden shadow-inner">
        <div className="relative z-10 flex items-center gap-2.5 font-bold text-lg">
          <div className="w-9 h-9 rounded-xl bg-white text-orange-900 flex items-center justify-center font-black text-sm shadow-md">
            MI
          </div>
          <span className="tracking-tight text-white font-extrabold text-xl">
            MeIntervU<span className="text-orange-200">AI</span>
          </span>
        </div>

        <div className="relative z-10 my-auto py-4 space-y-6 max-w-md">
          <div className="bg-orange-900/60 p-6 rounded-2xl border border-orange-600/50 shadow-sm transition-transform hover:scale-[1.01] duration-300">
            <img
              src="/illustrations/forgot-password.svg"
              alt="Keamanan Akun MeIntervUAI"
              className="w-full max-h-52 object-contain filter drop-shadow-md"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/40 border border-orange-500/40 text-orange-100 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-200" />
              Perlindungan Akun Terenkripsi
            </div>
            <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Pemulihan Sandi Aman & Instan
            </h2>
            <p className="text-xs xl:text-sm text-orange-100/90 leading-relaxed">
              Kandidat terlindungi dengan standar enkripsi modern. Setelah kata sandi diperbarui, seluruh sesi lama otomatis disegarkan demi menjaga data profil dan simulasi wawancara Anda.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/15 text-xs text-orange-100">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-orange-200" />
              <span>Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-orange-200/80">
          © 2026 MeIntervUAI. Seluruh hak cipta dilindungi.
        </div>
      </div>

      {/* 3. Kolom Form (Desktop & Mobile) */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-8 lg:py-12 overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto space-y-5 sm:space-y-6">
          <div className="hidden lg:block">
            <button
              type="button"
              onClick={() => navigate('/masuk')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-orange-800 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Kembali ke Halaman Masuk</span>
            </button>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="hidden lg:flex w-11 h-11 rounded-2xl bg-orange-100 border border-orange-200 text-orange-800 items-center justify-center shadow-sm mb-3">
              <Lock className="w-5 h-5 text-orange-700" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
              {t.auth.judulAturUlangSandi}
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.auth.subjudulAturUlangSandi}
            </p>
          </div>

          {pesanError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{pesanError}</span>
            </div>
          )}

          {pesanSukses && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{pesanSukses}</span>
            </div>
          )}

          {sesiValid === false && (
            <div className="p-5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                {t.auth.tautanKedaluwarsaJudul}
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                {t.auth.tautanKedaluwarsaDesc}
              </p>
              <button
                type="button"
                onClick={() => navigate('/masuk')}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs shadow-sm transition"
              >
                {t.auth.tombolMintaTautanBaru}
              </button>
            </div>
          )}

          {sesiValid !== false && (
            <form onSubmit={tanganiSimpanSandi} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  {t.auth.labelSandiBaru}
                </label>
                <div className="relative">
                  <input
                    type={lihatSandiBaru ? 'text' : 'password'}
                    required
                    value={sandiBaru}
                    onChange={(e) => setSandiBaru(e.target.value)}
                    placeholder={t.auth.placeholderSandiBaru}
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setLihatSandiBaru(!lihatSandiBaru)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                    aria-label={lihatSandiBaru ? 'Sembunyikan' : 'Lihat'}
                  >
                    {lihatSandiBaru ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {sandiBaru.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${warnaKekuatan}`}
                        style={{ width: `${(skorKekuatan / 4) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-500">
                      <span>{t.auth.labelKekuatanSandi} <strong className="text-stone-700">{labelKekuatan}</strong></span>
                      <span>{sandiBaru.length} Karakter</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  {t.auth.labelKonfirmasiSandiBaru}
                </label>
                <div className="relative">
                  <input
                    type={lihatKonfirmasi ? 'text' : 'password'}
                    required
                    value={konfirmasiSandi}
                    onChange={(e) => setKonfirmasiSandi(e.target.value)}
                    placeholder={t.auth.placeholderKonfirmasiSandiBaru}
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setLihatKonfirmasi(!lihatKonfirmasi)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                    aria-label={lihatKonfirmasi ? 'Sembunyikan' : 'Lihat'}
                  >
                    {lihatKonfirmasi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-orange-50/70 border border-orange-200/60 rounded-xl text-[11px] text-orange-950/80 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {t.auth.tipsSandi}
                </span>
              </div>

              <button
                type="submit"
                disabled={memuat}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold rounded-xl text-sm shadow-md shadow-orange-950/20 transition-all focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span>{memuat ? t.auth.tombolSedangMenyimpan : t.auth.tombolSimpanSandiBaru}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          )}

          <div className="text-center pt-1">
            <p className="text-[11px] text-stone-500">
              {t.auth.butuhBantuanCSM}{' '}
              <a href="/csm" className="font-semibold text-orange-700 hover:underline">
                {t.auth.tautanBantuanCSM}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
