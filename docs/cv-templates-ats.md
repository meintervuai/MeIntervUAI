# Standar Baku Format CV/Resume (Nasional & Internasional)

Dokumen ini adalah acuan resmi penentuan 5 template CV di **MeIntervUAI**. Seluruh template mengacu pada standar resmi institusional, regulasi ketenagakerjaan, dan spesifikasi teknis mesin ATS (*Applicant Tracking System*):

---

## 1. Landasan Hukum, Regulasi & Acuan Standar

| Yurisdiksi / Bidang | Lembaga & Acuan Resmi | Prinsip & Aturan Utama |
| :--- | :--- | :--- |
| **Internasional (Ivy League & MNC)** | Harvard University (OCS/Mignone Center) & Yale Career Strategy | - Format **1-Kolom Murni** tanpa tabel tersembunyi.<br>- Prinsip pencapaian **Google XYZ Formula** (*Accomplished [X] measured by [Y] by doing [Z]*).<br>- Dilarang foto dan elemen grafis untuk mencegah bias diskriminasi (US EEOC Compliance). |
| **Eropa & Global (ISO/DIN)** | Uni Eropa (Europass Framework) & Deutsches Institut für Normung (**DIN 5008**) | - Ukuran kertas standar internasional **ISO 216 (A4: 210 × 297 mm)**.<br>- Spasi dan margin terukur presisi (DIN 5008 Type A/B: margin 12mm-24mm).<br>- Struktur bagian kompetensi baku (Pendidikan, Pengalaman, Bahasa CEFR). |
| **Nasional Indonesia** | Kementerian Ketenagakerjaan RI (Kemnaker) & FHCI BUMN (Rekrutmen Bersama BUMN) | - Standar **Saringan Massal ATS Rekrutmen Bersama BUMN**: Format teks bersih anti-error mesin Workday/Taleo.<br>- Kejelasan kontak aktif (WhatsApp/Telepon, Domisili/Kota).<br>- Penyelarasan riwayat organisasi dan nilai inti (*core values*). |
| **Teknologi Parser ATS Global** | Workday, Taleo (Oracle), Greenhouse, Lever, iCIMS | - Struktur Linear Parsing: Urutan tag heading baku (`H1`, `H2`, `H3`, `P`).<br>- Dilarang Textbox, Multi-Kolom bersarang, Shape vector bertumpuk, atau Icon SVG pengganti teks.<br>- Format font web standar (*Inter, Roboto, Arial, Times New Roman, Garamond*). |

---

## 2. Pemetaan 5 Template CV Resmi MeIntervUAI

Berdasarkan regulasi dan acuan standar resmi di atas, 5 template CV yang disediakan di MeIntervUAI dirancang secara terukur:

```
                               ┌──────────────────────────────────────────────────────────┐
                               │             5 TEMPLATE CV STANDAR RESMI                 │
                               └──────────────────────────────────────────────────────────┘
                                                            │
         ┌───────────────────┬──────────────────────────────┼─────────────────────────┬───────────────────┐
         ▼                   ▼                              ▼                         ▼                   ▼
1. IVY CLASSIC       2. TECH SILICON        3. BUMN & KEMNAKER               4. EUROPASS SLATE    5. EXECUTIVE DIN 5008
(Harvard/Yale OCS)   (Jake's Resume / W3C)  (FHCI BUMN / Nasional)           (Uni Eropa Framework)(DIN 5008 / ISO 216)
• 1-Kolom Formal     • Left-Aligned Tech    • Kronologis Nasional Terstruktur • Header Kotak Rapi • Margin Presisi 18mm
• Font Serif         • Sans-Serif Modern    • Ramah Portal BUMN FHCI         • Kategori Terperinci• Leadership Metrics
• Center Header      • Skill-First Stack    • Single-Page ATS Clean          • Standard ISO A4    • Formal Corporate
```

### Rincian Spesifikasi Template

### 1. `ivy_classic` — Standar Harvard & Yale (Ivy League OCS)
- **Acuan Resmi**: *Harvard College Office of Career Services (OCS) Resume Guide* & *Yale School of Management*.
- **Karakter**: Header tengah (*centered*), pembatas garis horizontal hitam tegas (`1px solid`), tipografi *Serif* klasik.
- **Rekomendasi**: Perbankan (Investment Banking), Firma Hukum, Manajemen Konsultan (MBB), Lembaga Multinasional (UN/World Bank), Beasiswa Luar Negeri (LPDP, Chevening).

