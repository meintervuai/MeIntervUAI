# AGENTS.md — Panduan untuk Agen AI & Pengembang MENTERVU AI

> Baca dokumen ini **pertama** sebelum mengerjakan tugas apa pun di repositori ini.

## 1. Titik Masuk Wajib

Sebelum menulis kode, baca ketiga dokumen sumber keputusan **secara berurutan**:

1. **`prd.md`** — *apa* yang dibangun: kebutuhan produk, FR/NFR, panduan desain, milestone.
2. **`struktur_file.md`** — *di mana* menaruh kode: struktur folder, konvensi nama, peta endpoint & rute, aturan sinkronisasi.
3. **`database.md`** — *bagaimana* data disimpan: skema, relasi, RLS, kuota AI, migrasi.

Ketiganya **saling membaca** — jangan pernah mengubah salah satu tanpa menyesuaikan dua lainnya.

## 2. Konvensi Kunci

| Aspek | Aturan | Contoh |
|---|---|---|
| **Folder** | Bahasa Inggris | `models/`, `controllers/`, `services/`, `pages/`, `components/` |
| **File** | Bahasa Indonesia | `profil.py`, `Beranda.jsx`, `layanan_analisis_cv.py` |
| **Tabel & kolom DB** | Bahasa Indonesia, `snake_case` | `profil`, `sesi_wawancara`, `dibuat_pada` |
| **Endpoint API** | Bahasa Indonesia, `kebab-case` | `/api/analisis-cv`, `/api/profil` |
| **Struktur data AI (JSON)** | Bahasa Indonesia | `skor_kelengkapan`, `rekomendasi_perbaikan` |
| **Bahasa antarmuka** | Indonesia **default**, Inggris opsi | i18n `id` + `en` |
| **Kuota AI** | **20 panggilan/hari/user** | lihat `database.md` §9 |

Aturan lengkap: `struktur_file.md` §2 — Konvensi Penamaan.

## 3. Fakta Teknologi (jangan diubah tanpa pembaruan dokumen)

- **Backend:** Python FastAPI (pola MVC) → `backend/`
- **Frontend:** React + Vite + TypeScript (mobile-first) → `frontend/`
- **Database & Auth:** Supabase (PostgreSQL + RLS + Google OAuth)
- **LLM:** 2 API key Google (Gemini) + 1 API key OpenRouter → fallback otomatis
- **Kuota AI:** 20 panggilan/user/hari kalender (bukan per login)
- **Kredensial:** `.env` di root — **jangan pernah commit**
- **Video wawancara:** tidak pernah disimpan ke server mana pun

## 4. Alur Aman Mengerjakan Fitur

1. Baca PRD → tentukan FR & milestone terkait.
2. Cek `struktur_file.md` → letakkan file sesuai konvensi (folder Inggris, nama file Indonesia).
3. Cek `database.md` → tambah/ubah tabel lewat migrasi di `supabase/migrasi/`.
4. Perbarui **ketiga dokumen** jika pekerjaan menyentuh kebutuhan/struktur/data.
5. Ikuti Panduan Desain (`prd.md` §11): tanpa AI slop, warna utama oranye, ikon SVG kustom, mobile-first.

## 5. Checklist Sebelum Selesai

- [ ] Tidak ada nama file berbahasa Inggris di folder kode (nama file WAJIB Indonesia)
- [ ] Tidak ada folder berbahasa Indonesia di folder kode (folder disarankan Inggris)
- [ ] Endpoint baru tercatat di `struktur_file.md` §7
- [ ] Tabel/kolom baru tercatat di `database.md` §5
- [ ] Perilaku baru tercatat di `prd.md` §6
- [ ] Kuota AI diperhitungkan (kena hitung batas 20/hari) & dicatat di `pemakaian_ai`
- [ ] Tampilan dicek versi mobile (viewport ≤390px) sebelum desktop
- [ ] Ikon memakai SVG kustom (bukan font icon / emoji)
- [ ] Video wawancara dipastikan tidak disimpan