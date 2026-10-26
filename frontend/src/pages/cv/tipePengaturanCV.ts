// Tipe Konfigurasi Styling & Template CV ATS (src/pages/cv/tipePengaturanCV.ts)
// Mematuhi DB-01 (JSONB), FE-04 (Dwibahasa i18n), dan standar resmi 5 template ATS

export type TemplateId = 
  | 'ivy_classic' 
  | 'tech_silicon' 
  | 'bumn_nasional' 
  | 'europass_slate' 
  | 'executive_din'
  | 'modern_ats';

export type UkuranKertas = 'a4' | 'letter';
export type UkuranMargin = 'kompak' | 'standar' | 'lega';

export interface KonfigurasiVisualCV {
  templateId: TemplateId;
  ukuranKertas: UkuranKertas;
  margin: UkuranMargin;
  warnaAksen: string; // Hex color e.g. '#111827', '#1E3A8A', '#C84B31'
  ukuranTitle: number; // px, range 20 - 28 (default 24)
  ukuranSubtitle: number; // px, range 12 - 16 (default 14)
  ukuranH1: number; // px, range 13 - 18 (default 14)
  ukuranH2H3: number; // px, range 11 - 14 (default 12)
  ukuranBody: number; // px, range 10 - 12 (default 11)
  tampilkanFoto: boolean; // Menampilkan pasfoto formal di header (standar BUMN & DIN 5008)
  urlFoto?: string; // URL foto kustom atau dari profil akun
  posisiFoto?: 'kanan' | 'kiri'; // Posisi pasfoto di header (kanan standar DIN/Europass, kiri alternatif BUMN)
}

export const DEFAULT_KONFIGURASI_VISUAL: KonfigurasiVisualCV = {
  templateId: 'ivy_classic',
  ukuranKertas: 'a4',
  margin: 'standar',
  warnaAksen: '#111827',
  ukuranTitle: 24,
  ukuranSubtitle: 14,
  ukuranH1: 14,
  ukuranH2H3: 12,
  ukuranBody: 11,
  tampilkanFoto: false,
  urlFoto: '',
};

export const PRESET_WARNA_PROFESIONAL = [
  { id: 'noir', nama: 'Classic Noir', hex: '#111827' },
  { id: 'navy', nama: 'Executive Navy', hex: '#1E3A8A' },
  { id: 'slate', nama: 'Corporate Slate', hex: '#334155' },
  { id: 'emerald', nama: 'Forest Emerald', hex: '#065F46' },
  { id: 'burgundy', nama: 'Deep Burgundy', hex: '#881337' },
  { id: 'amber', nama: 'IntervU Amber', hex: '#C84B31' },
];
