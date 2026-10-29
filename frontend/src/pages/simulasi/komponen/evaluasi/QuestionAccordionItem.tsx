// QuestionAccordionItem.tsx - Item Accordion Evaluasi Komparatif Per Pertanyaan
// Menampilkan Skor, Kontak Mata MediaPipe, Transkrip Kandidat, Pemutar Audio,
// Komparasi 2-Kolom (Kekuatan vs Area Peningkatan & Koreksi Postur),
// dan Rekomendasi Jawaban Ideal dari Bina (STAR/CAR polish).
// Patuh anti-slop: Tanpa pulsing dots, tanpa sparkle icons, tanpa em-dash.

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  Award,
} from 'lucide-react';
import { EvaluasiPertanyaanItem } from './evaluasiTypes';
import { EvaluasiI18nDict } from './evaluasiI18n';

interface QuestionAccordionItemProps {
  item: EvaluasiPertanyaanItem;
  isOpen: boolean;
  onToggle: () => void;
  dict: EvaluasiI18nDict;
}

export const QuestionAccordionItem: React.FC<QuestionAccordionItemProps> = ({
  item,
  isOpen,
  onToggle,
  dict,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioProgress, setCurrentAudioProgress] = useState(0);

  // Simulasi progress bar audio saat diputar
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setCurrentAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 5;
        });
      }, 500);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio]);

  const togglePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingAudio((prev) => !prev);
  };

  // Format durasi audio mm:ss
  const formatDetik = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header Accordion (Bisa diklik untuk expand/collapse) */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors cursor-pointer select-none min-h-[56px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {/* Nomor Urut Pill */}
          <span className="w-7 h-7 rounded-xl bg-stone-100 text-stone-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-stone-200 mt-0.5 sm:mt-0">
            #{item.nomorUrut}
          </span>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-[#18181B] leading-snug tracking-tight line-clamp-2 sm:line-clamp-1">
              {item.pertanyaan}
            </h4>
          </div>
        </div>

        {/* Skor & Badges */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Badge Kontak Mata MediaPipe */}
          <div
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-[#EA580C] border border-orange-200 text-xs font-bold"
            title={`${dict.accordion.kontakMataLabel}: ${item.kontakMataPersen}%`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{item.kontakMataPersen}%</span>
          </div>

          {/* Badge Skor Jawaban */}
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border ${
              item.skor >= 85
                ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{item.skor}/100</span>
          </div>

          {/* Chevron Toggle Icon */}
          <div className="p-1 text-stone-400">
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-stone-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500" />
            )}
          </div>
        </div>
      </button>

      {/* Konten Accordion Terbuka */}
      {isOpen && (
        <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-stone-100 space-y-5 bg-[#FAF8F5]/30">
          {/* Transkrip Jawaban Kandidat & Pemutar Audio */}
          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">
                  {dict.accordion.transkripJawaban}
                </span>
                <span className="inline-block sm:hidden px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-[#EA580C] border border-orange-200">
                  Mata: {item.kontakMataPersen}%
                </span>
              </div>

              {/* Pemutar Audio Interaktif */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer shadow-2xs ${
                    isPlayingAudio
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>{dict.accordion.jedaAudio}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{dict.accordion.putarAudio}</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-1 text-[11px] font-mono text-stone-500">
                  <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>{formatDetik(item.durasiAudioDetik)}</span>
                </div>
              </div>
            </div>

            {/* Waveform / Visual Audio Bar jika sedang diputar */}
            {isPlayingAudio && (
              <div className="space-y-1 py-1">
                <div className="flex items-center gap-1 h-3">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-orange-400 rounded-full transition-all duration-300"
                      style={{
                        height: `${Math.max(20, ((i * 13 + currentAudioProgress) % 80) + 20)}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-600 h-full transition-all duration-500"
                    style={{ width: `${currentAudioProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Teks Kutipan Jawaban */}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic bg-stone-50 p-3 rounded-lg border border-stone-200/60 font-sans">
              "{item.jawabanKandidat}"
            </p>
          </div>

          {/* Grid 2 Kolom Evaluasi Komparatif (Kekuatan Hijau vs Area Peningkatan Oranye) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Kotak Hijau: Kekuatan & Bukti CAR */}
            <div className="bg-[#F0FDF4] rounded-xl p-4 border border-[#DCFCE7] shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-emerald-200/60">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <h5 className="text-xs font-extrabold text-emerald-900 tracking-tight">
                  {dict.accordion.kotakKekuatanJudul}
                </h5>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950">
                {item.kekuatanCAR.map((poin, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>{poin}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kotak Oranye: Area Peningkatan & Koreksi Postur MediaPipe */}
            <div className="bg-[#FFFBEB] rounded-xl p-4 border border-[#FEF3C7] shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-amber-200/60">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <h5 className="text-xs font-extrabold text-amber-900 tracking-tight">
                  {dict.accordion.kotakPeningkatanJudul}
                </h5>
              </div>
              <ul className="space-y-2 text-xs text-amber-950">
                {item.areaPeningkatan.map((poin, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{poin}</span>
                  </li>
                ))}
              </ul>

              {/* Koreksi Postur Real-Time MediaPipe */}
              {item.koreksiPosturMediaPipe.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Eye className="w-3 h-3 text-amber-700" />
                    <span>{dict.accordion.koreksiPosturJudul}</span>
                  </span>
                  <div className="space-y-1">
                    {item.koreksiPosturMediaPipe.map((kor, kIdx) => (
                      <div
                        key={kIdx}
                        className="flex items-start gap-2 bg-amber-100/70 p-2 rounded-lg text-[11px] text-amber-950 font-medium"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-bold text-[10px] shrink-0">
                          {kor.timestamp}
                        </span>
                        <span className="flex-1 leading-tight">{kor.deskripsi}</span>
                        {kor.derajatDeviasi && (
                          <span className="px-1.5 py-0.5 rounded bg-white/80 text-amber-800 text-[10px] font-semibold border border-amber-200 shrink-0">
                            {kor.derajatDeviasi}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kotak Rekomendasi Jawaban Ideal dari Bina (STAR/CAR polish) */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-orange-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[#EA580C] shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <h5 className="text-xs sm:text-sm font-extrabold text-[#18181B] tracking-tight">
                {dict.accordion.rekomendasiBinaJudul}
              </h5>
            </div>

            <p className="text-xs sm:text-[13px] text-stone-800 leading-relaxed font-sans bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200/80">
              {item.rekomendasiJawabanBina}
            </p>

            {item.poinKunciBina.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-extrabold text-stone-600 uppercase tracking-wider">
                  {dict.accordion.poinKunciJudul}:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {item.poinKunciBina.map((pk, pkIdx) => (
                    <span
                      key={pkIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200"
                    >
                      <Check className="w-3 h-3 text-[#EA580C]" />
                      <span>{pk}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
