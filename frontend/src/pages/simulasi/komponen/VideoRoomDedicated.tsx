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
import { usePostureAnalysis } from '../hooks/usePostureAnalysis';
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
}) => {
  const { t } = useBahasa();
  const [daftarPesanLokal, setDaftarPesanLokal] = useState<PesanChat[]>(daftarPesan);
  // State overlay alert HUD mengambang di kanan atas panggung video avatar Bina
  const [hudAlert, setHudAlert] = useState<{ judul: string; teks: string; tipe: string } | null>(null);

  // Sinkronkan daftar pesan dari parent saat bertambah
  useEffect(() => {
    setDaftarPesanLokal(daftarPesan);
  }, [daftarPesan]);

  // Ambil ucapan terakhir Bina untuk disajikan sebagai Closed Caption (CC) Subtitle di Panggung Video Utama
  const ucapanTerakhirBina = [...daftarPesanLokal]
    .reverse()
    .find((p) => p.pengirim === 'pewawancara' && !p.kondisi_terdeteksi)?.teks || '';

  // Aktifkan Hook Analisis Postur & MediaPipe Tasks Vision
  const { videoRef, canvasRef, telemetri, mulaiKamera, hentikanKamera } =
    usePostureAnalysis({
      sedangBicara: sedangMerekam,
    });

  // Sinkronisasi Reaktif HUD Peringatan Mengambang dengan State Telemetri Riil
  // Begitu kondisi tangan atau postur kembali Normal, notifikasi seketika hilang
  useEffect(() => {
    if (telemetri.tangan === 'gestur_tidak_sopan') {
      setHudAlert({
        judul: t.simulasiWawancara.koreksiTanganJudul,
        teks: t.simulasiWawancara.alertTanganTidakSopan,
        tipe: 'gestur_tidak_sopan',
      });
    } else if (telemetri.tangan === 'menghalangi_kamera') {
      setHudAlert({
        judul: t.simulasiWawancara.koreksiTanganJudul,
        teks: t.simulasiWawancara.alertTanganMenghalangi,
        tipe: 'menghalangi_kamera',
      });
    } else if (telemetri.tangan === 'menyentuh_wajah') {
      setHudAlert({
        judul: t.simulasiWawancara.koreksiTanganJudul,
        teks: t.simulasiWawancara.alertTanganMenyentuh,
        tipe: 'menyentuh_wajah',
      });
    } else if (telemetri.postur === 'miring' || telemetri.postur === 'bungkuk') {
      setHudAlert({
        judul: t.simulasiWawancara.koreksiPosturJudul,
        teks: t.simulasiWawancara.alertPosturMiring,
        tipe: 'postur',
      });
    } else {
      // Jika status telemetri Normal (tangan normal, postur tegak), langsung hilangkan notif seketika
      setHudAlert(null);
    }
  }, [telemetri.tangan, telemetri.postur, t]);

  // State deteksi ukuran layar mobile vs desktop agar ref tidak ganda di DOM
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Jalankan kamera saat komponen terpasang di layar (jika belum aktif)
  useEffect(() => {
    let timeoutId: any;
    if (!telemetri.kameraAktif) {
      timeoutId = setTimeout(() => {
        mulaiKamera();
      }, 100);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      hentikanKamera();
    };
  }, []);

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
            {/* Badge Live Video di Sudut Kiri Atas */}
            <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-stone-700/60 text-white text-[11px] font-bold shadow-md">
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

              {/* Toast HUD Notifikasi Peringatan di Kanan Atas Panggung Video Avatar */}
              {hudAlert && (
                <div className="absolute top-3 right-3 z-30 max-w-[280px] sm:max-w-[320px] p-3 rounded-2xl bg-stone-900/95 backdrop-blur-md border border-amber-500/70 text-amber-200 text-xs shadow-2xl animate-fadeIn flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold block text-white text-[11px] leading-tight">
                      {hudAlert.judul}
                    </span>
                    <p className="text-[11px] text-amber-100/90 leading-relaxed">
                      {hudAlert.teks}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Audio Respon Bina Saat Bersuara */}
              {sedangMemutarAudio && (
                <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-xl bg-orange-950/80 border border-orange-500/50 text-orange-200 text-xs font-semibold flex items-center gap-2 shadow-lg">
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>{t.simulasiWawancara.binaSedangBicara}</span>
                </div>
              )}

              {/* Subtitle / Closed-Caption (CC) Teks Suara Bina di Panggung Live Video */}
              {ucapanTerakhirBina && (
                <div className="absolute bottom-3 left-4 right-48 z-30 pointer-events-none">
                  <div className="max-w-xl px-4 py-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-stone-700/70 text-white text-xs sm:text-sm leading-relaxed shadow-xl animate-fadeIn">
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-amber-400">
                      <span>Bina</span>
                      {sedangMemutarAudio && <Volume2 className="w-3 h-3 text-amber-400" />}
                    </div>
                    <p className="line-clamp-3 font-medium text-stone-100">
                      "{ucapanTerakhirBina}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Picture-in-Picture (PiP) Kamera User di Pojok Kanan Bawah */}
            <div className="absolute bottom-3 right-3 z-30 w-44 h-32 rounded-2xl overflow-hidden border-2 border-stone-600/90 shadow-2xl bg-black">
              <div className="w-full h-full relative">
                {!isMobile && (
                  <>
                    {/* Video Streaming Pengguna (Mirrored) */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover scale-x-[-1] ${telemetri.kameraAktif ? 'block' : 'hidden'}`}
                    />
                    {/* Canvas Overlay MediaPipe Skeleton (Mirrored) */}
                    <canvas
                      ref={canvasRef}
                      className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none ${telemetri.kameraAktif ? 'block' : 'hidden'}`}
                    />
                  </>
                )}

                {telemetri.kameraAktif ? (
                  <>
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
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-stone-900 text-stone-400">
                    <CameraOff className="w-5 h-5 mb-1 text-stone-500" />
                    <span className="text-[10px]">{t.simulasiWawancara.kameraNonaktif}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Bar 4 Indikator Telemetri Bahasa Tubuh (Clean Badge - Bebas Lingkaran Bulat) */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {/* Telemetri 1: Kontak Mata */}
            <div
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center text-[11px] font-bold transition-colors ${
                telemetri.kontakMataPersen >= 70
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
              }`}
            >
              <span className="truncate">
                {t.simulasiWawancara.telemetriKontakMata} {telemetri.kontakMataPersen}%
              </span>
            </div>

            {/* Telemetri 2: Postur Tubuh */}
            <div
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center text-[11px] font-bold transition-colors ${
                telemetri.postur === 'tegak'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
              }`}
            >
              <span className="truncate">
                {t.simulasiWawancara.telemetriPostur}{' '}
                {telemetri.postur === 'tegak'
                  ? t.simulasiWawancara.telemetriTegak
                  : t.simulasiWawancara.telemetriMiring}
              </span>
            </div>

            {/* Telemetri 3: Bibir / Gerak Bicara */}
            <div
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center text-[11px] font-bold transition-colors ${
                telemetri.bibirSuara === 'jelas'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-stone-800 border-stone-700 text-stone-300'
              }`}
            >
              <span className="truncate">
                {t.simulasiWawancara.telemetriBibir}{' '}
                {telemetri.bibirSuara === 'jelas'
                  ? t.simulasiWawancara.telemetriJelas
                  : telemetri.bibirSuara === 'kurang_terbuka'
                  ? t.simulasiWawancara.telemetriKurangTerbuka
                  : t.simulasiWawancara.telemetriNormal}
              </span>
            </div>

            {/* Telemetri 4: Posisi Tangan & Gestur */}
            <div
              className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-colors ${
                telemetri.tangan === 'gestur_tidak_sopan'
                  ? 'bg-rose-900/90 border-rose-500 text-white shadow-sm'
                  : telemetri.tangan === 'menghalangi_kamera' || telemetri.tangan === 'menyentuh_wajah'
                  ? 'bg-amber-700/80 border-amber-500 text-white shadow-sm'
                  : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {telemetri.tangan === 'gestur_tidak_sopan' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
                  <span className="truncate">{t.simulasiWawancara.telemetriGesturTidakSopan}</span>
                </>
              ) : telemetri.tangan === 'menghalangi_kamera' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                  <span className="truncate">{t.simulasiWawancara.telemetriMenghalangiKamera}</span>
                </>
              ) : telemetri.tangan === 'menyentuh_wajah' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                  <span className="truncate">{t.simulasiWawancara.telemetriMenyentuhWajah}</span>
                </>
              ) : (
                <span className="truncate">
                  {t.simulasiWawancara.telemetriTangan} {t.simulasiWawancara.telemetriTanganNormal}
                </span>
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
            {daftarPesanLokal
              .filter((p) => !p.kondisi_terdeteksi)
              .map((pesan) => {
                // KASUS 1: BUBBLE BINA (PEWAWANCARA)
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

                // KASUS 2: BUBBLE KANDIDAT
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
          <div className="absolute top-3 left-3 z-30 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold">
            <span>{t.simulasiWawancara.badgeLiveVideo}</span>
          </div>

          <img
            src="/illustrations/bina-male-avatar.svg"
            alt="Bina"
            className="h-[80%] object-contain"
          />

          {/* Subtitle / Closed-Caption (CC) Teks Suara Bina di Panggung Mobile */}
          {ucapanTerakhirBina && (
            <div className="absolute bottom-2 left-2.5 right-32 z-30 pointer-events-none">
              <div className="p-2 rounded-xl bg-black/80 backdrop-blur-md border border-stone-700/70 text-white text-[10px] leading-snug shadow-lg">
                <span className="font-bold text-amber-400 block text-[9px] mb-0.5">Bina</span>
                <p className="line-clamp-2 text-stone-100">"{ucapanTerakhirBina}"</p>
              </div>
            </div>
          )}

          {/* Toast HUD Notifikasi Peringatan di Kanan Atas Panggung Video Mobile */}
          {hudAlert && (
            <div className="absolute top-2.5 right-2.5 z-30 max-w-[210px] p-2 rounded-xl bg-stone-900/95 backdrop-blur-md border border-amber-500/70 text-amber-200 text-[10px] shadow-xl animate-fadeIn flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold block text-white text-[10px] leading-tight">
                  {hudAlert.judul}
                </span>
                <p className="text-[9px] text-amber-100/90 leading-tight">
                  {hudAlert.teks}
                </p>
              </div>
            </div>
          )}

          {/* PiP Kamera Mobile di Pojok Kanan Bawah */}
          <div className="absolute bottom-2.5 right-2.5 z-30 w-28 h-20 rounded-xl overflow-hidden border-2 border-stone-600 bg-black">
            <div className="w-full h-full relative">
              {isMobile && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover scale-x-[-1] ${telemetri.kameraAktif ? 'block' : 'hidden'}`}
                  />
                  <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none ${telemetri.kameraAktif ? 'block' : 'hidden'}`}
                  />
                </>
              )}
              {telemetri.kameraAktif ? (
                telemetri.sedangMemuatModel && (
                  <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-semibold text-amber-300">
                    AI...
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">
                  {t.simulasiWawancara.kameraNonaktif}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Telemetri Strip Mobile */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 border-b border-stone-800 overflow-x-auto scrollbar-none">
          <div className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-200 text-[10px] font-bold shrink-0">
            {t.simulasiWawancara.telemetriKontakMata} {telemetri.kontakMataPersen}%
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-200 text-[10px] font-bold shrink-0">
            {t.simulasiWawancara.telemetriPostur}{' '}
            {telemetri.postur === 'tegak'
              ? t.simulasiWawancara.telemetriTegak
              : t.simulasiWawancara.telemetriMiring}
          </div>
          {telemetri.tangan === 'gestur_tidak_sopan' ? (
            <div className="px-2 py-1 rounded-lg bg-rose-800 text-white text-[10px] font-bold shrink-0">
              🚫 {t.simulasiWawancara.telemetriGesturTidakSopan}
            </div>
          ) : telemetri.tangan === 'menghalangi_kamera' ? (
            <div className="px-2 py-1 rounded-lg bg-amber-700 text-white text-[10px] font-bold shrink-0">
              ⚠️ {t.simulasiWawancara.telemetriMenghalangiKamera}
            </div>
          ) : telemetri.tangan === 'menyentuh_wajah' ? (
            <div className="px-2 py-1 rounded-lg bg-amber-700 text-white text-[10px] font-bold shrink-0">
              ⚠️ {t.simulasiWawancara.telemetriMenyentuhWajah}
            </div>
          ) : null}
        </div>

        {/* Transkrip Tengah Mobile */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
          <h3 className="text-xs font-bold text-stone-800">
            {t.simulasiWawancara.transkripEvaluasiJudul}
          </h3>
          {daftarPesanLokal
            .filter((p) => !p.kondisi_terdeteksi)
            .map((pesan) => (
              <div key={pesan.id} className="text-xs leading-relaxed">
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
