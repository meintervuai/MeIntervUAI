# Standar Basis Data: IntervU AI (DB-01 s.d DB-06)

Ruang lingkup: Pemilihan tipe database, relasi tabel, penamaan entitas, format ID, dan dokumentasi skema.

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
Dilarang menggunakan integer auto-increment biasa. Gunakan format UID terstruktur:
`<prefix><YYYYMMDD><4 digit acak>` tanpa pemisah.
Contoh:
- `pengguna`: `peng202610104821`
- `saldo_token`: `sald202610101928`
- `tiket_bantuan_csm`: `tikt202610107412`

### DB-06: Indeks untuk Kolom Kueri Kunci
Setiap kolom yang sering digunakan untuk pencarian, pemfilteran, atau foreign key wajib memiliki indeks (misal: `idx_pengguna_email`, `idx_tiket_status`).
