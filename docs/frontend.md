# Standar Frontend: MeIntervUAI (FE-01 s.d FE-05)

Ruang lingkup: Struktur kode frontend, urutan render, pendekatan komponen OOP/DRY, sentralisasi token desain, modul dwibahasa i18n, dan standardisasi form input mobile-first.

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
 
+### FE-07: Pemuatan Data & Transisi Menggunakan Skeleton Loading (Anti-Spinner Loop)
+- Pemuatan data halaman awal dan transisi antar menu/tab dilarang menggunakan spinner memutar di tengah layar kosong.
+- Gunakan kerangka *Skeleton Shimmer* (`animate-pulse`) yang mencerminkan struktur layout sebenarnya agar tidak memicu *layout shift*. Spinner putar (`animate-spin`) hanya diizinkan di dalam elemen mikro seperti tombol submit.

