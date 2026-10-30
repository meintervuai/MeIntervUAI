# Keputusan Arsitektur (ADR-002): Agregasi Rekomendasi Lowongan Kerja (Job Board Aggregator)

## Status
Diterima & Diimplementasikan (2026-10-30)

## Konteks
Pengguna MeIntervUAI membutuhkan fitur penelusuran lowongan pekerjaan yang relevan setelah menyusun CV ATS dan menyelesaikan simulasi wawancara kerja. Portal lowongan pekerjaan utama (JobStreet, Glints, LinkedIn, Kalibrr, Dealls) memiliki sistem proteksi bot (Cloudflare WAF, CAPTCHA, dynamic JS rendering). Pengguna menginginkan sistem yang:
1. Menampilkan daftar lowongan terkurasi dari berbagai portal populer.
2. Memberikan rekomendasi berbasis hasil analisis CV pengguna dan target peran simulasi wawancara.
3. Berfungsi sebagai agregator penampil dan kurasi lowongan (bukan portal lamaran internal MeIntervUAI), dengan tautan langsung ke sumber asli.
4. Mendukung fitur bookmark / simpan lowongan favorit ke akun pengguna.

## Keputusan Arsitektur
1. **Live Scraping & Aggregator Engine (`backend/app/services/job_scraper_service.py` & `backend/app/routers/lowongan.py`)**:
   - Seluruh data hardcode/mock telah **dihapus 100%**. Sistem kini murni mengagregasi data pekerjaan secara real-time dari portal terkemuka menggunakan engine scraper multi-sumber (LinkedIn Guest API & Indeed via python-jobspy).
   - Menyediakan endpoint pencarian dinamis (`GET /api/lowongan/cari`) yang melakukan real-time query langsung ke LinkedIn dan Indeed berdasarkan kata kunci, lokasi, dan tipe kerja (Remote, Hybrid, Onsite).
   - Menyediakan endpoint rekomendasi personal (`GET /api/lowongan/rekomendasi/{pengguna_id}`) yang membaca target role CV pengguna (`cv_pengguna`) dan riwayat evaluasi simulasi (`evaluasi_wawancara`), kemudian melakukan live fetch lowongan nyata yang cocok dengan profil pengguna.
   - Menyediakan endpoint pengelolaan bookmark pengguna (`GET /api/lowongan/bookmark` dan `POST /api/lowongan/bookmark/toggle`).
2. **Frontend Halaman Lowongan (`frontend/src/pages/lowongan/LowonganKerja.tsx`)**:
   - Tata letak Bento Grid kompak dengan densitas tinggi (1 col mobile, 2 col tablet, 3-4 col desktop) yang memuat banyak lowongan secara ergonomis.
   - Filter tab/pill: "Semua Lowongan", "Rekomendasi CV", "Rekomendasi Hasil Simulasi", dan "Disimpan / Bookmark".
   - Kartu lowongan menampilkan badge sumber portal resmi (LinkedIn, Indeed), perusahaan riil, lokasi, dan tombol aksi:
     - Tombol "Lihat di Sumber": Membuka tab baru langsung ke halaman resmi lowongan asli.
     - Tombol "Simpan Lowongan": Menyimpan ke daftar bookmark pengguna dengan sinkronisasi instan (*Stale-While-Revalidate*).
3. **Standar Kepatuhan Aturan Repositori**:
   - Patuh aturan dwibahasa FE-04 (`id.ts` & `en.ts`).
   - Skeleton loading saat memuat data (FE-07 / UX-17).
   - Notifikasi feedback menggunakan `NotifikasiToast` (FE-02 / UX-16).
   - Bebas visual klise AI / anti-slop (tanpa pulsing dots, tanpa em-dash).
