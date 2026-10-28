# Riset Standar Evaluasi CV: Perspektif Rekruter Nyata & Metode Jev

Dokumen ini adalah basis pengetahuan (*single source of truth*) yang menjadi acuan algoritma penilaian, evaluasi AI terstruktur (Metode Jev), dan kurasi saran audit CV pada platform MeIntervUAI. Seluruh agent dan modul AI wajib merujuk dokumen ini untuk menjaga kualitas audit CV tetap manusiawi, relevan, dan terbukti secara empiris.

---

## 1. Landasan Riset: Mengapa AI Saja Tidak Cukup?

AI dan parser sistem ATS (*Applicant Tracking System*) hanyalah filter teknis awal. Penentu akhir apakah kandidat dipanggil wawancara kerja dan diterima adalah **manusia (HR Recruiter dan Hiring Manager / User)**.

Evaluasi CV di MeIntervUAI memadukan dua dimensi utama:
1. **Dimensi Mesin (ATS Pass)**: Keterbacaan struktur satu kolom, ekstraksi heading, dan kelengkapan kontak.
2. **Dimensi Rekruter Nyata (Human Appeal)**: Daya pikat 6 detik, formula pencapaian berbasis dampak angka, keaslian gaya bahasa (*anti-AI slop*), dan kesiapan menghadapi wawancara teknis/perilaku.

---

## 2. Rujukan Praktisi HR Terkemuka Indonesia

Riset ini mengompilasi kaidah praktis dari praktisi Human Resources dan kreator edukasi karier profesional di Indonesia:

### A. Vina Muliana (Praktisi HR & BUMN)
* **Penggunaan *Action Verbs* & Rumus XYZ**:
  - Hindari kalimat pasif atau sekadar *"Bertanggung jawab atas..."*.
  - Gunakan kata kerja aktif konkret (*Mengembangkan, Merancang, Mengoptimasi, Menganalisis, Mengeksekusi*).
  - Terapkan formula: *"Accomplished [X] as measured by [Y] by doing [Z]"* (capaian terukur angka/persen dengan tindakan nyata).
* **Metode CAR (Context, Action, Result)**:
  - *Context*: Situasi atau tantangan kerja yang dihadapi.
  - *Action*: Tindakan aktif yang diambil kandidat.
  - *Result*: Hasil akhir terukur menggunakan angka dan persentase (misal: *efisiensi waktu 20%, peningkatan keterlibatan 35%*).
* **Formula Ringkasan Diri "La-Pis-An"**:
  - **La**tar belakang pendidikan atau keahlian dasar.
  - As**Pis**i karier (spesifik menyebut posisi yang ditargetkan).
  - Kemampu**An** utama yang relevan dan siap diimplementasikan.
* **Larangan Desain Berlebih (*Anti-Overdesign*)**:
  - Dilarang mencantumkan grafik batang kemampuan (*skill bars/percentages*), tabel bertumpuk, atau ikon rumit yang mengacaukan pemindaian ATS dan melelahkan mata HR.
  - Hindari *over-sharing* data pribadi yang tidak relevan (RT/RW, agama, status pernikahan, tinggi/berat badan).

### B. Eza Hazami (Praktisi HR & Employer Branding)
* **Uji 6-9 Detik Skimming HR**:
  - Rekruter menyeleksi puluhan hingga ratusan CV setiap pagi dengan waktu baca rata-rata 6-9 detik.
  - Informasi paling bernilai (posisi target, peran terakhir, dan pencapaian puncak) wajib berada di baris-baris atas (*prime visual real estate*).
* **Validitas Tautan Portofolio & Google Drive**:
  - Sering kali tautan GitHub atau Google Drive portofolio masih dalam kondisi terkunci (*restricted / minta izin akses*). Ini adalah kesalahan fatal yang membuat HR langsung mendiskualifikasi berkas. Audit wajib mengingatkan kelayakan akses tautan publik sebelum dikirim.
* **Format Ringkasan Diri (Professional Summary)**:
  - Ringkasan profil wajib padat 3 unsur: *Siapa Anda + Bidang/Posisi yang dilamar + Keahlian/pencapaian utama yang relevan*. Dilarang deskripsi kosong atau klaim generik tanpa arah.
* **Panjang Ideal**:
  - Maksimal 1 hingga 2 halaman rapi, linear, dan padat konteks.

### C. Yova Beltz & Ridha Poetri (Praktisi HR & Karir)
* **Larangan Rating Bintang / Progress Bar pada Keahlian**:
  - Penggunaan visual rating seperti bintang (*Photoshop: 4/5*) atau bar persentase (*Python: 80%*) dinilai tidak objektif oleh HR dan membingungkan mesin parsing ATS. Keahlian harus dibuktikan lewat portofolio dan poin pengalaman nyata.
* **Bahaya "Satu CV untuk Semua Lowongan" (*Generic Spray-and-Pray*)**:
  - Pelamar sering gagal karena mengirim CV generik tanpa menyesuaikan kata kunci (*keywords*) dengan *job description* posisi yang dituju.
