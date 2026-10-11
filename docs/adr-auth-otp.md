# ADR-001: Alur Pendaftaran Akun, Format ID Anti-Duplikasi & Verifikasi Email OTP

## Konteks & Latar Belakang Masalah
Sebelumnya, proses pendaftaran kandidat menggunakan metode bypass langsung (`signInWithPassword` otomatis) dan memotong UUID Supabase Auth (`peng_<slice>`). Hal ini menimbulkan dua kendala:
1. **Ketidaksesuaian Standar Antislop Vibecoding (`DB-05`)**: ID pengguna harus berformat `user<YYYYMMDD><4digit>` yang menjamin keunikan tanpa tanda hubung dan mudah dipindai secara visual.
2. **Kegagalan Verifikasi Email Nyata**: Akun yang membutuhkan konfirmasi email tidak diarahkan ke layar OTP, melainkan langsung gagal dengan pesan *"Invalid login credentials"*, dan email konfirmasi Supabase standar mengarah ke `localhost:3000` (port salah).

---

## Keputusan Arsitektur (Decisions)

### 1. Format ID Pengguna Urut Anti-Duplikasi (`DB-05`)
- Format ID pengguna distandarkan menjadi:
  `user<YYYYMMDD><4digit-urut>` mulai dari `0000` per hari pendaftaran (Contoh: `user202610110000`, `user202610110001`).
- Diterapkan secara seragam baik pada backend FastAPI ([auth.py](file:///d:/MeIntervUAI/backend/app/routers/auth.py), [supabase_service.py](file:///d:/MeIntervUAI/backend/app/services/supabase_service.py)) maupun pada layer frontend ([supabase.ts](file:///d:/MeIntervUAI/frontend/src/services/supabase.ts)).

### 2. Penegakan Keamanan Login (Anti-Bypass Verifikasi)
- **Email & Kata Sandi**: Pengguna yang mendaftar manual diatur dengan `email_terverifikasi = FALSE`. Jika mereka mencoba langsung masuk tanpa verifikasi OTP, sistem secara otomatis menolak akses, mengirimkan ulang kode OTP, dan mengarahkan tampilan ke tab verifikasi OTP dengan hitung mundur 30 detik.
- **Google OAuth**: Pengguna yang mendaftar atau masuk menggunakan akun Google secara otomatis diatur dengan `email_terverifikasi = TRUE` (tidak memerlukan OTP email manual) karena kepemilikan alamat email telah divalidasi langsung oleh Google.

### 3. Alur 3-Tahap Pendaftaran & Layar Verifikasi OTP
- **Tahap 1 (Formulir Pendaftaran)**: Pengguna mengisi Username, Email, Kata Sandi, dan Konfirmasi Sandi.
- **Tahap 2 (Layar Interaktif Verifikasi OTP)**:
  - Form otomatis beralih ke layar OTP tanpa berpindah URL.
  - Menampilkan kartu identitas email penerima dengan ikon amplop.
  - Input kode 6-digit dengan format monospaced terfokus.
  - Tombol **Kirim Ulang Kode OTP** yang dilengkapi countdown timer **30 detik** sebelum dapat ditekan kembali.
  - Tombol **Kembali & Periksa Email** jika kandidat ingin merevisi alamat email.
- **Tahap 3 (Aktivasi & Login Sesuai Standar)**:
  - Setelah 6-digit OTP diverifikasi sukses melalui endpoint `POST /api/auth/verifikasi-otp`, status `email_terverifikasi` diubah menjadi `TRUE`.
  - Halaman otomatis beralih ke tab **Masuk Akun** dengan notifikasi sukses, di mana kandidat login dengan email dan kata sandi yang telah didaftarkan.

---

## Status & Dampak
- **Status**: Diterima & Diimplementasikan (Accepted & Implemented).
- **Frontend Build**: Lulus kompilasi `npm run build` (1.543 modul tanpa galat).
- **Backend Test**: Endpoint `/api/auth/kirim-ulang-otp`, `/api/auth/verifikasi-otp`, dan proteksi `/api/auth/masuk` aktif.
- **Uji Coba Pengiriman OTP**: Berhasil dieksekusi ke alamat email `meintervuai@gmail.com`.
