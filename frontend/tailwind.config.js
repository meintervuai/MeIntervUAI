/** @type {import('tailwindcss').Config} */
// Token warna & tipografi MENTERVU AI — sumber kebenaran: prd.md §11 & design/tokens.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Skala oranye (primer)
        oranye: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Netral hangat (batu/stone)
        batu: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        latar: '#FAFAF7',
        kartu: '#FFFFFF',
        // Status (hanya fungsi)
        sukses: '#16A34A',
        peringatan: '#D97706',
        bahaya: '#DC2626',
        info: '#0284C7',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        dasar: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        kartu: '0.875rem',
        tombol: '0.75rem',
      },
      boxShadow: {
        kartu: '0 1px 2px rgba(41,37,36,0.05), 0 1px 3px rgba(41,37,36,0.08)',
        terangkat: '0 4px 12px rgba(41,37,36,0.10)',
      },
      spacing: {
        'aman-bawah': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};