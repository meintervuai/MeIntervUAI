// Halaman Permintaan Reset Sandi / Lupa Kata Sandi MeIntervUAI
// Dibungkus dengan BaseAuth, mengirimkan tautan reset kata sandi ke email terdaftar.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseAuth } from './BaseAuth';
import { KotakInput } from '../../components/ui/KotakInput';
import { Tombol } from '../../components/ui/Tombol';
import { authSupabase } from '../../services/supabase';
import { useBahasa } from '../../i18n';
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const LupaSandi: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useBahasa();

  const [email, setEmail] = useState('');
  const [memuat, setMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  const tanganiMintaResetSandi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setPesanError(t.auth.labelEmail);
      return;
    }

    setPesanError(null);
    setPesanSukses(null);
    setMemuat(true);

    try {
      await authSupabase.mintaResetKataSandi(email.trim());
      setPesanSukses(t.auth.suksesKirimPemulihan);
    } catch (err: any) {
      setPesanError(err.message || 'Gagal mengirimkan tautan pemulihan kata sandi.');
    } finally {
      setMemuat(false);
    }
  };

  return (
    <BaseAuth>
      <div className="w-full max-w-[380px] mx-auto my-auto space-y-4 animate-in fade-in duration-200">
        <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-orange-700 text-white mx-auto flex items-center justify-center shadow-sm">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-stone-900">
            {t.auth.judulLupaSandi}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {t.auth.subjudulLupaSandi}
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

        <form onSubmit={tanganiMintaResetSandi} className="space-y-3.5">
          <KotakInput
            label={t.auth.labelEmail}
            type="email"
            required
            placeholder={t.auth.placeholderEmailLupaSandi}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Tombol
            type="submit"
            varian="primer"
            ukuran="md"
            sedangMemuat={memuat}
            className="w-full font-bold bg-orange-700 hover:bg-orange-800 text-white min-h-[42px]"
          >
            <span>{t.auth.tombolKirimPemulihan}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Tombol>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/masuk')}
              className="text-xs text-stone-600 hover:text-stone-900 font-semibold"
            >
              ← {t.auth.kembaliKeMasuk}
            </button>
          </div>
        </form>
      </div>
    </BaseAuth>
  );
};
