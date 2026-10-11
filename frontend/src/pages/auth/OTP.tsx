// Halaman Verifikasi OTP MeIntervUAI
// Mendukung input fleksibel 6-8 digit angka dengan batas jeda 60 detik (sinkron Supabase & Resend limit).

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseAuth } from './BaseAuth';
import { Tombol } from '../../components/ui/Tombol';
import { api } from '../../services/api';
import { useBahasa } from '../../i18n';
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Mail,
  RefreshCw
} from 'lucide-react';

export const OTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useBahasa();

  const emailAwal = (location.state as any)?.email || '';
  const pesanAwal = (location.state as any)?.pesan || null;

  const [email, setEmail] = useState(emailAwal);
  const [kodeOtp, setKodeOtp] = useState('');
  const [timerCountdown, setTimerCountdown] = useState(60);
  const [sedangKirimUlang, setSedangKirimUlang] = useState(false);

  const [memuat, setMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(pesanAwal);

  // Interval timer 60 detik countdown
  useEffect(() => {
    let interval: any = null;
    if (timerCountdown > 0) {
      interval = setInterval(() => {
        setTimerCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerCountdown]);

  const tanganiVerifikasiOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeOtp.trim()) return;

    setPesanError(null);
    setPesanSukses(null);
    setMemuat(true);

    try {
      const res = await api.verifikasiOTP(email, kodeOtp.trim());
      if (res.status === 'sukses') {
        setPesanSukses(t.auth.suksesVerifikasiOTP || 'Akun Anda berhasil diverifikasi! Silakan masuk.');
        setKodeOtp('');
        setTimeout(() => {
          navigate('/masuk');
        }, 1500);
      } else {
        setPesanError(res.detail || res.pesan || 'Kode OTP salah atau telah kadaluarsa.');
      }
    } catch (err: any) {
      setPesanError(err.message || 'Gagal memverifikasi kode OTP.');
    } finally {
      setMemuat(false);
    }
  };

  const tanganiKirimUlangOTP = async () => {
    if (timerCountdown > 0 || sedangKirimUlang || !email) return;

    setSedangKirimUlang(true);
    setPesanError(null);
    try {
      const res = await api.kirimUlangOTP(email);
      if (res.status === 'sukses') {
        setPesanSukses(t.auth.suksesKirimUlangOTP || 'Kode OTP baru telah dikirimkan ke email Anda.');
        setTimerCountdown(60);
      } else {
        setPesanError(res.detail || res.pesan || 'Gagal mengirim ulang kode OTP.');
      }
    } catch (err: any) {
      setPesanError(err.message || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setSedangKirimUlang(false);
    }
  };

  return (
    <BaseAuth>
      <div className="w-full max-w-[380px] mx-auto my-auto space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-orange-700 text-white mx-auto flex items-center justify-center shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">
            {t.auth.judulVerifikasiOTP}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Kode verifikasi dikirimkan ke <strong className="text-stone-900">{email || 'email Anda'}</strong>
          </p>
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

        {!email && (
          <div className="mb-2">
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Email Akun
            </label>
            <input
              type="email"
              required
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 shadow-sm"
            />
          </div>
        )}

        <form onSubmit={tanganiVerifikasiOTP} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              {t.auth.labelKodeOTP}
            </label>
            <input
              type="text"
              required
              maxLength={8}
              placeholder="123456"
              value={kodeOtp}
              onChange={(e) => setKodeOtp(e.target.value)}
              className="w-full text-center tracking-widest text-lg font-mono font-bold px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 shadow-sm"
            />
            <p className="text-[11px] text-stone-500 text-center mt-1">
              Masukkan 6 angka kode verifikasi dari kotak masuk email.
            </p>
          </div>

          <Tombol
            type="submit"
            varian="primer"
            ukuran="md"
            sedangMemuat={memuat}
            className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[42px] shadow-sm"
          >
            <span>{t.auth.tombolVerifikasiOTP}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Tombol>
        </form>

        {/* Kirim Ulang dengan Jeda 60 Detik */}
        <div className="flex flex-col gap-2 pt-1 text-center">
          <button
            type="button"
            disabled={timerCountdown > 0 || sedangKirimUlang}
            onClick={tanganiKirimUlangOTP}
            className="text-xs font-bold text-orange-800 hover:text-orange-950 disabled:text-stone-400 flex items-center justify-center gap-1.5 transition-colors py-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${sedangKirimUlang ? 'animate-spin' : ''}`} />
            <span>
              {timerCountdown > 0
                ? t.auth.countdownKirimUlang.replace('{detik}', timerCountdown.toString())
                : t.auth.tombolKirimUlangOTP}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/daftar')}
            className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-2 py-0.5"
          >
            {t.auth.tombolKembaliDaftar}
          </button>
        </div>
      </div>
    </BaseAuth>
  );
};
