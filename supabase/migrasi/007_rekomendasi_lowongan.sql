-- =============================================================
-- 007_rekomendasi_lowongan.sql
-- MENTERVU AI — Skema Tabel Lowongan Kerja & Rekomendasi AI (Milestone 5)
-- Sesuai database.md §5.6 & PRD FR-16, FR-17, FR-18
-- =============================================================

-- 1. Tambah kolom perusahaan_target pada sesi_wawancara (jika belum ada)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'sesi_wawancara' 
          AND column_name = 'perusahaan_target'
    ) THEN
        ALTER TABLE public.sesi_wawancara ADD COLUMN perusahaan_target text;
    END IF;
END $$;

COMMENT ON COLUMN public.sesi_wawancara.perusahaan_target IS 'Nama perusahaan target wawancara kerja yang dipilih atau diinput mandiri oleh pengguna';

-- 2. Tabel lowongan
CREATE TABLE IF NOT EXISTS public.lowongan (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    judul               text NOT NULL,
    perusahaan          text NOT NULL,
    lokasi              text NOT NULL DEFAULT 'Jakarta, Indonesia',
    tipe_kerja          text NOT NULL DEFAULT 'Full-time' CHECK (tipe_kerja IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance')),
    sistem_kerja        text NOT NULL DEFAULT 'Hybrid' CHECK (sistem_kerja IN ('On-site', 'Hybrid', 'Remote')),
    tingkat_pengalaman  text NOT NULL DEFAULT 'Mid-Level',
    gaji_min            bigint,
    gaji_maks           bigint,
    mata_uang           text NOT NULL DEFAULT 'IDR',
    url_lamaran         text,
    logo_url            text,
    deskripsi           text,
    persyaratan_skills  jsonb NOT NULL DEFAULT '[]'::jsonb,
    data_mentah         jsonb NOT NULL DEFAULT '{}'::jsonb,
    sumber              text NOT NULL DEFAULT 'Kurasi AI',
    aktif               boolean NOT NULL DEFAULT true,
    dibuat_pada         timestamptz NOT NULL DEFAULT now(),
    diperbarui_pada     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.lowongan IS 'Katalog master lowongan pekerjaan terverifikasi (FR-16)';

-- 3. Tabel rekomendasi_lowongan
CREATE TABLE IF NOT EXISTS public.rekomendasi_lowongan (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profil_id           uuid NOT NULL REFERENCES public.profil(id) ON DELETE CASCADE,
    lowongan_id         uuid NOT NULL REFERENCES public.lowongan(id) ON DELETE CASCADE,
    evaluasi_sesi_id    uuid REFERENCES public.evaluasi_sesi(id) ON DELETE SET NULL,
    skor_kecocokan      integer NOT NULL CHECK (skor_kecocokan BETWEEN 0 AND 100),
    rincian_bobot       jsonb NOT NULL DEFAULT '{}'::jsonb, -- skill: 40%, pengalaman: 30%, posisi: 20%, lokasi: 10%
    status_lamaran      text NOT NULL DEFAULT 'tersimpan' CHECK (status_lamaran IN ('tersimpan', 'dilamar', 'diabaikan', 'wawancara')),
    dibuat_pada         timestamptz NOT NULL DEFAULT now(),
    diperbarui_pada     timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unik_profil_lowongan UNIQUE (profil_id, lowongan_id)
);

COMMENT ON TABLE public.rekomendasi_lowongan IS 'Hasil pencocokan lowongan AI terhadap data CV pengguna (FR-17, FR-18)';

-- 4. Indeks performa
CREATE INDEX IF NOT EXISTS idx_lowongan_judul ON public.lowongan (judul);
CREATE INDEX IF NOT EXISTS idx_lowongan_perusahaan ON public.lowongan (perusahaan);
CREATE INDEX IF NOT EXISTS idx_lowongan_aktif ON public.lowongan (aktif);
CREATE INDEX IF NOT EXISTS idx_rekomendasi_profil_id ON public.rekomendasi_lowongan (profil_id);
CREATE INDEX IF NOT EXISTS idx_rekomendasi_skor ON public.rekomendasi_lowongan (skor_kecocokan DESC);

-- 5. Row Level Security (RLS)
ALTER TABLE public.lowongan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rekomendasi_lowongan ENABLE ROW LEVEL SECURITY;

-- lowongan: Siapa pun (pengguna terautentikasi / publik) dapat membaca lowongan aktif
DROP POLICY IF EXISTS "Lowongan dapat dibaca semua pengguna aktif" ON public.lowongan;
CREATE POLICY "Lowongan dapat dibaca semua pengguna aktif"
    ON public.lowongan FOR SELECT
    USING (aktif = true);

-- rekomendasi_lowongan: Pengguna hanya dapat mengakses rekomendasinya sendiri
DROP POLICY IF EXISTS "Pengguna dapat mengelola rekomendasi lowongan sendiri" ON public.rekomendasi_lowongan;
CREATE POLICY "Pengguna dapat mengelola rekomendasi lowongan sendiri"
    ON public.rekomendasi_lowongan FOR ALL
    USING (profil_id = auth.uid())
    WITH CHECK (profil_id = auth.uid());
