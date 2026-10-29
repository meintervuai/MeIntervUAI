# Standar Basis Data & Audit Mutasi: MeIntervUAI (DB-01 s.d DB-07)

Ruang lingkup: Pemilihan tipe database, relasi tabel, penamaan entitas, format ID, dokumentasi skema, dan integritas buku besar transaksi token.

## Aturan

### DB-01: Rekomendasi Tipe Database Berdasarkan Kebutuhan
Gunakan basis data relasional PostgreSQL (via Supabase) yang mendukung integritas transaksi ACID, relasi antar sesi wawancara, dan kolom fleksibel `JSONB` untuk modul CV ATS.

### DB-02: Relasi Antartabel Wajib Eksplisit
Setiap hubungan entitas harus memiliki keterhubungan kunci primer (PK) ke kunci asing (FK) secara tegas (misal: `pengguna.pengguna_id` -> `profil_pengguna.pengguna_id`).

### DB-03: Skema Wajib Didokumentasikan Secara Nyata
Skema dan DDL tabel wajib disimpan di lokasi tetap dalam repositori: `db/schema.md`.

### DB-04: Penamaan Entitas & Kolom dalam Bahasa Indonesia
- Gunakan Bahasa Indonesia, bentuk tunggal (*singular*), dan format `snake_case`.
- Contoh tabel: `pengguna`, `profil_pengguna`, `saldo_token`, `transaksi_token`, `tiket_bantuan_csm`.
- Kolom kunci primer menggunakan format `<table>_id` (contoh: `pengguna_id`, `tiket_id`).

### DB-05: Format ID Terstruktur
Dilarang menggunakan integer auto-increment biasa. Gunakan format UID terstruktur urut per tanggal:
`<prefix><YYYYMMDD><4 digit urut>` dimulai dari `0000` tanpa pemisah.
Contoh:
- `pengguna`: `user202610110000`, `user202610110001`, `user202610110002` (prefix `user`)
- `profil_pengguna`: `prof202610110000` (prefix `prof`)
- `saldo_token`: `sald202610110000` (prefix `sald`)
- `transaksi_token`: `tran202610290000` (prefix `tran`)
- `tiket_bantuan_csm`: `tikt202610110000` (prefix `tikt`)

### DB-06: Indeks untuk Kolom Kueri Kunci
Setiap kolom yang sering digunakan untuk pencarian, pemfilteran, atau foreign key wajib memiliki indeks (misal: `idx_pengguna_email`, `idx_tiket_status`).

### DB-07: Integritas Buku Besar Transaksi Token & Rekonsiliasi Saldo (Ledger Audit Trail)
Setiap mutasi saldo token wajib didampingi pencatatan buku besar atomik di tabel `transaksi_token` untuk menjaga audit trail yang tidak dapat disangkal:
- **Struktur Entitas `transaksi_token`**:
  - `transaksi_id`: Format terstruktur `tranYYYYMMDD0000` (PK).
  - `saldo_id`: Kunci asing ke `saldo_token.saldo_id`.
  - `pengguna_id`: Kunci asing ke `pengguna.pengguna_id`.
  - `jenis_transaksi`: Kategori mutasi (`penyesuaian_admin`, `simulasi_teks`, `simulasi_suara`, `simulasi_video`, `topup_midtrans`).
  - `jumlah_token`: Nilai perubahan (+ untuk penambahan, - untuk pemotongan konsumsi sesi).
  - `saldo_sebelum` & `saldo_sesudah`: Snapshot saldo riil sebelum dan sesudah mutasi.
  - `keterangan`: Rincian alasan transaksi atau nomor sesi simulasi terkait.
  - `dibuat_pada`: Timestamp UTC pencatatan transaksi.
- **Kasus Audit Nyata (Penyesuaian Saldo Pengguna Admin)**:
  - Target Pengguna: `r23agil@gmail.com` (`pengguna_id: peng202610263154`).
  - Rekonsiliasi Tabel `saldo_token`:
    - Record ID: `sald202610262334`.
    - Saldo Awal: 800 token (`total_terpakai: 335`).
    - Saldo Akhir: **1000 token** (`total_terpakai: 335`).
  - Pencatatan Ledger Tabel `transaksi_token`:
    - `transaksi_id`: `tran202610290017`.
    - `jenis_transaksi`: `penyesuaian_admin`.
    - `jumlah_token`: 200.
    - `saldo_sebelum`: 800.
    - `saldo_sesudah`: 1000.
    - `keterangan`: `Penyesuaian saldo token admin menjadi 1000 token`.
- **Katalog Tarif Pemotongan Mutasi Sesi Simulasi**:
  - `simulasi_teks`: -10 token per inisialisasi sesi.
  - `simulasi_suara`: -15 token per inisialisasi sesi (alias `audio` / `voice`).
  - `simulasi_video`: -25 token per inisialisasi sesi (alias `vid`).