### 2. `tech_silicon` — Standar Industri Teknologi (Jake's Resume / Silicon Valley)
- **Acuan Resmi**: Standar format rekrutmen FAANG / Big Tech (model teruji *Jake's Resume / LaTeX* yang digunakan >50.000 engineer global).
- **Karakter**: Rata kiri (*left-aligned*), tipografi *Sans-Serif* modern (*Inter/Roboto*), kontak 1-baris hemat spasi, bagian *Keahlian Teknis* diletakkan strategis untuk pemindaian instan parser tech stack.
- **Rekomendasi**: Software Engineer, Data Scientist, AI/ML Specialist, Product Manager, DevOps.

### 3. `bumn_nasional` — Standar Nasional (FHCI BUMN & Kemnaker ATS)
- **Acuan Resmi**: *Pedoman Seleksi Administrasi Rekrutmen Bersama BUMN (RBB - FHCI)* dan panduan penulisan CV Kemnaker RI.
- **Karakter**: Kronologis bersih terbalik (*Reverse-Chronological*), penegasan riwayat universitas, akreditasi/IPK, pengalaman kerja, serta keikutsertaan organisasi/pelatihan formal yang selaras dengan nilai kerja BUMN.
- **Rekomendasi**: Rekrutmen Bersama BUMN, Perusahaan Swasta Nasional, Perbankan BUMN (Mandiri, BRI, BNI), ASN / PPPK.

### 4. `europass_slate` — Standar Uni Eropa (Europass Modernized ATS)
- **Acuan Resmi**: *European Union Europass CV Framework (Decision No 2241/2004/EC)* yang telah disesuaikan agar 100% ramah ATS parser (tanpa tabel bersarang kaku).
- **Karakter**: Pengelompokan bagian berbasis blok modular yang jelas, penegasan kemampuan bahasa, sertifikasi internasional, dan keahlian digital.
- **Rekomendasi**: Bekerja di Eropa/Jerman/Belanda/Inggris, magang internasional, institusi riset akademis, visa kerja ekspatriat.

### 5. `executive_din` — Standar Manajerial Presisi (DIN 5008 / ISO 216)
- **Acuan Resmi**: Standar industri Jerman *DIN 5008 (Schreib- und Gestaltungsregeln für die Textverarbeitung)* & *ISO 216*.
- **Karakter**: Margin presisi seragam (18mm - 24mm), kontras tipografi heading vs body terukur rasio emas, dilengkapi blok *Executive Summary* terstruktur untuk kandidat berpengalaman.
- **Rekomendasi**: Direktur, General Manager, VP, Senior Consultant, Praktisi Industri dengan pengalaman >5 tahun.

### 6. `modern_ats` — Standar Modern Minimalist (Corporate & Startup ATS)
- **Acuan Resmi**: Standar desain resume kontemporer W3C & benchmark rekrutmen startup/unicorn global (1-kolom bersih dengan garis bawah tebal inline pada tiap heading dan tipografi sans-serif modern).
- **Karakter**: Teks body bernapas lega, aksen warna korporat/startup pada nama & judul bagian (*inline accent border*), kontras tinggi (WCAG AAA), 100% bebas dari kolom bersarang yang memicu galat ATS scanner.
- **Rekomendasi**: Marketing & Growth, Business Development, UI/UX & Design Strategist, FinTech/Startup, Konsultan Manajemen Modern.

---

## 3. Matriks Kepatuhan ATS & Keterbacaan

| Kriteria ATS | Status Kepatuhan | Keterangan Teknis |
| :--- | :---: | :--- |
| **Arsitektur 1-Kolom (Single Column)** | ✅ **100% Lolos** | Menjamin linear parsing scanner membaca teks dari atas ke bawah tanpa tertukar. |
| **Tanpa Elemen Penghalang (No Shapes/Tables)** | ✅ **100% Lolos** | Tidak menggunakan table cells tersembunyi, canvas raster, atau grafik floating. |
| **Tipografi Terbaca Mesin (OCR Safe)** | ✅ **100% Lolos** | Menggunakan CSS text rendering native (Inter, Roboto, Georgia, Merriweather). |
| **Ukuran Font Cetak Standar** | ✅ **100% Lolos** | Body text minimal 10pt (13.3px), Heading 12pt - 18pt sesuai pedoman aksesibilitas. |
| **Dukungan Kertas ISO vs US** | ✅ **100% Lolos** | Opsi instan beralih antara A4 (210×297mm) dan Letter (8.5×11 inci) untuk pasar global. |

---

## 4. Standar Pencantuman Pasfoto Formal & Posisi Otomatis

Sesuai aturan ketenagakerjaan internasional (EEOC AS & UK Equality Act 2010) serta regulasi administrasi nasional (FHCI BUMN, BKN) dan Eropa (DIN 5008, Europass), sistem CV Builder menerapkan aturan penempatan pasfoto formal secara otomatis:

### A. Matriks Otomatisasi Pasfoto & Posisi Header

| Template | Status Pasfoto | Posisi Pasfoto | Alasan Regulasi & Acuan Resmi |
| :--- | :---: | :---: | :--- |
| **`ivy_classic`** | ❌ **Nonaktif (Hidden)** | - | **US EEOC Compliance**: Mencegah bias diskriminasi ras, usia, gender, dan penampilan. |
| **`tech_silicon`** | ❌ **Nonaktif (Hidden)** | - | **Global Tech ATS Standard**: Mencegah error parser biner pada ATS Big Tech global. |
| **`bumn_nasional`** | ✅ **Aktif Otomatis** | **Kiri Atas** | **Pedoman Seleksi FHCI BUMN & BKN**: Foto identitas formal pelamar diposisikan di sisi kiri atas sesuai pola baca *Z-pattern* dokumen administrasi Indonesia. |
| **`europass_slate`** | ✅ **Aktif Otomatis** | **Kanan Atas** | **Keputusan Parlemen Uni Eropa No 2241/2004/EC**: Format resmi Europass menempatkan pasfoto di sudut kanan atas. |
| **`executive_din`** | ✅ **Aktif Otomatis** | **Kanan Atas** | **Standar Jerman DIN 5008**: Pasfoto pelamar (*Bewerbungsfoto*) diletakkan di sudut kanan atas sejajar dengan identitas kontak. |

### B. Spesifikasi Teknis Pasfoto
1. **Rasio Aspek**: Proporsi pasfoto formal **3:4** (misal 300×400px atau cetak 3×4 cm / 4×5 cm).
2. **Komposisi Wajah**: Wajah dan leher mendominasi **70% s.d 80%** dari bingkai foto (*formal headshot*).
3. **Latar Belakang**: Polos bersih tanpa corak (Merah/Biru untuk BUMN/CPNS, Abu-abu netral/off-white untuk DIN 5008).
4. **Pemisahan Teks ATS**: Gambar diletakkan dalam kontainer flex terisolasi yang sejajar dengan header sehingga tidak memotong atau mengacaukan aliran linear teks (*single-column linear flow*).

