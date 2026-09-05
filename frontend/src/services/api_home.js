import { panggilApi } from './klien_api';

/**
 * Ringkasan Home (FR-19) dari backend: kuota sisa + analisis terakhir.
 * Dipakai ketika backend FastAPI aktif; untuk M1 halaman Home memakai
 * KonteksKuota + Supabase langsung sebagai sumber utama.
 */
export async function ambilRingkasanHome() {
  try {
    return await panggilApi('/home/ringkasan');
  } catch (galat) {
    // Backend belum berjalan → fallback ke sumber langsung (Supabase)
    console.warn('[api_home] backend tidak terjangkau:', galat.message);
    return null;
  }
}