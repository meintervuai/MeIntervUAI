# AGENTS.md — Panduan untuk Agen AI & Pengembang MENTERVU AI

> Baca dokumen ini **pertama** sebelum mengerjakan tugas apa pun di repositori ini.

## 0. PRIORITAS UTAMA: ANTI-SLOP (WAJIB & NON-NEGOTIABLE)

Seluruh agen AI yang bekerja di repositori ini **WAJIB MENJADIKAN `anti-slop` SEBAGAI PRIORITAS UTAMA** (sumber: [anti-slop](https://github.com/miqdadbadjuber/anti-slop.git)):
- Aturan tersimpan di `.agents/rules/antislop.md` dan 6 modul skill di `.agents/skills/`:
  - `antislop` (Core filter, always on — [SKILL.md](file:///c:/Users/r/Documents/Project/MeIntervUAI/.agents/skills/antislop/SKILL.md))
  - `antislop-ui` (UI & visual — [SKILL.md](file:///c:/Users/r/Documents/Project/MeIntervUAI/.agents/skills/antislop-ui/SKILL.md))
  - `antislop-copywriting` (Copy & teks — [SKILL.md](file:///c:/Users/r/Documents/Project/MeIntervUAI/.agents/skills/antislop-copywriting/SKILL.md))
  - `antislop-human` (Manusia & persona — [SKILL.md](file:///c:/Users/r/Documents/Project/MeIntervUAI/.agents/skills/antislop-human/SKILL.md))
  - `antislop-layoutmobile` (Layout mobile & responsif — [SKILL.md](file:///c:/Users/r/Documents/Project/MeIntervUAI/.agents/skills/antislop-layoutmobile/SKILL.md))
  - `antislop-code` (Komentar & struktur kode — [SKILL.md](file:///c:/Users/r/Documents/Project/MeIntervUAI/.agents/skills/antislop-code/SKILL.md))
- **Hard Gate (R-01 s/d R-38)** & **Delivery Gate** wajib dipatuhi: nol generic AI slop, tidak ada gradasi hiasan kosong, tidak ada teks placeholder klise ("elevate your career", "delve into", "game-changer"), dan antarmuka berjiwa (lively, berkarakter, purposeful).

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
4. **WAJIB SINKRONISASI DOKUMEN SETIAP PERUBAHAN**: Setiap kali selesai membuat/mengubah fitur, UI, komponen, endpoint, atau skema data, **SEGERA perbarui `prd.md`, `struktur_file.md`, dan `database.md`** sebelum mengakhiri tugas. Ini aturan mutlak agar agen AI berikutnya memiliki konteks akurat dan tidak bingung.
5. Ikuti Panduan Desain (`prd.md` §11): tanpa AI slop, warna utama oranye, ikon SVG kustom, mobile-first.

## 5. Protokol Wajib Pembaruan Dokumen (Global AI Rule)

> **ATURAN MUTLAK BAGI AGEN AI:** Jangan pernah menyelesaikan interaksi/tugas tanpa memperbarui dokumentasi proyek jika ada perubahan kode, tata letak antarmuka, komponen, endpoint, atau basis data.

Setiap agen AI yang bekerja di repositori ini WAJIB memeriksa dan memperbarui:
1. **`prd.md`**:
   - Catat perilaku fitur baru atau perubahan spesifikasi UI/UX di §5 (Lima Pilar) atau §6 (Functional Requirements).
   - Catat perubahan interaksi, navigasi responsif/mobile (seperti tab navigation, modal ke inline box, sticky preview), dan komponen di §11 (Panduan Desain & UI/UX).
2. **`struktur_file.md`**:
   - Daftarkan setiap file atau komponen baru yang dibuat (misal di `components/`, `pages/`, `services/`, `utils/`).
   - Perbarui peta modul di §4 (Backend) & §5 (Frontend).
   - Catat endpoint baru atau perubahan controller di §7.
3. **`database.md`**:
   - Catat penambahan tabel, kolom, indeks, enum, atau kebijakan RLS baru di §5 dan §11.
   - Perbarui catatan kuota jika ada perubahan logika kuota AI di §9.

## 6. Checklist Sebelum Selesai

- [ ] **DOKUMENTASI DIPERBARUI:** `prd.md`, `struktur_file.md`, dan `database.md` telah disinkronkan dengan kode terkini
- [ ] Tidak ada nama file berbahasa Inggris di folder kode (nama file WAJIB Indonesia)
- [ ] Tidak ada folder berbahasa Indonesia di folder kode (folder disarankan Inggris)
- [ ] Endpoint baru tercatat di `struktur_file.md` §7
- [ ] Tabel/kolom baru tercatat di `database.md` §5
- [ ] Perilaku/fitur/UI baru tercatat di `prd.md` §5, §6, atau §11
- [ ] Kuota AI diperhitungkan (kena hitung batas 20/hari) & dicatat di `pemakaian_ai`
- [ ] **LULUS FILTER ANTI-SLOP:** Bebas AI Slop (Hard Gate R-01 s/d R-38 & Delivery Gate) per `.agents/rules/antislop.md`
- [ ] Tampilan dicek versi mobile (viewport ≤390px) sebelum desktop
- [ ] Ikon memakai SVG kustom (bukan font icon / emoji)
- [ ] Video wawancara dipastikan tidak disimpan