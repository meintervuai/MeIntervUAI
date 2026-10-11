# Panduan & Dokumentasi Standar Antislop Vibecoding: MeIntervUAI

Dokumen ini adalah indeks dan peta struktur proyek (WF-09) untuk platform simulasi wawancara kerja AI, pembuat CV ATS, dan sistem Customer Success Management (MeIntervUAI).

## Peta Struktur Proyek (WF-09)
```
d:\MeIntervUAI\
├── docs/                         # Dokumentasi standar antislop vibecoding (rujukan agen)
│   ├── README.md                 # Peta struktur proyek & indeks aturan
│   ├── principles.md             # Prinsip dasar & tingkatan aturan (Hard, Purpose, Quality)
│   ├── workflow.md               # Alur kerja WF-01 s.d WF-09 (baca dokumen & perbarui saat kode berubah)
│   ├── backend.md                # Aturan backend BE-01 s.d BE-02 (Rate limit & Keamanan)
│   ├── frontend.md               # Aturan frontend FE-01 s.d FE-05 (Render, DRY, Tokens, i18n, Form Mobile)
│   ├── ui-ux.md                  # Aturan UI/UX UX-01 s.d UX-13 (Mobile-first, Rotasi, Kontras, Input Usability)
│   ├── database.md               # Aturan basis data DB-01 s.d DB-06 (Skema, ID, Indeks)
│   └── others.md                 # Aturan testing OT-01 dan gitignore OT-02
├── db/
│   └── schema.md                 # DDL skema database PostgreSQL/Supabase
├── backend/
│   ├── app/
│   │   ├── main.py               # Gateway FastAPI & middleware CORS/SlowAPI
│   │   ├── config.py             # Parser environment & setting rate-limit
│   │   ├── routers/              # Endpoint auth, csm_publik, profil, pengaturan
│   │   └── services/             # Client Supabase & generator ID terstruktur
│   ├── tests/                    # Pengujian unit otomatis (pytest)
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── illustrations/        # Aset SVG unDraw terverifikasi palet brand (#ea580c)
│   ├── src/
│   │   ├── i18n/                 # Modul lokalisasi dwibahasa terpusat (types.ts, hook useBahasa, id.ts, en.ts)
│   │   ├── components/ui/        # Komponen standar (Tombol, KotakInput + aksiKanan, Kartu, DialogModal, IndikatorToken)
│   │   ├── components/tata_letak/# Navbar responsif, Footer & Drawer
│   │   ├── pages/                # CSMPublik (Landing terpadu), MasukDaftar (Mobile-first Auth), Beranda, Pengaturan
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
- [Standar Backend (BE-01 - BE-02)](backend.md)
- [Standar Frontend (FE-01 - FE-05)](frontend.md)
- [Standar UI/UX, Multi-Device & Rotasi (UX-01 - UX-13)](ui-ux.md)
- [Standar Basis Data (DB-01 - DB-06)](database.md)
- [Standar Pengujian & Keamanan (OT-01 - OT-02)](others.md)
- [ADR-001: Alur Autentikasi & Verifikasi OTP](adr-auth-otp.md)
