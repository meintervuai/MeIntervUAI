// Halaman Pendaftaran Akun MeIntervUAI
// Dibungkus dengan BaseAuth, dilengkapi indikator kekuatan kata sandi dinamis (hitungKekuatanSandi).

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseAuth } from './BaseAuth';
import { KotakInput } from '../../components/ui/KotakInput';
import { Tombol } from '../../components/ui/Tombol';
import { authSupabase } from '../../services/supabase';
import { api } from '../../services/api';
import { useBahasa } from '../../i18n';
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export const Daftar: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useBahasa();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [konfirmasiSandi, setKonfirmasiSandi] = useState('');
  const [ingatkanSaya, setIngatkanSaya] = useState(true);

  const [lihatKataSandi, setLihatKataSandi] = useState(false);
  const [lihatKonfirmasiSandi, setLihatKonfirmasiSandi] = useState(false);

  const [memuat, setMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  // Indikator kekuatan kata sandi yang sinkron dengan halaman Atur Ulang Sandi
  const hitungKekuatanSandi = () => {
    if (!kataSandi) return 0;
    let skor = 0;
    if (kataSandi.length >= 6) skor += 1;
    if (kataSandi.length >= 8) skor += 1;
    if (/[A-Z]/.test(kataSandi) && /[a-z]/.test(kataSandi)) skor += 1;
    if (/[0-9]/.test(kataSandi) || /[^A-Za-z0-9]/.test(kataSandi)) skor += 1;
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

  const tanganiDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setPesanSukses(null);

    if (kataSandi.length < 6) {
      setPesanError(t.auth.galatSandiPendek || 'Kata sandi minimal 6 karakter.');
      return;
    }

    if (kataSandi !== konfirmasiSandi) {
      setPesanError(t.auth.galatSandiBeda || 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setMemuat(true);
    try {
      const responBackend = await api.daftar(email, username, kataSandi);
      if (responBackend.status === 'sukses') {
        navigate('/otp', {
          state: {
            email,
            pesan: responBackend.pesan || t.auth.subjudulVerifikasiOTP
          }
        });
        return;
      } else if (responBackend.detail || responBackend.pesan) {
        const pesanDetail = responBackend.detail || responBackend.pesan || '';
        if (
          pesanDetail.includes('already registered') ||
          pesanDetail.includes('User already registered') ||
          pesanDetail.includes('pengguna_email_key') ||
          pesanDetail.includes('duplicate key')
        ) {
          setPesanError(t.auth.galatEmailTerdaftar);
        } else {
          setPesanError(pesanDetail);
        }
        return;
      }
    } catch (err: any) {
      const pesan = err.message || '';
      if (
        pesan.includes('already registered') ||
        pesan.includes('User already registered') ||
        pesan.includes('409') ||
        pesan.includes('duplicate key')
      ) {
        setPesanError(t.auth.galatEmailTerdaftar);
      } else {
        setPesanError(pesan || 'Gagal melakukan pendaftaran. Silakan coba kembali.');
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
    <BaseAuth>
      <div className="w-full max-w-[380px] mx-auto my-auto space-y-3.5">
        {/* Form Header */}
        <div className="space-y-1 text-left">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            {t.auth.judulDaftar}
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed max-w-[48ch]">
            {t.auth.subjudulDaftar}
          </p>
        </div>

        {/* Tab Switcher Masuk / Daftar */}
        <div className="grid grid-cols-2 p-1 bg-stone-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => navigate('/masuk')}
            className="py-1.5 text-xs font-bold rounded-lg transition-all min-h-[34px] flex items-center justify-center text-stone-600 hover:text-stone-900"
          >
            {t.auth.tabMasuk}
          </button>
          <button
            type="button"
            className="py-1.5 text-xs font-bold rounded-lg transition-all min-h-[34px] flex items-center justify-center bg-white text-stone-900 shadow-sm"
          >
            {t.auth.tabDaftar}
          </button>
        </div>

        {/* Notifikasi Status */}
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
          className="w-full min-h-[38px] flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-orange-700"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span className="truncate">{t.auth.tombolGoogle}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full"></div>
          <span className="bg-[#fdfbf7] px-3 text-[11px] font-medium text-stone-500">
            {t.auth.pembatasAtau}
          </span>
        </div>

        {/* Formulir Pendaftaran */}
        <form onSubmit={tanganiDaftar} className="space-y-2">
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

          {/* Indikator Kekuatan Kata Sandi Dinamis */}
          {kataSandi && (
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-orange-700" />
                  {t.auth.labelKekuatanSandi}
                </span>
                <span
                  className={`font-semibold ${
                    skorKekuatan <= 1
                      ? 'text-rose-600'
                      : skorKekuatan === 2
                      ? 'text-amber-600'
                      : skorKekuatan === 3
                      ? 'text-blue-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {labelKekuatan}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      skorKekuatan >= step ? warnaKekuatan : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

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
            <label className="min-h-[28px] flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ingatkanSaya}
                onChange={(e) => setIngatkanSaya(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-stone-300 text-orange-700 focus:ring-orange-600 focus:ring-offset-0 cursor-pointer"
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
            className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[40px] mt-1"
          >
            <span>{t.auth.tombolSubmitDaftar}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Tombol>
        </form>
      </div>
    </BaseAuth>
  );
};
