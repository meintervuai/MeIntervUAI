-- =============================================================
-- 006_sesi_wawancara_m3.sql
-- MENTERVU AI — Skema Tabel Simulasi Wawancara AI (Milestone 3)
-- Tabel: sesi_wawancara, pertanyaan_sesi, jawaban_sesi, evaluasi_sesi
-- Sesuai database.md §5.5 & PRD FR-09, FR-10, FR-12, FR-13
-- =============================================================

-- 1. Tabel sesi_wawancara
CREATE TABLE IF NOT EXISTS public.sesi_wawancara (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profil_id       uuid NOT NULL REFERENCES public.profil(id) ON DELETE CASCADE,
    posisi_target   text NOT NULL,
    mode            text NOT NULL CHECK (mode IN ('teks', 'audio', 'video')),
    bahasa          text NOT NULL DEFAULT 'id' CHECK (bahasa IN ('id', 'en')),
    status          text NOT NULL DEFAULT 'berlangsung' CHECK (status IN ('berlangsung', 'selesai', 'dibatalkan')),
    skor_total      integer CHECK (skor_total BETWEEN 0 AND 100),
    tanggal_mulai   timestamptz NOT NULL DEFAULT now(),
    tanggal_selesai timestamptz,
    dibuat_pada     timestamptz NOT NULL DEFAULT now(),
    diperbarui_pada timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.sesi_wawancara IS 'Riwayat sesi simulasi wawancara kerja AI (FR-09, FR-10, FR-22)';

-- 2. Tabel pertanyaan_sesi
CREATE TABLE IF NOT EXISTS public.pertanyaan_sesi (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sesi_id              uuid NOT NULL REFERENCES public.sesi_wawancara(id) ON DELETE CASCADE,
    tipe                 text NOT NULL DEFAULT 'inti' CHECK (tipe IN ('inti', 'lanjutan', 'ice_breaking')),
    pertanyaan           text NOT NULL,
    kategori             text NOT NULL,
    urutan               integer NOT NULL,
    sumber_konteks       text, -- misal: 'cv_proyek', 'cv_pengalaman', 'follow_up_jawaban'
    pertanyaan_induk_id  uuid REFERENCES public.pertanyaan_sesi(id) ON DELETE SET NULL,
    status               text NOT NULL DEFAULT 'terjawab' CHECK (status IN ('terjawab', 'dilewati', 'aktif')),
    dibuat_pada          timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.pertanyaan_sesi IS 'Daftar pertanyaan yang diajukan AI dalam suatu sesi wawancara';

-- 3. Tabel jawaban_sesi
CREATE TABLE IF NOT EXISTS public.jawaban_sesi (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pertanyaan_sesi_id   uuid NOT NULL REFERENCES public.pertanyaan_sesi(id) ON DELETE CASCADE,
    teks_mentah          text NOT NULL,
    durasi_detik         integer NOT NULL DEFAULT 0,
    skor_pertanyaan      integer CHECK (skor_pertanyaan BETWEEN 0 AND 100),
    evaluasi_singkat     text,
    jawaban_ideal        text,
    dibuat_pada          timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.jawaban_sesi IS 'Jawaban dan penilaian individual per butir pertanyaan (FR-10, FR-13)';

-- 4. Tabel evaluasi_sesi
CREATE TABLE IF NOT EXISTS public.evaluasi_sesi (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sesi_id              uuid NOT NULL REFERENCES public.sesi_wawancara(id) ON DELETE CASCADE,
    skor_total           integer NOT NULL CHECK (skor_total BETWEEN 0 AND 100),
    skor_verbal          integer,
    skor_non_verbal      integer,
    predikat             text NOT NULL,
    metrik               jsonb NOT NULL DEFAULT '{}'::jsonb, -- relevansiIsi, strukturStar, kosaKata, kepercayaanDiri
    kekuatan             jsonb NOT NULL DEFAULT '[]'::jsonb,
    area_peningkatan     jsonb NOT NULL DEFAULT '[]'::jsonb,
    rincian_evaluasi     jsonb NOT NULL DEFAULT '[]'::jsonb,
    dibuat_pada          timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.evaluasi_sesi IS 'Laporan evaluasi komprehensif setelah simulasi selesai (FR-12, FR-13)';

-- Indeks Performa
CREATE INDEX IF NOT EXISTS idx_sesi_wawancara_profil_tgl ON public.sesi_wawancara (profil_id, dibuat_pada DESC);
CREATE INDEX IF NOT EXISTS idx_pertanyaan_sesi_sesi_urutan ON public.pertanyaan_sesi (sesi_id, urutan ASC);
CREATE INDEX IF NOT EXISTS idx_jawaban_sesi_pertanyaan ON public.jawaban_sesi (pertanyaan_sesi_id);
CREATE INDEX IF NOT EXISTS idx_evaluasi_sesi_sesi ON public.evaluasi_sesi (sesi_id);

-- RLS (Row Level Security)
ALTER TABLE public.sesi_wawancara ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pertanyaan_sesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jawaban_sesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluasi_sesi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sesi_wawancara_user_access" ON public.sesi_wawancara;
CREATE POLICY "sesi_wawancara_user_access" ON public.sesi_wawancara
    FOR ALL USING (profil_id = auth.uid()) WITH CHECK (profil_id = auth.uid());

DROP POLICY IF EXISTS "pertanyaan_sesi_user_access" ON public.pertanyaan_sesi;
CREATE POLICY "pertanyaan_sesi_user_access" ON public.pertanyaan_sesi
    FOR ALL USING (EXISTS (SELECT 1 FROM public.sesi_wawancara s WHERE s.id = sesi_id AND s.profil_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.sesi_wawancara s WHERE s.id = sesi_id AND s.profil_id = auth.uid()));

DROP POLICY IF EXISTS "jawaban_sesi_user_access" ON public.jawaban_sesi;
CREATE POLICY "jawaban_sesi_user_access" ON public.jawaban_sesi
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.pertanyaan_sesi p
        JOIN public.sesi_wawancara s ON s.id = p.sesi_id
        WHERE p.id = pertanyaan_sesi_id AND s.profil_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.pertanyaan_sesi p
        JOIN public.sesi_wawancara s ON s.id = p.sesi_id
        WHERE p.id = pertanyaan_sesi_id AND s.profil_id = auth.uid()
    ));

DROP POLICY IF EXISTS "evaluasi_sesi_user_access" ON public.evaluasi_sesi;
CREATE POLICY "evaluasi_sesi_user_access" ON public.evaluasi_sesi
    FOR ALL USING (EXISTS (SELECT 1 FROM public.sesi_wawancara s WHERE s.id = sesi_id AND s.profil_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.sesi_wawancara s WHERE s.id = sesi_id AND s.profil_id = auth.uid()));
