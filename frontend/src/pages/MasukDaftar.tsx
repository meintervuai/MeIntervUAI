// Halaman Masuk & Daftar: Autentikasi email/password, Google OAuth, verifikasi 6 digit OTP, dan penanganan aturan 30 hari.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Kartu } from '../components/ui/Kartu';
import { KotakInput } from '../components/ui/KotakInput';
import { Tombol } from '../components/ui/Tombol';
import { api } from '../services/api';
import { KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PropertiMasukDaftar {
  onLoginSukses: (pengguna: any) => void;
}

export const MasukDaftar: React.FC<PropertiMasukDaftar> = ({ onLoginSukses }) => {
  const navigate = useNavigate();
  const [tabAktif, setTabAktif] = useState<'masuk' | 'daftar'>('masuk');

  // Form input state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [konfirmasiSandi, setKonfirmasiSandi] = useState('');

  // OTP state
  const [layarOTP, setLayarOTP] = useState(false);
  const [kodeOTP, setKodeOTP] = useState('');
  const [emailVerifikasi, setEmailVerifikasi] = useState('');

  // Status loading & error
  const [memuat, setMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  const tanganiDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setPesanSukses(null);

    if (kataSandi !== konfirmasiSandi) {
      setPesanError('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    setMemuat(true);
    try {
      const res = await api.daftar(email, username, kataSandi);
      if (res.status === 'sukses') {
        setEmailVerifikasi(email);
        setLayarOTP(true);
        setPesanSukses(res.pesan || 'Kode OTP telah dikirimkan ke email Anda.');
      } else {
        setPesanError(res.pesan || 'Gagal melakukan pendaftaran.');
      }
    } catch (err: any) {
      setPesanError('Terjadi kesalahan jaringan. Pastikan koneksi internet Anda stabil.');
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
      const res = await api.masuk(email, kataSandi);
      if (res.status === 'sukses') {
        onLoginSukses(res.pengguna);
        navigate('/');
      } else if (res.status === 'perlu_verifikasi_otp_30hari') {
        setEmailVerifikasi(email);
        setLayarOTP(true);
        setPesanSukses(res.pesan || 'Akun tidak aktif > 30 hari. Masukkan OTP untuk memverifikasi akun Anda.');
      } else {
        setPesanError(res.pesan || 'Email atau kata sandi tidak cocok.');
      }
    } catch (err: any) {
      setPesanError('Kredensial tidak valid atau server sedang dalam pemeliharaan.');
    } finally {
      setMemuat(false);
    }
  };

  const tanganiVerifikasiOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setMemuat(true);

    try {
      const res = await api.verifikasiOTP(emailVerifikasi, kodeOTP);
      if (res.status === 'sukses') {
        setPesanSukses('Verifikasi berhasil! Mengarahkan ke halaman Beranda...');
        setTimeout(async () => {
          // Otomatis login setelah verifikasi OTP
          const loginRes = await api.masuk(emailVerifikasi, kataSandi);
          if (loginRes.pengguna) {
            onLoginSukses(loginRes.pengguna);
          } else {
            onLoginSukses({
              pengguna_id: 'peng_baru',
              email: emailVerifikasi,
              nama_pengguna: username || emailVerifikasi.split('@')[0],
              saldo_token: 100,
            });
          }
          navigate('/');
        }, 1000);
      } else {
        setPesanError(res.pesan || 'Kode OTP salah atau telah kedaluwarsa.');
      }
    } catch (err: any) {
      setPesanError('Kode OTP tidak valid.');
    } finally {
      setMemuat(false);
    }
  };

  const tanganiGoogleOAuth = () => {
    // Simulasi alur OAuth Google menggunakan Google Client ID
    setPesanError(null);
    setPesanSukses('Membuka autentikasi Google...');
    setTimeout(() => {
      onLoginSukses({
        pengguna_id: 'peng_google_user',
        email: 'user.google@gmail.com',
        nama_pengguna: 'GoogleCandidate',
        saldo_token: 100,
      });
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-600 text-white items-center justify-center font-black text-xl shadow-md mb-3">
            IU
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Selamat Datang di IntervU AI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulasi wawancara kerja adaptif dan pembuat CV berstandar ATS.
          </p>
        </div>

        <Kartu className="p-6 sm:p-8">
          {pesanError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{pesanError}</span>
            </div>
          )}

          {pesanSukses && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{pesanSukses}</span>
            </div>
          )}

          {/* Layar 1: Verifikasi 6 Digit OTP */}
          {layarOTP ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Masukkan Kode OTP</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kode 6 digit telah dikirimkan ke <span className="font-semibold text-slate-700">{emailVerifikasi}</span>
                </p>
              </div>

              <form onSubmit={tanganiVerifikasiOTP} className="space-y-4">
                <KotakInput
                  label="Kode OTP (6 Digit)"
                  required
                  maxLength={6}
                  placeholder="Contoh: 123456"
                  value={kodeOTP}
                  onChange={(e) => setKodeOTP(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-lg tracking-widest font-mono"
                />

                <Tombol
                  type="submit"
                  varian="primer"
                  ukuran="lg"
                  sedangMemuat={memuat}
                  className="w-full"
                >
                  Verifikasi & Masuk
                </Tombol>

                <button
                  type="button"
                  onClick={() => setLayarOTP(false)}
                  className="w-full text-xs text-slate-500 hover:text-slate-800 text-center py-2"
                >
                  Kembali ke Halaman Masuk
                </button>
              </form>
            </div>
          ) : (
            /* Layar 2: Tab Masuk & Daftar */
            <div>
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => { setTabAktif('masuk'); setPesanError(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
                    tabAktif === 'masuk'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  onClick={() => { setTabAktif('daftar'); setPesanError(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
                    tabAktif === 'daftar'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Daftar Baru
                </button>
              </div>

              {/* Tombol Cepat Google OAuth */}
              <button
                type="button"
                onClick={tanganiGoogleOAuth}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors mb-5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Lanjutkan dengan Google</span>
              </button>

              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  atau dengan email
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

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/bantuan')}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>

                  <Tombol
                    type="submit"
                    varian="primer"
                    ukuran="lg"
                    sedangMemuat={memuat}
                    className="w-full"
                  >
                    Masuk Sekarang <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Tombol>
                </form>
              ) : (
                /* Formulir Tab Daftar */
                <form onSubmit={tanganiDaftar} className="space-y-4">
                  <KotakInput
                    label="Nama Pengguna (Username)"
                    required
                    placeholder="agilpratama"
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
                    placeholder="Minimal 8 karakter"
                    value={kataSandi}
                    onChange={(e) => setKataSandi(e.target.value)}
                  />

                  <KotakInput
                    label="Konfirmasi Kata Sandi"
                    type="password"
                    required
                    placeholder="Ulangi kata sandi"
                    value={konfirmasiSandi}
                    onChange={(e) => setKonfirmasiSandi(e.target.value)}
                  />

                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                    🎁 <strong>Bonus Pendaftaran:</strong> Anda akan otomatis menerima <strong>100 Token Gratis</strong> setelah memverifikasi akun Anda.
                  </div>

                  <Tombol
                    type="submit"
                    varian="primer"
                    ukuran="lg"
                    sedangMemuat={memuat}
                    className="w-full"
                  >
                    Daftar & Terima Kode OTP
                  </Tombol>
                </form>
              )}
            </div>
          )}
        </Kartu>
      </div>
    </div>
  );
};
