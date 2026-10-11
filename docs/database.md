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
Dilarang menggunakan integer auto-increment biasa. Gunakan format UID terstruktur urut per tanggal:
`<prefix><YYYYMMDD><4 digit urut>` dimulai dari `0000` tanpa pemisah.
Contoh:
- `pengguna`: `user202610110000`, `user202610110001`, `user202610110002` (prefix `user`)
- `profil_pengguna`: `prof202610110000` (prefix `prof`)
- `saldo_token`: `sald202610110000` (prefix `sald`)
- `tiket_bantuan_csm`: `tikt202610110000` (prefix `tikt`)

### DB-06: Indeks untuk Kolom Kueri Kunci
Setiap kolom yang sering digunakan untuk pencarian, pemfilteran, atau foreign key wajib memiliki indeks (misal: `idx_pengguna_email`, `idx_tiket_status`).
