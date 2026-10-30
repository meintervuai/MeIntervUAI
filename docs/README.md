# Panduan & Dokumentasi Standar Antislop Vibecoding: MeIntervUAI

Dokumen ini adalah indeks dan peta struktur proyek (WF-09) untuk platform simulasi wawancara kerja AI, pembuat CV ATS, telemetri visi MediaPipe, dan sistem Customer Success Management (MeIntervUAI).

## Peta Struktur Proyek (WF-09)
```
d:\MeIntervUAI\
├── docs/                         # Dokumentasi standar antislop vibecoding (rujukan agen)
│   ├── README.md                 # Peta struktur proyek & indeks aturan
│   ├── principles.md             # Prinsip dasar & tingkatan aturan (Hard, Purpose, Quality)
│   ├── workflow.md               # Alur kerja WF-01 s.d WF-09 (baca dokumen & perbarui saat kode berubah)
│   ├── backend.md                # Standar backend BE-01 s.d BE-06 (Rate limit, Keamanan, Bina Engine, Audio, Token Rate)
│   ├── frontend.md               # Standar frontend FE-01 s.d FE-10 (Render, DRY, Tokens, i18n, Form Mobile, Skeleton, Vision Hook, Video Room, Scorecard)
│   ├── ui-ux.md                  # Standar UI/UX UX-01 s.d UX-20 (Mobile-first, Rotasi, Kontras, Studio Video, Telemetri MediaPipe, Scorecard Bento)
│   ├── database.md               # Standar basis data DB-01 s.d DB-07 (Skema, ID, Indeks, Buku Besar & Audit Mutasi Saldo)
│   └── others.md                 # Aturan testing OT-01 dan gitignore OT-02
├── db/
│   └── schema.md                 # DDL skema database PostgreSQL/Supabase
├── backend/
│   ├── app/
│   │   ├── main.py               # Gateway FastAPI & middleware CORS/SlowAPI
│   │   ├── config.py             # Parser environment & setting rate-limit
│   │   ├── routers/              # Endpoint auth, csm_publik, profil, pengaturan, cv, simulasi
│   │   └── services/             # Supabase service, ID generator, bina_service.py (Engine Adaptif CV 6-Fase), & audio_service.py (Fish Audio & Edge-TTS)
│   ├── tests/                    # Pengujian unit otomatis (pytest)
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── illustrations/        # Aset SVG unDraw & avatar eksekutif Bina terverifikasi (#ea580c)
│   ├── src/
│   │   ├── i18n/                 # Modul lokalisasi dwibahasa terpusat (types.ts, hook useBahasa, id.ts, en.ts)
│   │   ├── components/ui/        # Komponen standar (Tombol, KotakInput + aksiKanan, Kartu, DialogModal, IndikatorToken, NotifikasiToast)
│   │   ├── components/tata_letak/# Navbar responsif, Footer & Drawer
│   │   ├── pages/                # CSMPublik, MasukDaftar, Beranda, Pengaturan, cv/, simulasi/
│   │   │   ├── cv/               # CVBuilder (Orkestrator), komponen/ (FormKontak, Edukasi, Pengalaman, Proyek, Keahlian, PengaturanCV, PratinjauKertasATS)
│   │   │   └── simulasi/         # SimulasiWawancara (Orkestrator)
│   │   │       ├── hooks/        # usePostureAnalysis.ts (Analisis Bahasa Tubuh MediaPipe Vision WASM 18 FPS)
│   │   │       └── komponen/     # FormPersiapanSimulasi, TextRoomChat, VoiceRoomDedicated, VideoRoomDedicated, LaporanEvaluasiWawancara
│   │   │           └── evaluasi/ # Subkomponen Scorecard: BentoSummaryGrid, ScoreRingGauge, QuestionAccordionItem, evaluasiData, evaluasiI18n
│   │   ├── services/             # supabase.ts (Supabase OAuth & Auth) dan api.ts (Klien backend)
│   │   └── index.css             # Desain token terpusat & fluid typography
│   ├── package.json
│   └── vite.config.ts
├── .env                          # Kredensial rahasia (Supabase, Google OAuth, LLM keys)
└── .gitignore                    # Pemisahan file rahasia dari git
```

