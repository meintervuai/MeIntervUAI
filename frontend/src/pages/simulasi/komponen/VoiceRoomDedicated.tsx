// Komponen Khusus Ruang Simulasi Suara (VoiceRoomDedicated.tsx)
// Redesign Modern Split-View (Desktop Fit to Screen h-[calc(100vh-140px)]) & Sticky Control (Mobile)
// Sesuai Spesifikasi: Dark Charcoal Card (#18181B - #1F1F23), Concentric Audio Wave Rings, 
// Avatar Pria Profesional Bina, Transkrip Independen Putih Bersih (#FFFFFF)

import React from 'react';
import { useBahasa } from '../../../i18n';
import { PesanChat } from './types';
import { 
  FileText, 
  Volume2, 
  VolumeX, 
  Radio, 
  Mic, 
  MicOff,
  User
} from 'lucide-react';

interface PropertiVoiceRoom {
  targetRole: string;
  daftarPesan: PesanChat[];
  sedangMemutarAudio: boolean;
  sedangMerekam: boolean;
  sedangMerespon: boolean;
  liveTranscriptUser?: string;
  modeInteraksiSuara: 'ptt' | 'handsfree';
  setModeInteraksiSuara: (m: 'ptt' | 'handsfree') => void;
  tampilkanTranskripSuara: boolean;
  setTampilkanTranskripSuara: (t: boolean) => void;
  audioMuted: boolean;
  onToggleMute: () => void;
  onMulaiMerekam: () => void;
  onHentikanMerekam: () => void;
  onPutarAudio: (url?: string) => void;
  ujungChatRef: React.RefObject<HTMLDivElement>;
}

