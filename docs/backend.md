# Standar Backend: MeIntervUAI (BE-01 s.d BE-06)

Ruang lingkup: API, layanan, autentikasi, validasi input, keamanan, batas laju (rate limiting), engine adaptif Bina, modul audio, dan tarif transaksi token.

## Aturan

### BE-01: Batas Laju Permintaan (Rate Limit per User & IP)
Setiap endpoint wajib memiliki batasan kuota konkret untuk mencegah banjir bot dan pembengkakan biaya API:
- Endpoint Autentikasi (`/api/auth/*`): **5 percakapan/menit per IP**.
- Endpoint Umum (`/api/profil`, `/api/csm`, `/api/pengaturan`): **60 request/menit per user** (atau 100/menit per IP tanpa login).
- Endpoint Berat AI (`/api/cv/analisis`, `/api/simulasi/*`): **10-20 request/menit per user** + verifikasi saldo token.
- Saat kuota terlampaui: Mengembalikan kode status **HTTP 429 Too Many Requests** beserta header `Retry-After`.

### BE-02: Pencegahan Injeksi SQL & Sanitasi Input
- Gunakan kueri berparameter (*parameterized query*) melalui client Supabase; dilarang menggabungkan string kueri secara langsung (*string concatenation*).
- Validasi seluruh skema input request menggunakan model **Pydantic v2** yang ketat.
- Lindungi keluaran terhadap serangan Cross-Site Scripting (XSS).
- Batasi ukuran body request dan gunakan timeout pada setiap pemanggilan layanan pihak ketiga.

### BE-03: Single Dynamic Cognitive HR Engine (CV Grounding, Multi-LLM Fallback & Anti-Jailbreak)
Pada modul simulasi wawancara adaptif (`/api/simulasi/mulai`, `/api/simulasi/jawab`, `/api/simulasi/suara/proses`, dan `backend/app/services/bina_service.py`):
- **CV Grounding & Ekstraksi Dossier Terstruktur**:
  - Fungsi `ekstraksi_ringkasan_cv_untuk_bina` mengekstrak intisari data kandidat (kontak, ringkasan eksekutif, riwayat edukasi, pengalaman kerja, portofolio proyek, tech stack, metrik, keahlian, sertifikasi) dari `cv_pengguna.konten_json`.
  - Disuntikkan langsung ke dalam system prompt Bina sehingga seluruh pertanyaan merujuk data konkret di CV kandidat.
- **Sapaan Awal Personal Berbasis CV**:
  - `bangun_sapaan_awal_bina` menyerap nama lengkap dan riwayat kerja/studi kandidat (misal: "rekam jejak Anda sebagai Tech Lead di Fintech Nusantara") saat membuka sesi simulasi di `/api/simulasi/mulai`.
- **State Machine 6 Fase Wawancara Adaptif**:
  - Dipetakan secara dinamis berdasarkan turn percakapan pewawancara (`tentukan_fase_wawancara`):
    1. *Fase 1 (Turn 1)*: Pembuka & Motivasi Posisi.
    2. *Fase 2 (Turn 2-3)*: Eksplorasi Riwayat Kerja & Proyek Terakhir di CV.
    3. *Fase 3 (Turn 4-5)*: Deep Probing CAR/STAR & Pembuktian Metrik Mandiri (Pilar Vina Muliana & Eza Hazami).
    4. *Fase 4 (Turn 6-7)*: Simulasi Krisis Operasional & Tekanan Kerja (Pilar Apri Rokhyadi).
    5. *Fase 5 (Turn 8-9)*: Verifikasi Klaim Keahlian, Tools & Konsistensi CV (Pilar Yova Beltz & Ridha Poetri).
    6. *Fase 6 (Turn 10+)*: Sintesis Evaluasi, Reverse Inquiry & Penutupan Reflektif.
