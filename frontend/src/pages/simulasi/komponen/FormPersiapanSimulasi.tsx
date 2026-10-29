// Komponen Pemilihan Posisi & Format Simulasi (FormPersiapanSimulasi.tsx)
// Redesign Modern SaaS: Clean Cream Background (#FAF8F5), 2-Column Grid di Desktop,
// Horizontal Scrollable Pills di Mobile, Avatar Pria Profesional Bina, Tombol CTA Gradien Oranye Terakota.

import React from 'react';
import { Link } from 'react-router-dom';
import { Kartu } from '../../../components/ui/Kartu';
import { useBahasa } from '../../../i18n';
import { ModeSimulasiTipe } from './types';
import { 
  Briefcase, 
  Play, 
  Lock, 
  MessageSquare, 
  Mic, 
  Video 
} from 'lucide-react';

interface PropertiFormPersiapan {
  targetRole: string;
  setTargetRole: (role: string) => void;
  modeSimulasi: ModeSimulasiTipe;
  setModeSimulasi: (mode: ModeSimulasiTipe) => void;
  daftarRoleSaran: string[];
  kelayakan: {
    bisa_simulasi: boolean;
    alasan: string;
    cv_tersedia: boolean;
    kontak_terisi: boolean;
    edukasi_terisi: boolean;
    cv_teranalisis: boolean;
  };
  sedangMemeriksaKelayakan: boolean;
  sedangMemuatMulai: boolean;
  saldoTokenPengguna?: number;
  onMulaiSesi: () => void;
}

