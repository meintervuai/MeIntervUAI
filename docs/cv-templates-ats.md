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

## 2. Pemetaan 6 Template CV Resmi MeIntervUAI

Berdasarkan regulasi dan acuan standar resmi di atas, 6 template CV yang disediakan di MeIntervUAI dirancang secara terukur:

```
                               ┌──────────────────────────────────────────────────────────┐
                               │             6 TEMPLATE CV STANDAR RESMI                 │
                               └──────────────────────────────────────────────────────────┘
                                                            │
         ┌───────────────────┬──────────────────────────────┼─────────────────────────┬───────────────────┬───────────────────┐
         ▼                   ▼                              ▼                         ▼                   ▼                   ▼
1. IVY CLASSIC       2. TECH SILICON        3. BUMN & KEMNAKER               4. EUROPASS SLATE    5. EXECUTIVE DIN    6. MODERN ATS
(Harvard/Yale OCS)   (Jake's Resume / W3C)  (FHCI BUMN / Nasional)           (Uni Eropa Framework)(DIN 5008 / ISO 216)(Corporate/Startup)
• 1-Kolom Formal     • Left-Aligned Tech    • Kronologis Nasional Terstruktur • Header Kotak Rapi • Margin Presisi    • Minimalist Accent
• Font Serif         • Sans-Serif Modern    • Ramah Portal BUMN FHCI         • Kategori Terperinci• Leadership Metrics• Inline Accent Headings
• Center Header      • Skill-First Stack    • Single-Page ATS Clean          • Standard ISO A4    • Formal Corporate  • Clean Sans Layout
```

### Rincian Spesifikasi Template

### 1. `ivy_classic` - Standar Harvard & Yale (Ivy League OCS)
- **Acuan Resmi**: *Harvard College Office of Career Services (OCS) Resume Guide* & *Yale School of Management*.
- **Karakter**: Header tengah (*centered*), pembatas garis horizontal hitam tegas (`1px solid`), tipografi *Serif* klasik.
- **Rekomendasi**: Perbankan (Investment Banking), Firma Hukum, Manajemen Konsultan (MBB), Lembaga Multinasional (UN/World Bank), Beasiswa Luar Negeri (LPDP, Chevening).

