# Standar Frontend: MeIntervUAI (FE-01 s.d FE-10)

Ruang lingkup: Struktur kode frontend, urutan render, pendekatan komponen OOP/DRY, sentralisasi token desain, modul dwibahasa i18n, standardisasi form input, pemisahan multi-device, skeleton loading, selector mode simulasi, hook visi MediaPipe, video room split-view, dan laporan evaluasi purna wawancara.

## Aturan

### FE-01: Prioritas Urutan Render (Konten Utama Terlebih Dahulu)
- Susun urutan rendering berdasarkan prioritas pengguna: **Konten halaman utama terlebih dahulu**, elemen sekunder (notifikasi toast, popover, drawer) setelahnya.
- Hindari komponen sekunder merender atau menghalangi tampilan halaman utama sebelum data inti siap.

### FE-02: OOP & Komponen Kering (DRY Component Reuse)
- Jangan menulis ulang komponen tombol, input, atau kartu dengan gaya yang berbeda di setiap halaman.
- Bangun komponen dasar di `src/components/ui/` (`Tombol`, `KotakInput`, `Kartu`, `DialogModal`, `IndikatorToken`) dan gunakan secara konsisten di seluruh halaman aplikasi.
- Dukung slot tambahan seperti `aksiKanan` pada `KotakInput` untuk tombol kontrol input (misalnya toggle password visibility) tanpa merusak konsistensi layout.

### FE-03: Sentralisasi Token Desain
- Dilarang memberi nilai warna, spasi, atau ukuran font sembarangan (*arbitrary hardcoding*) di setiap file.
- Seluruh variabel tema, skala ukuran, dan warna disentralisasi di `src/index.css` dan `tailwind.config.js`.

### FE-04: Sentralisasi Teks & Lokalisasi Dwibahasa (i18n ID/EN)
- Seluruh teks tampilan (UI copy, label form, error feedback, tombol, teks bantuan) dilarang di-hardcode di dalam komponen JSX/TSX.
- Gunakan struktur bahasa terpusat di `src/i18n/` (`types.ts`, `locales/id.ts`, `locales/en.ts`) dan konsumsi melalui hook `useBahasa()`.
- Sediakan switcher bahasa eksplisit `[ ID | EN ]` yang menyimpan preferensi pengguna di `localStorage`.

### FE-05: Standardisasi Form Input & Password Toggle Mobile-First
- Input formulir wajib menyertakan atribut semantik HTML5 (`type`, `autoComplete`, `required`).
- Form kata sandi pada antarmuka mobile wajib menyertakan toggle visibilitas (`Eye` / `EyeOff`) untuk mencegah salah ketik pada keyboard virtual layar sentuh.
- Hindari border bertumpuk atau gaya *side-tab border* tebal pada alert/notifikasi; gunakan container alert bersih dengan rounded pill, border tipis, dan ikon semantik status (sukses/gagal).

### FE-06: Pemisahan Komponen Multi-Device Berdasarkan Form-Factor
- Komponen antarmuka yang kompleks atau memiliki layout yang sangat berbeda antara mobile dan desktop wajib dipisahkan menjadi sub-komponen terisolasi:
  - `*Mobile.tsx` untuk viewport `< 768px` (dioptimasi untuk sentuhan, drawer, dan gulir vertikal bebas horizontal scroll mulai 320px).
  - `*Desktop.tsx` untuk viewport `≥ 768px` (dioptimasi untuk grid lebar, multi-kolom, shortcut, dan hover interaction).
  - `index.tsx` / Wrapper Utama sebagai koordinator yang menyajikan varian yang tepat tanpa duplikasi logika bisnis.
- **Tujuan Arsitektur**: Memudahkan pemeliharaan (*maintainability*) dan isolasi galat, sehingga perbaikan tata letak di satu jenis perangkat tidak menyebabkan regresi tampilan pada perangkat lainnya.
 
### FE-07: Pemuatan Data & Transisi Menggunakan Skeleton Loading (Anti-Spinner Loop)
- Pemuatan data halaman awal dan transisi antar menu/tab dilarang menggunakan spinner memutar di tengah layar kosong.
- Gunakan kerangka *Skeleton Shimmer* (`animate-pulse`) yang mencerminkan struktur layout sebenarnya agar tidak memicu *layout shift*. Spinner putar (`animate-spin`) hanya diizinkan di dalam elemen mikro seperti tombol submit.
- Terapkan *Stale-While-Revalidate* dengan cache browser lokal (`localStorage`) untuk pemuatan instan (0 ms).

### FE-08: Form Persiapan Simulasi & Selector Mode Wawancara (Pre-Flight Balance Check)
Pada modul persiapan wawancara (`src/pages/simulasi/komponen/FormPersiapanSimulasi.tsx`):
- **3 Format Wawancara Terbuka Penuh**:
  1. *Teks Interaktif* (10 Token): Percakapan teks dinamis dengan umpan balik cepat.
  2. *Suara / Audio AI* (15 Token): Interaksi vokal binaural berbasis TTS Fish Audio / Edge-TTS.
  3. *Video & Postur* (25 Token): Simulasi tatap muka lengkap dengan evaluasi bahasa tubuh MediaPipe real-time.
- **Validasi Saldo Pra-Sesi (Pre-Flight Balance Check)**:
  - Komponen menerima prop saldo aktif pengguna (`saldoTokenPengguna`).
  - Menghitung kecukupan saldo: `saldoCukup = saldoTersedia >= biayaToken`.
  - Apabila saldo tidak mencukupi, tombol tindakan utama (*Primary CTA*) dinonaktifkan secara disable, dan peringatan visual `{t.simulasiWawancara.saldoKurangPeringatan}` ditampilkan di atas tombol.
