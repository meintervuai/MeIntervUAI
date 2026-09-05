import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi Vite — MENTERVU AI (mobile-first)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
  },
});