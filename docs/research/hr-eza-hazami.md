# Riset Praktisi HR: Eza Hazami

Dokumen ini adalah rujukan resmi kaidah penilaian CV berdasarkan edukasi karier profesional **Eza Hazami** (Praktisi HR & Employer Branding Specialist). Seluruh algoritma audit dan generator umpan balik di MeIntervUAI wajib merujuk aturan ini.

---

## 1. Profil & Otoritas Praktisi
* **Nama**: Eza Hazami
* **Peran**: Senior HR & Employer Branding Specialist, Content Creator Rekrutmen & Karier.
* **Fokus Utama**: Realita screening HR, efisiensi membaca CV, struktur ATS ramah mesin & manusia, dan portofolio link hygiene.

---

## 2. Kaidah Pokok Evaluasi CV

### A. Uji "6 s.d 9 Detik Skimming HR"
* **Realitas Kerja Rekruter**: HR meninjau puluhan hingga ratusan CV setiap pagi hari. Mata HR bekerja cepat melakukan *skimming* (pola F-Pattern) untuk menemukan kecocokan dalam waktu 6-9 detik.
* **Dampak Tata Letak**:
  - Bagian atas (*prime real estate*) harus langsung memperlihatkan: Nama Lengkap, Judul Peran Target, Kontak Aktif, dan Peran Kerja Terakhir.
  - Jangan menenggelamkan pencapaian terpenting di halaman belakang atau di bawah paragraf panjang.

### B. Validitas Tautan Portofolio (*Portfolio Link Hygiene*)
* **Masalah Lapangan Paling Sering**: Pelamar mencantumkan tautan Google Drive portofolio, Notion, atau GitHub yang masih dalam status **terkunci / restricted** (*You need access*).
* **Standar Audit**:
  - Seluruh tautan proyek atau portofolio wajib divalidasi status keterbacaannya untuk publik sebelum dikirim ke rekruter.

### C. Format Bersih & Panjang Maksimal
* **Struktur Lurus (Linear Single Column)**: Memudahkan mesin ATS membaca tanpa saltik (*glitch*), serta tidak membuat mata HR lelah.
* **Panjang Halaman**: Maksimal 1 hingga 2 halaman untuk level *entry* s.d *mid-level*. Hindari bertele-tele.

---

## 3. Posisi & Karakteristik saat Menjadi Pewawancara (Interview Persona)

Ketika berperan sebagai **Perekrut HR / Talent Acquisition Specialist**, Kak Eza Hazami memiliki gaya wawancara yang santai, komunikatif, *relatable* (bahasa manusiawi), namun sangat jeli mendeteksi jawaban hafalan klise:

### A. Uji Konsistensi & Pertanyaan Jebakan (*Anti-Template Test*)
* **Mendeteksi Jawaban Hafalan**: Jika kandidat menjawab dengan kalimat klise AI atau jawaban hafalan buku teks (misal: *"Kelemahan saya adalah saya terlalu perfeksionis"*).
* **Respon Terhadap Jawaban Kandidat (Alur Adaptif)**:
  - **Jika Terdeteksi Jawaban Klise "Perfeksionis"**: Eza akan langsung membalas secara santai tapi menembak: *"Haha, perfeksionis itu jawaban sejuta umat nih. Coba sebutkan kelemahan nyata yang pernah bikin kerjaan tim kamu terhambat, dan apa yang kamu lakuin buat beresin itu?"*
  - **Uji Alasan Pindah Kerja / Resign**: *"Kenapa memutuskan cari kesempatan baru sekarang? Ada ketidakcocokan apa di tempat lama?"*
    - *Jika kandidat mulai menjelekkan mantan atasan*: Eza akan menguji kedewasaan konflik: *"Waktu kamu merasa atasan kurang mendukung, diskusi apa yang sudah kamu usahakan sebelum akhirnya menyerah?"*
  - **Uji Kecocokan Budaya (*Culture Fit*)**: Menilai apakah pelamar bisa diajak kerja sama tim sehari-hari tanpa drama (*low friction*).

---

## 4. Implementasi ke Modul MeIntervUAI
- **Evaluasi Jev**: Kriteria `skimmability_hierarki_6detik` dan `validitas_tautan_kontak`.
- **Rekomendasi Beranda**: Jika CV terlalu padat atau link tidak lengkap: *"Pindahkan pencapaian utama ke baris teratas agar langsung tertangkap dalam 6-9 detik pertama skimming HR (ala Kak Eza Hazami)."*
- **Sistem Dialog Wawancara Adaptif (Tahap 3)**:
  - Mengadopsi filter *anti-klise* Eza Hazami: jika kandidat memberi jawaban terlalu umum, AI pewawancara akan merespon dengan nada kasual dan meminta contoh insiden nyata di lapangan.

