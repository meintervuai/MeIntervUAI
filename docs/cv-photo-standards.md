# Riset Standar Pasfoto CV & Resume (Nasional & Internasional)

Dokumen ini menyajikan hasil audit riset mengenai standar pencantuman pasfoto dalam CV/Resume berdasarkan regulasi nasional (FHCI BUMN, Kemenaker, CPNS) dan konvensi internasional (DIN 5008 Jerman, Europass EU, dan US/UK ATS - EEOC).

---

## 1. Matriks Regulasi & Konvensi Pasfoto

| Yurisdiksi / Standar | Aturan Pasfoto | Alasan Regulasi / Dasar Hukum | Rekomendasi Template di MeIntervUAI |
| :--- | :--- | :--- | :--- |
| **Indonesia (BUMN & CPNS)** | **Wajib / Sangat Disarankan** | Verifikasi identitas seleksi administrasi (FHCI BUMN & BKN). Menghindari joki tes & verifikasi kecocokan wajah. | `bumn_nasional` (Otomatis Aktif) |
| **Jerman & DACH (DIN 5008)** | **Standar Tradisional (*Bewerbungsfoto*)** | Kultur rekrutmen formal Jerman (*Lebenslauf*). Foto ditaruh di sudut kanan atas header. | `executive_din` (Otomatis Aktif) |
| **Uni Eropa (Europass)** | **Opsional (*Optional*)** | Standar CEDEFOP / Komisi Uni Eropa. Disarankan untuk instansi publik Eropa atau swasta lokal. | `europass_slate` (Otomatis Aktif) |
| **Amerika Serikat & UK (US/UK ATS)** | **DILARANG KERAS / Ditolak Otomatis** | **EEOC (*Equal Employment Opportunity Commission*) & UK Equality Act 2010**: Mencegah diskriminasi ras, usia, gender, dan penampilan. Software ATS membuang foto karena dapat mengacaukan parser biner/OCR. | `ivy_classic` & `tech_silicon` (Otomatis Nonaktif) |
| **Startup & Modern Executive** | **Aktif Otomatis** | Format resume modern split dua kolom. Pasfoto melingkar (*circular headshot*) ditempatkan di atas sidebar gelap kiri. | `modern_ats` (Otomatis Aktif) |

---

## 2. Standar Teknis Pasfoto CV Formal (BUMN & Jerman)

Jika pelamar menggunakan template yang mendukung foto (`bumn_nasional`, `executive_din`, atau `europass_slate`), foto yang diunggah harus memenuhi kriteria standar industri berikut:

### A. Rasio Aspek & Dimensi
1. **Rasio**: Standar formal adalah **3:4** (misal 300x400 piksel) atau **4:6** (400x600 piksel).
2. **Proporsi Wajah**: Komposisi wajah dan leher mencakup **70% s.d 80%** dari total area bingkai (*close-up / medium close-up headshot*).
3. **Posisian**: Tegak lurus, pundak simetris, menghadap tepat ke arah lensa kamera (bukan sudut miring selfie atau foto seluruh badan).

### B. Latar Belakang (Background)
* **Nasional (BUMN/Instansi)**: Latar belakang polos bersih tanpa bayangan (warna umum: **Merah, Biru, atau Abu-abu terang** netral).
* **Internasional (Jerman / DACH)**: Latar abu-abu terang (*light grey*), putih lembut (*off-white*), atau studio gradient netral.

### C. Pakaian & Grooming (Penampilan)
* Pakaian formal berkerah: kemeja putih/terang dengan dasi dan jas hitam/navy (pria) atau blazer formal (wanita).
* Wajah terlihat jelas, tidak mengenakan kacamata hitam, topi, atau masker. Kacamata korektif tidak boleh memantulkan silau blitz (*anti-reflective*).

---

## 3. Kesesuaian Implementasi pada MeIntervUAI

Berdasarkan audit terhadap kode antarmuka dan pratinjau lembar kertas di MeIntervUAI:

1. **Auto-Switch Cerdas Sesuai Standar ATS**:
   - Saat pengguna memilih template **Ivy Classic** atau **Tech Silicon**, sistem otomatis **menonaktifkan foto** demi menjaga integritas lolos ATS internasional dan kepatuhan EEOC.
   - Saat pengguna memilih template **BUMN Nasional**, **Europass**, atau **Executive DIN**, sistem otomatis **mengaktifkan pasfoto**.
2. **Rasio 3:4 yang Presisi & Penempatan Otomatis Sesuai Regulasi**:
   - Di `PratinjauKertasATS.tsx` dan `FormKontakCV.tsx`, bingkai foto dikunci pada dimensi standar pasfoto (`w-16 h-20` / `w-20 sm:h-24`, proporsi 3:4).
   - **Posisi Terkunci Otomatis (Tanpa Pilihan Manual)**: Sistem otomatis memposisikan foto di **Kiri Atas** untuk template `bumn_nasional` (sesuai standar administrasi BKN & Z-pattern nasional), dan di **Kanan Atas** untuk `europass_slate` dan `executive_din` (sesuai standar DIN 5008 & Europass).
3. **Pemisahan Teks & Gambar (Safe Parsing ATS)**:
   - Gambar tidak mengganggu struktur teks vertikal (single-column text flow) sehingga saat diekspor ke PDF teksnya tetap terindeks secara selektif oleh parser ATS.
4. **Fleksibilitas Pengguna Terarah**:
   - Pengguna tetap memegang kendali untuk mengunggah, mengganti, atau menghapus foto, sementara kepatuhan letak/posisi dijamin 100% oleh sistem agar dokumen tidak melanggar standar rekrutmen institusional.
