# Dokumentasi Skema Basis Data IntervU AI

Dokumen ini mencatat rancangan skema basis data relasional (PostgreSQL / Supabase) sesuai aturan `antislop-vibecoding-database` (DB-01 s.d DB-06).

## Konvensi Naming & ID
1. **Nama Entitas & Kolom (DB-04)**: Menggunakan Bahasa Indonesia, bentuk tunggal (*singular*), dan format `snake_case`.
2. **Format Identifier Terstruktur (DB-05)**: `<prefix><YYYYMMDD><4 digit acak>` tanpa pemisah.
   - `pengguna`: prefix `peng` (contoh: `peng202610108391`)
   - `profil_pengguna`: prefix `prof` (contoh: `prof202610101942`)
   - `saldo_token`: prefix `sald` (contoh: `sald202610105128`)
   - `transaksi_token`: prefix `tran` (contoh: `tran202610104719`)
   - `tiket_bantuan_csm`: prefix `tikt` (contoh: `tikt202610109384`)
   - `ulasan_aplikasi`: prefix `ulas` (contoh: `ulas202610102651`)
   - `cv_pengguna`: prefix `cvvv` (contoh: `cvvv202610107293`)
   - `sesi_wawancara`: prefix `sesi` (contoh: `sesi202610103820`)
   - `evaluasi_wawancara`: prefix `eval` (contoh: `eval202610104921`)

---

## DDL Skema Tabel Tahap 1 (MVP)

```sql
-- 1. Tabel Pengguna
CREATE TABLE IF NOT EXISTS pengguna (
    pengguna_id VARCHAR(32) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    kata_sandi_hash VARCHAR(255),
    nama_pengguna VARCHAR(100) NOT NULL UNIQUE,
    peran VARCHAR(20) DEFAULT 'kandidat' CHECK (peran IN ('kandidat', 'csm', 'admin')),
    email_terverifikasi BOOLEAN DEFAULT FALSE,
    login_terakhir TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pengguna_email ON pengguna(email);
CREATE INDEX IF NOT EXISTS idx_pengguna_peran ON pengguna(peran);

-- 2. Tabel Profil Pengguna (Onboarding)
CREATE TABLE IF NOT EXISTS profil_pengguna (
    profil_id VARCHAR(32) PRIMARY KEY,
    pengguna_id VARCHAR(32) NOT NULL REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
    nama_lengkap VARCHAR(255),
    umur INTEGER,
    status_pekerjaan VARCHAR(100), -- 'mahasiswa', 'pelajar', 'pekerja', 'mencari_kerja', 'lainnya'
    jenis_kelamin VARCHAR(50),     -- 'pria', 'wanita', 'memilih_tidak_disebutkan'
    industri_impian VARCHAR(150),
    role_impian VARCHAR(150),
    nomor_telepon VARCHAR(50),
    url_foto_profil TEXT,
    preferensi_bahasa VARCHAR(10) DEFAULT 'id', -- 'id' atau 'en'
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profil_pengguna_id ON profil_pengguna(pengguna_id);

-- 3. Tabel Saldo Token (Token Metering)
CREATE TABLE IF NOT EXISTS saldo_token (
    saldo_id VARCHAR(32) PRIMARY KEY,
    pengguna_id VARCHAR(32) NOT NULL UNIQUE REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
    jumlah_saldo INTEGER DEFAULT 100 CHECK (jumlah_saldo >= 0),
    total_terpakai INTEGER DEFAULT 0,
    terakhir_diperbarui TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saldo_pengguna_id ON saldo_token(pengguna_id);

-- 4. Tabel Transaksi Token (Buku Besar / Ledger)
CREATE TABLE IF NOT EXISTS transaksi_token (
    transaksi_id VARCHAR(32) PRIMARY KEY,
    pengguna_id VARCHAR(32) NOT NULL REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
    jenis_transaksi VARCHAR(50) NOT NULL, -- 'bonus_daftar', 'pemakaian_cv', 'pemakaian_teks', 'pemakaian_suara', 'pemakaian_video', 'penyesuaian_admin'
    jumlah_token INTEGER NOT NULL,
    saldo_sebelum INTEGER NOT NULL,
    saldo_sesudah INTEGER NOT NULL,
    keterangan TEXT,
    dicatat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaksi_pengguna_id ON transaksi_token(pengguna_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_dicatat_pada ON transaksi_token(dicatat_pada);

-- 5. Tabel Tiket Bantuan CSM (CSM Publik & Pengguna)
CREATE TABLE IF NOT EXISTS tiket_bantuan_csm (
    tiket_id VARCHAR(32) PRIMARY KEY,
    nama_pengirim VARCHAR(150) NOT NULL,
    email_pengirim VARCHAR(255) NOT NULL,
    kategori_kendala VARCHAR(100) NOT NULL, -- 'simulasi', 'kuota_token', 'cv_builder', 'teknis', 'lainnya'
    subjek_pesan VARCHAR(255) NOT NULL,
    isi_pesan TEXT NOT NULL,
    status_tiket VARCHAR(30) DEFAULT 'menunggu' CHECK (status_tiket IN ('menunggu', 'diproses', 'selesai')),
    catatan_csm TEXT,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tiket_email ON tiket_bantuan_csm(email_pengirim);
CREATE INDEX IF NOT EXISTS idx_tiket_status ON tiket_bantuan_csm(status_tiket);

-- 6. Tabel Ulasan Aplikasi
CREATE TABLE IF NOT EXISTS ulasan_aplikasi (
    ulasan_id VARCHAR(32) PRIMARY KEY,
    pengguna_id VARCHAR(32) NOT NULL REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
    bintang_rating INTEGER NOT NULL CHECK (bintang_rating >= 1 AND bintang_rating <= 5),
    isi_ulasan TEXT,
    status_tanggapan VARCHAR(30) DEFAULT 'menunggu' CHECK (status_tanggapan IN ('menunggu', 'ditanggapi')),
    catatan_csm TEXT,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ulasan_pengguna_id ON ulasan_aplikasi(pengguna_id);
CREATE INDEX IF NOT EXISTS idx_ulasan_rating ON ulasan_aplikasi(bintang_rating);
```