- **Arsitektur Multi-LLM Resilient (Zero Downtime / Anti Rate-Limit)**:
  - **Primary Provider**: Cohere Command-R7B (dengan fallback otomatis antar endpoint v2 dan v1).
  - **Secondary Fallback**: Google Gemini 3.1 Flash Lite (`GEMINI_API_KEY` / `GOOGLE_API_KEY_1`) aktif seketika apabila Cohere kehabisan kuota, limit rate (HTTP 429), atau mengalami kendala koneksi.
  - **Tertiary Safety**: Fallback respons HR dinamis kontekstual berbasis fase wawancara dan target role kandidat.
- **Universal Relevance Evaluator (Biner)**:
  - Input pengguna diverifikasi secara semantik melalui model biner cepat untuk memastikan kandidat berada dalam koridor evaluasi profesional (kualifikasi diri, klarifikasi teknis, atau konfirmasi alur kerja).
- **Post-Processing Anti-Slop & Enforcer 1 Pertanyaan Tunggal**:
  - Pembersihan otomatis label struktural (`Tanggapan:`, `Pertanyaan:`).
  - Pembersihan ucapan klise dan basa-basi robotik ("terima kasih sudah sharing...", "jawaban yang luar biasa...", "tentu saja...", "senang mendengarnya...").
  - Penghapusan daftar bernomor dan bullet points markdown (*, -, 1., 2.).
  - Enforcer single-question: memangkas pertanyaan kedua jika model mengajukan lebih dari 1 pertanyaan, serta menyematkan pertanyaan tajam jika model lupa menyertakan tanda tanya.
  - Eliminasi karakter em-dash strip panjang menjadi strip (-) sesuai standar UX-02 AGENTS.md.
  - Sanitasi artifak token prompt (`=true`, `=false`) dan kebocoran identitas bot AI.

### BE-04: Standar Akses Kelayakan Simulasi (CV Gate & Dynamic Role Extraction)
Pada modul persiapan wawancara (`/api/simulasi/kelayakan/{pengguna_id}`):
- **Syarat Mutlak Kelayakan (CV Gate)**:
  - Menu simulasi hanya dapat diakses jika pengguna telah mengisi minimal data **Kontak** (nama & email/telepon) dan minimal 1 riwayat **Edukasi** di CV.
  - Jika belum lengkap, endpoint mengembalikan `bisa_simulasi: false` beserta rincian kekurangan untuk mencegah AI mewawancarai profil kosong tanpa konteks.
- **Zero Hardcode (Rekomendasi Murni dari Basis Data)**:
  - Dilarang keras menaruh daftar posisi acak statis di antarmuka frontend.
  - Seluruh posisi rekomendasi diekstrak dinamis dari database pengguna:
    1. `target_role` dari dokumen CV utama (`cv_pengguna.target_role`).
    2. Rekomendasi peran hasil audit AI sebelumnya (`cv_pengguna.rekomendasi_ai.target_role`).
    3. Jabatan dari riwayat pengalaman kerja kandidat (`pengalaman_kerja[].posisi`).
    4. Target karir yang diisi pada onboarding profil (`profil_pengguna.role_impian`).
- **Efisiensi Token (Tanpa Analisis Ulang Otomatis)**:
  - Pembukaan menu simulasi hanya membaca data yang tersimpan di database (`cv_teranalisis: true/false`).
  - Tidak memotong token pengguna secara otomatis saat membuka menu simulasi. Pengguna mengendalikan sendiri analisis CV secara mandiri di kartu Beranda.

