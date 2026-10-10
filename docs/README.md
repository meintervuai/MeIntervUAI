# Panduan & Dokumentasi Standar Antislop Vibecoding: IntervU AI

Dokumen ini adalah indeks dan peta struktur proyek (WF-09) untuk platform simulasi wawancara kerja AI, pembuat CV ATS, dan sistem Customer Success Management (IntervU AI).

## Peta Struktur Proyek (WF-09)
```
d:\MeIntervUAI\
├── docs/                         # Dokumentasi standar antislop vibecoding (rujukan agen)
│   ├── README.md                 # Peta struktur proyek & indeks aturan
│   ├── principles.md             # Prinsip dasar & tingkatan aturan (Hard, Purpose, Quality)
│   ├── workflow.md               # Alur kerja WF-01 s.d WF-09
│   ├── backend.md                # Aturan backend BE-01 s.d BE-02 (Rate limit & Keamanan)
│   ├── frontend.md               # Aturan frontend FE-01 s.d FE-03 (Render, OOP, Tokens)
│   ├── ui-ux.md                  # Aturan UI/UX UX-01 s.d UX-12 (Multi-device, Rotasi, Kontras)
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
│   ├── src/
│   │   ├── components/ui/        # Komponen standar (Tombol, KotakInput, Kartu, DialogModal, IndikatorToken)
│   │   ├── components/tata_letak/# Navbar responsif & Drawer
│   │   ├── pages/                # CSMPublik, MasukDaftar, Beranda, Pengaturan
│   │   ├── services/api.ts       # Klien komunikasi API backend
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
- [Standar Frontend (FE-01 - FE-03)](frontend.md)
- [Standar UI/UX, Multi-Device & Rotasi (UX-01 - UX-12)](ui-ux.md)
- [Standar Basis Data (DB-01 - DB-06)](database.md)
- [Standar Pengujian & Keamanan (OT-01 - OT-02)](others.md)