* **Bahaya *Overclaiming* / Klaim Berlebihan**:
  - Mencantumkan klaim penguasaan alat/teknologi tanpa bukti proyek nyata akan menjadi bumerang saat wawancara mendalam (*Behavioral Event Interview*).
  - Segala klaim di CV harus dapat dipertanggungjawabkan saat diuji pada sesi wawancara.

---

## 3. Rujukan Riset Global & Akademik

* **TheLadders Eye-Tracking Studies (2012 & 2018)**:
  - Mengonfirmasi bahwa rekruter manusia meninjau resume dengan pola tatapan **F-Pattern** dan **E-Pattern** dengan durasi 6 s.d 7,4 detik.
* **Laszlo Bock (Mantan SVP People Operations Google)**:
  - **Formula Google XYZ**: *"Accomplished [X] as measured by [Y] by doing [Z]"* (Mencapai hasil X, diukur dengan metrik Y, dengan melakukan tindakan Z).
* **SHRM (Society for Human Resource Management) & Harvard University**:
  - Peringatan atas kejenuhan rekruter terhadap *AI Slop / Cliches*: kata-kata hampa seperti *"hardworking, passionate, synergized, dynamic go-getter"* tanpa bukti metrik kuantitatif.

---

## 4. Implementasi Metode Jev (Decision Primitives & Teknologi Open Source)

Untuk menghasilkan evaluasi yang konsisten, murah/gratis, dan anti-halusinasi, proses penilaian CV dan pemantauan riset tidak menggunakan prompt teks bebas panjang yang boros token, melainkan mengadopsi 2 implementasi engine **Jev AI (System One Decision Primitives)**:

### Pilihan Engine Jev AI yang Digunakan di MeIntervUAI:
1. **[logan-markewich/jeff](https://github.com/logan-markewich/jeff) (100% Gratis & Self-Hosted Drop-in)**:
   - **Teknologi**: Menggunakan model open-weight GLiFormer (`knowledgator/gliformer-large-v1`, ~400M–575M parameter) dari HuggingFace.
   - **Fitur**: Menyediakan endpoint lokal `POST /v1/systemone` yang 100% cocok dengan `typesafe-sdk`.
   - **Mendukung 3 Primitives**: `Choice`, `Score`, dan `Noul` (Probabilitas boolean terkalibrasi).
   - **Keuntungan**: Berjalan 100% offline di laptop/server lokal tanpa API key, tanpa kuota, dan tanpa biaya per panggilan.

2. **[typesafe-ai/system-one-adapter-python](https://github.com/typesafe-ai/system-one-adapter-python) (Adapter Resmi TypeSafe AI)**:
   - **Teknologi**: Adapter open source resmi dari TypeSafe AI sebagai drop-in replacement `TypeSafeClient`.
   - **Fitur**: Mengarahkan request Jev Decision Primitives (`Choice`, `Score`, `Noul`) ke model fleksibel (seperti Google Gemini Flash atau model lokal via structured output).
   - **Keuntungan**: Menghemat biaya operasional karena memanfaatkan kuota gratis Gemini API secara efisien.

```
                        [ INPUT CV KANDIDAT ]
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     EVALUASI ATOMIK (JEV)       │       │    NARASI REKRUTER (GEMINI)     │
│  (logan-markewich/jeff ATAU     │       │                                 │
│  typesafe-ai/system-one-adapter)│       │                                 │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ 1. Skimmability 6-Detik (Score) │       │ • Menerjemahkan skor atomik     │
│ 2. Formula CAR/XYZ (Noul/Prob)  │  ───> │   menjadi catatan kurasi        │
│ 3. Deteksi AI Slop (Choice)     │       │   bahasa manusia yang hangat,   │
│ 4. Relevansi Role (Score)       │       │   tegas, dan solutif ala        │
│ 5. Validitas Kontak & Link      │       │   praktisi HR profesional.      │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

### Rubrik 5 Kriteria Atomik:
1. `skimmability_hierarki`: Struktur F-pattern, judul peran jelas, dan letak pencapaian di baris atas.
2. `metrik_kuantitatif_xyz`: Keberadaan rasio angka, persentase, skala, atau volume kerja dalam deskripsi pengalaman.
3. `relevansi_role_impian`: Kesesuaian keahlian teknis dan riwayat kerja dengan peran target.
4. `kebersihan_slop_kata_klise`: Bebas dari kata sifat klise robotik dan deskripsi tugas pasif.
5. `kesiapan_konfirmasi_interview`: Kesiapan klaim keahlian untuk diuji pada simulasi wawancara STAR.

---

## 5. Standar Format Umpan Balik untuk Pengguna di Beranda

Hasil audit yang ditampilkan di halaman depan wajib mengikuti gaya bahasa manusiawi:
- **Nada Bicara**: Konstruktif, profesional, langsung ke poin perbaikan (bukan basa-basi).
- **Format Saran**: Selalu menyertakan perbandingan konkret:
  - *Contoh Lemah*: "Bertanggung jawab membuat landing page."
  - *Contoh Kuat (Rekomendasi)*: "Merancang dan membangun landing page responsif yang meningkatkan konversi pendaftaran sebesar 22%."
