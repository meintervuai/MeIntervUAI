-- =============================================================
-- 004_penyimpanan_foto.sql
-- MENTERVU AI — Bucket Storage publik `foto-profil` untuk avatar
-- pengguna (FR-02). File disimpan per folder uid: {uid}/avatar.jpg
-- Wajib dijalankan SETELAH 003.
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('foto-profil', 'foto-profil', true)
ON CONFLICT (id) DO NOTHING;

-- Baca publik (avatar dipakai di UI)
CREATE POLICY "foto_profil_baca_publik" ON storage.objects
  FOR SELECT USING (bucket_id = 'foto-profil');

-- Tulis/hapus hanya ke folder milik sendiri: {auth.uid()}/...
CREATE POLICY "foto_profil_tulis_sendiri" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'foto-profil'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "foto_profil_perbarui_sendiri" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'foto-profil'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "foto_profil_hapus_sendiri" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'foto-profil'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );