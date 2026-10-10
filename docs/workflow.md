# Alur Kerja Agen (Workflow Rules: WF-01 s.d WF-09)

Panduan proses kerja AI coding agent agar tidak menghasilkan keluaran generik:

### WF-01: Baca Dokumentasi Terlebih Dahulu Sebelum Bertindak
- Jangan menulis kode tanpa membaca panduan di `docs/` dan file konfigurasi proyek.
- Membaca dokumen mencegah agen mengasumsikan pola sembarangan.

### WF-02: Konteks Kosong atau Tidak Jelas? Tanyakan Dahulu
- Jika kebutuhan pengguna ambigu, berhenti dan tanyakan dalam bahasa pengguna. Jangan menebak.

### WF-03: Rekomendasi Teknologi Wajib Disertai Alasan (Kelebihan & Kekurangan)
- Jelaskan *pros* dan *cons* sebelum memilih basis data, framework, atau arsitektur.

### WF-04: Buntu atau Terkendala? Cari Repositori Teruji di GitHub (> 1.000 Stars)
- Cari rujukan pola yang telah terbukti di komunitas open-source (>1.000 bintang), lalu adaptasikan secara tepat.

### WF-05: Bangun MVP Terlebih Dahulu (Anti Over-Engineering)
- Bangun versi fungsional terkecil yang menyelesaikan masalah inti. Hindari abstraksi spekulatif.

### WF-06: Header Dokumentasi Singkat di Awal Setiap File
- Setiap file kode harus diawali komentar/docstring singkat (1-3 baris) yang menjelaskan tujuan dan konten utama file.

### WF-07: Selalu Perbarui Dokumentasi Saat Kode Berubah
- Jika struktur, endpoint, atau teknologi berubah, dokumentasi harus diperbarui pada sesi yang sama.

### WF-08: Evaluasi Aturan dari Masukan Pengguna
- Jadikan koreksi pengguna sebagai sinyal untuk memperbarui dan memperketat aturan kerja.

### WF-09: Catat Peta Struktur Folder
- Peta struktur folder wajib dicatat di `docs/README.md` agar agen selanjutnya dapat menjelajah dengan terarah.