### BE-05: Modul Audio Interaktif & Multi-Language Voice Mode (Voice Mode Bina)
Pada modul suara simulasi (`/api/simulasi/suara/proses` dan `/api/simulasi/tts`):
- **Pemisahan Modular Service Audio**: Logika Text-To-Speech dan Speech-To-Text diisolasi mandiri pada `backend/app/services/audio_service.py` untuk menjaga keterbacaan router `backend/app/routers/simulasi.py`.
- **Text-To-Speech (TTS) Berbasis Arsitektur Bilingual Multilingual**:
  - **Tingkat 1 (LLM Contextual TTS)**: [Fish Audio Cloud API](https://fish.audio) (`fish-speech` / model `s2.1-pro-free`). Memahami struktur kalimat bilingual secara natural; istilah teknis bahasa Inggris di tengah kalimat Indonesia dilafalkan mulus tanpa mengeja per huruf. Dikonfigurasi melalui `FISH_AUDIO_API_KEY` dan `FISH_AUDIO_MODEL`.
  - **Tingkat 2 (Microsoft Neural Multilingual)**: `en-US-BrianMultilingualNeural` via `edge-tts`. Mampu membaca Bahasa Indonesia dan istilah Bahasa Inggris secara native tanpa perlu kamus fonetik manual.
  - Format Output: Base64 Data URL (`data:audio/mp3;base64,...`) siap putar di Web Audio API/HTML5 Audio elemen.
- **Speech-To-Text (STT) Zero-Latency & Resilient Whisper**:
  - **Jalur Utama**: Browser Web Speech API (`live_transcript`) yang dikirim langsung saat kandidat menyelesaikan rekaman (zero-latency STT, ~0 ms).
  - **Jalur Cadangan**: Groq API model `whisper-large-v3-turbo` (`language="id"` / ~300ms) untuk transkripsi audio biner raw.

### BE-06: Tarif Token Simulasi, Normalisasi Mode & Audit Buku Besar Mutasi
Pada modul simulasi wawancara (`backend/app/routers/simulasi.py`):
- **Struktur Tarif Token Berdasarkan Format Wawancara**:
  - **Mode Teks Interaktif**: 10 token per sesi.
  - **Mode Suara / Audio AI**: 15 token per sesi.
  - **Mode Video & Postur MediaPipe**: 25 token per sesi.
- **Fungsi Normalisasi Mode (`normalisasi_mode_simulasi`)**:
  - Menerima parameter mode mentah dari frontend atau klien eksternal.
  - Melakukan pembersihan whitespace dan lowercase secara deterministik.
  - Pemetaan alias: `["suara", "audio", "voice"]` dipetakan ke `suara`; `["video", "vid"]` dipetakan ke `video`; fallback atau format lain dipetakan ke `teks`.
- **Protokol Transaksi Aman & Bebas Orphan Deduction**:
  1. **Pengecekan Saldo Awal**: Membaca record `saldo_token`. Jika `jumlah_saldo < biaya_token`, request langsung ditolak dengan HTTP 400 Bad Request (`detail="Saldo token tidak mencukupi untuk memulai simulasi mode {mode}. Diperlukan {biaya_token} token."`).
  2. **Ekstraksi CV Sebelum Pemotongan**: Data `konten_json` dari tabel `cv_pengguna` diambil dan disiapkan sebelum token dipotong. Apabila kueri atau parsing CV terkendala, saldo pengguna tidak berkurang sama sekali.
  3. **Penyusunan Sapaan Awal & Sintesis Audio**: Sapaan personal dibuat melalui `bangun_sapaan_awal_bina`. Jika mode adalah `suara` atau `video`, sintesis audio TTS langsung dijalankan.
  4. **Pemotongan Saldo & Pencatatan Ledger Transaksi**:
     - Tabel `saldo_token` diperbarui (`jumlah_saldo = jumlah_saldo - biaya_token`, `total_terpakai = total_terpakai + biaya_token`).
     - Tabel `transaksi_token` mencatat baris mutasi lengkap dengan `jenis_transaksi = f"simulasi_{mode_standar}"`, `jumlah_token = -biaya_token`, `saldo_sebelum`, `saldo_sesudah`, dan deskripsi transaksi.
- **Sinkronisasi Routing Percakapan Lanjutan**:
  - Endpoint `/api/simulasi/jawab`: Mengambil data CV dari database dan menyuntikkannya ke `hasilkan_respon_bina(..., cv_data=konten_cv)`.
  - Endpoint `/api/simulasi/suara/proses`: Meneruskan transkripsi audio dan data CV ke `hasilkan_respon_bina(..., cv_data=konten_cv)` untuk menjaga konsistensi konteks wawancara.


