# Standar UI/UX, Multi-Device & Rotasi Layar: IntervU AI (UX-01 s.d UX-12)

Ruang lingkup: Kualitas visual premium, responsivitas semua perangkat (320px–1920px), ketahanan rotasi layar, dan aksesibilitas kontras.

## Aturan Utama

### UX-01: Sebutkan Nama Teknis Elemen
Saat membahas atau memperbaiki antarmuka, sebutkan nama komponennya secara teknis (misal: *pagination*, *toast*, *modal dialog*, *card*).

### UX-02: Desain Premium, Bukan Slop AI
- Maksimal **1 warna dominan netral + 1 warna aksen terarah** (total corak warna ≤ 3).
- Dilarang: *glassmorphism* berat yang bertumpuk, gradien pelangi lebih dari 2 warna, bayangan melayang berlebihan, dan border neon acak.

### UX-03: Warna Status Terstandarisasi
- Merah: Error / Kuota Habis (`rose-600`)
- Kuning: Peringatan (`amber-500`)
- Hijau: Sukses / Saldo Terisi (`emerald-600`)
- Biru: Informasi (`sky-600`)

### UX-04: Ikon Terverifikasi (Bukan Emoji Keyboard)
- Dilarang menggunakan emoji keyboard (🔥, 🚀) sebagai ikon navigasi.
- Gunakan pustaka resmi seperti `lucide-react` dengan ukuran konsisten.

### UX-05: Konsistensi Antarhalaman
Halaman baru wajib menyesuaikan ukuran tajuk, jarak spasi, dan gaya kartu dari halaman yang telah ada.

### UX-06: Rasio Komponen Terukur
Gunakan rasio aspek proporsional untuk kartu dan gambar: `1:1`, `4:3`, `3:4`, `16:9`.

### UX-07: Skala Ukuran Kelipatan 4
Gunakan kelipatan 4px untuk padding, margin, dan radius: **4px, 8px, 12px, 16px, 24px, 32px, 48px**.

### UX-08: Skala Warna Bertahap (Shade Ramp)
Setiap warna memiliki turunan bertahap minimal 5 langkah (misal: `brand-900` s.d `brand-100`).

### UX-09: Kontras Teks Aman (WCAG AA)
- Teks normal: Rasio kontras minimum **≥ 4.5:1** terhadap latar belakang.
- Teks besar (≥ 24px atau ≥ 18px tebal) & ikon: Rasio kontras **≥ 3:1**.

### UX-10: Pendekatan Mobile-First
Desain dibangun dari layar terkecil terlebih dahulu, kemudian ditingkatkan ke layar yang lebih besar. Tidak boleh ada *horizontal scroll* pada perangkat seluler.

### UX-11: Seluruh Ukuran Perangkat (320px s.d 1920px)
Tata letak wajib diuji dan bertahan pada seluruh ukuran standar:
- **320px**: Ponsel kecil (iPhone SE 1).
- **480px**: Ponsel layar sedang.
- **768px**: Tablet portrait.
- **1024px**: Tablet landscape / Laptop kecil.
- **1280px**: Laptop standar.
- **1440px - 1920px**: Layar monitor desktop besar & ultrawide.
- Gunakan **Tipografi Cair (*Fluid Typography*)** via CSS `clamp()` untuk transisi ukuran teks yang halus.
- Elemen sentuh (tombol dan kontrol form) wajib memiliki **target sentuh minimum 44px** (`min-h-[44px]`).

### UX-12: Ketahanan Rotasi Layar (Portrait ↔ Landscape)
- Saat ponsel atau tablet diputar ke posisi landscape, tinggi viewport berkurang tajam (seringkali hanya 320px–420px).
- Modal dialog wajib memiliki `max-h-[90vh] overflow-y-auto` agar formulir dan tombol konfirmasi tetap dapat digulir dan tidak terpotong.
- Terapkan `viewport-fit=cover` dan padding lingkungan `env(safe-area-inset-*)` untuk mencegah konten tertutup oleh poni kamera (notch).