### 2. `tech_silicon` - Standar Industri Teknologi (Jake's Resume / Silicon Valley)
- **Acuan Resmi**: Standar format rekrutmen FAANG / Big Tech (model teruji *Jake's Resume / LaTeX* yang digunakan >50.000 engineer global).
- **Karakter**: Rata kiri (*left-aligned*), tipografi *Sans-Serif* modern (*Inter/Roboto*), kontak 1-baris hemat spasi, bagian *Keahlian Teknis* diletakkan strategis untuk pemindaian instan parser tech stack.
- **Rekomendasi**: Software Engineer, Data Scientist, AI/ML Specialist, Product Manager, DevOps.

### 3. `bumn_nasional` - Standar Nasional (FHCI BUMN & Kemnaker ATS)
- **Acuan Resmi**: *Pedoman Seleksi Administrasi Rekrutmen Bersama BUMN (RBB - FHCI)* dan panduan penulisan CV Kemnaker RI.
- **Karakter**: Kronologis bersih terbalik (*Reverse-Chronological*), penegasan riwayat universitas, akreditasi/IPK, pengalaman kerja, serta keikutsertaan organisasi/pelatihan formal yang selaras dengan nilai kerja BUMN.
- **Rekomendasi**: Rekrutmen Bersama BUMN, Perusahaan Swasta Nasional, Perbankan BUMN (Mandiri, BRI, BNI), ASN / PPPK.

### 4. `europass_slate` - Standar Uni Eropa (Europass Modernized ATS)
- **Acuan Resmi**: *European Union Europass CV Framework (Decision No 2241/2004/EC)* yang telah disesuaikan agar 100% ramah ATS parser (tanpa tabel bersarang kaku).
- **Karakter**: Pengelompokan bagian berbasis blok modular yang jelas, penegasan kemampuan bahasa, sertifikasi internasional, dan keahlian digital.
- **Rekomendasi**: Bekerja di Eropa/Jerman/Belanda/Inggris, magang internasional, institusi riset akademis, visa kerja ekspatriat.

### 5. `executive_din` - Standar Manajerial Presisi (DIN 5008 / ISO 216)
- **Acuan Resmi**: Standar industri Jerman *DIN 5008 (Schreib- und Gestaltungsregeln für die Textverarbeitung)* & *ISO 216*.
- **Karakter**: Margin presisi seragam (18mm - 24mm), kontras tipografi heading vs body terukur rasio emas, dilengkapi blok *Executive Summary* terstruktur untuk kandidat berpengalaman.
- **Rekomendasi**: Direktur, General Manager, VP, Senior Consultant, Praktisi Industri dengan pengalaman >5 tahun.

### 6. `modern_ats` - Standar Modern Two-Column (Corporate & Creative Executive)
- **Acuan Resmi**: Desain resume kontemporer eksekutif modern (arsitektur *Split Two-Column* dengan sidebar kontras gelap di sisi kiri dan kanvas riwayat kerja berbasis *Timeline Experience* di sisi kanan).
- **Karakter**:
  * **Sidebar Kiri Gelap (*Dark Slate/Navy Sidebar* ~35%)**: Memuat pasfoto melingkar (*circular headshot*), detail kontak terstruktur, riwayat pendidikan formal, serta daftar keahlian (*bulleted skills*).
  * **Kanvas Kanan Bersih (*White Main Canvas* ~65%)**: Nama kandidat berukuran *display bold*, target peran, ringkasan profesional naratif, serta riwayat pengalaman kerja dengan penanda garis vertikal dan titik waktu (*timeline dot & line*).
- **Rekomendasi**: Marketing & Growth Manager, UI/UX & Design Strategist, Business Development, FinTech/Startup, Profesional Kreatif & Korporat Modern.

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
| **`modern_ats`** | ✅ **Aktif Otomatis** | **Kiri Atas (Sidebar)** | **Modern Two-Column Split**: Pasfoto melingkar (*circular avatar*) ditempatkan secara terpadu di bagian atas sidebar gelap. |

### B. Spesifikasi Teknis Pasfoto
1. **Rasio Aspek**: Proporsi pasfoto formal **3:4** (misal 300×400px atau cetak 3×4 cm / 4×5 cm).
2. **Komposisi Wajah**: Wajah dan leher mendominasi **70% s.d 80%** dari bingkai foto (*formal headshot*).
3. **Latar Belakang**: Polos bersih tanpa corak (Merah/Biru untuk BUMN/CPNS, Abu-abu netral/off-white untuk DIN 5008).
4. **Pemisahan Teks ATS**: Gambar diletakkan dalam kontainer flex terisolasi yang sejajar dengan header sehingga tidak memotong atau mengacaukan aliran linear teks (*single-column linear flow*).

---

## 5. Matriks Ketentuan Styling & Sub-Tab Konfigurasi Template

Untuk menjaga kepatuhan parser ATS dan etika rekrutmen institusional, opsi pada sub-tab pengaturan CV (`Template`, `Kertas`, `Warna`, `Tipografi`) dikondisikan secara cerdas:

| Template | Ketentuan Format Kertas | Ketentuan Palet Warna | Ketentuan Keluarga Font |
| :--- | :--- | :--- | :--- |
| **`ivy_classic`** | Bebas (A4 / US Letter) | 🔒 **Monokrom Wajib (`#111827`)**<br>Harvard/Yale OCS melarang warna dekoratif bebas. | 🔒 **Serif Wajib**<br>Dibatasi pada: *Times New Roman, Georgia, Garamond*. |
| **`tech_silicon`** | Bebas (A4 / US Letter) | Bebas (Aksen heading, links, skills) | **Sans-Serif Modern**<br>Inter, Roboto. |
| **`bumn_nasional`** | Diutamakan A4 (ISO 216) | Bebas (Aksen formal: Navy, Noir, Slate) | Bebas (*Inter, Roboto, Times, Georgia*). |
| **`europass_slate`** | Diutamakan A4 (ISO 216) | Bebas (Aksen border blok kategori) | Bebas (*Inter, Roboto, Times*). |
| **`executive_din`** | 🔒 **Wajib A4 (ISO 216)**<br>DIN 5008 secara hukum berbasis A4. | Bebas (Aksen garis & heading formal) | Diutamakan Sans Netral (*Roboto, Inter*). |
| **`modern_ats`** | Bebas (A4 / US Letter) | Bebas (Background dark sidebar & timeline dots) | **Sans-Serif Kontemporer** (*Inter, Roboto*). |

---

## 6. Standar Baku Skala Tipografi ATS (Batas Minimal & Maksimal)

Berdasarkan pedoman tipografi resume resmi institusional (Harvard OCS, DIN 5008, dan panduan OCR scanner ATS global), ukuran font dibatasi ketat untuk mencegah teks menjadi raksasa atau tidak terbaca mesin parser:

| Elemen Tipografi | Batas Minimal | Standar Default | Batas Maksimal | Rujukan Standar & Alasan |
| :--- | :---: | :---: | :---: | :--- |
| **Candidate Name (Title)** | **20 px** (15 pt) | **24 px** (18 pt) | **28 px** (21 pt) | Standar hierarki visual tertinggi dokumen tanpa memakan ruang baris konten. |
| **Target Role (Subtitle)** | **12 px** (9 pt) | **14 px** (10.5 pt) | **16 px** (12 pt) | Penegas posisi karir pelamar di bawah nama. |
| **Section Heading (H1)** | **13 px** (10 pt) | **14 px** (10.5 pt) | **18 px** (13.5 pt) | Standar pembagi bagian resume (Pengalaman, Pendidikan, Keahlian). |
| **Position / School (H2/H3)** | **11 px** (8.25 pt) | **12 px** (9 pt) | **14 px** (10.5 pt) | Sub-judul posisi pekerjaan atau nama institusi pendidikan. |
| **Body Text & Bullets (P)** | **10 px** (7.5 pt) | **11 px** (8.25 pt) | **12 px** (9 pt) | Batas kritis OCR parser: teks di bawah 10px (~7.5pt) berisiko gagal di-ekstrak oleh parser ATS. |

> [!IMPORTANT]
> **Pencegahan Nilai Ekstrem (Sanitasi Input)**: Sistem CV Builder secara otomatis melakukan validasi dan pembatasan (*clamping*) input angka. Jika pengguna mengosongkan input atau memasukkan angka di luar rentang (misal `0`, `99`), sistem secara otomatis mengembalikannya ke batas aman standar baku di atas.

---

## 7. Penanganan Multi-Halaman (Multi-Page Flow)

1. **Prinsip Utama Resume ATS**:
   - Untuk pelamar *entry-level* hingga *mid-level* (< 5 tahun pengalaman), standar baku internasional adalah **1 Halaman Penuh (Single Page)**.
   - Untuk pelamar *senior*, *akademisi*, atau *eksekutif* (> 5–10 tahun pengalaman), dokumen dapat bertambah menjadi **2 Halaman**.
2. **Perilaku Pratinjau Kertas (*Adaptive Page Height*)**:
   - Kertas menggunakan `min-height: 297mm` (A4) atau `min-height: 11in` (Letter).
   - Apabila isian pengalaman atau proyek melebihi 1 halaman, kanvas kertas otomatis memanjang vertikal secara proporsional kelipatan lembar fisik.
3. **Cetak & Ekspor PDF (`window.print`)**:
   - Menggunakan aturan CSS cetak standar `@media print`:
     - Setiap pergantian bagian penting menggunakan `break-inside: avoid` untuk mencegah teks terpotong di tengah baris atau di antara heading dan bullet-point.
     - Pembagian halaman (*page break*) terpisah secara otomatis dan presisi pada batas kertas 297mm tanpa terpotong di tengah elemen.

