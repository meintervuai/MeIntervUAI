-- =============================================================
-- 003_entitas_milestone_1.sql
-- MENTERVU AI — Entitas M1: riwayat_cv, penyesuaian analisis_cv,
-- seed templat_cv, trigger & fungsi, indeks.
-- Wajib dijalankan SETELAH 001 dan 002.
-- =============================================================

-- ---------- riwayat_cv (versi CV) ----------
CREATE TABLE IF NOT EXISTS public.riwayat_cv (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profil_id       uuid NOT NULL REFERENCES public.profil(id) ON DELETE CASCADE,
    templat_id      uuid REFERENCES public.templat_cv(id),
    nama_dokumen    text NOT NULL,
    data_cv         jsonb NOT NULL DEFAULT '{}'::jsonb,
    versi           integer NOT NULL DEFAULT 1,
    status          text NOT NULL DEFAULT 'aktif'
                    CHECK (status IN ('aktif','arsip','dihapus')),
    dibuat_pada     timestamptz NOT NULL DEFAULT now(),
    diperbarui_pada timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.riwayat_cv IS 'Dokumen CV dan riwayat versi (FR-04, FR-05) — database.md 5.2';

-- ---------- Penyesuaian analisis_cv (sesuai JSON prompt ATS) ----------
ALTER TABLE public.analisis_cv
  ADD COLUMN IF NOT EXISTS riwayat_cv_id         uuid REFERENCES public.riwayat_cv(id),
  ADD COLUMN IF NOT EXISTS skor_kelengkapan      integer CHECK (skor_kelengkapan BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS skor_daya_tarik       integer CHECK (skor_daya_tarik  BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ringkasan_analisis    text,
  ADD COLUMN IF NOT EXISTS rekomendasi_perbaikan jsonb NOT NULL DEFAULT '{"tambah":[],"perbaiki":[],"hapus":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS penyedia              text,
  ADD COLUMN IF NOT EXISTS model                 text,
  ADD COLUMN IF NOT EXISTS status                text NOT NULL DEFAULT 'berhasil'
                    CHECK (status IN ('berhasil','diproses','gagal'));

-- Backfill dari kolom legacy (score → skor_kelengkapan, brief_evaluation → ringkasan_analisis)
UPDATE public.analisis_cv
   SET skor_kelengkapan   = score,
       ringkasan_analisis = brief_evaluation
 WHERE skor_kelengkapan IS NULL AND score IS NOT NULL;
-- Catatan: kolom legacy (score, brief_evaluation, recommendations) DI-PERTAHANKAN
-- untuk rollback; backend membaca kolom baru (database.md §5.3).

-- ---------- Penyesuaian templat_cv (kolom baru sesuai database.md 5.4) ----------
ALTER TABLE public.templat_cv
  ADD COLUMN IF NOT EXISTS kategori         text,
  ADD COLUMN IF NOT EXISTS skema_tata_letak jsonb;

-- Rename 5 template lama (Inggris) ke nama Indonesia — data penggunaan tetap
UPDATE public.templat_cv SET nama = 'Profesional',   kategori = 'umum'          WHERE nama = 'Corporate Executive';
UPDATE public.templat_cv SET nama = 'Kreatif',       kategori = 'kreatif'       WHERE nama = 'Creative Minimalist';
UPDATE public.templat_cv SET nama = 'Modern',        kategori = 'umum'          WHERE nama = 'Modern Academic';
UPDATE public.templat_cv SET nama = 'Minimalis',     kategori = 'umum'          WHERE nama = 'Tech Professional';
UPDATE public.templat_cv SET nama = 'Lulusan Baru',  kategori = 'lulusan_baru'  WHERE nama = 'Startup Developer';

-- ---------- Triggers & fungsi ----------
CREATE OR REPLACE FUNCTION public.perbarui_waktu()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.diperbarui_pada := now();
    RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_riwayat_cv_waktu ON public.riwayat_cv;
CREATE TRIGGER trg_riwayat_cv_waktu BEFORE UPDATE ON public.riwayat_cv
FOR EACH ROW EXECUTE FUNCTION public.perbarui_waktu();

-- Profil otomatis untuk user baru (Google OAuth):
-- ditangani oleh fungsi handle_new_user() yang diperbarui di migrasi 002
-- (trigger on_auth_user_created sudah ada sejak awal di project ini).

-- Reset kuota harian (dipanggil layanan_kuota saat lazy reset)
CREATE OR REPLACE FUNCTION public.reset_kuota_harian(profil_uid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.profil
       SET token_hari_ini       = 0,
           terakhir_reset_kuota = CURRENT_DATE,
           diperbarui_pada      = now()
     WHERE id = profil_uid
       AND terakhir_reset_kuota < CURRENT_DATE;
END; $$;

-- ---------- RLS riwayat_cv & analisis_cv ----------
ALTER TABLE public.riwayat_cv ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "riwayat_cv_select_own" ON public.riwayat_cv;
DROP POLICY IF EXISTS "riwayat_cv_insert_own" ON public.riwayat_cv;
DROP POLICY IF EXISTS "riwayat_cv_update_own" ON public.riwayat_cv;
CREATE POLICY "riwayat_cv_select_own" ON public.riwayat_cv FOR SELECT
  USING (profil_id = auth.uid());
CREATE POLICY "riwayat_cv_insert_own" ON public.riwayat_cv FOR INSERT
  WITH CHECK (profil_id = auth.uid());
CREATE POLICY "riwayat_cv_update_own" ON public.riwayat_cv FOR UPDATE
  USING (profil_id = auth.uid());

-- ---------- Indeks ----------
CREATE INDEX IF NOT EXISTS idx_riwayat_cv_profil       ON public.riwayat_cv (profil_id, status);
CREATE INDEX IF NOT EXISTS idx_analisis_cv_profil_tgl  ON public.analisis_cv (profil_id, dibuat_pada DESC);
CREATE INDEX IF NOT EXISTS idx_pemakaian_ai_profil_tgl ON public.pemakaian_ai (profil_id, dibuat_pada DESC);