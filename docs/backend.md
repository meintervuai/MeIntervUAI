# Standar Backend: IntervU AI (BE-01 s.d BE-02)

Ruang lingkup: API, layanan, autentikasi, validasi input, keamanan, dan batas laju (*rate limiting*).

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

### BE-03: Single Dynamic Cognitive HR Engine (Multi-LLM Fallback & Anti-Jailbreak)
Pada modul simulasi wawancara adaptif (`/api/simulasi/jawab` dan `backend/app/services/bina_service.py`):
- **Arsitektur Multi-LLM Resilient (Zero Downtime / Anti Rate-Limit)**:
  - **Primary Provider**: Cohere Command-R7B (dengan fallback otomatis antar endpoint v2 dan v1).
  - **Secondary Fallback**: Google Gemini 3.1 Flash Lite (`GEMINI_API_KEY` / `GOOGLE_API_KEY_1`) aktif seketika apabila Cohere kehabisan kuota, limit rate (HTTP 429), atau mengalami kendala koneksi.
  - **Tertiary Safety**: Fallback respons HR cerdas default tanpa memutuskan sesi simulasi.
- **Bukan Filter Regex Blacklist Rapuh**: Dilarang mengandalkan daftar kata terlarang satu per satu untuk menyaring input pengguna.
- **Universal Relevance Evaluator (Biner)**: Input pengguna diverifikasi secara semantik melalui model biner cepat untuk memastikan kandidat berada dalam koridor evaluasi profesional (kualifikasi diri, klarifikasi teknis, atau konfirmasi alur kerja).
- **Cognitive Reframing (Zero-Leakage Guarantee)**:
  - Jika input di luar nalar/topik acak (resep masakan, politik luar, lirik lagu, matematika sekolah), sistem membalikkan konteks secara dinamis sebagai bahan evaluasi sikap/fokus profesional tanpa pernah membacakan artikel ensiklopedia atau mengulang template teguran kaku.
  - Jika kandidat menanyakan istilah teknis dari pertanyaan sebelumnya (seperti *ROI*, *microservices*, *kpi*), sistem menjelaskan definisinya dalam 1 kalimat padat dan langsung menantang balik pemahaman kandidat.
- **Larangan Format AI Slop (Human Persona Standard)**:
  - Dilarang keras menggunakan penomoran daftar (**1.**, **2.**, **3.**), bullet point, atau bold heading.
  - Dilarang membombardir kandidat dengan banyak pertanyaan sekaligus dalam 1 giliran; wajib **tepat 1 pertanyaan** per giliran.
  - Bina wajib bereaksi secara manusiawi dan reaktif terhadap sikap arogan, malas, maupun trolling kandidat (misal: membedah 'malas' sebagai red flag fatal, atau menantang klaim individualis dalam kepemimpinan tim).
- **Sanitasi Artifak Token**: Menjamin tidak ada artifak token prompt (seperti `=true`, `=false`, atau sisa json mentah) yang lolos ke antarmuka pengguna.

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

