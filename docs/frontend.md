# Standar Frontend: IntervU AI (FE-01 s.d FE-03)

Ruang lingkup: Struktur kode frontend, urutan render, pendekatan komponen OOP/DRY, dan sentralisasi token desain.

## Aturan

### FE-01: Prioritas Urutan Render (Konten Utama Terlebih Dahulu)
- Susun urutan rendering berdasarkan prioritas pengguna: **Konten halaman utama terlebih dahulu**, elemen sekunder (notifikasi toast, popover, drawer) setelahnya.
- Hindari komponen sekunder merender atau menghalangi tampilan halaman utama sebelum data inti siap.

### FE-02: OOP & Komponen Kering (DRY Component Reuse)
- Jangan menulis ulang komponen tombol, input, atau kartu dengan gaya yang berbeda di setiap halaman.
- Bangun komponen dasar di `src/components/ui/` (`Tombol`, `KotakInput`, `Kartu`, `DialogModal`, `IndikatorToken`) dan gunakan secara konsisten di seluruh halaman aplikasi.

### FE-03: Sentralisasi Token Desain
- Dilarang memberi nilai warna, spasi, atau ukuran font sembarangan (*arbitrary hardcoding*) di setiap file.
- Seluruh variabel tema, skala ukuran, dan warna disentralisasi di `src/index.css` dan `tailwind.config.js`.
