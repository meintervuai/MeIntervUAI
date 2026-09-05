import { supabase } from './klien_supabase';

/**
 * Kuota AI harian (database.md §9):
 * - lazy reset via RPC reset_kuota_harian (dibuat migrasi 003)
 * - batas efektif = batas_panggilan_harian + kuota_tambahan (bisa negatif)
 * - sisa = max(0, batas - terpakai)
 */
export async function muatKuota(uid) {
  // Lazy reset (aman dipanggil berulang; hanya efektif saat tanggal berganti)
  const { error: galatRpc } = await supabase.rpc('reset_kuota_harian', {
    profil_uid: uid,
  });
  if (galatRpc) console.warn('reset_kuota_harian:', galatRpc.message);

  const { data, error } = await supabase
    .from('profil')
    .select('batas_panggilan_harian, token_hari_ini, kuota_tambahan')
    .eq('id', uid)
    .single();
  if (error) throw error;

  const batas = Math.max(0, (data.batas_panggilan_harian ?? 20) + (data.kuota_tambahan ?? 0));
  const terpakai = data.token_hari_ini ?? 0;
  return { batas, terpakai, sisa: Math.max(0, batas - terpakai) };
}