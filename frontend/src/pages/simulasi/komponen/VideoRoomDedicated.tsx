/**
 * Komponen Khusus Ruang Simulasi Video & Evaluasi Bahasa Tubuh (VideoRoomDedicated.tsx)
 * Berdasarkan User Mockup Desain (media_1793290849010_571d9bae.jpg)
 * Panel Kiri (58%): Video Avatar Bina + PiP Kamera User (Skeleton Overlay) + 4 Telemetry Chips + PTT CTA
 * Panel Kanan (42%): Transkrip & Evaluasi Real-Time + Inline AI Vision Alert Card
 * Mematuhi: FE-04 (useBahasa), FE-06 (Split-View / Responsive), UX-11, UX-16, UX-18 & Anti-Slop (No pulsing dot, no em-dash)
 */

import React, { useState, useEffect } from 'react';
import { useBahasa } from '../../../i18n';
import { PesanChat } from './types';
import { usePostureAnalysis, PostureAlertEvent } from '../hooks/usePostureAnalysis';
import {
  Volume2,
  VolumeX,
  Mic,
  Camera,
  CameraOff,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface PropertiVideoRoom {
  targetRole: string;
  daftarPesan: PesanChat[];
  sedangMemutarAudio: boolean;
  sedangMerekam: boolean;
  sedangMerespon: boolean;
  liveTranscriptUser?: string;
  modeInteraksiSuara: 'ptt' | 'handsfree';
  setModeInteraksiSuara: (m: 'ptt' | 'handsfree') => void;
  audioMuted: boolean;
  onToggleMute: () => void;
  onMulaiMerekam: () => void;
  onHentikanMerekam: () => void;
  onPutarAudio: (url?: string) => void;
  ujungChatRef: React.RefObject<HTMLDivElement>;
  onTambahPesan?: (pesan: PesanChat) => void;
}

export const VideoRoomDedicated: React.FC<PropertiVideoRoom> = ({
  targetRole,
  daftarPesan,
  sedangMemutarAudio,
  sedangMerekam,
  sedangMerespon,
  liveTranscriptUser = '',
  modeInteraksiSuara,
  setModeInteraksiSuara,
  audioMuted,
  onToggleMute,
  onMulaiMerekam,
  onHentikanMerekam,
  onPutarAudio,
  ujungChatRef,
  onTambahPesan,
}) => {
  const { t } = useBahasa();
  const [daftarPesanLokal, setDaftarPesanLokal] = useState<PesanChat[]>(daftarPesan);

  // Sinkronkan daftar pesan dari parent saat bertambah
  useEffect(() => {
    setDaftarPesanLokal(daftarPesan);
  }, [daftarPesan]);

  // Tangani Inline Vision Alert Event ke Alur Transkrip
  const tanganiAlertVision = (alert: PostureAlertEvent) => {
    const alertCard: PesanChat = {
      id: `alert_${Date.now()}`,
      pengirim: 'pewawancara',
      nama: 'AI Vision Evaluator',
      kondisi_terdeteksi: alert.tipe,
      teks: alert.tipe === 'tangan' ? t.simulasiWawancara.alertTanganMenyentuh : t.simulasiWawancara.alertPosturMiring,
      waktu: 'Baru saja',
    };
    setDaftarPesanLokal((prev) => [...prev, alertCard]);
    if (onTambahPesan) {
      onTambahPesan(alertCard);
    }
  };

  // Aktifkan Hook Analisis Postur & MediaPipe Tasks Vision
  const { videoRef, canvasRef, telemetri, mulaiKamera, hentikanKamera } =
    usePostureAnalysis({
      sedangBicara: sedangMerekam,
      onTriggerAlert: tanganiAlertVision,
    });

  // Jalankan kamera saat komponen terpasang di layar
  useEffect(() => {
    mulaiKamera();
    return () => {
      hentikanKamera();
    };
  }, [mulaiKamera, hentikanKamera]);

  return (
    <div className="w-full h-full flex flex-col md:h-[calc(100vh-120px)] md:min-h-[620px] md:max-h-[880px] animate-fadeIn">
      {/* ============================================================== */}
      {/* DESKTOP LAYOUT (SPLIT-VIEW 2-KOLOM 58% : 42% FIT TO SCREEN)       */}
      {/* ============================================================== */}
      <div className="hidden md:grid md:grid-cols-12 gap-5 h-full overflow-hidden">
        {/* ============================================================== */}
        {/* PANEL KIRI (58% / 7 KOLOM) - VIDEO UTAMA & KONTROL TELEMETRI    */}
        {/* ============================================================== */}
        <div className="md:col-span-7 flex flex-col h-full bg-[#18181B] border border-stone-800 rounded-3xl p-5 shadow-xl justify-between relative overflow-hidden">
          {/* 1. Header Bar di Atas Kartu */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-800/90 z-10">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs text-white font-bold tracking-tight">
                {t.simulasiWawancara.judulModeVideo}
              </span>
              <span className="text-stone-600">|</span>
              <span className="text-xs text-amber-400 font-semibold truncate" title={targetRole}>
                {targetRole}
              </span>
            </div>

            {/* Kontrol Cepat: Toggle Kamera & Mute Audio */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={telemetri.kameraAktif ? hentikanKamera : mulaiKamera}
                className={`p-2 rounded-xl border transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  telemetri.kameraAktif
                    ? 'bg-stone-800/90 border-stone-700 text-stone-200 hover:bg-stone-800'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
                title={telemetri.kameraAktif ? t.simulasiWawancara.matikanKamera : t.simulasiWawancara.nyalakanKamera}
              >
                {telemetri.kameraAktif ? (
                  <Camera className="w-4 h-4" />
                ) : (
                  <CameraOff className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                className={`p-2 rounded-xl border transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  audioMuted
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-stone-800/90 border-stone-700 text-stone-200 hover:bg-stone-800'
                }`}
                title={audioMuted ? t.simulasiWawancara.nyalakanSpeaker : t.simulasiWawancara.bisukanSpeaker}
              >
                {audioMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Panggung Video Utama: Avatar Bina + PiP Kamera Pengguna */}
          <div className="flex-1 my-3 rounded-2xl bg-stone-900 border border-stone-800 relative overflow-hidden flex items-center justify-center">
            {/* Badge Live Video di Sudut Kiri Atas (Tanpa Pulsing Dot - Anti Slop Mandatori) */}
            <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-stone-700/60 text-white text-[11px] font-bold flex items-center gap-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{t.simulasiWawancara.badgeLiveVideo}</span>
            </div>

            {/* Video / Visual Avatar Eksekutif Bina */}
            <div className="w-full h-full flex items-center justify-center bg-radial from-stone-800 to-stone-950 relative">
              <img
                src="/illustrations/bina-male-avatar.svg"
                alt="Bina - AI Head of Talent Acquisition"
                className={`max-h-[82%] object-contain transition-transform duration-500 ${
                  sedangMemutarAudio ? 'scale-105' : 'scale-100 opacity-95'
                }`}
              />

              {/* Status Audio Respon Bina Saat Bersuara */}
              {sedangMemutarAudio && (
                <div className="absolute bottom-3 left-3 z-30 px-3 py-1 rounded-xl bg-orange-950/80 border border-orange-500/50 text-orange-200 text-xs font-semibold flex items-center gap-2 shadow-lg">
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>{t.simulasiWawancara.binaSedangBicara}</span>
                </div>
              )}
            </div>

            {/* Picture-in-Picture (PiP) Kamera User di Pojok Kanan Bawah */}
            <div className="absolute bottom-3 right-3 z-30 w-44 h-32 rounded-2xl overflow-hidden border-2 border-stone-600/90 shadow-2xl bg-black">
              {telemetri.kameraAktif ? (
                <div className="w-full h-full relative">
                  {/* Video Streaming Pengguna (Mirrored) */}
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* Canvas Overlay MediaPipe Skeleton (Mirrored) */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
                  />
                  <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white tracking-wider">
                    USER
                  </div>
                  {telemetri.sedangMemuatModel ? (
                    <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-semibold text-amber-300 tracking-wider">
                      AI Loading
                    </div>
                  ) : (
                    <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-semibold text-emerald-400 tracking-wider">
                      AI Active
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-stone-900 text-stone-400">
                  <CameraOff className="w-5 h-5 mb-1 text-stone-500" />
                  <span className="text-[10px]">{t.simulasiWawancara.kameraNonaktif}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Bar 4 Indikator Telemetri Bahasa Tubuh (Solid Dot - Tanpa Animasi Pulsa) */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {/* Telemetri 1: Kontak Mata */}
            <div
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-colors ${
                telemetri.kontakMataPersen >= 70
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  telemetri.kontakMataPersen >= 70 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="truncate">
                {t.simulasiWawancara.telemetriKontakMata} {telemetri.kontakMataPersen}%
              </span>
            </div>

            {/* Telemetri 2: Postur Tubuh */}
            <div
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-colors ${
                telemetri.postur === 'tegak'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  telemetri.postur === 'tegak' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="truncate">
                {t.simulasiWawancara.telemetriPostur}{' '}
                {telemetri.postur === 'tegak'
                  ? t.simulasiWawancara.telemetriTegak
                  : t.simulasiWawancara.telemetriMiring}
              </span>
            </div>

            {/* Telemetri 3: Bibir / Gerak Bicara */}
            <div
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-colors ${
                telemetri.bibirSuara === 'jelas'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-stone-800 border-stone-700 text-stone-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  telemetri.bibirSuara === 'jelas' ? 'bg-emerald-400' : 'bg-stone-400'
                }`}
              />
              <span className="truncate">
                {t.simulasiWawancara.telemetriBibir}{' '}
                {telemetri.bibirSuara === 'jelas'
                  ? t.simulasiWawancara.telemetriJelas
                  : telemetri.bibirSuara === 'kurang_terbuka'
                  ? t.simulasiWawancara.telemetriKurangTerbuka
                  : t.simulasiWawancara.telemetriNormal}
              </span>
            </div>

            {/* Telemetri 4: Posisi Tangan (Alert Terracotta / Amber jika menyentuh wajah) */}
            <div
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-colors ${
                telemetri.tangan === 'menyentuh_wajah'
                  ? 'bg-amber-700/80 border-amber-500 text-white shadow-sm'
                  : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {telemetri.tangan === 'menyentuh_wajah' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                  <span className="truncate">{t.simulasiWawancara.telemetriMenyentuhWajah}</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate">
                    {t.simulasiWawancara.telemetriTangan} {t.simulasiWawancara.telemetriTanganNormal}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 4. Kontrol Utama: Tombol PTT "Tahan untuk Bicara" & Switch */}
          <div className="space-y-2">
            <button
              type="button"
              onMouseDown={onMulaiMerekam}
              onMouseUp={onHentikanMerekam}
              onTouchStart={onMulaiMerekam}
              onTouchEnd={onHentikanMerekam}
              disabled={sedangMerespon || sedangMemutarAudio}
              className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-lg select-none cursor-pointer min-h-[52px] ${
                sedangMerekam
                  ? 'bg-rose-700 text-white ring-4 ring-rose-500/30'
                  : sedangMerespon
                  ? 'bg-stone-800 text-stone-400 border border-stone-700 cursor-not-allowed'
                  : 'bg-amber-700 hover:bg-amber-800 text-white active:scale-98'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>
                {sedangMerekam
                  ? t.simulasiWawancara.lepasKirimCta
                  : sedangMerespon
                  ? t.simulasiWawancara.mengevaluasiCta
                  : t.simulasiWawancara.tahanBicaraCta}
              </span>
            </button>

            {/* Switch Mode PTT vs Hands-Free */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-[11px] text-stone-400 font-medium">
                {t.simulasiWawancara.modePttLabel}
              </span>
              <button
                type="button"
                onClick={() =>
                  setModeInteraksiSuara(modeInteraksiSuara === 'ptt' ? 'handsfree' : 'ptt')
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer min-h-[20px] ${
                  modeInteraksiSuara === 'ptt' ? 'bg-amber-700' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    modeInteraksiSuara === 'ptt' ? 'left-4.5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PANEL KANAN (42% / 5 KOLOM) - TRANSKRIP & EVALUASI REAL-TIME    */}
        {/* ============================================================== */}
        <div className="md:col-span-5 flex flex-col h-full bg-white border border-stone-200/90 rounded-3xl p-5 shadow-sm overflow-hidden">
          {/* Header Transkrip */}
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-stone-900 tracking-tight">
                {t.simulasiWawancara.transkripEvaluasiJudul}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                ({daftarPesanLokal.length} {t.simulasiWawancara.jumlahInteraksi})
              </span>
            </div>
            <Volume2 className="w-4 h-4 text-stone-400" />
          </div>

          {/* Area Pesan Mengalir */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 pr-1">
            {daftarPesanLokal.map((pesan) => {
              // KASUS 1: INLINE AI VISION ALERT CARD
              if (pesan.kondisi_terdeteksi) {
                return (
                  <div
                    key={pesan.id}
                    className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-900 text-xs font-medium shadow-2xs flex items-start gap-2.5 animate-fadeIn"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">
                        {pesan.kondisi_terdeteksi === 'tangan'
                          ? t.simulasiWawancara.koreksiTanganJudul
                          : t.simulasiWawancara.koreksiPosturJudul}
                      </span>
                      <p className="leading-relaxed">{pesan.teks}</p>
                    </div>
                  </div>
                );
              }

              // KASUS 2: BUBBLE BINA (PEWAWANCARA)
              if (pesan.pengirim === 'pewawancara') {
                return (
                  <div key={pesan.id} className="space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <div className="flex items-center gap-1.5">
                        <span>Bina</span>
                        <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                      </div>
                      {pesan.audio_url && (
                        <button
                          type="button"
                          onClick={() => onPutarAudio(pesan.audio_url)}
                          className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer min-h-[30px]"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{t.simulasiWawancara.putarUlangAudio}</span>
                        </button>
                      )}
                    </div>
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs sm:text-sm text-stone-800 leading-relaxed shadow-2xs">
                      {pesan.teks}
                    </div>
                  </div>
                );
              }

              // KASUS 3: BUBBLE KANDIDAT
              return (
                <div key={pesan.id} className="space-y-1 text-right animate-fadeIn">
                  <div className="text-xs font-bold text-stone-700">{pesan.nama}</div>
                  <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 text-xs sm:text-sm text-stone-900 leading-relaxed inline-block text-left shadow-2xs">
                    {pesan.teks}
                  </div>
                </div>
              );
            })}

            {/* Live Transcript Streaming saat bicara */}
            {liveTranscriptUser && (
              <div className="p-3 rounded-xl bg-orange-50/40 border border-orange-200/60 text-xs text-stone-600 italic">
                🎙️ {liveTranscriptUser}
              </div>
            )}

            <div ref={ujungChatRef} />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE LAYOUT (< 768px: FULL-HEIGHT VERTICAL & STICKY CTA)       */}
      {/* ============================================================== */}
      <div className="md:hidden flex flex-col h-screen -mx-3 -my-3 overflow-hidden bg-stone-900">
        {/* Panggung Video Atas (~38vh) */}
        <div className="h-[38vh] w-full relative bg-stone-950 flex items-center justify-center overflow-hidden border-b border-stone-800">
          <div className="absolute top-3 left-3 z-30 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{t.simulasiWawancara.badgeLiveVideo}</span>
          </div>

          <img
            src="/illustrations/bina-male-avatar.svg"
            alt="Bina"
            className="h-[80%] object-contain"
          />

          {/* PiP Kamera Mobile di Pojok Kanan Bawah */}
          <div className="absolute bottom-2.5 right-2.5 z-30 w-28 h-20 rounded-xl overflow-hidden border-2 border-stone-600 bg-black">
            {telemetri.kameraAktif ? (
              <div className="w-full h-full relative">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
                />
                {telemetri.sedangMemuatModel && (
                  <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-semibold text-amber-300">
                    AI...
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">
                {t.simulasiWawancara.kameraNonaktif}
              </div>
            )}
          </div>
        </div>

        {/* Telemetri Strip Mobile (Solid Dots) */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 border-b border-stone-800 overflow-x-auto scrollbar-none">
          <div className="px-2 py-1 rounded-lg bg-stone-800 text-stone-200 text-[10px] font-bold shrink-0">
            ● {t.simulasiWawancara.telemetriKontakMata} {telemetri.kontakMataPersen}%
          </div>
          <div className="px-2 py-1 rounded-lg bg-stone-800 text-stone-200 text-[10px] font-bold shrink-0">
            ● {t.simulasiWawancara.telemetriPostur}{' '}
            {telemetri.postur === 'tegak'
              ? t.simulasiWawancara.telemetriTegak
              : t.simulasiWawancara.telemetriMiring}
          </div>
          {telemetri.tangan === 'menyentuh_wajah' && (
            <div className="px-2 py-1 rounded-lg bg-amber-700 text-white text-[10px] font-bold shrink-0">
              ⚠️ {t.simulasiWawancara.telemetriMenyentuhWajah}
            </div>
          )}
        </div>

        {/* Transkrip Tengah Mobile */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
          <h3 className="text-xs font-bold text-stone-800">
            {t.simulasiWawancara.transkripEvaluasiJudul}
          </h3>
          {daftarPesanLokal.map((pesan) => (
            <div key={pesan.id} className="text-xs leading-relaxed">
              {pesan.kondisi_terdeteksi ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                  ⚠️ {pesan.teks}
                </div>
              ) : (
                <div
                  className={`p-3 rounded-xl ${
                    pesan.pengirim === 'pewawancara'
                      ? 'bg-stone-50 border border-stone-200 text-stone-900'
                      : 'bg-orange-50 border border-orange-200 text-stone-900 text-right'
                  }`}
                >
                  <span className="font-bold block text-[11px] mb-0.5">
                    {pesan.nama}
                  </span>
                  <p>{pesan.teks}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={ujungChatRef} />
        </div>

        {/* Sticky Bottom Primary CTA Bar (UX-16: Thumb Zone) */}
        <div className="p-3 bg-stone-900 border-t border-stone-800 pb-[max(12px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onMouseDown={onMulaiMerekam}
            onMouseUp={onHentikanMerekam}
            onTouchStart={onMulaiMerekam}
            onTouchEnd={onHentikanMerekam}
            disabled={sedangMerespon || sedangMemutarAudio}
            className="w-full py-3.5 rounded-2xl bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg min-h-[48px] cursor-pointer"
          >
            <Mic className="w-5 h-5" />
            <span>
              {sedangMerekam
                ? t.simulasiWawancara.lepasKirimCta
                : t.simulasiWawancara.tahanBicaraCta}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
