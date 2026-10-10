// Halaman Masuk & Daftar MeIntervUAI:
// 1. Tanpa header navigasi sticky (fokus penuh pada alur autentikasi).
// 2. Autentikasi Supabase & PostgreSQL nyata (tanpa jebakan akun dummy / mock).
// 3. Tanpa akun demo (sesuai arahan pengguna).
// 4. Kepatuhan Impeccable Quality: zero nested cards, kontras WCAG AA >= 4.5:1, pembatas baris teks terkontrol.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KotakInput } from '../components/ui/KotakInput';
import { Tombol } from '../components/ui/Tombol';
import { authSupabase } from '../services/supabase';
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PropertiMasukDaftar {
  onLoginSukses: (pengguna: any, ingatkanSaya?: boolean) => void;
}

export const MasukDaftar: React.FC<PropertiMasukDaftar> = ({ onLoginSukses }) => {
  const navigate = useNavigate();
  const [tabAktif, setTabAktif] = useState<'masuk' | 'daftar'>('masuk');
  const [ingatkanSaya, setIngatkanSaya] = useState(true);

  // Form input state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [konfirmasiSandi, setKonfirmasiSandi] = useState('');

  // Status loading & notifikasi
  const [memuat, setMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  const tanganiDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setPesanSukses(null);

    if (kataSandi.length < 6) {
      setPesanError('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (kataSandi !== konfirmasiSandi) {
      setPesanError('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    setMemuat(true);
    try {
      // Daftarkan akun baru ke Supabase Auth
      const data = await authSupabase.daftar(email, kataSandi, username);

      // Auto-login langsung: Supabase trigger telah mengonfirmasi email dan menginisialisasi saldo 100 token
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

      setPesanSukses('Pendaftaran berhasil. Silakan beralih ke tab Masuk.');
      setTabAktif('masuk');
    } catch (err: any) {
      const pesan = err.message || 'Gagal melakukan pendaftaran. Silakan coba kembali.';
      if (pesan.includes('already registered')) {
        setPesanError('Email ini sudah terdaftar. Silakan beralih ke tab Masuk.');
      } else {
        setPesanError(pesan);
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
        setPesanError('Alamat email atau kata sandi tidak cocok.');
      } else {
        setPesanError(pesan || 'Gagal masuk akun. Periksa koneksi internet Anda.');
      }
    } finally {
      setMemuat(false);
    }
  };

  const tanganiGoogleOAuth = async () => {
    setPesanError(null);
    setPesanSukses('Mengarahkan ke Google OAuth resmi...');
    try {
      await authSupabase.masukGoogle();
    } catch (err: any) {
      setPesanError(err.message || 'Gagal membuka Google OAuth.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#fdfbf7]">
      <div className="w-full max-w-md space-y-6">
        {/* Tombol Navigasi Kembali ke Beranda */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-orange-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Pengenalan MeIntervUAI</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-orange-700 text-white items-center justify-center font-black text-xl shadow-sm">
            MI
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Masuk ke MeIntervUAI
          </h1>
          <p className="text-sm text-stone-700 max-w-[65ch]">
            Studio simulasi wawancara adaptif dan penyusun CV berstandar ATS.
          </p>
        </div>

        {/* Panel Form Utama (Tunggal, Zero Nested Containers) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Status Alert Bersih (Border-L Indikator, Tanpa Kartu Bertingkat) */}
          {pesanError && (
            <div className="border-l-2 border-rose-700 pl-3.5 py-1 text-xs text-rose-800 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{pesanError}</span>
            </div>
          )}

          {pesanSukses && (
            <div className="border-l-2 border-emerald-700 pl-3.5 py-1 text-xs text-emerald-900 font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <span>{pesanSukses}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border-b border-stone-200">
            <button
              type="button"
              onClick={() => { setTabAktif('masuk'); setPesanError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
                tabAktif === 'masuk'
                  ? 'border-orange-700 text-orange-900'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => { setTabAktif('daftar'); setPesanError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
                tabAktif === 'daftar'
                  ? 'border-orange-700 text-orange-900'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {/* Tombol Google OAuth Nyata */}
          <button
            type="button"
            onClick={tanganiGoogleOAuth}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-stone-300 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Lanjutkan dengan Akun Google</span>
          </button>

          {/* Garis Pembatas dengan Kontras Tinggi */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full"></div>
            <span className="bg-white px-3 text-xs font-semibold text-stone-700 uppercase tracking-wider">
              atau dengan kredensial
            </span>
          </div>

          {/* Formulir Tab Masuk */}
          {tabAktif === 'masuk' ? (
            <form onSubmit={tanganiMasuk} className="space-y-4">
              <KotakInput
                label="Alamat Email"
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <KotakInput
                label="Kata Sandi"
                type="password"
                required
                placeholder="••••••••"
                value={kataSandi}
                onChange={(e) => setKataSandi(e.target.value)}
              />

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ingatkanSaya}
                    onChange={(e) => setIngatkanSaya(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-orange-700 focus:ring-orange-600 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-700">
                    Ingatkan saya (30 hari)
                  </span>
                </label>

                <Link
                  to="/bantuan"
                  className="text-xs font-semibold text-orange-900 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              <Tombol
                type="submit"
                varian="primer"
                ukuran="lg"
                sedangMemuat={memuat}
                className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[48px]"
              >
                <span>Masuk ke Studio</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Tombol>
            </form>
          ) : (
            /* Formulir Tab Daftar */
            <form onSubmit={tanganiDaftar} className="space-y-4">
              <KotakInput
                label="Nama Pengguna (Username)"
                required
                placeholder="Contoh: agilpratama"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <KotakInput
                label="Alamat Email"
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <KotakInput
                label="Kata Sandi"
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={kataSandi}
                onChange={(e) => setKataSandi(e.target.value)}
              />

              <KotakInput
                label="Konfirmasi Kata Sandi"
                type="password"
                required
                placeholder="Ulangi kata sandi Anda"
                value={konfirmasiSandi}
                onChange={(e) => setKonfirmasiSandi(e.target.value)}
              />

              <div className="py-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ingatkanSaya}
                    onChange={(e) => setIngatkanSaya(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-orange-700 focus:ring-orange-600 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-700">
                    Ingatkan saya (tetap masuk hingga 30 hari)
                  </span>
                </label>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed pt-1">
                <strong className="text-orange-950 font-bold">100 Token Selamat Datang:</strong> Alokasi otomatis langsung ke akun Anda saat pendaftaran selesai untuk simulasi wawancara dan audit CV ATS.
              </p>

              <Tombol
                type="submit"
                varian="primer"
                ukuran="lg"
                sedangMemuat={memuat}
                className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[48px]"
              >
                <span>Daftar Akun Baru</span>
              </Tombol>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
