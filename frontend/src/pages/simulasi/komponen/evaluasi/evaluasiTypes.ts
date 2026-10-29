// evaluasiTypes.ts - Definisi tipe data untuk Laporan Evaluasi Wawancara
import { PesanChat } from '../types';

export interface EvaluasiPertanyaanItem {
  id: string;
  nomorUrut: number;
  pertanyaan: string;
  skor: number; // 0 - 100
  kontakMataPersen: number; // 0 - 100%
  jawabanKandidat: string;
  durasiAudioDetik: number;
  audioSimulasiUrl?: string;
  kekuatanCAR: string[];
  areaPeningkatan: string[];
  koreksiPosturMediaPipe: {
    timestamp: string;
    deskripsi: string;
    derajatDeviasi?: string;
  }[];
  rekomendasiJawabanBina: string;
  poinKunciBina: string[];
}

export interface SkorTelemetriInput {
  skorKeseluruhan?: number;
  persentilKandidat?: number;
  metodeCar?: number;
  komunikasi?: number;
  penguasaanTeknis?: number;
  bahasaTubuh?: number;
  kontakMataRataRata?: number;
  catatanPosturDominan?: string;
  kutipanEvaluasiBina?: string;
  durasiSesiFormatted?: string;
}

export interface LaporanEvaluasiProps {
  onKembaliKeStudio: () => void;
  targetRole?: string;
  modeSimulasi?: string;
  riwayatChat?: PesanChat[];
  skorTelemetri?: SkorTelemetriInput;
}