export const FormPersiapanSimulasi: React.FC<PropertiFormPersiapan> = ({
  targetRole,
  setTargetRole,
  modeSimulasi,
  setModeSimulasi,
  daftarRoleSaran,
  kelayakan,
  sedangMemeriksaKelayakan,
  sedangMemuatMulai,
  saldoTokenPengguna,
  onMulaiSesi,
}) => {
  const { t } = useBahasa();

  // Biaya token dinamis & validasi saldo pra-klik
  const biayaToken = modeSimulasi === 'suara' ? 15 : modeSimulasi === 'video' ? 25 : 10;
  const saldoTersedia = saldoTokenPengguna ?? 1000;
  const saldoCukup = saldoTersedia >= biayaToken;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KONDISI 1: SKELETON SHIMMER LOADING (FE-07 / UX-17) */}
      {sedangMemeriksaKelayakan ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs animate-pulse">
          <div className="md:col-span-5 space-y-4">
            <div className="h-6 bg-stone-200 rounded-lg w-2/3" />
            <div className="h-11 bg-stone-100 rounded-xl w-full" />
            <div className="h-28 bg-stone-100 rounded-xl w-full" />
          </div>
          <div className="md:col-span-7 space-y-4">
            <div className="h-6 bg-stone-200 rounded-lg w-1/2" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-28 bg-stone-100 rounded-xl" />
              <div className="h-28 bg-stone-100 rounded-xl" />
              <div className="h-28 bg-stone-100 rounded-xl" />
            </div>
            <div className="h-24 bg-stone-100 rounded-2xl" />
          </div>
        </div>
      ) : !kelayakan.bisa_simulasi ? (
        /* KONDISI 2: CV BELUM MEMENUHI SYARAT (TERKUNCI) */
        <Kartu className="max-w-xl mx-auto p-6 sm:p-8 space-y-6 bg-white border border-stone-200/90 shadow-sm text-center rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">
              Simulasi Wawancara Terkunci
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              {kelayakan.alasan || 'Pewawancara AI membutuhkan poin kontak dan riwayat edukasi di CV Anda agar dapat menyusun pertanyaan wawancara yang kontekstual dan personal.'}
            </p>
          </div>

          <div className="max-w-sm mx-auto p-4 rounded-xl bg-stone-50 border border-stone-200 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Informasi Kontak (Nama & Email):</span>
              <span className={`font-semibold ${kelayakan.kontak_terisi ? 'text-emerald-700' : 'text-rose-600'}`}>
                {kelayakan.kontak_terisi ? 'Terisi' : 'Belum Terisi'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Riwayat Edukasi (Minimal 1):</span>
              <span className={`font-semibold ${kelayakan.edukasi_terisi ? 'text-emerald-700' : 'text-rose-600'}`}>
                {kelayakan.edukasi_terisi ? 'Terisi' : 'Belum Terisi'}
              </span>
            </div>
          </div>

          <div className="pt-1">
            <Link
              to="/cv"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs transition-colors min-h-[44px] shadow-sm shadow-orange-700/20"
            >
              <span>Lengkapi Data CV Sekarang</span>
            </Link>
          </div>
        </Kartu>
      ) : (
        /* KONDISI 3: 2-COLUMN GRID DESKTOP (ABOVE THE FOLD - MINIMAL SCROLL) */
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-stone-200/80">
            
            {/* ================= KOLOM KIRI (45%): PEMILIHAN POSISI TARGET ================= */}
            <div className="md:col-span-5 p-6 sm:p-7 space-y-5 bg-white">
              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                  {t.simulasiWawancara.pilihPosisiLabel}
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {t.simulasiWawancara.subjudulPosisi}
                </p>
              </div>

              {/* Input Pencarian Posisi */}
              <div className="relative">
                <Briefcase className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder={t.simulasiWawancara.pilihPosisiPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-stone-50/50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white min-h-[46px] transition-all"
                />
              </div>

              {/* Rekomendasi dari Riwayat CV Anda (Wrap di Desktop, Horizontal Scroll di Mobile) */}
              {daftarRoleSaran.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    {t.simulasiWawancara.rekomendasiCvLabel}
                  </span>
                  
                  {/* Container: Horizontal Scroll pada Mobile, Wrap pada Desktop */}
                  <div className="flex md:flex-wrap gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none snap-x">
                    {daftarRoleSaran.map((role, idx) => {
                      const isActive = targetRole === role;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTargetRole(role)}
                          className={`shrink-0 md:shrink px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer snap-start min-h-[44px] flex items-center justify-center ${
                            isActive
                              ? 'bg-orange-700 text-white border-orange-700 shadow-sm shadow-orange-700/25 ring-2 ring-orange-600/30'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ================= KOLOM KANAN (55%): FORMAT & PROFIL BINA ================= */}
            <div className="md:col-span-7 p-6 sm:p-7 space-y-5 bg-stone-50/40 flex flex-col justify-between">
              <div className="space-y-4">
                {/* 1. Pilih Format Simulasi Wawancara */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-stone-900 flex items-center justify-between">
                    <span>{t.simulasiWawancara.pilihModeLabel}</span>
                    <span className="text-[11px] font-normal text-stone-500">{t.simulasiWawancara.instruksiPilihFormat}</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Format A: Teks */}
                    <div
                      onClick={() => setModeSimulasi('teks')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        modeSimulasi === 'teks'
                          ? 'border-orange-600 bg-white ring-2 ring-orange-500/20 shadow-xs'
                          : 'border-stone-200 bg-white/70 hover:border-stone-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`p-1.5 rounded-lg ${modeSimulasi === 'teks' ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-600'}`}>
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          10 {t.simulasiWawancara.biayaTokenUnit}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-stone-900 mt-1">{t.simulasiWawancara.modeTeksJudul}</div>
                      <p className="text-[10px] text-stone-500 mt-0.5 leading-snug line-clamp-2">
                        {t.simulasiWawancara.modeTeksDesc}
                      </p>
                    </div>

                    {/* Format B: Suara / Audio AI (Aktif Default) */}
                    <div
                      onClick={() => setModeSimulasi('suara')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        modeSimulasi === 'suara'
                          ? 'border-orange-600 bg-white ring-2 ring-orange-500/20 shadow-xs'
                          : 'border-stone-200 bg-white/70 hover:border-stone-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`p-1.5 rounded-lg ${modeSimulasi === 'suara' ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-600'}`}>
                          <Mic className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                          15 {t.simulasiWawancara.biayaTokenUnit}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-stone-900 mt-1">{t.simulasiWawancara.modeAudioJudul}</div>
                      <p className="text-[10px] text-stone-500 mt-0.5 leading-snug line-clamp-2">
                        {t.simulasiWawancara.modeAudioDesc}
                      </p>
                    </div>

                    {/* Format C: Video & Bahasa Tubuh (Unlocked - 25 Token) */}
                    <div
                      onClick={() => setModeSimulasi('video')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        modeSimulasi === 'video'
                          ? 'border-orange-600 bg-white ring-2 ring-orange-500/20 shadow-xs'
                          : 'border-stone-200 bg-white/70 hover:border-stone-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`p-1.5 rounded-lg ${modeSimulasi === 'video' ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-600'}`}>
                          <Video className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          25 {t.simulasiWawancara.biayaTokenUnit}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-stone-900 mt-1">{t.simulasiWawancara.modeVideoJudul}</div>
                      <p className="text-[10px] text-stone-500 mt-0.5 leading-snug line-clamp-2">
                        {t.simulasiWawancara.modeVideoDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Alert Status Hijau Lembut */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs flex items-center justify-between gap-3">
                  <span className="text-emerald-900 font-medium text-[11px] sm:text-xs">
                    {kelayakan.cv_teranalisis
                      ? t.simulasiWawancara.statusCvTeranalisis
                      : t.simulasiWawancara.statusCvBelumAnalisis}
                  </span>
                  {!kelayakan.cv_teranalisis && (
                    <Link to="/" className="text-orange-700 hover:text-orange-800 font-bold underline shrink-0 text-[11px]">
                      {t.simulasiWawancara.tombolAnalisisSingkat}
                    </Link>
                  )}
                </div>

                {/* 3. Kartu Profil Pewawancara AI: Bina (Avatar Laki-Laki Indonesia) */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2.5">
                  <div className="flex items-start gap-3.5">
                    {/* Avatar Ilustrasi Pria Profesional Indonesia */}
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-orange-200 shadow-xs bg-orange-50">
                      <img 
                        src="/illustrations/bina-male-avatar.svg" 
                        alt="Bina - AI Head of Talent Acquisition" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs sm:text-sm font-extrabold text-stone-900 block truncate">
                          Bina
                        </strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          Head of Talent Acquisition
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                        {t.simulasiWawancara.deskripsiBinaLengkap}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= FOOTER CARD: SALDO, BIAYA & TOMBOL CTA LEBAR PENUH ================= */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs px-1 text-stone-600 font-medium">
                  <span>{t.simulasiWawancara.saldoTokenAnda} <strong className="text-stone-900">{saldoTersedia} {t.simulasiWawancara.biayaTokenUnit}</strong></span>
                  <span>{t.simulasiWawancara.biayaSesiLabel} <strong className="text-orange-700">{biayaToken} {t.simulasiWawancara.biayaTokenUnit}</strong></span>
                </div>
                {!saldoCukup && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {t.simulasiWawancara.saldoKurangPeringatan}
                  </div>
                )}
                <button
                  type="button"
                  disabled={sedangMemuatMulai || !targetRole.trim() || !saldoCukup}
                  onClick={onMulaiSesi}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-700 via-orange-600 to-amber-600 hover:from-orange-800 hover:to-orange-700 text-white font-extrabold text-sm min-h-[50px] shadow-md shadow-orange-700/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {sedangMemuatMulai
                      ? t.simulasiWawancara.sedangMemulai
                      : !saldoCukup
                      ? t.simulasiWawancara.saldoKurangPeringatan
                      : `${t.simulasiWawancara.tombolMulaiWawancara} (${biayaToken} ${t.simulasiWawancara.biayaTokenUnit})`
                    }
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