export const VoiceRoomDedicated: React.FC<PropertiVoiceRoom> = ({
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

  return (
    <div className="w-full h-full flex flex-col md:h-[calc(100vh-150px)] md:min-h-[580px] md:max-h-[820px] animate-fadeIn">
      
      {/* ============================================================== */}
      {/* DESKTOP LAYOUT (SPLIT-VIEW 2-COLUMN, 100% TINGGI FIT SCREEN)     */}
      {/* ============================================================== */}
      <div className="hidden md:grid md:grid-cols-12 gap-5 h-full overflow-hidden">
        
        {/* KOLOM KIRI (55% - PANEL INTERAKSI SUARA) */}
        <div className="md:col-span-7 flex flex-col h-full bg-[#18181B] border border-stone-800 rounded-3xl p-6 shadow-xl relative overflow-hidden justify-between">
          
          {/* Subtle Background Glow Oranye Terakota */}
          <div 
            className={`absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
              sedangMemutarAudio 
                ? 'bg-orange-600/35 opacity-100 scale-125' 
                : sedangMerekam 
                ? 'bg-emerald-600/30 opacity-100 scale-110'
                : sedangMerespon 
                ? 'bg-amber-600/30 opacity-100 animate-pulse'
                : 'bg-orange-600/15 opacity-40'
            }`} 
          />

          {/* 1. Header Bar Di Atas Kartu Gelap */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-300 font-medium">
                <span className="text-white font-bold">Mode Percakapan Suara Langsung</span>
                <span className="text-stone-600 mx-2">|</span>
                <span className="text-orange-400 font-semibold truncate max-w-[200px]" title={targetRole}>
                  {targetRole}
                </span>
              </span>
            </div>

            {/* Kontrol Kanan: Toggle PTT/Handsfree, Mute Mic Status, Mute Speaker */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModeInteraksiSuara(modeInteraksiSuara === 'ptt' ? 'handsfree' : 'ptt')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  modeInteraksiSuara === 'handsfree'
                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800'
                }`}
                title="Beralih mode input mikrofon"
              >
                <Radio className="w-3.5 h-3.5 text-orange-400" />
                <span>{modeInteraksiSuara === 'handsfree' ? 'Hands-Free' : 'Mode Tahan Bicara (PTT)'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  audioMuted 
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-800'
                }`}
                title={audioMuted ? 'Nyalakan Speaker Suara' : 'Bisukan Speaker Suara'}
              >
                {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-stone-200" />}
              </button>
            </div>
          </div>

          {/* 2. Area Tengah: Avatar Lingkaran Pria Eksekutif HR Bina & Concentric Audio Rings */}
          <div className="flex-1 flex flex-col items-center justify-center relative py-6 z-10">
            <div className="relative flex items-center justify-center">
              
              {/* Concentric Audio Wave Rings (Animasi saat Bina Bicara atau Kandidat Merekam) */}
              <div 
                className={`absolute w-56 h-56 rounded-full border border-orange-500/20 transition-all duration-700 pointer-events-none ${
                  sedangMemutarAudio ? 'scale-125 opacity-80 animate-ping' : sedangMerekam ? 'scale-115 opacity-60 border-emerald-500/25 animate-ping' : 'opacity-10 scale-90'
                }`} 
              />
              <div 
                className={`absolute w-44 h-44 rounded-full border border-orange-500/30 transition-all duration-500 pointer-events-none ${
                  sedangMemutarAudio ? 'scale-110 opacity-90' : sedangMerekam ? 'scale-105 opacity-80 border-emerald-500/40' : 'opacity-20'
                }`} 
              />
              <div 
                className={`absolute w-36 h-36 rounded-full bg-orange-600/10 blur-md pointer-events-none ${
                  sedangMemutarAudio ? 'opacity-100 scale-110' : 'opacity-20'
                }`} 
              />

              {/* Avatar Pria Profesional Bina */}
              <div className={`relative w-28 h-28 rounded-full p-1 transition-all duration-300 shadow-2xl ${
                sedangMemutarAudio
                  ? 'ring-4 ring-orange-500 shadow-orange-500/50 scale-105'
                  : sedangMerekam
                  ? 'ring-4 ring-emerald-500 shadow-emerald-500/50 scale-105'
                  : sedangMerespon
                  ? 'ring-4 ring-amber-500/80'
                  : 'ring-2 ring-stone-700/80'
              }`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-stone-900 border-2 border-stone-800">
                  <img
                    src="/illustrations/bina-male-avatar.svg"
                    alt="Bina - Head of Talent Acquisition"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Teks Status Dinamis & Live Transcript Kandidat */}
            <div className="text-center mt-4 space-y-1.5 z-10 max-w-md w-full px-4">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {sedangMemutarAudio ? (
                  <span className="text-orange-400">{t.simulasiWawancara.binaBicara}</span>
                ) : sedangMerekam ? (
                  <span className="text-emerald-400">
                    {t.simulasiWawancara.binaMendengar}
                  </span>
                ) : sedangMerespon ? (
                  <span className="text-amber-400">{t.simulasiWawancara.binaBerpikir}</span>
                ) : (
                  <span>Siap mendengarkan jawaban Anda</span>
                )}
              </h3>

              {/* LIVE REAL-TIME STREAMING SPEECH BUBBLE (Saat sedang bicara) */}
              {sedangMerekam && (
                <div className="p-2.5 rounded-xl bg-stone-900/90 border border-emerald-500/40 shadow-inner text-left max-h-20 overflow-y-auto animate-fadeIn">
                  <div className="text-[10px] font-bold text-emerald-400 mb-0.5">
                    Mendengarkan ucapan langsung:
                  </div>
                  <p className="text-xs text-stone-200 italic leading-relaxed">
                    "{liveTranscriptUser || 'Silakan mulai berbicara...'}"
                  </p>
                </div>
              )}

              <p className="text-[11px] text-stone-400">
                Karakter Suara: Bina (en-US-BrianMultilingualNeural - Microsoft Neural)
              </p>
            </div>
          </div>

          {/* 3. Area Bawah: Tombol Utama Oranye Terakota */}
          <div className="pt-2 z-10">
            {modeInteraksiSuara === 'ptt' ? (
              <button
                type="button"
                disabled={sedangMerespon || sedangMemutarAudio}
                onMouseDown={onMulaiMerekam}
                onMouseUp={onHentikanMerekam}
                onTouchStart={onMulaiMerekam}
                onTouchEnd={onHentikanMerekam}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg select-none min-h-[52px] ${
                  sedangMerekam
                    ? 'bg-rose-600 hover:bg-rose-700 text-white scale-[0.99] ring-4 ring-rose-500/30'
                    : 'bg-[#EA580C] hover:bg-[#C84B11] text-white ring-4 ring-orange-500/20 hover:scale-[1.01] active:scale-[0.99]'
                } disabled:opacity-40 disabled:pointer-events-none`}
              >
                <Mic className="w-5 h-5 fill-current" />
                <span>{sedangMerekam ? 'Lepas untuk Mengirim Jawaban' : 'Tahan untuk Bicara'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={sedangMerespon || sedangMemutarAudio}
                onClick={sedangMerekam ? onHentikanMerekam : onMulaiMerekam}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg select-none min-h-[52px] ${
                  sedangMerekam
                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                } disabled:opacity-40 disabled:pointer-events-none`}
              >
                {sedangMerekam ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>{sedangMerekam ? 'Klik untuk Selesai Bicara' : 'Klik untuk Mulai Bicara'}</span>
              </button>
            )}
          </div>

        </div>

        {/* KOLOM KANAN (45% - PANEL TRANSKRIP REAL-TIME) */}
        <div className="md:col-span-5 flex flex-col h-full bg-white border border-stone-200/90 rounded-3xl shadow-sm overflow-hidden">
          
          {/* Header Kartu Transkrip */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 bg-stone-50/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 text-orange-800">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-extrabold text-stone-900 tracking-tight">
                Transkrip Percakapan Real-Time
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200/70">
              {daftarPesan.length} interaksi
            </span>
          </div>

          {/* Body Transkrip Independen Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin">
            {daftarPesan.map((pesan) => {
              const adalahBina = pesan.pengirim === 'pewawancara';
              return (
                <div
                  key={pesan.id}
                  className={`flex flex-col ${adalahBina ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {adalahBina ? (
                      <>
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-orange-200 shrink-0 bg-orange-50">
                          <img src="/illustrations/bina-male-avatar.svg" alt="Bina" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-bold text-stone-800">
                          Bina (Head of Talent Acquisition)
                        </span>
                        {pesan.audio_url && (
                          <button
                            type="button"
                            onClick={() => onPutarAudio(pesan.audio_url)}
                            className="text-orange-700 hover:text-orange-800 inline-flex items-center gap-1 font-bold text-[10px] ml-1 cursor-pointer"
                            title="Dengarkan kembali ucapan Bina"
                          >
                            <Volume2 className="w-3 h-3" /> Putar Ulang
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold text-stone-700">
                          {pesan.nama}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bubble Chat */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-2xs ${
                      adalahBina
                        ? 'bg-stone-50 border border-stone-200 text-stone-900 rounded-tl-sm'
                        : 'bg-orange-50/80 border border-orange-200 text-stone-900 rounded-tr-sm font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">{pesan.teks}</p>
                  </div>
                </div>
              );
            })}

            {/* LIVE BUBBLE KANDIDAT REAL-TIME SAAT MEREKAM / BERBICARA */}
            {sedangMerekam && (
              <div className="flex flex-col items-end animate-fadeIn">
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-bold text-emerald-700">
                    Merekam Suara...
                  </span>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] bg-emerald-50/80 border border-emerald-300 text-emerald-950 rounded-tr-sm font-medium shadow-2xs">
                  <p className="whitespace-pre-line italic">
                    "{liveTranscriptUser || 'Mendengarkan ucapan langsung...'}"
                  </p>
                </div>
              </div>
            )}

            <div ref={ujungChatRef} />
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* MOBILE LAYOUT (< 768px - STICKY CONTROL & SCROLLABLE TRANSCRIPT) */}
      {/* ============================================================== */}
      <div className="flex md:hidden flex-col h-[calc(100vh-140px)] overflow-hidden space-y-3">
        
        {/* 1. Compact Voice Visualizer (Sekitar 25-30% tinggi layar) */}
        <div className="bg-[#18181B] border border-stone-800 rounded-2xl p-4 shadow-md shrink-0 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] font-bold text-stone-200 truncate max-w-[170px]">
              {targetRole}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setModeInteraksiSuara(modeInteraksiSuara === 'ptt' ? 'handsfree' : 'ptt')}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-800 border border-stone-700 text-stone-300"
              >
                {modeInteraksiSuara === 'handsfree' ? 'Handsfree' : 'PTT'}
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                className="p-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-300"
              >
                {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3.5 py-2.5 z-10">
            <div className={`relative w-14 h-14 rounded-full p-0.5 shrink-0 ${
              sedangMemutarAudio ? 'ring-2 ring-orange-500 shadow-orange-500/50' : sedangMerekam ? 'ring-2 ring-emerald-500' : 'ring-1 ring-stone-700'
            }`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-stone-900">
                <img src="/illustrations/bina-male-avatar.svg" alt="Bina" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {sedangMemutarAudio ? (
                  <span className="text-orange-400">{t.simulasiWawancara.binaBicara}</span>
                ) : sedangMerekam ? (
                  <span className="text-emerald-400">{t.simulasiWawancara.binaMendengar}</span>
                ) : sedangMerespon ? (
                  <span className="text-amber-400">{t.simulasiWawancara.binaBerpikir}</span>
                ) : (
                  <span>Siap mendengarkan jawaban</span>
                )}
              </div>
              <p className="text-[10px] text-stone-400 truncate mt-0.5">
                Karakter Suara: Bina (Laki-laki)
              </p>
            </div>
          </div>
        </div>

        {/* 2. Scrollable Transcript (Tengah) */}
        <div className="flex-1 bg-white border border-stone-200 rounded-2xl p-3 overflow-y-auto space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
            <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-700" />
              Transkrip Real-Time
            </span>
            <span className="text-[10px] text-stone-500 font-semibold">
              {daftarPesan.length} pesan
            </span>
          </div>

          {daftarPesan.map((pesan) => {
            const adalahBina = pesan.pengirim === 'pewawancara';
            return (
              <div
                key={pesan.id}
                className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                  adalahBina
                    ? 'bg-stone-50 border border-stone-200 text-stone-900 mr-4'
                    : 'bg-orange-50/80 border border-orange-200/80 text-stone-900 ml-4 font-medium'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                  <span className={adalahBina ? 'text-orange-900' : 'text-stone-700'}>
                    {adalahBina ? 'Bina (AI HR)' : pesan.nama}
                  </span>
                  {adalahBina && pesan.audio_url && (
                    <button
                      type="button"
                      onClick={() => onPutarAudio(pesan.audio_url)}
                      className="text-orange-700 text-[10px] font-bold"
                    >
                      Putar
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-line">{pesan.teks}</p>
              </div>
            );
          })}

          {/* LIVE BUBBLE KANDIDAT MOBILE SAAT MEREKAM */}
          {sedangMerekam && (
            <div className="p-2.5 rounded-xl text-xs leading-relaxed bg-emerald-50/90 border border-emerald-300 text-emerald-950 ml-4 font-medium animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-[10px] mb-1 text-emerald-800">
                <span>Anda (Merekam Suara...)</span>
              </div>
              <p className="whitespace-pre-line italic">
                "{liveTranscriptUser || 'Mendengarkan ucapan langsung...'}"
              </p>
            </div>
          )}

          <div ref={ujungChatRef} />
        </div>

        {/* 3. Sticky Bottom Action Bar (Lebar penuh jangkauan jempol) */}
        <div className="shrink-0 pt-1 pb-2">
          {modeInteraksiSuara === 'ptt' ? (
            <button
              type="button"
              disabled={sedangMerespon || sedangMemutarAudio}
              onMouseDown={onMulaiMerekam}
              onMouseUp={onHentikanMerekam}
              onTouchStart={onMulaiMerekam}
              onTouchEnd={onHentikanMerekam}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md select-none min-h-[48px] ${
                sedangMerekam
                  ? 'bg-rose-600 text-white scale-[0.99] ring-2 ring-rose-500/40'
                  : 'bg-[#EA580C] text-white active:scale-[0.98]'
              } disabled:opacity-40 disabled:pointer-events-none`}
            >
              <Mic className="w-4 h-4 fill-current" />
              <span>{sedangMerekam ? 'Lepas untuk Mengirim' : '🎙️ Tahan untuk Bicara'}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={sedangMerespon || sedangMemutarAudio}
              onClick={sedangMerekam ? onHentikanMerekam : onMulaiMerekam}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md select-none min-h-[48px] ${
                sedangMerekam ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
              } disabled:opacity-40 disabled:pointer-events-none`}
            >
              {sedangMerekam ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{sedangMerekam ? 'Klik Selesai Bicara' : 'Klik Mulai Bicara'}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
