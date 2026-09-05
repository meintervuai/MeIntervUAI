-- =============================================================
-- 002_kuota_harian_20.sql
-- MENTERVU AI — Kuota AI: 20 panggilan per user per hari kalender.
-- Wajib dijalankan SETELAH 001.
-- =============================================================

-- Kolom baru di profil
ALTER TABLE public.profil
  ADD COLUMN IF NOT EXISTS batas_panggilan_harian integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS terakhir_reset_kuota    date     NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS peran                   text     NOT NULL DEFAULT 'pengguna'
    CHECK (peran IN ('pengguna','admin'));

-- Kolom lama (berbasis token) ditandai deprecated, dipertahankan utk rollback
ALTER TABLE public.profil RENAME COLUMN ai_quota_limit  TO batas_token_ai;   -- legacy
ALTER TABLE public.profil RENAME COLUMN ai_tokens_used  TO token_ai_terpakai;-- legacy

-- Seed pengaturan kuota global
INSERT INTO public.pengaturan_kuota_ai (kunci_pengaturan, nilai_pengaturan, deskripsi)
VALUES ('kuota_harian_panggilan', 20, 'Batas panggilan AI per pengguna per hari kalender (lazy reset saat tanggal berganti)')
ON CONFLICT (kunci_pengaturan)
DO UPDATE SET nilai_pengaturan = EXCLUDED.nilai_pengaturan,
              deskripsi        = EXCLUDED.deskripsi,
              diperbarui_pada  = now();

-- Backfill pengguna yang ada (agar langsung punya batas 20 & tanggal reset hari ini)
UPDATE public.profil
   SET terakhir_reset_kuota = CURRENT_DATE,
       token_hari_ini       = 0
 WHERE terakhir_reset_kuota IS NULL;

-- =============================================================
-- Perbarui trigger handle_new_user (dipicu on_auth_user_created)
-- agar menulis ke tabel/kolom BERNAMA BARU. Tanpa ini, login user
-- baru akan gagal setelah rename 001.
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profil (id, email, nama_lengkap, url_avatar, status_akun, bahasa,
                             batas_panggilan_harian, terakhir_reset_kuota, token_hari_ini)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    'aktif',
    'id',
    20,
    CURRENT_DATE,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$function$;