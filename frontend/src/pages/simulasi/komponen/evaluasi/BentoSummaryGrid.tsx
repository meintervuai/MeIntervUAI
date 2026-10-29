// BentoSummaryGrid.tsx - Bento Grid 3 Kolom Ringkasan Evaluasi Simulasi
// Column 1: Overall Score Gauge (Circular SVG)
// Column 2: 4 Pillar Metrics (CAR, Komunikasi, Teknis, MediaPipe)
// Column 3: Ringkasan Eksekutif Bina AI (Avatar, Quote Evaluasi, Gestur Dominan)
// Patuh anti-slop: Tanpa pulsing dots, tanpa sparkle icons, tanpa em-dash.

import React from 'react';
import { Target, MessageSquare, Briefcase, Eye, ShieldCheck, Quote } from 'lucide-react';
import { ScoreRingGauge } from './ScoreRingGauge';
import { EvaluasiI18nDict } from './evaluasiI18n';

interface BentoSummaryGridProps {
  skorKeseluruhan: number;
  persentil: number;
  statusLabel: string;
  tagPersentilText: string;
  metodeCar: number;
  komunikasi: number;
  penguasaanTeknis: number;
  bahasaTubuh: number;
  kutipanBina: string;
  catatanPostur: string;
  dict: EvaluasiI18nDict;
}

export const BentoSummaryGrid: React.FC<BentoSummaryGridProps> = ({
  skorKeseluruhan,
  persentil,
  statusLabel,
  tagPersentilText,
  metodeCar,
  komunikasi,
  penguasaanTeknis,
  bahasaTubuh,
  kutipanBina,
  catatanPostur,
  dict,
}) => {
  const pilarList = [
    {
      id: 'car',
      nama: dict.bento.pilarCar,
      skor: metodeCar,
      desc: dict.bento.pilarCarDesc,
      icon: Target,
      barWarna: 'bg-emerald-600',
    },
    {
      id: 'komunikasi',
      nama: dict.bento.pilarKomunikasi,
      skor: komunikasi,
      desc: dict.bento.pilarKomunikasiDesc,
      icon: MessageSquare,
      barWarna: 'bg-emerald-600',
    },
    {
      id: 'teknis',
      nama: dict.bento.pilarTeknis,
      skor: penguasaanTeknis,
      desc: dict.bento.pilarTeknisDesc,
      icon: Briefcase,
      barWarna: 'bg-amber-600',
    },
    {
      id: 'mediapipe',
      nama: dict.bento.pilarMediaPipe,
      skor: bahasaTubuh,
      desc: dict.bento.pilarMediaPipeDesc,
      icon: Eye,
      barWarna: 'bg-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Kolom 1: Overall Score Gauge */}
      <div className="w-full">
        <ScoreRingGauge
          skor={skorKeseluruhan}
          persentil={persentil}
          statusLabel={statusLabel}
          tagPersentilText={tagPersentilText}
        />
      </div>

      {/* Kolom 2: 4 Pilar Metrik Evaluasi */}
      <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 text-[#EA580C]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">
              {dict.bento.pilarMetrikJudul}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-stone-600">
            Standar HR Lead
          </span>
        </div>

        <div className="space-y-3.5 my-auto">
          {pilarList.map((pilar) => {
            const Icon = pilar.icon;
            return (
              <div key={pilar.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Icon className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>{pilar.nama}</span>
                  </div>
                  <span className="font-extrabold text-stone-900 font-mono">
                    {pilar.skor}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pilar.barWarna} transition-all duration-700 ease-out`}
                    style={{ width: `${pilar.skor}%` }}
                  />
                </div>

                <p className="text-[10.5px] text-stone-600 leading-tight">
                  {pilar.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
          <span>Rata-rata 4 Pilar:</span>
          <span className="font-extrabold text-stone-900 font-mono">
            {Math.round((metodeCar + komunikasi + penguasaanTeknis + bahasaTubuh) / 4)}%
          </span>
        </div>
      </div>

      {/* Kolom 3: Ringkasan Eksekutif Bina AI */}
      <div className="w-full md:col-span-2 lg:col-span-1 bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
        {/* Header Kartu Bina */}
        <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
          <div className="relative w-11 h-11 rounded-full border-2 border-amber-300 overflow-hidden bg-amber-50 shrink-0 shadow-2xs">
            <img
              src="/illustrations/bina-male-avatar.svg"
              alt="Bina Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback avatar jika gambar svg tidak termuat
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 truncate">
              {dict.bento.binaExecutiveJudul}
            </h3>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 mt-0.5">
              {dict.bento.binaRoleBadge}
            </span>
          </div>
        </div>

        {/* Sharp Evaluation Quote */}
        <div className="my-4 relative bg-[#FAF8F5] rounded-xl p-3.5 border border-stone-200/80">
          <Quote className="w-4 h-4 text-amber-600/50 mb-1" />
          <p className="text-xs sm:text-[13px] font-medium text-stone-800 leading-relaxed italic">
            "{kutipanBina}"
          </p>
        </div>

        {/* Catatan Gestur Dominan MediaPipe */}
        <div className="pt-2 border-t border-stone-100 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
            <Eye className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>{dict.bento.gesturDominanJudul}</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-normal">
            {catatanPostur}
          </p>
        </div>
      </div>
    </div>
  );
};
