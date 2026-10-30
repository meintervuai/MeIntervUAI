// LaporanEvaluasiWawancara.tsx - Post-Interview Scorecard & Feedback Report
// Berdasarkan Riset Praktisi HR (Vina Muliana, Eza Hazami, Yova Beltz, Apri Rokhyadi) & Metode Jev
// Visual Palette: Background #FAF8F5, Kartu #FFFFFF border #E5E7EB, Aksen #EA580C, Kekuatan #16A34A, Teks #18181B
// Responsive: Desktop 3-Kolom Bento & Mobile Stacked (<768px) dengan Sticky Footer Ergonomis >= 44px
// Anti-slop: Tanpa pulsing dots, tanpa sparkle icons, tanpa em-dash.

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Download,
  RotateCcw,
  Briefcase,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { useBahasa } from '../../../i18n';
import { PesanChat } from './types';
import { SkorTelemetriInput } from './evaluasi/evaluasiTypes';
import { kamusEvaluasi } from './evaluasi/evaluasiI18n';
import {
  adaptasiRiwayatChatKeEvaluasi,
  hitungMetrikTelemetri,
} from './evaluasi/evaluasiData';
import { BentoSummaryGrid } from './evaluasi/BentoSummaryGrid';
import { QuestionAccordionItem } from './evaluasi/QuestionAccordionItem';

export interface LaporanEvaluasiProps {
  onKembaliKeStudio: () => void;
  targetRole?: string;
  modeSimulasi?: string;
  riwayatChat?: PesanChat[];
  skorTelemetri?: SkorTelemetriInput;
}

