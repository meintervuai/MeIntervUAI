// ScoreRingGauge.tsx - Circular SVG Ring Gauge untuk Skor Keseluruhan
// Patuh anti-slop: Tanpa pulsing dots, tanpa sparkle icons, tanpa em-dash.

import React from 'react';
import { Award, TrendingUp } from 'lucide-react';

interface ScoreRingGaugeProps {
  skor: number; // 0 - 100
  persentil: number;
  statusLabel: string;
  tagPersentilText: string;
}

export const ScoreRingGauge: React.FC<ScoreRingGaugeProps> = ({
  skor,
  persentil,
  statusLabel,
  tagPersentilText,
}) => {
  // Geometri Lingkaran SVG
  const radius = 54;
  const strokeWidth = 10;
  const keliling = 2 * Math.PI * radius;
  const progressClamped = Math.min(100, Math.max(0, skor));
  const offset = keliling - (progressClamped / 100) * keliling;

  // Warna adaptif skor (skor >= 80 hijau, 60-79 amber/orange, < 60 rose merah)
  const warnaStroke = skor >= 75 ? '#16A34A' : skor >= 50 ? '#EA580C' : '#E11D48';
  const warnaBgRing = skor >= 75 ? '#DCFCE7' : skor >= 50 ? '#FFEDD5' : '#FFE4E6';

  const badgeStyle =
    skor >= 75
      ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
      : skor >= 50
      ? 'bg-amber-50 border-amber-200/80 text-amber-800'
      : 'bg-rose-50 border-rose-200/80 text-rose-800';

  return (
    <div className="flex flex-col items-center text-center p-5 sm:p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs h-full justify-between">
      {/* Label Kicker Atas */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Hasil Evaluasi
          </span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold">
          <TrendingUp className="w-3 h-3 text-stone-500" />
          <span>Top {persentil}%</span>
        </div>
      </div>

      {/* Circular SVG Ring Gauge */}
      <div className="relative my-4 flex items-center justify-center">
        <svg
          className="w-36 h-36 sm:w-40 sm:h-40 transform -rotate-90 drop-shadow-2xs"
          viewBox="0 0 130 130"
          aria-label={`Skor wawancara ${skor} dari 100`}
        >
          {/* Background Track Circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke={warnaBgRing}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground Progress Circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke={warnaStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={keliling}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-5xl font-black text-[#18181B] tracking-tight leading-none">
            {skor}
          </span>
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mt-1">
            dari 100
          </span>
        </div>
      </div>

      {/* Status Kelayakan & Tag Persentil */}
      <div className="w-full space-y-2 pt-2">
        <div className={`inline-flex items-center px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-extrabold shadow-2xs ${badgeStyle}`}>
          <span>{statusLabel}</span>
        </div>
        <p className="text-xs text-stone-600 font-medium">
          {tagPersentilText}
        </p>
      </div>
    </div>
  );
};