## Daftar Rujukan Modul Dokumentasi
- [Prinsip & Definisi Slop](principles.md)
- [Alur Kerja (Workflow WF-01 - WF-09)](workflow.md)
- [Standar Backend (BE-01 - BE-06)](backend.md)
- [Standar Frontend (FE-01 - FE-10)](frontend.md)
- [Standar UI/UX, Multi-Device & Studio Vision (UX-01 - UX-20)](ui-ux.md)
- [Standar Basis Data & Audit Mutasi (DB-01 - DB-07)](database.md)
- [Standar Pengujian & Keamanan (OT-01 - OT-02)](others.md)
- [ADR-001: Alur Autentikasi & Verifikasi OTP](adr-auth-otp.md)
- [ADR-002: Agregasi Rekomendasi Lowongan Kerja (Job Board Aggregator)](adr-lowongan-kerja.md)
- [Spesifikasi 6 Template CV ATS & Kustomisasi Styling](cv-templates-ats.md)
- [Standar Pasfoto CV & Resume Formal (Nasional & Internasional)](cv-photo-standards.md)
- [Matriks Riset Isian Form Dinamis 6 Template CV Resmi](cv-form-field-matrix.md)
- [Folder Indeks Riset Evaluasi CV & Rekrutmen](research/README.md)
  - [Riset HR: Vina Muliana (Metode CAR & La-Pis-An)](research/hr-vina-muliana.md)
  - [Riset HR: Eza Hazami (Uji Skimming 6-9 Detik & Validasi Portofolio)](research/hr-eza-hazami.md)
  - [Riset HR: Yova Beltz & Ridha Poetri (Anti-Overclaiming & Wawancara)](research/hr-yova-ridha.md)
  - [Riset BUMN: Apri Rokhyadi (Substansi Konten & Seleksi Korporat)](research/hr-apri-rokhyadi.md)
  - [Riset Global & Evaluasi Atomik Metode Jev](research/standar-evaluasi-cv-rekruter.md)
  - [Panduan Dialog Wawancara Adaptif (Branching & Probing)](research/panduan-dialog-wawancara-adaptif.md)
  - [Spesifikasi Karakter Orisinal: Bina (Head of Talent Acquisition)](research/karakter-bina.md)

## Format Mode Simulasi Wawancara Aktif
1. **Mode Teks Interaktif (10 Token)**: Tanya jawab cepat berbasis teks dengan verifikasi substansi jawaban dan umpan balik adaptif.
2. **Mode Suara / Audio AI (15 Token)**: Tanya jawab vokal interaktif berlatar dark charcoal visualizer konsentris dengan sintesis Fish Audio / Edge-TTS Brian Multilingual.
3. **Mode Video & Postur MediaPipe (25 Token)**: Simulasi tatap muka split-view (58% : 42%) dengan avatar eksekutif Bina, PiP kamera kandidat dengan kanvas overlay kerangka MediaPipe real-time (18 FPS), 4 telemetri bahasa tubuh (Kontak Mata %, Postur, Artikulasi Bibir, Gestur Tangan), serta Inline Vision Alert Card.
4. **Laporan Evaluasi Simulasi Wawancara (Scorecard Purna Wawancara)**: Akses instan pasca-sesi menyajikan Bento Grid 3 Kolom (Circular Gauge 84/100, 4 Pilar Metrik, Ringkasan Eksekutif Bina) dan Accordion Per Pertanyaan dengan komparasi Kekuatan vs Catatan Kritis bertanda waktu, rekomendasi STAR/CAR ideal, serta unduh PDF terformat bersih.