export const LaporanEvaluasiWawancara: React.FC<LaporanEvaluasiProps> = ({
  onKembaliKeStudio,
  targetRole = 'Senior Accounting & Financial Controller',
  modeSimulasi = 'video',
  riwayatChat = [],
  skorTelemetri,
}) => {
  const { bahasa } = useBahasa();
  const dict = useMemo(() => kamusEvaluasi[bahasa === 'en' ? 'en' : 'id'], [bahasa]);

  // Siapkan daftar pertanyaan & jawaban evaluasi yang realistis
  const daftarPertanyaan = useMemo(() => {
    return adaptasiRiwayatChatKeEvaluasi(riwayatChat, bahasa === 'en' ? 'en' : 'id');
  }, [riwayatChat, bahasa]);

  // Hitung metrik 4 pilar & skor ringkasan
  const metrik = useMemo(() => {
    return hitungMetrikTelemetri(daftarPertanyaan, skorTelemetri);
  }, [daftarPertanyaan, skorTelemetri]);

  // State Accordion per pertanyaan (Default pertanyaan pertama terbuka)
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (daftarPertanyaan.length > 0) {
      initial[daftarPertanyaan[0].id] = true;
    }
    return initial;
  });

  const handleToggle = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleBukaSemua = () => {
    const semua: Record<string, boolean> = {};
    daftarPertanyaan.forEach((q) => {
      semua[q.id] = true;
    });
    setOpenIds(semua);
  };

  const handleTutupSemua = () => {
    setOpenIds({});
  };

  // Unduh Laporan PDF melalui Web Print Dialog dengan style teroptimasi
  const handleUnduhPDF = () => {
    // Buka semua accordion agar ter-print lengkap
    handleBukaSemua();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Label mode interaksi yang ramah dibaca
  const labelModeTeks = useMemo(() => {
    if (modeSimulasi === 'video') {
      return bahasa === 'en' ? 'Video & Body Language Mode' : 'Mode Video & Bahasa Tubuh';
    }
    if (modeSimulasi === 'suara') {
      return bahasa === 'en' ? 'Dedicated Voice Mode' : 'Mode Interaksi Suara';
    }
    return bahasa === 'en' ? 'Interactive Text Mode' : 'Mode Percakapan Teks';
  }, [modeSimulasi, bahasa]);

  // Penentuan status kelayakan umum berdasarkan skor riil
  const statusLabel = useMemo(() => {
    if (metrik.skorKeseluruhan >= 85) return dict.bento.statusSangatBaik;
    if (metrik.skorKeseluruhan >= 70) return dict.bento.statusBaik;
    if (metrik.skorKeseluruhan >= 50) return dict.bento.statusCukup;
    if (metrik.skorKeseluruhan >= 30) return dict.bento.statusPerluLatihan;
    return dict.bento.statusTidakLolos;
  }, [metrik.skorKeseluruhan, dict]);

  const tagPersentil = useMemo(() => {
    const bidang = bahasa === 'en' ? 'Financial' : 'Finansial';
    return dict.bento.tagPersentil(metrik.persentilKandidat, bidang);
  }, [metrik.persentilKandidat, dict, bahasa]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] font-sans antialiased pb-28 md:pb-16 print:bg-white print:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* ======================================================== */}
        {/* SECTION 1: HEADER & METADATA ACTIONS                     */}
        {/* ======================================================== */}
        <header className="space-y-4 pb-4 border-b border-stone-200/80 print:border-none">
          {/* Top Bar: Navigasi Kembali & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={onKembaliKeStudio}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors min-h-[44px] cursor-pointer shadow-2xs self-start print:hidden"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600" />
              <span>{dict.header.kembaliKeStudio}</span>
            </button>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5 print:hidden">
              <button
                type="button"
                onClick={onKembaliKeStudio}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold transition-colors min-h-[44px] cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-4 h-4 text-stone-600" />
                <span>{dict.header.latihUlang}</span>
              </button>

              <button
                type="button"
                onClick={handleUnduhPDF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-extrabold transition-colors min-h-[44px] cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{dict.header.unduhPdf}</span>
              </button>
            </div>
          </div>

          {/* Judul & Deskripsi Utama */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100/70 text-[#EA580C] text-[11px] font-extrabold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Scorecard & Feedback Panel</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#18181B] tracking-tight">
              {dict.header.judulLaporan}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              {dict.header.subjudulLaporan}
            </p>
          </div>

          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Pill Posisi Target */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-2xs text-xs font-bold text-stone-800">
              <Briefcase className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500 font-medium">{dict.header.labelPosisi}:</span>
              <span className="text-stone-900">{targetRole}</span>
            </div>

            {/* Pill Mode Simulasi */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-2xs text-xs font-bold text-stone-800">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500 font-medium">{dict.header.labelMode}:</span>
              <span className="text-[#EA580C]">{labelModeTeks}</span>
            </div>

            {/* Pill Durasi Sesi */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-2xs text-xs font-bold text-stone-800">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500 font-medium">{dict.header.labelDurasi}:</span>
              <span className="text-stone-900 font-mono">{metrik.durasiSesiFormatted}</span>
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* SECTION 2: BENTO GRID 3 KOLOM RINGKASAN                  */}
        {/* ======================================================== */}
        <section aria-label="Ringkasan Evaluasi Bento Grid">
          <BentoSummaryGrid
            skorKeseluruhan={metrik.skorKeseluruhan}
            persentil={metrik.persentilKandidat}
            statusLabel={statusLabel}
            tagPersentilText={tagPersentil}
            metodeCar={metrik.metodeCar}
            komunikasi={metrik.komunikasi}
            penguasaanTeknis={metrik.penguasaanTeknis}
            bahasaTubuh={metrik.bahasaTubuh}
            kutipanBina={metrik.kutipanEvaluasiBina}
            catatanPostur={metrik.catatanPosturDominan}
            dict={dict}
          />
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: EVALUASI MENDALAM PER PERTANYAAN (ACCORDION)   */}
        {/* ======================================================== */}
        <section className="space-y-4 pt-2" aria-label="Detail Evaluasi Per Pertanyaan">
          {/* Header Bagian Accordion & Kontrol Expand */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#18181B] tracking-tight">
                {dict.accordion.judulBagian}
              </h2>
              <p className="text-xs text-stone-600 leading-normal">
                {dict.accordion.subjudulBagian}
              </p>
            </div>

            {/* Tombol Buka / Tutup Semua */}
            <div className="flex items-center gap-2 shrink-0 print:hidden">
              <button
                type="button"
                onClick={handleBukaSemua}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-600 bg-white hover:bg-stone-100 border border-stone-200 transition-colors min-h-[36px] cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>{dict.accordion.bukaSemua}</span>
              </button>
              <button
                type="button"
                onClick={handleTutupSemua}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-600 bg-white hover:bg-stone-100 border border-stone-200 transition-colors min-h-[36px] cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>{dict.accordion.tutupSemua}</span>
              </button>
            </div>
          </div>

          {/* List Accordion Pertanyaan */}
          <div className="space-y-3 sm:space-y-4">
            {daftarPertanyaan.map((item) => (
              <QuestionAccordionItem
                key={item.id}
                item={item}
                isOpen={!!openIds[item.id]}
                onToggle={() => handleToggle(item.id)}
                dict={dict}
              />
            ))}
          </div>
        </section>

      </div>

      {/* ======================================================== */}
      {/* SECTION 4: MOBILE STICKY FOOTER ACTIONS (< 768px)        */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 sm:hidden z-40 shadow-lg safe-bottom print:hidden">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onKembaliKeStudio}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-300 bg-white active:bg-stone-100 text-stone-800 text-xs font-extrabold transition-colors min-h-[44px] cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-stone-600" />
            <span>{dict.footerMobile.latihUlangCta}</span>
          </button>

          <button
            type="button"
            onClick={handleUnduhPDF}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#EA580C] active:bg-orange-700 text-white text-xs font-extrabold transition-colors min-h-[44px] cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{dict.footerMobile.unduhPdfCta}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default LaporanEvaluasiWawancara;
