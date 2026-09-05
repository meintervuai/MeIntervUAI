/**
 * Token desain MENTERVU AI — sumber kebenaran: prd.md §11.
 * Nilai identik dengan tailwind.config.js (keduanya WAJIB sinkron).
 */

export const WARNA = {
  oranye: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // hover & aksen
    600: '#EA580C', // PRIMER: tombol utama, elemen aktif
    700: '#C2410C', // teks aksen & state tekan
    800: '#9A3412',
    900: '#7C2D12',
  },
  batu: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524', // teks utama
    900: '#1C1917',
  },
  status: {
    sukses: '#16A34A',
    peringatan: '#D97706',
    bahaya: '#DC2626',
    info: '#0284C7',
  },
};

export const TIPOGRAFI = {
  judul: '"Plus Jakarta Sans", system-ui, sans-serif',
  isi: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  skalaPx: { kecil: 12, ket: 14, dasar: 16, sub: 20, judul: 24, besar: 32 },
  tinggiBaris: 1.5,
};

export const UKURAN = {
  breakpoint: { tablet: 768, desktop: 1024 },
  sentuhMinPx: 44, // NFR-10: target sentuh minimal 44×44px
  radius: { kartu: 14, tombol: 12 },
};