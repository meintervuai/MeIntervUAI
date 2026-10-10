# Standar Pengujian & Keamanan: IntervU AI (OT-01 s.d OT-02)

Ruang lingkup: Pengujian kualitas (QA), keamanan berkas, dan pemisahan file rahasia dari git.

## Aturan

### OT-01: AI Bertindak Sebagai QA / Penguji Kualitas
Sebelum menyatakan suatu fitur selesai, lakukan pengujian fungsional dan keamanan:
- Pengujian fungsional otomatis dengan runner pengujian (`pytest backend/tests`).
- Pengujian typechecking dan kompilasi build frontend (`npm run build`).
- Penyusunan laporan temuan dan status hasil pengujian.

### OT-02: Kelengkapan .gitignore & Perlindungan File Sensitif
- File `.gitignore` wajib mencakup seluruh dependensi (`node_modules/`, `venv/`), file build (`dist/`), file log, dan file kredensial rahasia (`.env`, `*.env`).
- Dilarang keras melakukan commit terhadap API key, secret token, atau connection string database.
