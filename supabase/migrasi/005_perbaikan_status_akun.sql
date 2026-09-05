-- =============================================================
-- 005_perbaikan_status_akun.sql
-- MENTERVU AI — Selaraskan nilai & default `status_akun` ke enum
-- Indonesia (aktif/dinonaktifkan/diblokir) — database.md §6.
-- =============================================================

ALTER TABLE public.profil ALTER COLUMN status_akun SET DEFAULT 'aktif';

UPDATE public.profil SET status_akun = 'aktif' WHERE status_akun = 'active';

ALTER TABLE public.profil
  ADD CONSTRAINT profil_status_akun_check
  CHECK (status_akun IN ('aktif', 'dinonaktifkan', 'diblokir'));