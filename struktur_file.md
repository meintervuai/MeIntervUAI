# struktur_file.md — Struktur File & Konvensi — MENTERVU AI

| Atribut | Nilai |
|---|---|
| **Status dokumen** | Draft v0.1 |
| **Terakhir diperbarui** | 2026-09-06 |
| **Dokumen terkait** | [`prd.md`](prd.md) • [`database.md`](database.md) • [`AGENTS.md`](AGENTS.md) |
| **Sumber acuan** | `SRS.docx` |

> ⚙️ Dokumen ini menjelaskan **di mana** kode diletakkan dan **bagaimana** menamainya, serta **saling terkait** dengan `prd.md` (*apa*) dan `database.md` (*data*). Lihat [§10](#10-aturan-sinkronisasi-3-dokumen) untuk aturan sinkronisasi.

---

## 1. Tujuan & Cara Pakai

1. Baca sebelum membuat folder/file baru.
2. Patuhi **konvensi penamaan** (§2) — folder Bahasa Inggris, file Bahasa Indonesia.
3. Setiap endpoint/rute baru wajib didaftarkan di §7–§8.
4. Setiap file yang menyentuh data wajib berpijak ke skema di `database.md`.

## 2. Konvensi Penamaan

| Aspek | Aturan | Contoh |
|---|---|---|
| **Folder** | Bahasa Inggris (`snake_case` / `kebab-case`) | `models/`, `controllers/`, `services/`, `pages/`, `components/` |
| **File Python** | Bahasa Indonesia, `snake_case` | `profil.py`, `layanan_analisis_cv.py`, `pengarah_rute_llm.py` |
| **File Frontend** | Bahasa Indonesia: komponen `PascalCase.jsx`, modul `snake_case.js` | `Beranda.jsx`, `KartuSkorCv.jsx`, `api_analisis_cv.js` |
| **Tabel & kolom DB** | Bahasa Indonesia, `snake_case`, tunggal | `profil`, `sesi_wawancara`, `dibuat_pada` |
| **Endpoint API** | Bahasa Indonesia, `kebab-case`, berawalan `/api/` | `/api/analisis-cv`, `/api/profil` |
| **Kunci JSON AI** | Bahasa Indonesia | `skor_kelengkapan`, `rekomendasi_perbaikan` |
| **Rute frontend** | Bahasa Indonesia, `kebab-case` | `/home`, `/masuk`, `/pembuat-cv` |
| **Environment var** | `UPPER_SNAKE_CASE` | `SUPABASE_URL`, `GOOGLE_API_KEY_1` |

> **Istilah teknis** yang tetap dipertahankan meski berbahasa Inggris: LLM, API, JSON, JWT, OAuth, HTTP, RLS, OTP, PDF — karena tidak ada padanan baku yang lebih singkat.

---

## 3. Pohon Struktur Repositori

```
MeIntervUAI/                          # ROOT
├─ .env                               # kredensial (JANGAN commit)
├─ .env.example                       # contoh kredensial
├─ README.md                          # ringkasan proyek
├─ AGENTS.md                          # panduan agen AI/pengembang (baca pertama)
├─ prd.md                             # kebutuhan produk (apa)
├─ struktur_file.md                   # dokumen ini (di mana)
├─ database.md                        # skema data (data)
├─ supabase/
│  └─ migrasi/                        # migrasi SQL (versi diurutkan)
│     ├─ 001_konversi_penamaan_indonesia.sql
│     ├─ 002_kuota_harian_20.sql
│     ├─ 003_entitas_milestone_1.sql
│     ├─ 004_penyimpanan_foto.sql
│     └─ 005_perbaikan_status_akun.sql
├─ backend/                           # Python FastAPI (Controller + Model + Service)
│  ├─ .env.example
│  ├─ requirements.txt
│  ├─ pyproject.toml
│  ├─ main.py                         # entry point uvicorn
│  ├─ app/
│  │  ├─ __init__.py
│  │  ├─ config/                      # konfigurasi, keamanan, klien supabase
│  │  │  ├─ __init__.py
│  │  │  ├─ pengaturan.py
│  │  │  ├─ keamanan.py
│  │  │  └─ klien_supabase.py
│  │  ├─ models/                      # (M) akses data / representasi entitas
│  │  │  ├─ __init__.py
│  │  │  ├─ profil.py
│  │  │  ├─ riwayat_cv.py
│  │  │  ├─ analisis_cv.py
│  │  │  ├─ templat_cv.py
│  │  │  └─ pemakaian_ai.py
│  │  ├─ controllers/                 # (C) REST routes FastAPI
│  │  │  ├─ __init__.py
│  │  │  ├─ otentikasi.py
│  │  │  ├─ keluar.py
│  │  │  ├─ home.py
│  │  │  ├─ profil.py
│  │  │  ├─ cv.py
│  │  │  ├─ analisis_cv.py
│  │  │  └─ kuota.py
│  │  ├─ services/                    # logika bisnis (dipanggil controllers)
│  │  │  ├─ __init__.py
│  │  │  ├─ layanan_profil.py
│  │  │  ├─ layanan_cv.py
│  │  │  ├─ layanan_analisis_cv.py
│  │  │  ├─ layanan_kuota.py
│  │  │  └─ ai/                       # gateway LLM
│  │  │     ├─ __init__.py
│  │  │     ├─ pengarah_rute_llm.py   # fallback: gemini1 → gemini2 → openrouter
│  │  │     ├─ penyedia_google_1.py
│  │  │     ├─ penyedia_google_2.py
│  │  │     ├─ penyedia_openrouter.py
│  │  │     ├─ pengawas_kuota.py      # cek batas 20/hari
│  │  │     ├─ normalisasi_skor.py
│  │  │     └─ prompt/
│  │  │        ├─ analisis_cv_ats.txt # prompt resmi (prd.md §9)
│  │  │        └─ evaluasi_umum.txt
│  │  ├─ schemas/                     # Pydantic (validasi request/response)
│  │  │  ├─ __init__.py
│  │  │  ├─ permintaan_profil.py
│  │  │  ├─ permintaan_cv.py
│  │  │  ├─ permintaan_analisis_cv.py
│  │  │  ├─ respons_analisis_cv.py
│  │  │  └─ respons_umum.py
│  │  └─ utils/
│  │     ├─ __init__.py
│  │     ├─ respons_standar.py
│  │     └─ validasi_json.py          # ekstrak & perbaiki JSON dari LLM
│  └─ tests/
│     ├─ test_otentikasi.py
│     ├─ test_analisis_cv.py
│     └─ test_kuota.py
└─ frontend/                          # React + Vite + TS (View)
   ├─ .env.example
   ├─ index.html
   ├─ package.json
   ├─ vite.config.ts
   ├─ tsconfig.json
   ├─ tailwind.config.js
   └─ src/
      ├─ main.tsx
      ├─ App.tsx                      # definisi rute + proteksi
      ├─ index.css
      ├─ vite-env.d.ts                # deklarasi import.meta.env (istilah teknis)
      ├─ design/                      # design system (prd.md §11)
      │  ├─ tokens.js                 # warna, tipografi, radius, spacing
      │  ├─ globals.css
      │  └─ cek_aksesibilitas.js
      ├─ pages/                       # halaman (route-level)
      │  ├─ Beranda.jsx               # landing publik (guest)
      │  ├─ Masuk.jsx                 # login Google
      │  ├─ Home.jsx                  # dashboard + bagian Analisis CV
      │  ├─ PembuatCv.jsx             # daftar CV + pilih template
      │  ├─ EditorCv.jsx              # editor CV bertahap (autosave 30 dtk)
      │  ├─ AnalisisCv.jsx            # detail hasil analisis (atau diatas Home)
      │  ├─ Profil.jsx
      │  └─ Segera.jsx                # halaman "Segera Hadir" (modul non-M1)
      ├─ components/                  # komponen UI reuse
      │  ├─ TataLetak.jsx             # kerangka halaman terproteksi (header+nav)
      │  ├─ NavbarBawah.jsx           # bottom nav mobile
      │  ├─ PelindungRute.jsx         # guard: belum login → /masuk
      │  ├─ KartuKuota.jsx
      │  ├─ KartuTindakan.jsx         # ubin tindakan cepat (badge "Segera")
      │  ├─ KartuSkorCv.jsx
      │  ├─ DaftarPosisi.jsx
      │  ├─ BagianPerbaikanCv.jsx
      │  ├─ SkeletonAnalisis.jsx
      │  └─ cv/                       # komponen fitur CV & analisis
      │     ├─ KotakAnalisisCv.jsx    # kartu analisis AI inline persisten di Home
      │     ├─ ModalAnalisisCv.jsx    # re-export backward-compat
      │     ├─ IkonMediaSosial.jsx    # SVG kustom untuk 6 platform media sosial
      │     └─ PratinjauCv.jsx        # render lembar A4 CV 5 template
      ├─ components/icons/            # SVG kustom (dilarang font icon/emoji)
      │  ├─ IkonLogo.jsx
      │  ├─ IkonHome.jsx
      │  ├─ IkonProfil.jsx
      │  ├─ IkonCv.jsx
      │  ├─ IkonSimulasi.jsx
      │  ├─ IkonLowongan.jsx
      │  ├─ IkonAnalisis.jsx
      │  ├─ IkonKuota.jsx
      │  ├─ IkonPerisai.jsx
      │  ├─ IkonGoogle.jsx
      │  ├─ IkonKeluar.jsx
      │  └─ IkonPlus.jsx
      ├─ services/                    # klien Supabase & API backend
      │  ├─ klien_supabase.js         # createClient (anon key + RLS)
      │  ├─ klien_api.js
      │  ├─ api_otentikasi.js
      │  ├─ api_home.js
      │  ├─ api_profil.js
      │  ├─ api_kuota.js
      │  ├─ api_cv.js
      │  └─ api_analisis_cv.js
      ├─ contexts/                    # state global React
      │  ├─ KonteksOtentikasi.jsx
      │  ├─ KonteksKuota.jsx
      │  └─ KonteksBahasa.jsx
      ├─ hooks/
      │  ├─ pakai_kuota.js
      │  └─ pakai_analisis_cv.js
      ├─ i18n/
      │  ├─ terjemahan_id.ts          # default
      │  └─ terjemahan_en.ts
      ├─ types/
      │  ├─ entitas.ts                # mencerminkan database.md
      │  └─ respons_api.ts
      └─ utils/
         ├─ pemformat.js
         └─ pembersih_cv.js           # buang field foto/base64 sebelum kirim ke AI
```

---

## 4. Backend — Detail Modul (FastAPI, MVC)

**Alur request:** `main.py` (registrasi router) → `controllers/*` (validasi + HTTP) → `services/*` (logika bisnis) → `models/*` (akses Supabase) → DB. Semua answer melalui `utils/respons_standar.py`.

| Modul | Tanggung jawab | Catatan |
|---|---|---|
| `config/pengaturan.py` | Baca `.env` (Supabase, Google OAuth, LLM keys) | package via `pydantic-settings` |
| `config/keamanan.py` | Dependency `pengguna_aktif()`, verifikasi JWT Supabase | Baca klaim `sub` sebagai `profil_id` |
| `config/klien_supabase.py` | Inisialisasi client `supabase-py` (service key untuk server-side) | Tersedia global |
| `models/*` | Fungsi CRUD per entitas via PostgREST | 1 file = 1 tabel (`database.md`) |
| `controllers/otentikasi.py` | Login check, keluar, sesi saat ini | Google OAuth diselesaikan di frontend via Supabase JS; backend verifikasi token |
| `controllers/home.py` | Ringkasan Home (kuota, analisis terakhir, aksi cepat) | M1 |
| `controllers/cv.py` | CRUD `riwayat_cv`, pilih template, autosave | M1 |
| `controllers/analisis_cv.py` | Jalankan analisis, ambil hasil terkini | M1 + kuota |
| `controllers/kuota.py` | Sisa kuota hari ini | M1 |
| `services/layanan_kuota.py` | Lazy reset harian, cek & tambah pemakaian | Memakai `pengawas_kuota.py` |
| `services/ai/pengarah_rute_llm.py` | Orkestrasi: cek kuota → coba gemini1 → gemini2 → openrouter | Satu antarmuka `kirim_prompt(...)` |
| `services/ai/pengawas_kuota.py` | Blokir jika ≥ batas; catat `pemakaian_ai` | HTTP 429 saat habis |
| `services/ai/normalisasi_skor.py` | Paksa skor 0–100, rata-ratakan antar model bila perlu | |
| `services/layanan_analisis_cv.py` | Bangun konteks (buang base64), muat prompt, kirim, simpan `analisis_cv` | Cache bila CV tak berubah |
| `utils/validasi_json.py` | Ekstrak JSON dari respons LLM (buang ```json ...```), reparsing dasar | |

## 5. Frontend — Detail Modul (React, View)

| Modul | Tanggung jawab |
|---|---|
| `design/tokens.js` | Semua variabel desain dari `prd.md` §11 (warna, tipografi, radius, spacing, breakpoints) |
| `design/globals.css` | Reset, kelas utilitas dasar, `color-scheme`, focus ring oranye |
| `pages/Masuk.jsx` | Tombol "Masuk dengan Google" via `supabase.auth.signInWithOAuth`, redirect |
| `pages/Home.jsx` | FR-19: Dashboard utama dengan **Mobile Tab Navigation** (Ringkasan, Analisis CV, Profil CV) persisten (`localStorage` + `?tab=`), KartuKuota, dan kotak inline `KotakAnalisisCv` |
| `pages/PembuatCv.jsx` | Form interaktif CV builder bertahap + **sidebar pratinjau A4 sticky** pada desktop & toggle mode pada mobile |
| `pages/EditorCv.jsx` | Form bertahap + autosave 30 dtk (debounce) ke `POST /api/cv` |
| `pages/AnalisisCv.jsx` | Detail hasil: KartuSkorCv + DaftarPosisi + BagianPerbaikanCv (render dari DB) |
| `components/cv/KotakAnalisisCv.jsx` | Kotak inline persisten Analisis CV AI di Home (skor ATS/HR, evaluasi, interactive chips konfirmasi posisi, saran perbaikan) |
| `components/cv/IkonMediaSosial.jsx` | Komponen SVG kustom untuk 6 platform media sosial (LinkedIn, GitHub, Website/Portofolio, Twitter/X, Instagram, Facebook) |
| `components/cv/PratinjauCv.jsx` | Render lembar A4 CV langsung di browser untuk 5 template (ATS Friendly, Kronologis, Fungsional, Kombinasi, Kreatif) |
| `components/PelindungRute.jsx` | Cek `KonteksOtentikasi`; belum login → redirect `/masuk` |
| `components/icons/*` | SVG inline kustom (`aria-label` wajib) — lihat `prd.md` §11.4 |
| `contexts/KonteksKuota.jsx` | Menyimpan sisa kuota; diperbarui setelah panggilan AI |
| `contexts/KonteksBahasa.jsx` | `bahasa` aktif (id default), dari `profil.bahasa`; kunci: `terjemahan_<kode>.ts` |
| `hooks/pakai_analisis_cv.js` | State: diam / memproses (skeleton) / hasil / error(429) |
| `services/api_*.js` | Pembungkus fetch ke `/api/*`; sertakan `Authorization: Bearer <jwt>` |
| `utils/pembersih_cv.js` | Menghapus field gambar/base64 dari `data_cv` sebelum kirim ke analisis |

---

## 6. Supabase — Migrasi & Seed

- Semua perubahan skema lewat file SQL di `supabase/migrasi/`, **diurutkan 001, 002, …**.
- Setelah menulis migrasi baru, perbarui `database.md` §5 & §11 (status migrasi) + tambahkan referensi di tabel endpoint (jika menambah kolom).
- Jangan commit kredensial; `supabase` CLI config (jika dipakai) di file `.env.local` terpisah.

| File migrasi | Isi | Status |
|---|---|---|
| `001_konversi_penamaan_indonesia.sql` | `RENAME TABLE/COLUMN` dari nama lama (Inggris) → nama Indonesia | ✅ diterapkan (live) |
| `002_kuota_harian_20.sql` | Tambah `batas_panggilan_harian` (20), `terakhir_reset_kuota`; seed `kuota_harian_panggilan`; perbaiki `handle_new_user()` | ✅ diterapkan (live) |
| `003_entitas_milestone_1.sql` | `riwayat_cv` + penyesuaian `analisis_cv` + rename `templat_cv` (5 template Indonesia) + trigger/fungsi + RLS + indeks | ✅ diterapkan (live) |
| `004_penyimpanan_foto.sql` | Bucket Storage `foto-profil` (publik) + kebijakan RLS storage per-uid | ✅ diterapkan (live) |
| `005_perbaikan_status_akun.sql` | Default & nilai `status_akun` → enum Indonesia + CHECK | ✅ diterapkan (live) |

## 7. Peta Endpoint API (Backend)

> Konvensi respons: `{ "status": "sukses"|"gagal", "data": {...} | "pesan": "..." }`. Semua endpoint (kecuali `otentikasi` publik tertentu) butuh `Authorization: Bearer <JWT>`. Kolom **M** = milestone.

| Metode | Endpoint | Controller → Service | Fungsi | Kuota AI | M |
|---|---|---|---|---|---|
| POST | `/api/otentikasi/sesi` | `otentikasi.py` → verifikasi JWT | Validasi token Google + pastikan `profil` ada; balas data profil | — | M1 |
| POST | `/api/logout` | `keluar.py` → `supabase.auth.signOut(token)` | **Batalkan JWT di sisi server** (server-side revocation); klien lanjut bersihkan sesi lokal | — | M1 |
| GET | `/api/otentikasi/sesi` | `otentikasi.py` | Cek sesi aktif | — | M1 |
| GET | `/api/home/ringkasan` | `home.py` → `layanan_kuota`, `layanan_analisis_cv` | Kuota sisa (x/20), analisis terakhir, aksi cepat | — | M1 |
| GET | `/api/kuota` | `kuota.py` → `layanan_kuota` | Sisa kuota hari ini | — | M1 |
| GET | `/api/profil` | `profil.py` → `layanan_profil` | Ambil profil | — | M1 |
| PATCH | `/api/profil` | `profil.py` → `layanan_profil` | Ubah nama, posisi target, bahasa, dll | — | M1 |
| PUT | `/api/profil/foto` | *(opsional)* | M1: unggah foto dilakukan **langsung dari frontend** ke Storage `foto-profil` via RLS (migrasi 004); endpoint backend hanya bila perlu validasi server | — | M1 |
| GET | `/api/cv` | `cv.py` → `layanan_cv` | Daftar `riwayat_cv` milik user | — | M1 |
| POST | `/api/cv` | `cv.py` → `layanan_cv` | Buat CV baru (versi 1, pilih template) | — | M1 |
| GET | `/api/cv/{id}` | `cv.py` → `layanan_cv` | Detail CV | — | M1 |
| PUT | `/api/cv/{id}` | `cv.py` → `layanan_cv` | Simpan/autosave CV (update `data_cv`, bump versi saat "simpan sebagai versi baru") | — | M1 |
| DELETE | `/api/cv/{id}` | `cv.py` → `layanan_cv` | Hapus CV (soft-delete status arsip) | — | M1 |
| GET | `/api/templat-cv` | `cv.py` → `layanan_cv` | Daftar template aktif | — | M1 |
| POST | `/api/analisis-cv` | `analisis_cv.py` → `layanan_analisis_cv` | Jalankan analisis ATS (body: `riwayat_cv_id`, `bahasa`) | ✅ **1 panggilan** | M1 |
| GET | `/api/analisis-cv/terbaru` | `analisis_cv.py` | Ambil analisis terbaru user (dari DB, bukan LLM) | — | M1 |
| GET | `/api/analisis-cv/{id}` | `analisis_cv.py` | Ambil 1 hasil analisis | — | M1 |

> Endpoint fase berikut (M3–M5): `/api/sesi-wawancara`, `/api/pertanyaan-sesi`, `/api/evaluasi-sesi`, `/api/lowongan`, `/api/rekomendasi-lowongan`, `/api/notifikasi` — ditambahkan ke tabel ini saat implementasi, sesuai `database.md`.

## 8. Peta Rute Frontend (React Router)

| Rute | Halaman | Proteksi | M |
|---|---|---|---|
| `/` | `Beranda.jsx` (landing publik) | publik | M1 |
| `/masuk` | `Masuk.jsx` (login split-screen) | publik (redirect ke `/home` bila sudah login) | M1 |
| `/daftar` | `Daftar.jsx` (pendaftaran split-screen) | publik (redirect ke `/home` bila sudah login) | M1 |
| `/home` | `Home.jsx` (dashboard + analisis CV) | **login** | M1 |
| `/pembuat-cv` | `PembuatCv.jsx` (daftar CV + template) | **login** | M1 |
| `/cv/:id` | `EditorCv.jsx` (editor bertahap) | **login** | M1 |
| `/analisis-cv/:id` | `AnalisisCv.jsx` (hasil) | **login** | M1 |
| `/profil` | `Profil.jsx` | **login** | M1 |

- Rute selain di atas (simulasi, lowongan, notifikasi) → halaman `Segera.html`/komponen "Segera Hadir" sampai M1 selesai.
- Skeleton saat navigasi antar halaman; bottom nav hanya di halaman yang butuh navigasi utama (Home, CV, Profil).

---

## 9. Pola "Data AI → Komponen UI" (Render dari DB, Bukan Teks Mentah)

Alur wajib untuk semua hasil AI (analisis CV di M1; nanti evaluasi wawancara):

```text
[1] Frontend: GET /api/analisis-cv/terbaru   (data dari DATABASE, bukan LLM)
        ↓
[2] hooks/pakai_analisis_cv.js   (state: diam → memproses[skelaton] → hasil → error)
        ↓
[3] Petakan JSON DB → komponen CSS:
   • analisis_cv.skor_kelengkapan     →  KartuSkorCv   (progress bar/ring, warna oranye)
   • analisis_cv.skor_daya_tarik      →  KartuSkorCv   (nomor + label)
   • analisis_cv.rekomendasi_posisi   →  DaftarPosisi  (chips, icon kustom)
   • analisis_cv.rekomendasi_perbaikan→  BagianPerbaikanCv (3 kolom: tambah/perbaiki/hapus)
        ↓
[4] Tampilkan; tombol "Analisis Ulang" memanggil POST /api/analisis-cv (sekali lagi hitung kuota)
```

**Aturan:** 
- Frontend **tidak pernah** menampilkan `prompt`/`respons` mentah dari `pemakaian_ai`.
- Pemetaan field (kunci JSON) ↔ kolom DB WAJIB selaras dengan `database.md` §5 (`analisis_cv`) dan `prd.md` §9.
- Saat `POST /api/analisis-cv` mengembalikan **429**, frontend menampilkan kartu khusus "Kuota hari ini habis" (icon SVG `IkonKuota`) — bukan pesan error mentah.

## 10. Aturan Sinkronisasi 3 Dokumen

Matriks dampak (dipakai di ketiga dokumen):

| Perubahan | prd.md | struktur_file.md | database.md |
|---|---|---|---|
| Fitur baru / ubah FR | §5–§6 | §7 (endpoint) + §8 (rute) | §5 (tabel terkait) |
| File/controller baru | §6 (kalau FR baru) | §3–§5 (pohon + modul) | §5 (jika ada tabel) |
| Tabel/kolom baru | §6 (ref "Data") | §4 (models) + §6 (migrasi) | §5 + §11 (migrasi) |
| Struktur JSON AI berubah | §9 (prompt) | §9 (pola render) | §5 (kolom jsonb) |
| Desain/warna/ikon berubah | §11 | §5 (`design/`, `icons/`) | — (kecuali ada kolom baru) |
| Nilai kuota ≠ 20 | §8 | §7 (kolom kuota) | §9 + setting di `pengaturan_kuota_ai` |

**Langkah operasional agent AI:**
1. Identifikasi perubahan → tentukan baris matriks di atas.
2. Edit dokumen sumber perubahan → update dua dokumen lain.
3. Baca ulang ketiganya untuk cek referensi silang (penomoran §).
4. Jalankan checklist §11.

## 11. Checklist Agen AI (sebelum menyatakan selesai)

- [ ] Nama file baru = Bahasa Indonesia (kecuali `__init__.py`, konfigurasi, dan istilah teknis tak berpadanan).
- [ ] Folder baru = Bahasa Inggris.
- [ ] Endpoint & rute baru tercatat di §7–§8.
- [ ] Tercatat di `database.md` (tabel/kolom + migrasi) dan `prd.md` (FR/NFR).
- [ ] Kuota 20/hari diperhitungkan untuk semua panggilan LLM baru.
- [ ] Hasil AI dirender dari DB (bukan mentah), dengan skeleton saat memproses.
- [ ] Desain mematuhi `prd.md` §11 (oranye, kontras AA, ikon SVG kustom, mobile-first).
- [ ] Video wawancara dipastikan tidak disimpan.