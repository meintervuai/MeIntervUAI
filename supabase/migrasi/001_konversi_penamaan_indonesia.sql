-- =============================================================
-- 001_konversi_penamaan_indonesia.sql
-- MENTERVU AI — Konversi nama tabel & kolom lama (Inggris/campuran)
-- ke Bahasa Indonesia. AMAN: hanya RENAME; TIDAK menghapus data.
-- =============================================================

-- ---------- Rename tabel ----------
ALTER TABLE public.profiles            RENAME TO profil;
ALTER TABLE public.interview_sessions  RENAME TO sesi_wawancara;
ALTER TABLE public.question_bank       RENAME TO bank_pertanyaan;
ALTER TABLE public.cv_templates        RENAME TO templat_cv;
ALTER TABLE public.cv_analysis_results RENAME TO analisis_cv;
ALTER TABLE public.ai_logs             RENAME TO pemakaian_ai;
ALTER TABLE public.ai_quota_settings   RENAME TO pengaturan_kuota_ai;
ALTER TABLE public.system_settings     RENAME TO pengaturan_sistem;
ALTER TABLE public.landing_settings    RENAME TO pengaturan_landing;
ALTER TABLE public.testimonials        RENAME TO testimoni;
ALTER TABLE public.product_images      RENAME TO gambar_produk;
ALTER TABLE public.visitor_analytics   RENAME TO analitik_pengunjung;
ALTER TABLE public.site_visits         RENAME TO kunjungan_situs;

-- ---------- Rename kolom profil ----------
ALTER TABLE public.profil RENAME COLUMN full_name       TO nama_lengkap;
ALTER TABLE public.profil RENAME COLUMN avatar_url      TO url_avatar;
ALTER TABLE public.profil RENAME COLUMN account_status  TO status_akun;
ALTER TABLE public.profil RENAME COLUMN target_position TO posisi_target;
ALTER TABLE public.profil RENAME COLUMN token_today     TO token_hari_ini;
ALTER TABLE public.profil RENAME COLUMN token_month     TO token_bulan;
ALTER TABLE public.profil RENAME COLUMN sessions_today  TO sesi_hari_ini;
ALTER TABLE public.profil RENAME COLUMN quota_override  TO kuota_tambahan;
ALTER TABLE public.profil RENAME COLUMN created_at      TO dibuat_pada;
ALTER TABLE public.profil RENAME COLUMN updated_at      TO diperbarui_pada;
ALTER TABLE public.profil RENAME COLUMN dob             TO tanggal_lahir;
ALTER TABLE public.profil RENAME COLUMN city            TO kota;
ALTER TABLE public.profil RENAME COLUMN phone           TO telepon;
ALTER TABLE public.profil RENAME COLUMN last_active     TO terakhir_aktif;
ALTER TABLE public.profil RENAME COLUMN language        TO bahasa;

-- ---------- Rename kolom tabel pendukung ----------
ALTER TABLE public.templat_cv RENAME COLUMN name        TO nama;
ALTER TABLE public.templat_cv RENAME COLUMN is_active   TO is_aktif;
ALTER TABLE public.templat_cv RENAME COLUMN usage_count TO penggunaan;
ALTER TABLE public.templat_cv RENAME COLUMN created_at  TO dibuat_pada;

ALTER TABLE public.pemakaian_ai RENAME COLUMN user_id      TO profil_id;
ALTER TABLE public.pemakaian_ai RENAME COLUMN feature_name TO fitur;
ALTER TABLE public.pemakaian_ai RENAME COLUMN tokens_used  TO perkiraan_token;
ALTER TABLE public.pemakaian_ai RENAME COLUMN response     TO respons;
ALTER TABLE public.pemakaian_ai RENAME COLUMN provider     TO penyedia;
ALTER TABLE public.pemakaian_ai RENAME COLUMN created_at   TO dibuat_pada;

-- analisis_cv (dari cv_analysis_results)
ALTER TABLE public.analisis_cv RENAME COLUMN user_id    TO profil_id;
ALTER TABLE public.analisis_cv RENAME COLUMN created_at TO dibuat_pada;

ALTER TABLE public.pengaturan_kuota_ai RENAME COLUMN setting_key   TO kunci_pengaturan;
ALTER TABLE public.pengaturan_kuota_ai RENAME COLUMN setting_value TO nilai_pengaturan;
ALTER TABLE public.pengaturan_kuota_ai RENAME COLUMN description   TO deskripsi;
ALTER TABLE public.pengaturan_kuota_ai RENAME COLUMN updated_at    TO diperbarui_pada;

ALTER TABLE public.pengaturan_sistem RENAME COLUMN key        TO kunci;
ALTER TABLE public.pengaturan_sistem RENAME COLUMN value      TO nilai;
ALTER TABLE public.pengaturan_sistem RENAME COLUMN updated_at TO diperbarui_pada;

-- ---------- Konstrain FK ikut menyesuaikan (jika nama berubah)
-- PostgreSQL otomatis mengupdate FK yang merujuk tabel/kolom yang di-rename.
-- Verifikasi: select conname from pg_constraint where conrelid='public.profil'::regclass;