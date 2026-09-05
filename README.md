# MENTERVU AI

**Simulasi Wawancara Kerja Berbasis Kecerdasan Buatan (AI)**

Platform web untuk melatih wawancara kerja dengan AI: pembuat CV, analisis & revisi CV, simulasi wawancara (teks/audio/video), evaluasi verbal & non-verbal, serta pencocokan lowongan — mengutamakan **privasi** (video tidak pernah disimpan) dan **mobile-first**.

> Deskripsi lengkap: [`prd.md`](prd.md)

## 📚 Dokumentasi (baca secara berurutan)

| Dokumen | Isi |
|---|---|
| [`prd.md`](prd.md) | Kebutuhan produk, FR/NFR, panduan desain, prompt AI, milestone |
| [`struktur_file.md`](struktur_file.md) | Struktur folder (MVC), konvensi nama, peta endpoint & rute |
| [`database.md`](database.md) | Skema database, ERD, relasi, RLS, kuota AI |
| [`AGENTS.md`](AGENTS.md) | Panduan kerja untuk agen AI & pengembang |

> ⚠️ Ketiga dokumen utama **saling terkait** — perubahan pada salah satu wajib disinkronkan ke dua lainnya (lihat §15 di `prd.md`).

## 🛠️ Stack Teknologi

- **Frontend:** React + Vite + TypeScript + Tailwind (mobile-first)
- **Backend:** Python FastAPI (pola MVC)
- **Database & Auth:** Supabase (PostgreSQL + RLS + Google OAuth)
- **AI:** Google Gemini (2 akun) + OpenRouter (fallback) — kuota **20 panggilan/hari/user**
- **Non-verbal:** MediaPipe (client-side, video tidak disimpan)
- **PDF CV:** html2pdf.js • **Lowongan:** JSearch API

## 🚀 Menjalankan (ringkas)

```bash
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Salin `.env.example` → `.env` di masing-masing sisi dan isi kredensial dari `.env` root. Detail: [`struktur_file.md`](struktur_file.md).

## 📦 Milestone Saat Ini

**Milestone 1:** Masuk (login Google), Home (dashboard + analisis CV), CV builder, Profil.
Modul lain ditandai "Coming Soon" sampai Milestone 1 disahkan.
