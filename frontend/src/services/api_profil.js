import { supabase } from './klien_supabase';

const TABEL = 'profil';

/** Ambil satu baris profil milik pengguna. */
export async function ambilProfil(uid) {
  const { data, error } = await supabase
    .from(TABEL)
    .select(
      'id, email, nama_lengkap, url_avatar, status_akun, posisi_target, bahasa, batas_panggilan_harian, token_hari_ini, kuota_tambahan, terakhir_reset_kuota, peran',
    )
    .eq('id', uid)
    .single();
  if (error) throw error;
  return data;
}

/** Perbarui sebagian kolom profil (RLS: hanya milik sendiri). */
export async function perbaruiProfil(uid, perubahan) {
  const { data, error } = await supabase
    .from(TABEL)
    .update(perubahan)
    .eq('id', uid)
    .select(
      'id, email, nama_lengkap, url_avatar, status_akun, posisi_target, bahasa, batas_panggilan_harian, token_hari_ini, kuota_tambahan, terakhir_reset_kuota, peran',
    )
    .single();
  if (error) throw error;
  return data;
}

/**
 * Unggah foto profil ke bucket `foto-profil` (migrasi 004) pada folder
 * milik pengguna: {uid}/avatar.{ekstensi}, lalu balas URL publik.
 */
export async function unggahAvatar(uid, berkas) {
  const ekstensi = (berkas.name.split('.').pop() || 'jpg').toLowerCase();
  const jalur = `${uid}/avatar.${ekstensi}`;

  const { error } = await supabase.storage
    .from('foto-profil')
    .upload(jalur, berkas, { upsert: true, cacheControl: '3600' });
  if (error) throw error;

  const { data } = supabase.storage.from('foto-profil').getPublicUrl(jalur);
  // Tambah penanda versi agar cache browser menyegarkan avatar lama
  const urlPublik = `${data.publicUrl}?v=${Date.now()}`;
  return perbaruiProfil(uid, { url_avatar: urlPublik });
}