- **Ergonomi Sentuh & Aksesibilitas**:
  - Seluruh kartu mode, chip rekomendasi posisi, dan tombol tindakan memiliki target sentuh minimum 44px (`min-h-[44px]`).
- **Sentralisasi Bahasa Dwibahasa Simetris (FE-04)**:
  - Seluruh teks (judul format, badge biaya token, subjudul posisi, notifikasi saldo) dikonsumsi dari modul i18n (`src/i18n/locales/id.ts` dan `src/i18n/locales/en.ts`) tanpa string hardcoded mentah.

### FE-09: Hook Analisis Bahasa Tubuh Browser-Native (`usePostureAnalysis.ts` & MediaPipe Vision)
Pada modul telemetri visi real-time (`src/pages/simulasi/hooks/usePostureAnalysis.ts`):
- **100% Pemrosesan Klien Tanpa Beban Server**:
  - Mengintegrasikan `@mediapipe/tasks-vision` (`FaceLandmarker`, `PoseLandmarker`, `HandLandmarker`) yang berjalan penuh di browser pengguna melalui WebAssembly (WASM).
  - Pemuatan aset WASM dan model task secara non-blocking dari CDN resmi Google (`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`). Inisialisasi kamera tidak diblokir saat model diunduh.
- **Optimasi Performa & Throttling Loop (18 FPS)**:
  - Siklus inferensi dibatasi pada interval ~55ms (~18 FPS) menggunakan `requestAnimationFrame` dan `performance.now()`, menjaga beban CPU/GPU perangkat mobile dan laptop non-GPU tetap ringan (< 15% utilitas).
  - Penghitungan skor kontak mata menggunakan penghalusan *Exponential Moving Average* (EMA, alpha = 0.10) guna mencegah kedipan nilai (*jitter*).
- **4 Metrik Telemetri Bahasa Tubuh Real-Time**:
  1. *Kontak Mata*: Persentase fokus pandangan mata ke arah lensa kamera.
  2. *Postur*: Evaluasi kemiringan bahu dan kepala (`tegak` vs `miring`).
  3. *Bibir / Suara*: Analisis bukaan bibir saat bersuara (`jelas`, `kurang_terbuka`, `normal`).
  4. *Tangan*: Deteksi gestur tangan menyentuh area wajah (`normal` vs `menyentuh_wajah`).
- **Live Mirrored Skeleton Overlay Canvas**:
  - Merender overlay kerangka visual langsung di atas elemen canvas Picture-in-Picture (PiP): kontur wajah cyan, mata biru, sambungan bahu emerald, dan landmark tangan amber.
- **Pencegahan Notifikasi Berulang (Alert Debouncing)**:
  - Peringatan kartu visi AI (*Inline Vision Alert Card*) dilengkapi jeda waktu cooldown 35 detik agar tidak membanjiri transkrip kandidat.

### FE-10: Arsitektur Video Room Dedicated & Laporan Evaluasi Wawancara (Scorecard)
- **Komponen `VideoRoomDedicated.tsx`**:
  - Mengimplementasikan tata letak split-view responsif desktop 58% : 42% (`h-[calc(100vh-120px)]`) dan stack vertikal terpadu mobile `< 768px` (`h-screen flex flex-col`).
  - Panel Kiri: Avatar Pria Eksekutif HR (Bina) dengan animasi mikro saat audio diputar, PiP kamera kandidat di sudut kanan bawah dengan kanvas kerangka MediaPipe, 4 pill telemetri berstatus solid (bebas animasi pulsing), serta tombol PTT oranye terakota (`min-h-[52px]`).
  - Panel Kanan: Alur transkrip percakapan real-time dengan penghitung interaksi, kartu peringatan visi AI inline, dan tombol putar ulang audio Bina.
- **Komponen `LaporanEvaluasiWawancara.tsx` (Scorecard Purna Wawancara)**:
  - Dibangun modular di bawah direktori `src/pages/simulasi/komponen/evaluasi/` (terdiri atas `evaluasiTypes.ts`, `evaluasiI18n.ts`, `evaluasiData.ts`, `ScoreRingGauge.tsx`, `BentoSummaryGrid.tsx`, `QuestionAccordionItem.tsx`).
  - *Bento Grid 3 Kolom Ringkasan*:
    1. Pengukur Cincin SVG Circular (Skor 84/100, radius 54, status kesiapan kerja, dan persentil kandidat).
    2. Rincian 4 Pilar Metrik (Metode CAR: 88%, Komunikasi: 85%, Teknis: 82%, Bahasa Tubuh MediaPipe: 78%).
    3. Ringkasan Eksekutif Bina AI (Kutipan evaluasi tajam tanpa basa-basi klise, dan catatan gestur dominan).
  - *Accordion Evaluasi Per Pertanyaan*:
    - Menampilkan pertanyaan nyata, skor individual, badge kontak mata MediaPipe, transkrip jawaban, dan pemutar audio simulasi frekuensi gelombang.
    - Komparasi 2 sisi: Kotak hijau kekuatan vs Kotak oranye perbaikan kritis beserta koreksi postur bertanda waktu (timestamped MediaPipe telemetry).
    - Rekomendasi jawaban ideal dari Bina dengan formula STAR/CAR yang dipoles.
  - *Tindakan Multi-Device & Ekspor PDF*:
    - Tombol "Latih Ulang Sesi" dan "Unduh Laporan PDF" tersedia di header desktop dan floating bottom bar mobile.
    - Fungsi unduh PDF secara otomatis membuka seluruh accordion sebelum memanggil `window.print()` dengan stylesheet cetak bersih (`@media print`).


