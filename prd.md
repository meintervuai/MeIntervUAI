# PRD — MENTERVU AI : Simulasi Wawancara Kerja Berbasis Kecerdasan Buatan (AI)

| Atribut | Nilai |
|---|---|
| **Nama produk** | MENTERVU AI |
| **Status dokumen** | Draft v0.1 |
| **Terakhir diperbarui** | 2026-09-06 |
| **Sumber acuan** | `SRS.docx` — Software Requirements Specification |
| **Dokumen terkait** | [`struktur_file.md`](struktur_file.md) • [`database.md`](database.md) • [`AGENTS.md`](AGENTS.md) |
| **Bahasa utama** | Bahasa Indonesia (default) — Inggris sebagai bahasa kedua |

> ⚙️ **Aturan mengikat:** Dokumen ini **saling terkait** dengan `struktur_file.md` dan `database.md`. Setiap perubahan pada satu dokumen WAJIB diikuti penyesuaian pada dua dokumen lainnya — lihat [§15](#15-peta-keterkaitan-dokumen--aturan-sinkronisasi).

---

## 1. Ringkasan Eksekutif

MENTERVU AI adalah platform berbasis web untuk membantu pencari kerja mempersiapkan diri menghadapi proses rekrutmen melalui **simulasi wawancara kerja berbasis AI** dan **pembuatan CV profesional**. Aplikasi menyasar mahasiswa tingkat akhir, lulusan baru, profesional yang ingin berkembang, dan individu yang pindah karier.

Produk dibangun di atas 5 pilar utama:

| # | Pilar | Inti |
|---|---|---|
| 1 | **Pembuat CV** | Form interaktif bertahap, 4–5 template, simpan otomatis 30 detik, ekspor PDF ramah ATS, riwayat versi |
| 2 | **Analisis & Revisi CV** | AI (peran Senior HR / ATS) menilai kelengkapan & daya tarik, rekomendasi posisi, saran perbaikan |
| 3 | **Simulasi Wawancara** | 3 mode (teks/audio/video), pertanyaan dinamis 5–15, follow-up adaptif, kontrol darurat, hybrid input |
| 4 | **Evaluasi Komprehensif** | Verbal (STAR, relevansi) + non-verbal (kontak mata, postur, durasi via MediaPipe) → skor 0–100 |
| 5 | **Pencocokan Lowongan** | JSearch API + skor kecocokan AI (skill 40%, pengalaman 30%, gaji 20%, lokasi 10%) |

**Prinsip produk:** privasi diutamakan (video wawancara tidak pernah disimpan, hasil dievaluasi sebagai transkrip + skor numerik), **mobile-first** (bukan sekadar responsif), AI yang dapat dijelaskan (explainable), serta optimasi token ketat.

## 2. Masalah & Tujuan

### Masalah
- Persiapan wawancara kerja minim latihan realistis; umpan balik sering subjektif atau tidak tersedia.
- CV lulusan baru sering gagal lolos ATS karena struktur & kata kunci yang kurang tepat.
- Akses konsultasi karier (career coach) mahal dan tidak merata, terutama bagi pengguna di Indonesia yang mayoritas mengakses internet lewat HP.

### Tujuan
- Menyediakan ruang latihan wawancara mandiri dengan umpan balik objektif, terstruktur, dan berbasis rubrik.
- Membantu pengguna menyusun CV yang kuat secara struktur (ATS-friendly) dengan saran AI yang bisa diterima/ditolak.
- Memberikan evaluasi verbal & non-verbal yang jujur dan dapat dipertanggungjawabkan (tanpa klaim deteksi emosi).
- Menghemat biaya token AI lewat batching + caching sehingga layanan tetap terjangkau (kuota 20 panggilan/hari/user).

## 3. Target Pengguna & Persona

| Persona | Karakteristik | Kebutuhan | Fitur utama |
|---|---|---|---|
| **Lulusan Baru** | Baru lulus SMA/Universitas, minim pengalaman formal | Bantuan menyusun CV dari nol, panduan menyoroti prestasi akademik & organisasi, latihan intensif membangun percaya diri | Pembuat CV, template lulusan baru, mode latihan |
| **Pencari Kerja Berpengalaman** | 1–10+ tahun pengalaman, mencari peluang baru | Optimasi CV, latihan untuk posisi spesifik, pertanyaan teknis & kepemimpinan | Analisis CV, simulasi mode video, pencocokan lowongan |
| **Pindah Karier** | Beralih industri/peran berbeda | Menyoroti keahlian yang bisa dialihkan, memahami bidang baru, penjelasan kesenjangan keahlian | Analisis kesenjangan, saran revisi CV, rekomendasi lowongan |

## 4. Lingkup Produk

### Termasuk
- Web aplikasi (bukan native mobile) dengan pendekatan **mobile-first**.
- Pembuat CV, analisis & revisi CV, simulasi wawancara (teks/audio/video), evaluasi, riwayat, dasbor, notifikasi, dan rekomendasi lowongan.
- Dukungan bahasa **Indonesia (default)** dan **Inggris** untuk isi sesi (pertanyaan, evaluasi, rekomendasi); UI antarmuka berbahasa Indonesia.

### Tidak Termasuk (batasan tegas)
- Pengembangan aplikasi mobile native pada tahap ini.
- Penyimpanan video wawancara di server mana pun (hanya skor, transkrip, dan umpan balik).
- Deteksi emosi kompleks (cemas, gugup, percaya diri) — hanya **Skor Kepercayaan Diri** dari 3 metrik objektif.
- Pemrosesan lamaran otomatis ke perusahaan (hanya mengarahkan ke URL lamaran eksternal).
- Layanan konsultasi dengan career coach manusia (sepenuhnya berbasis AI).
- Jaminan diterima kerja — berfungsi sebagai media latihan & evaluasi mandiri.

---

## 5. Lima Pilar Fitur

### 5.1 Pembuat CV & Manajemen CV
- Formulir interaktif **bertahap** (langkah demi langkah) untuk menyusun CV dari nol.
- **5 template profesional** yang dapat disesuaikan: ATS Friendly, Kronologis, Fungsional, Kombinasi, Kreatif (entitas `templat_cv` — `database.md` §5).
- **Tata Letak Pratinjau Sticky (Desktop):** Pratinjau lembar A4 di kolom kanan berposisi diam/sticky (`lg:sticky lg:top-[168px] lg:h-[calc(100vh-180px)] lg:overflow-y-auto`) dengan scrollbar internal tersendiri saat form kiri digulir ke bawah. Pada perangkat seluler, tersedia tombol toggle mode Formulir vs Pratinjau.
- **Daftar Pilihan Template Horizontal Scroll (Mobile):** Di layar seluler, daftar template ditampilkan dalam baris horizontal yang dapat digeser ke samping (`overflow-x-auto snap-x`) dengan ukuran kartu kompak (`w-[215px]`) untuk menghindari scrolling vertikal panjang.
- **Restrukturisasi Keterangan Template & Panduan Dinamis:** Deskripsi singkat diletakkan rapi persis di bawah masing-masing nama template, dilengkapi rekomendasi posisi/industri, serta kotak panduan khusus dinamis di bagian bawah yang menyesuaikan dengan template aktif yang dipilih pengguna.
- **Tautan Media Sosial Lengkap (6 Platform):** Pilihan tipe tautan sosial media populer (LinkedIn, GitHub, Portofolio / Website, Twitter / X, Instagram, Facebook) menggunakan **ikon SVG kustom** di formulir editor dan seluruh template pratinjau A4.
- **Simpan otomatis setiap 30 detik** ke Supabase + cache browser sebagai cadangan saat koneksi terputus (NFR-06).
- **Ekspor PDF** ramah ATS menggunakan `html2pdf.js` (jalankan di sisi klien).
- **Riwayat versi CV** untuk pemulihan (entitas `riwayat_cv` — `database.md` §5).
- Formulir fleksibel: konten hingga 2–3 halaman (pengalaman, proyek, dll), bisa menyembunyikan bagian yang tidak relevan (sesuai kebutuhan magang/kerja/beasiswa/organisasi).
- *(Fase berikutnya)* AI memberi **saran kontekstual** berdasarkan posisi target.

### 5.2 Analisis & Revisi CV AI
- AI berperan sebagai **Senior HR dan ATS Expert** sesuai prompt resmi (lihat [§9](#9-prompt-resmi--analisis-cv-ats)).
- **Format Kotak Inline Permanen (Bukan Modal/Popup):** Analisis CV disajikan sebagai kartu inline (`KotakAnalisisCv.jsx`) permanen di dalam dashboard Home tanpa tombol tutup (X).
- **Penyimpanan Status Permanen (Persistent State):** Hasil analisis terakhir (skor ATS, skor HR, evaluasi, rekomendasi posisi, saran perbaikan) tersimpan di `localStorage` (`mentervu_analisis_cv`) & Supabase `analisis_cv`, langsung tampil saat halaman dibuka kembali.
- **Chips Rekomendasi Posisi Interaktif:** Mengklik salah satu chip rekomendasi memicu modal konfirmasi "Ubah Posisi Target?". Jika disetujui, target posisi profil diperbarui dan AI otomatis menjalankan analisis ulang.
- Keluaran AI (JSON):
  - `skor_kelengkapan` (0–100)
  - `skor_daya_tarik` (0–100)
  - `rekomendasi_posisi` (maks 3 posisi)
  - `rekomendasi_perbaikan` → `tambah` / `perbaiki` / `hapus`
- **Hasil disimpan ke DB** (`analisis_cv`) lalu ambil dari DB dan **dirender sebagai komponen UI/CSS** — bukan menampilkan teks AI mentah (pola: `struktur_file.md` §9).
- *(Fase berikutnya)* Saran per bagian bisa diterima/ditolak satu per satu atau massal (FR-07, FR-15), tampilan bandingkan berdampingan.

### 5.3 Simulasi Wawancara (3 Mode & Strict Single-Screen View)
- **Mode Teks** (default, chat WhatsApp/Telegram style, paling ringan), **Audio** (voice waveform oranye dinamis + speech-to-text), **Video** (kamera real-time mirror + live speech transcript strip).
- **Pertanyaan 1 & 2 Wajib Perkenalan Diri & Cross-Check CV**:
  - **Pertanyaan 1**: Perkenalan diri profesional & elevator pitch (latar belakang pendidikan, rangkuman karier, dan motivasi melamar).
  - **Pertanyaan 2**: Validasi & cross-check mendalam terhadap riwayat CV (mengaitkan peran spesifik di pengalaman kerja, proyek portofolio, atau latar belakang edukasi & keahlian yang tercantum di CV pengguna).
  - **Pertanyaan 3 s/d 10+**: Pertanyaan berbasis standar HRD & metode STAR teknikal/umum + adaptive follow-up cerdas.
- **Cross-Check AI Real-Time**: AI membandingkan transkrip ucapan pengguna dengan entitas CV asli (perusahaan, jabatan, nama proyek, institusi, jurusan, keahlian) dan menampilkan status validasi instan (`✓ Cocok dengan CV: [entitas]`).
- **Live Speech Transcript Dual-Buffer (Bebas Double Teks)**:
  - Pemisahan ketat antara buffer final terakumulasi (`finalTranscriptRef.current`) dan buffer sementara non-final (`interimText`).
  - Mencegah penumpukan rekaman ganda ("cerita ceritakan ceritakan ar..."), buffer dibersihkan tuntas setiap transisi pertanyaan baru.
- **Tata Letak Strict 1 Layar Penuh (Zero Scrolling / `h-[100dvh]` Non-Scrollable)**:
  - Ruang simulasi aktif mengunci scroll halaman (`fixed inset-0 z-50 h-[100dvh] w-screen overflow-hidden` dan `document.body.style.overflow = 'hidden'`).
  - Header bar kompak (`h-12 sm:h-14`), viewport utama fleksibel (`flex-1 min-h-0`), floating transcript strip internal scroll (`max-h-20 sm:max-h-24`), dan control action bar bawah terfiksasi (`h-14 sm:h-16`) sehingga bebas dari window scrolling vertikal.
- **Konsistensi Tema Oranye Terang (`oranye-*`) & Strict Anti-Black**:
  - Seluruh antarmuka simulasi menggunakan mode normal bertema oranye terang (`#FF6B00`, `#EA580C`, `#FFFDF9`, `#FFFFFF`).
  - **Dilarang menggunakan warna hitam/gelap** pada latar belakang ruang wawancara, kartu preview video/kamera, banner rapor evaluasi, maupun dialog/modal. Satu-satunya warna non-oranye yang diperkenankan adalah hijau/emerald (jawaban tepat / mic aktif) dan merah (peringatan / mic senyap).
- **Indikator Loading Animasi Komprehensif (Anti-Lag / Anti-Freeze)**:
  - Setiap transisi yang memiliki latensi jaringan atau pemrosesan AI wajib dilengkapi animasi visual berputar (spinner) oranye dan pesan status deskriptif: saat menyiapkan ruang simulasi, saat AI menganalisis jawaban di mode teks/audio/video, pada tombol aksi bawah "Selesai Menjawab (Lanjut)", serta overlay layar penuh saat AI menyusun rapor evaluasi holistik di akhir sesi.
- **Evaluasi AI Semantik Ketat Terhadap Jawaban Ngawur / Spam**:
  - Algoritma AI mendeteksi secara presisi jawaban keyboard smashing (seperti `skdaldsalda`), pengulangan konsonan/vokal tak wajar, atau klik lanjut tanpa berbicara.
  - Jawaban ngawur/spam langsung diganjar skor rendah (0–15) dan direspon dengan teguran profesional yang sopan tanpa pujian palsu.
  - Untuk jawaban yang relevan, AI mengekstraksi poin utama dan menyusun pertanyaan pendalaman dialog (`pertanyaan_lanjutan`) secara dinamis sehingga tercipta obrolan dua arah yang hidup (real conversation).
- **Penghapusan Total Dialog Native Browser (No Native Alert/Confirm Popups)**:
  - Seluruh panggilan `window.alert` dan `window.confirm` ditiadakan. Digantikan oleh komponen modal kustom in-app (`modalKonfirmasiAkhiriBuka`, `modalPeringatanBelumBicara`, `notifikasiPeringatan`) bertema oranye-putih modern dengan transisi animasi halus.
- **Rekomendasi Jawaban Berupa Contoh Nyata Role-Play (Bukan Kisi-Kisi Teoritis)**:
  - Bagian "Contoh Cara Menjawab yang Benar (Model STAR)" pada rapor review menyajikan skrip jawaban orang pertama yang realistis dan siap dipelajari, bukan sekadar instruksi skematis (seperti "Format STAR: Latar Belakang -> Keahlian").
- **Pengenalan Suara & Text-to-Speech (TTS) Alami Bahasa Indonesia**:
  - Menggunakan Web Speech API dengan listener `onvoiceschanged` untuk memuat suara peramban secara asinkron.
  - Memprioritaskan profil suara alami Bahasa Indonesia (`id-ID`, Google Bahasa Indonesia, Microsoft Gadis, Microsoft Ardi) agar artikulasi pertanyaan terdengar luwes, natural, dan tidak terbaca kaku dengan logat Inggris.
  - Lifecycle `SpeechRecognition` diperkuat dengan auto-restart pada event `onend` dan sinkronisasi status via `isAiBicaraRef` untuk menjamin transkripsi terus menyala tanpa lag.
- **Sistem Tab Ganda Menu Simulasi (Pilih Mode vs. Hasil Review Sesi)**:
  - **Tab 1 ("Pilih Mode Simulasi" - Wizard 2 Langkah Terstruktur)**:
    - **Langkah 1 (Target Pekerjaan & Perusahaan)**: Validasi access gate CV, kurasi lowongan adaptif AI (Smart Matching CV), input posisi target (dengan saran chip populer), input nama perusahaan target (dengan saran perusahaan populer & penjelasan penyelarasan konteks AI), deteksi otomatis tingkat pengalaman AI, serta pemilihan bahasa pengantar (ID/EN). Tombol navigasi *"Lanjut ke Pilih Mode & Perangkat"* terkunci sampai posisi terisi.
    - **Langkah 2 (Format & Perangkat)**: Kartu ringkasan target terpilih dengan tombol *"Ubah Target"*, seleksi 3 format wawancara (Teks, Audio, Video), panel pengecekan perangkat keras adaptif (webcam, mic berfilter echo, uji suara speaker), jaminan privasi 100% lokal browser, tips STAR, tombol *"Kembali ke Target Pekerjaan"*, dan tombol utama *"Masuk Ruang Simulasi"*.
  - **Tab 2 ("Hasil Review Sesi")**: Rekapitulasi riwayat ulasan sesi yang diselesaikan, skor total numerik, predikat kompetensi, 4 metrik pilar (Kesesuaian Isi, Struktur STAR, Kosa Kata Profesional, Kejelasan Artikulasi), catatan kekuatan & perbaikan, serta navigasi interaktif membuka rapor detail per sesi atau melatih ulang posisi target.
- **Penyimpanan & Navigasi Otomatis Pasca-Sesi**:
  - Ketika sesi diselesaikan (mencapai 10+ pertanyaan atau tombol Akhiri Sesi ditekan), hasil evaluasi langsung disimpan secara persisten ke basis data Supabase (`evaluasi_wawancara`, `sesi_wawancara`) dan cadangan `localStorage` (`mentervu_riwayat_simulasi`), kemudian pengguna otomatis diarahkan membuka tampilan rincian review pada Tab 2.
- **AI Recruiter Dinamis & Evaluasi Semantik Real-Time (Human-Like Interviewer)**:
  - **Inisiasi Percakapan oleh AI**: Di mode teks (chat), AI recruiter membuka sesi wawancara terlebih dahulu dengan salam pembuka profesional personal (menyebutkan nama posisi dan perusahaan target), disusul lontaran pertanyaan pertama (Q1). Pengguna bertindak sebagai responden kandidat.
  - **Evaluasi Semantik & Anti-Ngawur Realistis**: Setiap jawaban kandidat dievaluasi secara semantik menggunakan LLM Gateway backend (`/api/simulasi/evaluasi-interaktif`) atau fallback cerdas lokal. Menghilangkan sistem skor acak berbasis hitung kata (`kataCount > 35`). Jawaban berupa ketidaktahuan ("gak tau", "tidak tahu", "idk"), penyerahan, atau teks acak/spam secara ketat dinilai rendah (skor 0–25). Jawaban berbobot yang memenuhi metode STAR dinilai objektif (75–95).
  - **Umpan Balik Percakapan Alami (Conversational Feedback Loop)**: Sebelum melompat ke pertanyaan berikutnya, AI memberikan tanggapan lisan/chat langsung (*reaksi_pewawancara*) yang mengapresiasi atau mengomentari poin kandidat seperti pewawancara manusia nyata. Pada mode teks ditampilkan sebagai bubble chat tanggapan terpisah dengan animasi *typing indicator*, dan pada mode suara/video dibacakan via *speech synthesis* sebelum pertanyaan selanjutnya diajukan.
- **Hybrid input**: textarea ketik / tombol koreksi manual + speech-to-text.
- **Kontrol darurat**: jeda, akhiri sesi, mute mic, dan toggle kamera (dengan auto-downgrade cerdas Video → Audio).
- **Jaminan Privasi**: Video & audio diproses lokal di browser, tidak ada rekaman video/suara yang diunggah ke server mana pun.

### 5.4 Evaluasi Komprehensif
- **Verbal** (via LLM): isi jawaban, struktur (metode STAR), relevansi dengan CV, kelengkapan — dengan **normalisasi skor antar model**.
- **Non-verbal** (MediaPipe Face Landmarker + Blendshapes ARKit & 3D Head Pose, berjalan murni di memori browser pengguna): mendeteksi kontak mata (% tatap kamera vs melirik bawah/catatan), kestabilan postur tubuh (tegak vs membungkuk/miring), serta skor kepercayaan diri non-verbal secara real-time via live HUD overlay dan tersinkronisasi ke laporan evaluasi akhir (Pilar 4: Kepercayaan Diri). Deteksi bersifat responsif dan jujur (0% / indikator mencari wajah bila wajah belum masuk frame) dan 100% menjaga privasi tanpa pernah mengirim rekaman video ke server (NFR-04).
- **Skor total 0–100** dengan rincian per aspek + **AI explainable** (setiap skor disertai penjelasan dan referensi rubrik).
- Evaluasi per pertanyaan: perbandingan jawaban ideal vs jawaban pengguna.
- **Umpan balik pengguna**: pengguna dapat menandai jika penilaian AI dirasa tidak akurat (entitas `umpan_balik_akurasi`).
- **Halaman hasil ber-tab**: Evaluasi | Rekomendasi Posisi (2–3) | Lowongan (3–5).
- **Batch evaluation** di akhir sesi: auto-correct + normalisasi + umpan balik holistik digabung dalam 1 panggilan API (optimasi token).

### 5.5 Pencocokan Lowongan Kerja & Integrasi Adaptif Simulasi
- **Menu Lowongan Kerja AI (`/lowongan`)**:
  - **Pencocokan Lowongan Nyata (JSearch API & Platform Resmi)**: Sistem terhubung langsung ke backend (`POST /api/lowongan/analisis-kecocokan`) yang menarik lowongan aktif nyata via **JSearch API (RapidAPI)** dari platform bursa kerja terkemuka (**LinkedIn, Jobstreet, Glints, Indeed, Glassdoor**). Jika API key belum disetel, sistem mengagregasi tautan pencarian lowongan aktif terfilter langsung ke portal resmi platform tersebut.
  - **Skor Kecocokan AI (0–100%)**: Setiap lowongan nyata dianalisis keselarasan profilnya terhadap CV pengguna dengan pembobotan: Keahlian **40%**, Pengalaman **30%**, Kesesuaian Posisi & Industri **20%**, Sistem Kerja / Lokasi **10%**. Dilengkapi rincian *skills cocok* vs *skills gap*, wawasan kultur perusahaan, dan estimasi rentang gaji pasar.
  - **Lamar Langsung di Platform Resmi (FR-18)**: Setiap kartu lowongan menyediakan tombol *"Lamar di Platform"* yang langsung membuka tautan postingan lowongan kerja asli di LinkedIn/Jobstreet/Glints/Indeed.
  - **Sinkronisasi Langsung ke Sesi Simulasi**: Setiap lowongan nyata dapat langsung diklik *"Simulasi Wawancara"*, otomatis mentransfer judul posisi dan perusahaan target ke ruang persiapan simulasi ([Simulasi.jsx](file:///c:/Users/r/Documents/Project/MeIntervUAI/frontend/src/pages/Simulasi.jsx)) dan membuka Langkah 2 secara instan.
- **Integrasi Lowongan Adaptif pada Menu Simulasi (`/simulasi`)**:
  - Pada tab konfigurasi simulasi, tersedia panel rekomendasi lowongan AI hasil matching CV. Pengguna bebas memilih rekomendasi atau mengetikkan target perusahaan mandiri.
  - **Penyelarasan Konteks Wawancara**: AI menyusun pertanyaan pembuka dan studi kasus teknis/situasional yang disesuaikan secara spesifik dengan kultur, tantangan teknologi, dan standar bisnis perusahaan target tersebut.
- **Layar Pemuatan (Loading State) Sesi Simulasi**:
  - Saat tombol "Mulai Simulasi" ditekan, transisi dialihkan ke layar pemuatan transisional dengan animasi denyut oranye khas IntervU, indikator progres, dan teks status dinamis bertahap (menganalisis CV -> menyiapkan skenario spesifik perusahaan -> menyusun pertanyaan -> verifikasi kesiapan ruang).
  - Berjalan minimal 2.8–3 detik untuk memastikan sesi dan butir pertanyaan pertama berhasil dibuat dan disimpan di database sehingga ruang simulasi terbuka dengan pertanyaan pertama siap tampil utuh tanpa jeda kosong.

---

## 6. Functional Requirements (FR-01 s/d FR-22)

Prioritas: **P0** = wajib di Milestone 1 • **P1** = penting • **P2** = pelengkap. Kolom "Data" merujuk ke tabel di `database.md` §5.

| ID | Nama | Deskripsi | Prioritas | Milestone | Data |
|---|---|---|---|---|---|
| FR-01 | Login & Registrasi | Masuk via **Google OAuth** atau email+password; verifikasi email wajib; reset password via tautan kedaluwarsa (1 jam) | P0 | M1 | `profil` |
| FR-02 | Manajemen Profil | Edit data diri, unggah foto, kelola bahasa (id/en, default id), posisi target | P0 | M1 | `profil` |
| FR-03 | Persetujuan Akses Kamera/Mikro | Persetujuan untuk analisis real-time; **tidak ada opsi rekaman** | P1 | M3 | `pengaturan_sistem` |
| FR-04 | Pembuatan CV | Form interaktif bertahap, simpan otomatis 30 detik, 2–3 halaman | P0 | M1 | `riwayat_cv`, `templat_cv` |
| FR-05 | Template CV | 4–5 template profesional (desain, tata letak) | P0 | M1 | `templat_cv` |
| FR-06 | Analisis CV AI | AI menganalisis kelengkapan, daya tarik, rekomendasi posisi, dan perbaikan | P0 | M1 | `analisis_cv`, `pemakaian_ai` |
| FR-07 | Saran Revisi CV | Saran per bagian (Ringkasan/Pengalaman/Keahlian) yang bisa diterima/ditolak | P1 | M4 | `saran_revisi_cv` |
| FR-08 | Unduh CV PDF | Ekspor PDF profesional & ramah ATS via `html2pdf.js` | P1 | M2 | `riwayat_cv` |
| FR-09 | Persiapan Simulasi | Navigasi Tab 1 ("Pilih Mode Simulasi"): Akses gate kelengkapan CV, pilih posisi target, mode (Teks/Audio/Video), bahasa (id/en), & device check | P0 | M3 | `sesi_wawancara` |
| FR-10 | Simulasi Real-time | STT, analisis MediaPipe, hybrid input, auto-correct, timer & progress sticky, kontrol darurat, **TTS Alami Gemini/Siri (rate 0.98, pitch 1.02)**, serta **Guard Anti-Advance** yang memblokir lanjut otomatis bila kandidat belum berbicara (dengan opsi lewati berpenalti skor 0) | P0 | M3 | `sesi_wawancara`, `pertanyaan_sesi`, `jawaban_sesi` |
| FR-11 | Peringatan Koneksi | Deteksi latency tinggi / frame rendah → peringatan + tombol cepat ke mode audio | P1 | M3 | `pengaturan_sistem` |
| FR-12 | Evaluasi AI | Evaluasi verbal & non-verbal real-time + normalisasi skor antar model + **Evaluasi Semantik Ketat Anti-Ngawur** (penalti skor 0–5 untuk repetisi 'bla bla bla', spam keyboard smash, atau permintaan skip disertai teguran visual pewawancara) | P0 | M3 | `evaluasi_sesi`, `metrik_performa` |
| FR-13 | Review Hasil | Tab 2 ("Hasil Review Sesi"): Transkrip (mentah + ideal), skor total numerik, metrik pilar STAR, kekuatan & perbaikan, rekomendasi karir | P0 | M3 | `evaluasi_sesi`, `jawaban_sesi`, `evaluasi_wawancara` |
| FR-14 | Analisis Kesenjangan | AI membandingkan CV dengan jawaban → kesenjangan keahlian | P1 | M4 | `analisis_cv`, `evaluasi_sesi` |
| FR-15 | Terapkan Saran Sekali Klik | Terima/tolak saran per bagian; "Terima Semua" / "Tolak Semua" | P1 | M4 | `saran_revisi_cv` |
| FR-16 | Pencarian Lowongan | Cari & filter lowongan manual dari JSearch API | P1 | M5 | `lowongan` |
| FR-17 | Pencocokan Lowongan AI | Skor kecocokan (skill 40%, pengalaman 30%, gaji 20%, lokasi 10%) | P1 | M5 | `rekomendasi_lowongan` |
| FR-18 | Lamar Pekerjaan | Tombol mengarahkan ke URL lamaran eksternal | P1 | M5 | `rekomendasi_lowongan` |
| FR-19 | Home (Dashboard) | Ringkasan kuota AI, skor CV terakhir, tindakan cepat, riwayat kegiatan, **kotak Analisis CV inline persisten**, serta **Mobile Tab Navigation** (Ringkasan, Analisis CV, Profil CV) dengan persistent active tab | P0 | M1 | `profil`, `analisis_cv`, `pemakaian_ai` |
| FR-20 | Statistik Progress | Grafik tren skor & skill dari waktu ke waktu | P2 | M5 | `evaluasi_sesi` |
| FR-21 | Sistem Notifikasi | Notifikasi saran CV, lowongan baru, pencapaian | P2 | M5 | `notifikasi` |
| FR-22 | Riwayat Simulasi | Tab 2 Menu Simulasi: Kartu rekapitulasi riwayat sesi dengan skor, predikat, metrik STAR, tombol buka review, & tombol latih ulang | P1 | M3 | `sesi_wawancara`, `evaluasi_wawancara` |

## 7. Non-Functional Requirements (NFR-01 s/d NFR-13)

| ID | Nama | Keterangan |
|---|---|---|
| NFR-01 | Arsitektur Terpisah | Frontend & Backend terpisah (repo/folder berbeda, pola MVC); deploy Vercel; Database + Auth di Supabase |
| NFR-02 | Integrasi LLM | Gateway LLM (2× Google Gemini + OpenRouter) dengan fallback otomatis antar model + strategi optimasi token (batching + caching) |
| NFR-03 | Autentikasi & Otorisasi | Supabase Auth (Google OAuth), JWT, RLS di semua tabel; verifikasi email; magic link kedaluwarsa 1 jam |
| NFR-04 | Enkripsi & Penyimpanan | HTTPS; video wawancara **tidak disimpan**; hanya skor/transkrip/umpan balik di Supabase; foto profil di Supabase Storage |
| NFR-05 | Kepatuhan Privasi | Ekspor/hapus data pengguna; manajemen persetujuan kamera/mikrofon; privasi-by-design |
| NFR-06 | Simpan Otomatis & Sinkronisasi | Autosave 30 detik ke Supabase + cache browser sebagai cadangan |
| NFR-07 | Optimasi Koneksi | Deteksi latency tinggi → peringatan; pengguna bisa pindah manual ke mode audio |
| NFR-08 | Manajemen AI & API | Fallback antar penyedia; (1) batching pertanyaan inti & evaluasi akhir, (2) caching analisis CV, (3) dynamic follow-up hanya jika logika adaptif terpenuhi |
| NFR-09 | Antarmuka Adaptif | Mobile-first responsif (mobile/tablet/laptop/desktop), progressive enhancement |
| NFR-10 | Kontrol Simulasi | Tombol darurat (jeda/lewati/akhiri), live caption, timer + progress bar sticky, warna dinamis |
| NFR-11 | Visualisasi Data | Tampilan side-by-side revisi CV; grafik progress pengguna |
| NFR-12 | Integrasi Eksternal | OpenRouter, JSearch, Supabase, MediaPipe, html2pdf.js, Web Speech API |
| NFR-13 | Fleksibilitas Skema | Struktur data dinamis via `jsonb` (data_cv, rekomendasi, metrik) tanpa migrasi paksa |
| NFR-14 | Desain Bukan AI-Slop | Palet hangat (oranye utama), teks tidak bertabrakan, ikon SVG kustom, tanpa gradasi generik — rinci: [§11](#11-panduan-desain-design-system) |

---

## 8. Kuota AI & Strategi Optimasi Token

### 8.1 Kebijakan Kuota Harian (20 Panggilan)
- Setiap pengguna dibatasi **20 panggilan AI per hari kalender** (tidak terikat login/logout).
- **Yang dihitung:** semua pemanggilan LLM — analisis CV, generate pertanyaan inti, follow-up, auto-correct, evaluasi akhir, pencocokan AI. Panggilan yang **gagal** karena error eksternal (bukan karena habis kuota) tidak dihitung.
- Nilai default dikelola di `pengaturan_kuota_ai` → kunci `kuota_harian_panggilan` (nilai **20**). Admin bisa menaikkan/menurunkan per user lewat `profil.kuota_tambahan`.
- **Reset harian:** pola *lazy reset* — saat tanggal berubah, `profil.token_hari_ini` dikembalikan ke 0 dan `terakhir_reset_kuota` diperbarui (lihat `database.md` §9).
- Saat kuota habis (≥20): backend **menolak panggilan (HTTP 429)** dengan pesan ramah; frontend menampilkan kartu "Kuota hari ini telah habis — coba lagi besok".

### 8.2 Strategi Optimasi Token
| Teknik | Penerapan |
|---|---|
| **Batch inisialisasi** | 5–8 pertanyaan inti dibuat sekali dalam 1 panggilan |
| **Batch evaluasi akhir** | auto-correct + normalisasi skor + umpan balik holistik digabung 1 panggilan |
| **Caching analisis CV** | hasil `analisis_cv` disimpan; bila CV belum berubah, sistem memakai hasil terakhir (tidak memanggil LLM ulang) |
| **Dynamic follow-up** | follow-up hanya dipicu jika jawaban memenuhi ambang logika adaptif |
| **Pemilihan penyedia** | priority: Google akun 1 → Google akun 2 → OpenRouter (fallback otomatis) |

### 8.3 Batas Penyedia (dari pengaturan yang sudah ada)
| Kunci setting | Batas | Siklus |
|---|---|---|
| `google1_weekly_limit` | 300.000 token | mingguan (reset Senin 00:00) |
| `google2_weekly_limit` | 300.000 token | mingguan (reset Senin 00:00) |
| `openrouter_daily_limit` | 100.000 token | harian (reset tengah malam) |
| `kuota_harian_panggilan` | **20 panggilan/user** | harian (lazy reset) |

## 9. Prompt Resmi — Analisis CV (ATS)

Prompt ini adalah **satu-satunya** sumber prompt analisis CV (di-copy verbatim dari kebutuhan pengguna). Salinan fisik disimpan di `backend/app/services/ai/prompt/analisis_cv_ats.txt`. Prompt lain yang memanggil analisis CV **wajib** menggunakan file ini.

```
Role: Bertindaklah sebagai Senior HR dan ATS (Applicant Tracking System) Expert. Tugasmu adalah menganalisis data CV berikut secara mendalam.
PENTING: Abaikan sepenuhnya data gambar/foto (base64 string) dalam analisis. Fokus hanya pada teks dan struktur data.

Konteks CV (format JSON):
{{context}}

Bahasa aktif aplikasi: {{bahasa}} (gunakan bahasa ini untuk seluruh output).

Kembalikan output WAJIB dalam format JSON murni (valid JSON tanpa pembungkus ```json atau teks basa-basi):
{
  "skor_kelengkapan": <number 0-100>,
  "skor_daya_tarik": <number 0-100>,
  "rekomendasi_posisi": [
    "<Posisi 1>",
    "<Posisi 2>",
    "<Posisi 3>"
  ],
  "rekomendasi_perbaikan": {
    "tambah": ["<poin 1>", "<poin 2>"],
    "perbaiki": ["<poin 1>", "<poin 2>"],
    "hapus": ["<poin 1>", "<poin 2>"]
  }
}
Gunakan bahasa yang profesional, objektif, dan konstruktif sesuai bahasa yang aktif di aplikasi.
```

**Cara integrasi (wajib):**
1. Ambil `data_cv` (jsonb) dari `riwayat_cv` → **buang semua field gambar/base64** → isi `{{context}}`.
2. Isi `{{bahasa}}` dari `profil.bahasa` (default `id`).
3. Kirim via `services/ai/pengarah_rute_llm.py` (cek kuota dulu — §8).
4. **Validasi JSON** hasil; normalisasi skor ke 0–100; simpan ke `analisis_cv`.
5. Frontend menarik hasil dari DB → render ke komponen UI (bukan menampilkan mentah) — `struktur_file.md` §9.

## 10. Arsitektur & Stack Teknologi

```
┌─────────────────────────┐        ┌──────────────────────────┐
│        FRONTEND         │  HTTP  │         BACKEND          │
│  React + Vite + TS      │ JSON   │  Python FastAPI (MVC)    │
│  (mobile-first)         │───────▶│  controllers → services  │
│  View                   │        │  → models → Supabase     │
└───────────┬─────────────┘        └────────────┬─────────────┘
            │ Supabase JS (auth)                │ supabase-py (PostgREST)
            ▼                                   ▼
      ┌─────────────────────────────────────────────────────┐
      │                   SUPABASE                           │
      │  Auth (Google OAuth + JWT) • PostgreSQL + RLS        │
      │  Storage (foto profil)                               │
      └───────────┬─────────────────────────────────────────┘
                  │  services/ai (LLM gateway)
                  ▼
      Google Gemini 1 ─▶ Google Gemini 2 ─▶ OpenRouter (fallback)
                    + MediaPipe (client-side, non-verbal)
```

| Lapisan | Teknologi | Lokasi |
|---|---|---|
| View | React 18 + Vite + TypeScript + Tailwind | `frontend/` |
| Controller | FastAPI routes + middleware autentikasi JWT | `backend/app/controllers/` |
| Service (logika bisnis) | Modul Python | `backend/app/services/` |
| Model (data) | Supabase PostgreSQL via `supabase-py` | `backend/app/models/` |
| AI | Gemini (2 akun) + OpenRouter, MediaPipe, Web Speech API | `backend/app/services/ai/` + frontend |
| Auth | Supabase Auth (Google OAuth) | Supabase |
| Storage | Supabase Storage (foto profil) | Supabase |
| PDF | html2pdf.js (client) | frontend |
| Lowongan | JSearch API | `backend/app/services/` |

---

## 11. Panduan Desain (Design System)

> Bagian ini **mengikat** untuk semua halaman (Milestone 1 dan seterusnya). Perubahan desain → perbarui bagian ini **dan** `struktur_file.md` §5 (design tokens) agar sinkron.

### 11.1 Prinsip Anti "AI Slop" (Prioritas Utama — Berbasis Ruleset anti-slop)
Seluruh antarmuka, copywriting, dan implementasi kode wajib melewati filter **anti-slop** (`.agents/rules/antislop.md` & `.agents/skills/antislop/`, merujuk standar [anti-slop](https://github.com/miqdadbadjuber/anti-slop.git)) dengan kepatuhan mutlak terhadap Hard Gate (R-01 s/d R-38):

| ❌ Dilarang (Slop) | ✅ Yang diterapkan (Anti-Slop Standar) |
|---|---|
| Gradasi ungu–biru generik tanpa alasan | Palet hangat oranye + netral batu (stone) terkurasi |
| Emoji sebagai ikon | **SVG kustom** berukuran presisi (lihat 11.4) |
| Glassmorphism / blur berlebihan | Kartu flat, border 1px, bayangan halus minim |
| Hero besar foto stok tanpa makna | Data berguna langsung terlihat (kuota, skor, aksi cepat) |
| Semua teks rata tengah (*center-aligned slop*) | Hierarki kiri–kanan terstruktur, mobile-first |
| Bayangan tebal / neon / glow liar | Elevasi tipis, radius konsisten (rounded-xl/2xl) |
| Kotak kosong tanpa hierarki kontras | Kontras antar kartu, grid 8pt, spacing ketat |
| Spinner "berputar tak jelas" saat AI bekerja | **Skeleton loader** + status progres bertahap informatif |
| Kata-kata kosong klise AI ("elevate", "delve", "game-changer") | Salinan bahasa Indonesia ringkas, spesifik, dan berbobot |

### 11.2 Warna (Primer: Oranye)
Token desain disimpan di `frontend/src/design/tokens.js` (`struktur_file.md` §5).

```js
// ===== Token Warna MENTERVU AI =====
// Skala oranye (primer)
'--oranye-50':  '#FFF7ED',   // latar lembut kartu/hero
'--oranye-100': '#FFEDD5',
'--oranye-200': '#FED7AA',
'--oranye-300': '#FDBA74',
'--oranye-400': '#FB923C',
'--oranye-500': '#F97316',   // hover & aksen
'--oranye-600': '#EA580C',   // PRIMER: tombol utama, elemen aktif
'--oranye-700': '#C2410C',   // teks aksen & state tekan
'--oranye-800': '#9A3412',
'--oranye-900': '#7C2D12',
'--oranye-950': '#431407',

// Netral hangat (batu/stone) — menemani oranye
'--latar':        '#FAFAF7', // background halaman
'--kartu':        '#FFFFFF',
'--teks-utama':   '#292524', // batu-800: teks biasa
'--teks-sekunder':'#57534E', // batu-600: keterangan
'--teks-muted':   '#78716C', // batu-500
'--garis':        '#D6D3D1', // batu-300: border 1px
'--teks-link':    '#C2410C', // oranye-700 (AA di bg terang)
'--batu-900':     '#1C1917',
'--batu-950':     '#0C0A09', // kontainer banner & viewport simulasi gelap kontras tinggi

// Status (hanya fungsi, bukan dekorasi)
'--sukses':   '#16A34A',
'--peringatan':'#D97706',
'--bahaya':   '#DC2626',
'--info':     '#0284C7',
```

**Aturan kontras & pemakaian (agar teks tidak bertabrakan):**
- Teks putih (`#FFF`) hanya di atas `oranye-600`/`oranye-700` (tombol CTA aktif) — kontras ≥ 4.5:1.
- Teks utama = `batu-800` di atas `#FAFAF7`/`#FFF`. **Hindari menulis teks panjang berwarna oranye.**
- Oranye hanya untuk: CTA, aksen aktif, highlight nilai/skor, focus ring (`oranye-500`).
- `teks-sekunder` = batu-600, `teks-muted` = batu-500 — hanya untuk metadata/keterangan.
- Link = `oranye-700`, underline saat hover.
- Warna status hanya untuk makna (sukses/peringatan/bahaya/info) — tidak untuk dekorasi.
- Semua pasangan teks/latar wajib lolos kontras **WCAG AA (≥ 4.5:1)**; helper cek kontras di `frontend/src/utils/cek_aksesibilitas.js`.

### 11.3 Tipografi
- **Judul & tombol:** *Plus Jakarta Sans* (open-source karya Indonesia; aksara & diakritik Indonesia lengkap), weight 600–800.
- **Isi:** sistem font UI browser (`ui-sans-serif/system-ui`) agar cepat di mobile.
- Skala: 12 / 14 / **16 (dasar)** / 20 / 24 / 32 px; line-height 1.5.
- **Target sentuh minimal 44×44px** (NFR-10). Jangan letakkan dua tombol dengan warna utama bersebelahan tanpa pemisah.

### 11.4 Ikon (SVG Kustom)
- Semua ikon = **inline SVG**, stroke 1.75–2px, ujung membulat, konsisten; disimpan sebagai komponen `frontend/src/components/icons/*.jsx`.
- **Referensi gaya:** Lucide / Heroicons / Tabler (open-source) → **diubah agar khas MENTERVU** (contoh: logo = mark oranye + motif pewawancara AI).
- **Dilarang:** font icon (`@fortawesome/fontawesome`), ikon bawaan boilerplate, emoji sebagai ikon.
- Setiap ikon wajib `aria-label`/`title`.

### 11.5 Komponen Inti Analisis CV AI (Inline Box Persisten)
| Komponen | Fungsi | Data (`analisis_cv` / state) |
|---|---|---|
| `KotakAnalisisCv` | Kartu utama inline (tanpa tombol close) yang merender ringkasan ATS, HR, posisi, evaluasi, dan saran perbaikan | `skor_kelengkapan`, `skor_daya_tarik`, `rekomendasi_posisi`, `rekomendasi_perbaikan` |
| `KartuSkorCv` | 2 progress bar / donut: kelengkapan (ATS) & daya tarik (HR) | `skor_kelengkapan`, `skor_daya_tarik` |
| `DaftarPosisi` | Chips rekomendasi posisi (dapat diklik untuk beralih target posisi dengan dialog konfirmasi) | `rekomendasi_posisi[]` |
| `BagianPerbaikanCv` | 3 kolom berwarna: ➕ Tambah (hijau) · 🔧 Perbaiki (oranye) · 🗑️ Hapus (merah) | `rekomendasi_perbaikan` |
| `SkeletonAnalisis` | Skeleton loader saat AI memproses analisis | — |
| `TombolAnalisisCv` | Jalankan/ulangi analisis (memeriksa kuota harian) | — |

> Catatan: kolom `BagianPerbaikanCv` menggunakan **warna status** (hijau=sukses untuk "tambah", oranye=peringatan untuk "perbaiki", merah=bahaya untuk "hapus") untuk membedakan makna — ini pengecualian sah dari aturan "warna status hanya untuk fungsi".

### 11.6 Responsif & Mobile-First
1. Rancang **mobile (≤390px)** dulu → ukuran 768px (tablet) → ≥1024px (desktop).
2. Navigasi utama = **bottom navigation** di mobile, pindah ke sidebar/topbar di desktop.
3. Gunakan `Visual Viewport` + `env(safe-area-inset)` untuk area keyboard/notch.
4. Progres bar & CTA penting selalu terlihat (sticky) tanpa menghalangi konten.
5. CV Builder: Sidebar pratinjau sticky pada desktop (`lg:sticky lg:top-[168px] lg:h-[calc(100vh-180px)] lg:overflow-y-auto lg:overflow-x-auto`) dengan scrollbar visual yang disembunyikan (`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`), tetap mendukung scroll mouse wheel / trackpad, serta dilengkapi interaksi **Drag-to-Pan** (klik dan seret kanvas abu-abu untuk panning dokumen A4 secara mulus); pada mobile tersedia toggle mode form vs pratinjau.

### 11.7 Header Branding Permanen & Mobile Tab Navigation di Home Dashboard
Pada halaman utama (Home Dashboard), tata letak dioptimalkan untuk mobile dan desktop:
1. **Header Branding Permanen (Fixed Header Badge):**
   - Badge identitas `"POWERED BY AGIL MAHASISWA S1 SISTEM INFORMASI UKSW"` diletakkan secara permanen tepat di bawah salam sapaan header dan di atas menu tab.
   - Badge selalu terlihat secara konsisten di desktop maupun mobile tanpa berpindah-pindah atau tersembunyi saat pergantian tab.
2. **Mobile Tab Navigation 3 Tab Ringkas (`< lg` / `< 1024px`):**
   - **Tab "Ringkasan" (`ringkasan`):**
     - Banner Hero Simulasi Wawancara AI (CTA Mulai Latihan)
     - **1 Baris Horizontal 3 Stat Cards (`grid-cols-3 gap-2`):** Skor Terakhir, Sesi Latihan, dan Sisa Kuota AI tersusun sejajar hemat ruang vertikal.
     - **Integrasi Penuh Profil CV:** Komponen kelengkapan Profil CV (lingkaran persentase SVG + 6 akordion checklist data diri) tampil langsung di dalam tab Ringkasan berdampingan dengan banner dan stat cards.
   - **Tab "Analisis CV" (`analisis`):**
     - Kotak Analisis CV dengan AI (`KotakAnalisisCv`) inline lengkap dengan skor ATS/HR, evaluasi, chips rekomendasi posisi interaktif, dan rincian saran perbaikan (tambah, perbaiki, hapus).
   - **Tab "Aktivitas" (`aktivitas`):**
     - Log aktivitas wawancara, riwayat sesi latihan, dan tombol pintas mulai simulasi baru.
   *(Tab terpisah khusus Profil CV dihapus karena sudah diintegrasikan langsung ke tab Ringkasan sehingga navigasi lebih ringkas)*.

**Perilaku Status Persisten:**
- Status tab aktif disimpan di `localStorage` (`mentervu_home_tab_mobile`) dan disinkronkan ke URL search parameter `?tab=...`.
- Pada layar desktop (`≥ 1024px`), tab pill otomatis disembunyikan dan antarmuka beralih ke tata letak 2 kolom (kiri: banner, stat cards, analisis CV inline, aktivitas; kanan: sidebar kelengkapan profil CV).

### 11.8 Penyederhanaan Kartu Template CV (CV Builder)
1. **Kartu Pilihan Template Super Ringkas:**
   - Di dalam grid/carousel pilihan template, teks deskripsi panjang dan keterangan "Cocok untuk..." dipangkas dari dalam kartu.
   - Kartu hanya menampilkan: miniatur wireframe/thumbnail layout (`IlustrasiTemplateCv`) + penanda "Dipilih", badge kategori (misal: `STANDAR ATS`, `KORPORAT & BUMN`), dan Judul/Nama Template saja (misal: `CV ATS Friendly`, `CV Kronologis`, `CV Fungsional`).
   - Ukuran kartu lebih ramping (`w-[155px] sm:w-auto`), hemat ruang vertikal dan horizontal.
2. **Panduan & Keterangan Lengkap di Kotak Detail Aktif:**
   - Seluruh deskripsi lengkap template serta rekomendasi industri/kesesuaian karir dipindahkan ke kotak informasi khusus di bawah kartu yang aktif secara dinamis sesuai template yang dipilih pengguna.

### 11.9 Preset Palet Warna Profesional & Pembatasan Kontras Teks (CV Builder)
1. **Konsep Preset Tema Profesional:**
   - Menggantikan pemilihan warna acak dengan 6 kurasi tema warna profesional:
     - **Classic Monochrome** (Formal & Legal): `#1E293B` aksen, `#0F172A` heading, `#334155` subheading, `#1E293B` teks.
     - **Navy Blue** (Korporat & BUMN): `#1E40AF` aksen, `#172554` heading, `#1E3A8A` subheading, `#1F2937` teks.
     - **Deep Teal** (Eksekutif & Medis): `#0F766E` aksen, `#134E4A` heading, `#115E59` subheading, `#1F2937` teks.
     - **Warm Copper** (Tech & Modern): `#EA580C` aksen, `#7C2D12` heading, `#9A3412` subheading, `#1F2937` teks.
     - **Modern Charcoal** (Software & Tech): `#374151` aksen, `#111827` heading, `#4B5563` subheading, `#1F2937` teks.
     - **Royal Burgundy** (Hukum & Luxury): `#881337` aksen, `#4C0519` heading, `#9F1239` subheading, `#1F2937` teks.
   - Sekali klik pada salah satu kartu preset, sistem secara otomatis menerapkan racikan kombinasi yang aman, harmonis, dan memenuhi standar kontras WCAG AA untuk keempat komponen sekaligus (*Warna Aksen, Heading, Subheading, dan Teks Biasa*).
2. **Penguncian Teks Biasa pada Spektrum Gelap (Dark Grayscale):**
   - Pada kustomisasi manual lanjutan, disediakan palet cepat *Dark Grayscale* (`#111827`, `#1F2937`, `#374151`, `#0F172A`, `#18181B`).
   - Input manual warna teks biasa dilengkapi validasi *perceived luminance*. Jika pengguna memilih warna terang (kuning, merah terang, hijau muda, dsb. dengan *luminance* > 90), sistem secara otomatis mengunci dan mengembalikan warna teks ke abu gelap standar (`#1F2937`) disertai notifikasi penjelasan. Hal ini krusial untuk menjamin keterbacaan (*readability*) paragraf isi di lembar putih A4 dan mencegah penolakan oleh scanner ATS.

### 11.10 Parsing Bullet Point Semantis & Standar Ekspor PDF Bersih Bebas Watermark (CV Builder)
1. **Parser & Format Line Break Semantis (`renderDeskripsiTeks`):**
   - Mengatasi isu teks deskripsi proyek/portofolio yang sebelumnya menyatu dalam satu baris panjang tanpa mengenali newline (`\n`).
   - Sistem membaca baris baru secara terstruktur dengan utilitas `renderDeskripsiTeks`:
     - Karakter pemisah (`\n`) terbaca otomatis menggunakan `whitespace-pre-line` dan perataan teks `text-justify`.
     - Mengenali karakter penanda poin daftar (`•`, `-`, `*`, `⁃`, `–`) di awal baris dan mengonversinya menjadi elemen daftar semantis (`<ul>` dan `<li>`).
     - Setiap item daftar menggunakan struktur `flex items-start gap-1.5` dengan dot bulat berwaran aksen dinamis (`accentColor`) dan perataan teks gantung yang rapi (hanging indent), sehingga teks yang turun baris tidak menusuk ke bawah simbol bullet.
     - Diterapkan secara seragam pada bagian **Pengalaman Kerja** maupun **Proyek & Portofolio** di seluruh 5 template CV.
2. **Ekspor PDF Bersih Bebas Watermark Promosi:**
   - Menghapus seluruh label promosi aplikasi / watermark (seperti `"Dibuat dengan MeIntervU AI · Format Ramah ATS"`, `"CV Kronologis Profesional · MeIntervU AI"`, dsb.) pada bagian *footer* dokumen di semua 5 template.
   - Hasil akhir cetak dokumen hanya menyisakan penomoran halaman resmi yang elegan di sudut kanan bawah (`Halaman 1 dari 1`).
3. **Penguncian Skala Ekspor 100% & Fiksasi 1:1 Rendering (Isolasi UI Zoom & Media Screen):**
   - Mencegah kerusakan rasio, font mengecil/membesar, atau pergeseran margin saat pengguna mengunduh PDF dalam keadaan kanvas pratinjau di-zoom (misal 30%, 65%, atau 120%).
   - Fungsi `handleDownloadPdf` melakukan kloning elemen DOM `#cv-preview-sheet` ke dalam kontainer *off-screen* terisolasi (`left: -9999px`) dengan lebar desktop `1200px` dan `windowWidth: 1200` pada `html2canvas` agar aturan CSS media `screen` tetap berlaku konsisten (mencegah aturan `@media print` merusak latar belakang dan layout).
   - Menunggu font dan aset selesai dimuat (`await document.fonts.ready` dan verifikasi semua gambar avatar/foto profil telah `complete`) sebelum kanvas digambar untuk mencegah fallback font sistem ke Arial/Times New Roman.
   - Menerapkan `-webkit-print-color-adjust: exact;` dan `print-color-adjust: exact;` pada seluruh container template dan klon PDF untuk menjamin warna latar, header, dan border tampil akurat 100%.
   - Kloning dinormalkan ke dimensi standar A4 (`width: 595px; minHeight: 842px; margin: 0; boxSizing: border-box`), dan dirender oleh `html2pdf.js` / `html2canvas` dengan `scale: 2.5` beresolusi tinggi dan proporsi 100% sempurna sesuai standar cetak kertas A4.

### 11.11 Menu Simulasi Wawancara AI Multi-Mode (`/simulasi`) — Standar Video Interview (HireVue)
Halaman interaktif persiapan dan ruang simulasi wawancara kerja berbasis AI (FR-09, FR-10, FR-12, FR-13):
1. **Prasyarat Akses Berdasarkan Kelengkapan CV (Access Gate):**
   - Tombol mulai simulasi terkunci (*disabled*) jika profil CV pengguna belum memenuhi prasyarat minimal analisis AI.
   - Syarat minimal: Memiliki data **Pengalaman Kerja** (minimal 1 riwayat pekerjaan/proyek yang valid) dan **Keahlian / Skills** (minimal 1 hard/soft skills).
   - Jika belum lengkap, sistem menampilkan kartu peringatan khusus yang merinci bagian apa saja yang masih kosong disertai tombol CTA langsung menuju CV Builder (`/pembuat-cv`).
2. **Deteksi Otomatis Tingkat Pengalaman dari CV (Tanpa Input Manual):**
   - Menghilangkan input manual pilihan tingkat pengalaman (Junior/Mid/Senior).
   - AI mendeteksi dan mengambil konteks tingkat pengalaman langsung dari data riwayat kerja, durasi, dan tanggung jawab yang tercatat di CV pengguna (*Fresh Graduate*, *Junior 1-2 tahun*, *Mid-Level 3-5 tahun*, atau *Senior 5+ tahun*), ditampilkan dalam badge otomatis.
3. **Perekaman Media Bebas Echo & Desync (WebRTC Best Practice):**
   - **Pencegahan Suara Double (Echo Loop):**
     - Elemen pratinjau `<video>` lokal wajib memiliki atribut `autoPlay playsInline muted` serta penetapan imperative `el.muted = true` dan `el.volume = 0` pada callback/ref hook DOM.
     - Penerapan Acoustic Echo Cancellation (AEC), noise suppression, dan auto gain control pada constraint audio: `{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }`.
     - Jeda otomatis STT (*SpeechRecognition*) saat AI sedang berbicara (*speechSynthesis*) untuk mencegah suara AI masuk kembali sebagai jawaban pengguna.
     - Pembersihan dan penghentian seluruh track lama (`track.stop()`) sebelum memulai stream baru.
   - **Pencegahan Audio/Video Tidak Sinkron (Desync):**
     - Penggabungan track audio dan video ke dalam satu `MediaStream` tunggal sebelum diinisialisasi ke `MediaRecorder`.
     - Penggunaan codec stabil yang didukung peramban: `video/webm;codecs=vp9,opus` atau `video/webm;codecs=vp8,opus`.
     - Penambahan buffer jeda singkat (~300ms) sebelum recorder mulai merekam untuk memastikan sinkronisasi clock hardware encoder.
4. **Multi-Mode Simulasi Wawancara (Teks, Audio, Video):**
   - **Dynamic Device Check:**
     - **Mode Teks:** Melewati (*skip*) pengecekan perangkat keras sama sekali. Pengguna dapat langsung masuk ke ruang simulasi.
     - **Mode Audio:** Hanya meminta izin dan menguji Mikrofon (visual level meter). Pengecekan kamera disembunyikan.
     - **Mode Video:** Meminta izin dan menguji Mikrofon serta Kamera depan (*webcam*).
   - **Tata Letak (UI) Dinamis Berdasarkan Mode:**
     - **Mode Teks (Chat Interface):** Tampilan bertema aplikasi pesan instan (mirip WhatsApp/Telegram). Pertanyaan AI muncul sebagai *chat bubble* di kiri disertai avatar bot, jawaban pengguna di bubble kanan oranye, serta input multiline textarea dan tombol "Kirim" di bagian bawah.
     - **Mode Audio (Voice-Only Interface):** Fokus layar pada teks pertanyaan besar di tengah, avatar pengguna dengan *Audio Visualizer* gelombang suara (SVG waveform animasi) yang bereaksi terhadap suara pengguna, serta dock bawah dengan tombol Mute/Unmute Mic dan Selesai Menjawab.
     - **Mode Video (Camera & Voice Interface):** Standar HireVue dengan tata letak split-screen 40:60 di Desktop dan vertical stack di Mobile, live camera feed, indikator merah berkedip `⏺ RECORDING`, dan dock kontrol lengkap (Kamera On/Off, Mic Mute/Unmute, Selesai Menjawab).
   - **Mode Switching (Downgrade Dinamis):**
     - Pada Mode Video, pengguna dapat mematikan kamera (Camera Off) di tengah simulasi jika terjadi kendala jaringan atau privasi, secara otomatis mengalihkan visual ke mode audio tanpa menghentikan atau mereset sesi wawancara.
5. **Pewawancara AI Adaptif Berbasis CV & Dynamic Follow-up (Minimal 10 Pertanyaan):**
   - **Pertanyaan Awal Berbasis CV Nyata:** Pertanyaan pertama (Ice-breaking) dirancang secara spesifik dengan membaca data riwayat proyek atau pekerjaan nyata dari profil CV pengguna (menyebutkan nama proyek atau perusahaan secara eksplisit).
   - **Adaptive Follow-up Questioning:** AI menganalisis kata kunci dari jawaban pengguna (misal: kepemimpinan tim, penanganan bug kritis, optimasi performa, atau negosiasi stakeholder) untuk menghasilkan pertanyaan lanjutan mendalam layaknya wawancara asli.
   - **Batas Minimal Sesi:** Setiap sesi simulasi menyusun minimal 10 pertanyaan komprehensif sebelum sesi diperbolehkan selesai secara otomatis.
6. **Persistensi Database & Evaluasi Skor Komprehensif (FR-12, FR-13):**
   - Rangkaian sesi, butir pertanyaan, dan jawaban pengguna disimpan secara persisten ke database Supabase (`sesi_wawancara`, `pertanyaan_sesi`, `jawaban_sesi`, `evaluasi_sesi`) dengan sinkronisasi ke penyimpanan lokal.
   - Evaluasi pasca-wawancara menyajikan Skor Keseluruhan (0–100), Predikat Kesiapan Kerja, 4 Pilar Metrik (Kesesuaian Isi, Analisis Metode STAR, Kosa Kata Profesional, Kepercayaan Diri), Rincian Pertanyaan & Jawaban Ideal, serta Rekomendasi Karir/CV lanjutan.
7. **Penyelarasan Warna & Ergonomi Mobile (Zero-Fatigue UI/UX):**
   - **Hero Banner Bersih & Kontras Tinggi:** Menggunakan kontainer kartu putih bersih (`bg-white border border-batu-200/90`) dengan tipografi gelap kontras tinggi (`text-batu-900`) dan aksen badge oranye lembut (`bg-oranye-50 border-oranye-200 text-oranye-700`), menghilangkan potensi teks putih di atas latar terang (*contrast collision*).
   - **Kepadatan Vertikal Ringkas di Layar Mobile:** Memangkas tinggi hero banner pengantar pada layar kecil (≤390px) agar navigasi tab dan kontrol konfigurasi (Wizard 2 langkah) langsung terlihat di layar pertama (*above the fold*) tanpa memaksa pengguna melakukan *scrolling* yang melelahkan.
8. **Animasi & Transisi Halus (Framer Motion Integration):**
   - Mengadopsi library `framer-motion` untuk transisi antarmuka yang modern, responsif, dan bebas sentakan (*jank-free*).
   - **Wizard Stepper Transition:** Transisi perpindahan antara Langkah 1 (Target Posisi) dan Langkah 2 (Format & Perangkat) menggunakan animasi geser horizontal halus (`<AnimatePresence mode="wait">`).
   - **Kartu Lowongan & Modals:** Daftar kartu lowongan dirender dengan efek stagger berurutan saat dimuat, dan modal dialog (Detail & Custom Input) menggunakan efek pegas (*spring physics*) dengan pembukaan dan penutupan yang presisi.

### 11.12 Desain & Prototype Antarmuka Mobile di Google Stitch
Seluruh halaman utama MeIntervU AI dirancang secara mobile-first di **Google Stitch** (Project ID: `5300245815618569314` - *MeIntervU AI - Mobile Screens*) dengan Design System terintegrasi (`assets/1f3ba97b8beb40ddaba1a01f13f6841b`):
1. **Beranda / Landing Page (Mobile):** Header ringkas, Hero CTA ganda, Bar statistik, 5 Pilar fitur unggulan, dan sticky bottom quick-action bar.
2. **Dashboard Utama / Home (Mobile):** Kartu kuota AI harian (18/20 panggilan), status skor ATS CV, hero card rekomendasi wawancara Tokopedia, statistik performa, dan glassmorphic bottom navigation (5 tab).
3. **Simulasi Wawancara AI (Mobile):** Antarmuka video live interview, feed kamera portrait dengan framing guide, audio waveform real-time, tips metode STAR interaktif, dan bar kontrol jempol (mute, camera, selesaikan jawaban).
4. **Analisis Skor CV (Mobile):** Circular ATS gauge (88/100), rincian 4 pilar evaluasi (Format, Kata Kunci, Dampak, Struktur), chip kata kunci terdeteksi vs saran penambahan, serta kartu rekomendasi tindakan prioritas.
5. **Bursa Lowongan Kerja & Job Matcher (Mobile):** Input pencarian & filter pills (Remote, Hybrid, Jakarta), kartu lowongan kerja dengan persentase kecocokan CV nyata (94% Match), dan tombol langsung "Simulasi Wawancara Posisi Ini".
6. **Pembuat CV ATS (Mobile):** Multi-step wizard stepper (Data Diri, Pengalaman, Pendidikan, Keahlian), input form ergonomis dengan generator poin pencapaian AI, dan preview live ATS score.
7. **Masuk / Login & Profil Pengguna (Mobile):** Autentikasi Google OAuth & email yang bersih, status sisa kuota harian transparan, dan menu preferensi karir/bahasa.

---

## 12. Milestone & Roadmap

> **Milestone 1 adalah fokus saat ini.** Setelah disetujui, lanjut M2 → M3 → M4 → M5. Setiap FR yang sudah lengkap ditandai di tabel §6.

| Milestone | Nama | Lingkup | FR |
|---|---|---|---|
| **M1** | Fondasi + Home + CV | Setup backend/frontend/Supabase, **Login Google**, **Home** (dashboard + Analisis CV), **CV builder**, **Profil** | FR-01, FR-02, FR-04, FR-05, FR-06, FR-19 |
| **M2** | Penyempurnaan CV | Ekspor PDF ATS, copy/duplikat CV, optimasi autosave | FR-08 |
| **M3** | Simulasi Wawancara | 3 mode, pertanyaan dinamis, evaluasi real-time, hasil ber-tab | FR-03, FR-09, FR-10, FR-11, FR-12, FR-13 |
| **M4** | Revisi CV & Riwayat | Saran per bagian, analisis kesenjangan, bandingkan berdampingan, riwayat simulasi | FR-07, FR-14, FR-15, FR-22 |
| **M5** | Lowongan, Statistik & Notifikasi | Pencarian/pencocokan lowongan, grafik progress, notifikasi | FR-16, FR-17, FR-18, FR-20, FR-21 |

**User stories inti Milestone 1 (diterima sebagai "Selesai" bila terpenuhi):**

- **Login (FR-01)** — Sebagai pengguna, saya dapat masuk dengan akun Google; setelah masuk saya diarahkan ke `/home`; sesi tetap aktif saat refresh; saya bisa keluar. Rute tertutup mengarahkan ke `/masuk`.
- **Home (FR-19)** — Sebagai pengguna, saya melihat ringkasan kuota AI (**x/20**), skor CV terakhir (jika ada), tindakan cepat (Analisis CV, Buat CV, Simulasi — yang belum dibuka ditandai "Segera"), dan bagian Analisis CV.
- **Analisis CV (FR-06)** — Sebagai pengguna, saya bisa memilih CV (dari `riwayat_cv`) dan menekan "Analisis dengan AI"; selama menunggu muncul skeleton; hasil tampil sebagai komponen (skor, posisi, 3 kolom tambah/perbaiki/hapus) — **bukan teks AI mentah**.
- **CV builder (FR-04, FR-05)** — Sebagai pengguna, saya membuat CV bertahap, memilih salah satu dari 4–5 template, data tersimpan otomatis (autosave 30 detik) dan muncul di daftar CV.
- **Profil (FR-02)** — Sebagai pengguna, saya dapat mengubah nama, posisi target, bahasa (id/en), dan foto profil.

**Fitur Non-M1 ditampilkan sebagai "Segera Hadir" (komponen tab/nav dinonaktifkan) — jangan dibangun sebelum selesai M1.**

## 13. Batasan & Asumsi

- Aplikasi web (mobile-first), bukan native mobile.
- **Video wawancara tidak pernah disimpan** — hanya skor, transkrip, dan umpan balik.
- Tidak ada deteksi emosi; hanya Skor Kepercayaan Diri dari 3 metrik objektif.
- AI dijalankan via layanan pihak ketiga (Google Gemini ×2, OpenRouter); ketersediaan mengikuti rate limit & kebijakan penyedia.
- **Kuota 20 panggilan/hari/user** adalah sumber utama pengendalian biaya.
- Rekomendasi lowongan tidak memproses lamaran; hanya mengarahkannya ke URL eksternal.
- Bahasa awal: Indonesia (default UI & isi) + Inggris (isi sesi; UI tetap Indonesia).
- Kapasitas penyimpanan CV & riwayat mengikuti kebijakan server (Supabase).
- Asumsi: pengguna memiliki koneksi internet; mode video membutuhkan izin kamera/mikro, jika tidak tersedia sistem beralih ke mode teks.

## 14. Daftar Istilah

| Istilah | Arti |
|---|---|
| **LLM** | Large Language Model — model bahasa (Gemini/OpenRouter) |
| **STS/STT** | Speech-to-Text / ubah suara ke teks |
| **ATS** | Applicant Tracking System — sistem penyaring CV perusahaan |
| **RLS** | Row Level Security di Supabase |
| **MVC** | Model-View-Controller — pola arsitektur |
| **Batch / batching** | Menggabungkan beberapa pemanggilan dalam satu permintaan |
| **Follow-up** | Pertanyaan lanjutan adaptif |
| **Auto-correct** | Koreksi otomatis hasil STT oleh AI |
| **Skeleton loader** | Kerangka placeholder saat konten/analisis dimuat |
| **Milestone** | Tonggak penyelesaian iterasi |

## 15. Peta Keterkaitan Dokumen & Aturan Sinkronisasi

Ketiga dokumen saling membaca dan **wajib konsisten**:

| Jika terjadi perubahan… | Yang ikut diperbarui |
|---|---|
| Fitur baru / ubah FR / ubah prioritas | `prd.md` §5–§6 → `struktur_file.md` §7 (endpoint) → `database.md` §5 (tabel) |
| Tambah endpoint/controller | `struktur_file.md` §7 → `prd.md` §6 (jika FR baru) → `database.md` (jika data baru) |
| Tambah/kurangi kolom atau tabel | `database.md` §5 + §11 (migrasi) → `struktur_file.md` §4 (models/controllers) |
| Ubah struktur data AI (JSON) | `prd.md` §9 (prompt) → `database.md` §5 (kolom jsonb) → `struktur_file.md` §9 (pola render) |
| Ubah desain/warna/ikon | `prd.md` §11 → `struktur_file.md` §5 (`design/tokens.js`, `components/icons/`) |
| Ubah kuota (nilai 20) | `prd.md` §8 → `database.md` §9 → `struktur_file.md` §7 (kuota endpoint) |

**Aturan emas:**
1. **Satu sumber kebenaran.** Prompt → `prd.md` §9 & file `.txt`; Token warna → `prd.md` §11 & `tokens.js`; Skema → `database.md`.
2. Sebelum menyelesaikan tugas, jalankan checklist `AGENTS.md` §5.
3. Referensi silang selalu memakai penomoran bagian (mis. "lihat `database.md` §5") agar tetap konsisten saat ditulis ulang.
4. Setelah mengubah salah satu dokumen, **baca ulang dua lainnya** untuk memastikan tidak ada referensi yang ketinggalan.