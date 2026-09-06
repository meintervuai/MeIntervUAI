import { supabase } from './klien_supabase';

/**
 * Layanan data CV & Riwayat Versi (FR-04, FR-05, FR-19).
 * Berinteraksi langsung dengan Supabase PostgreSQL + RLS.
 */

/** Ambil daftar CV milik pengguna */
export async function ambilDaftarCv(profilId) {
  if (!profilId) return [];
  try {
    const { data, error } = await supabase
      .from('riwayat_cv')
      .select('id, nama_dokumen, versi, status, dibuat_pada, diperbarui_pada, templat_id')
      .eq('profil_id', profilId)
      .neq('status', 'dihapus')
      .order('diperbarui_pada', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (galat) {
    console.warn('[api_cv] gagal mengambil daftar CV:', galat.message);
    return [];
  }
}

/** Ambil 1 CV paling terbaru milik pengguna */
export async function ambilCvTerbaru(profilId) {
  if (!profilId) return null;
  try {
    const { data, error } = await supabase
      .from('riwayat_cv')
      .select('id, nama_dokumen, data_cv, versi, status, dibuat_pada, diperbarui_pada, templat_id')
      .eq('profil_id', profilId)
      .neq('status', 'dihapus')
      .order('diperbarui_pada', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (galat) {
    console.warn('[api_cv] gagal mengambil CV terbaru:', galat.message);
    return null;
  }
}

/** Ambil hasil analisis CV paling terbaru */
export async function ambilAnalisisTerbaru(profilId) {
  if (!profilId) return null;
  try {
    const { data, error } = await supabase
      .from('analisis_cv')
      .select('id, riwayat_cv_id, skor_kelengkapan, skor_daya_tarik, ringkasan_analisis, rekomendasi_posisi, rekomendasi_perbaikan, dibuat_pada')
      .eq('profil_id', profilId)
      .eq('status', 'berhasil')
      .order('dibuat_pada', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (galat) {
    console.warn('[api_cv] gagal mengambil analisis terbaru:', galat.message);
    return null;
  }
}

/** Simpan atau perbarui dokumen CV ke Supabase */
export async function simpanCv(profilId, idCv, dataCv, namaDokumen = 'CV Utama') {
  if (!profilId) return null;
  try {
    if (idCv) {
      const { data, error } = await supabase
        .from('riwayat_cv')
        .update({
          nama_dokumen: namaDokumen,
          data_cv: dataCv,
          diperbarui_pada: new Date().toISOString(),
        })
        .eq('id', idCv)
        .eq('profil_id', profilId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('riwayat_cv')
        .insert({
          profil_id: profilId,
          nama_dokumen: namaDokumen,
          data_cv: dataCv,
          status: 'aktif',
          versi: 1,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  } catch (galat) {
    console.warn('[api_cv] gagal menyimpan CV:', galat.message);
    return null;
  }
}

