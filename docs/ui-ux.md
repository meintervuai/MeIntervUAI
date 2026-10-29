# Standar UI/UX, Multi-Device & Studio Vision: MeIntervUAI (UX-01 s.d UX-20)

Ruang lingkup: Kualitas visual premium, responsivitas semua perangkat (320px–1920px), ketahanan rotasi layar, aksesibilitas kontras, voice controller, video studio split-view, telemetri bahasa tubuh MediaPipe, dan laporan evaluasi purna wawancara (Scorecard).

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
- Modal dialog dan halaman form independen wajib memiliki pembungkus dengan `min-h-screen overflow-y-auto` dan `max-h-[90vh]` pada popup dialog agar formulir dan tombol konfirmasi tetap dapat digulir dan tidak terpotong.
- Terapkan `viewport-fit=cover` dan padding lingkungan `env(safe-area-inset-*)` untuk mencegah konten tertutup oleh poni kamera (notch).

### UX-13: Standardisasi Formulir & Pengalaman Layar Sentuh Mobile
- **Target Sentuh Ergonomis**: Seluruh tombol, tab selector, checkbox, dan toggle visibilitas wajib memiliki target sentuh minimum 44px (`min-h-[44px]` dan `min-w-[44px]`).
- **Pencegahan Saltik (Fat-Finger Prevention)**: Kolom kata sandi pada formulir autentikasi wajib menyediakan toggle mata (`Eye` / `EyeOff`) agar pengguna dapat memeriksa teks sebelum submit.
- **Pencegahan Slop Side-Tab**: Dilarang menggunakan border tebal sepihak (`border-l-2`, `border-l-4`) pada kartu alert/status. Gunakan alert box bersih dengan warna latar tint halus (`bg-rose-50`, `bg-emerald-50`), border tipis seragam, dan ikon semantik status.
- **Dwibahasa Terpadu**: Di halaman alur mandiri (seperti autentikasi), sediakan pemilih bahasa cepat (`[ ID | EN ]`) di bagian header atas agar pengguna dapat memilih bahasa sebelum berinteraksi dengan input.

### UX-14: Pola Autentikasi Split-Screen Standar Industri (Rujukan GitHub >75k Stars)
- **Struktur Grid 2-Kolom Desktop (`lg:grid lg:grid-cols-2`)**:
  - **Kolom Kiri (Brand & Visual Storytelling)**: Panel latar Executive Orange (`bg-gradient-to-br from-orange-700 via-orange-800 to-orange-950`) memuat logo brand, ilustrasi vektor unDraw SVG resmi, ringkasan pilar nilai platform, serta kutipan testimoni kandidat karier (`blockquote`).
  - **Kolom Kanan (Formulir Autentikasi Terfokus)**: Form terpusat vertikal (`max-w-[380px]`), segmented tab switcher, Google OAuth resmi, input semantik, toggle password, dan *terms & privacy notice* di bagian bawah tanpa scrollbar di desktop (`h-screen overflow-hidden`).
- **Pengalaman Layar Seluler (`< 1024px`)**: Kolom visual kiri disembunyikan otomatis (`hidden lg:flex`), form mengambil lebar penuh dengan padding ergonomis, fokus 100% pada konversi pendaftaran tanpa hambatan visual berat.
- **Zero AI-Slop & Zero Nested Cards**: Dilarang membuat kartu bertumpuk di dalam kartu, bayangan melayang berlebihan (*wide shadow*), maupun *kicker eyebrow* di atas judul. Heading harus tampil kuat, mandiri, dan berbobot.

### UX-15: Standar Onboarding Profil & Personalisasi Studio (Pola Interaktif & Humanis)
- **Zero Friction & Human Tone**: Hindari istilah intimidatif seperti kewajiban administratif. Gunakan penjelasan humanis tentang bagaimana AI menyesuaikan gaya pertanyaan dan rubrik STAR berdasarkan tahapan karir pengguna.
- **Visual Micro-Hierarchy**: Gunakan icon visual (`Sparkles`, `User`, `GraduationCap`, `Briefcase`) untuk memperjelas konteks setiap bagian input secara intuitif.
- **Fleksibilitas Role & Quick-Fill Chips**: Input posisi/role impian bersifat opsional dan dilengkapi chip pilihan rekomendasi cepat (misal: Frontend Developer, Backend Engineer, UI/UX Designer, Product Manager, Data Analyst, Customer Success).
- **Aksesibilitas & Kontras**: Seluruh label input, tombol pilihan, dan deskripsi wajib memenuhi WCAG AA ($\ge 4.5:1$ untuk teks normal) dengan target sentuh ergonomis $\ge 44\text{px}$.

### UX-16: Riset Ergonomi Mobile-Native, Tipografi & Elemen Khusus Ponsel (Anti Desktop-Shrink)
- **Dilarang Sekadar Menyusutkan Tampilan Desktop (*No Mere Scaling Down*)**:
  - Tampilan mobile bukan miniatur desktop. Dilarang sekadar memperkecil font atau memadatkan tabel desktop ke layar 360px–420px hingga tidak terbaca.
  - Setiap komponen mobile (`*Mobile.tsx`) wajib dirancang berdasarkan **riset ergonomi penggunaan satu tangan (*thumb-driven navigation*)**.
- **Standar Tipografi & Skala Teks Mobile**:
  - **Body Text**: Minimal `14px` (`text-sm`), dilarang menggunakan teks di bawah `12px` (`text-[10px]` dilarang untuk teks instruksi/konten).
  - **Heading Mobile**: Menggunakan skala proporsional yang ringkas (H1 mobile: `20px–24px`, bukan `36px–48px` yang memakan setengah layar ponsel).
  - **Tinggi Baris (Line Height)**: Gunakan `leading-relaxed` atau `leading-normal` agar paragraf tidak menumpuk saat dibaca sambil berjalan/bergerak.
- **Pola Komponen Khusus Mobile (*Mobile-Native Patterns*)**:
  - **Jangkauan Ibu Jari (*Thumb Zone*)**: Tombol tindakan utama (*Primary CTA*) diletakkan di bagian bawah layar (*sticky bottom bar* atau *floating footer* dengan padding aman `env(safe-area-inset-bottom)`), bukan di sudut atas yang sulit dijangkau.
  - **Bottom Sheet vs Modal Tengah**: Ganti pop-up tengah layar dengan *Bottom Sheet* atau drawer geser dari bawah yang mudah ditutup dengan swipe jempol.
  - **Segmented Control & Pill Carousel**: Ganti deretan tombol horizontal panjang dengan *horizontal scrollable chips/pills* dengan snapping yang mulus.
  - **Input Friendly**: Input form harus mencegah zoom otomatis di iOS Safari (`font-size >= 16px` pada input field mobile).

### UX-17: Standar Skeleton Shimmer Loading & Zero CLS (Transisi Halaman & Form)
- Pemuatan data halaman awal dan transisi antar menu/tab dilarang menggunakan spinner memutar di tengah layar kosong.
- Gunakan kerangka Skeleton Shimmer (`animate-pulse`) yang mencerminkan geometri layout sebenarnya (header, kartu form, tab pills, dan tombol).
- Menghasilkan pengalaman pengguna instan tanpa kedipan visual atau pergeseran tata letak (*Cumulative Layout Shift* / CLS).

### UX-18: Standar Studio Wawancara Split-View & Voice Controller
- **Split-View Desktop (`md:grid md:grid-cols-12 h-[calc(100vh-140px)]`)**:
  - Kolom Kiri (55%): Panel gelap dark charcoal (`#18181B` s.d `#1F1F23`) dengan concentric audio wave rings, avatar eksekutif pria HR Indonesia (Bina), status vokal real-time, dan tombol PTT oranye terakota (`#EA580C`). Seluruh kontrol pas dalam 1 layar tanpa scroll vertikal halaman utama.
  - Kolom Kanan (45%): Panel transkrip putih bersih (`#FFFFFF`) dengan border halus (`#E5E7EB`), bubble chat terpisah (Bina di kiri dengan avatar, Kandidat di kanan dengan aksen oranye), scrollable secara independen dengan auto-scroll ke interaksi terbaru.
- **Sticky Control Mobile (`< 768px`)**:
  - Compact visualizer atas (25-30% viewport), transkrip scrollable independen di bagian tengah (`flex-1`), dan Sticky Bottom Action Bar di bagian bawah untuk jangkauan ibu jari yang ergonomis saat menekan tombol bicara.

### UX-19: Standar Studio Video & Telemetri Bahasa Tubuh Real-Time
Berdasarkan spesifikasi desain mockup resmi:
- **Layout Split-View Desktop (`h-[calc(100vh-120px)]`)**:
  - **Panel Kiri (58%)**:
    * Panggung Video Utama: Menampilkan avatar visual Pria Eksekutif HR (Bina) dengan transisi visual saat audio berbicara aktif.
    * Picture-in-Picture (PiP) Kamera Kandidat: Diposisikan di pojok kanan bawah video stage dengan overlay skeleton kanvas MediaPipe (Face mesh cyan, Pose bahu emerald, Hand landmarks amber).
    * 4 Indikator Telemetri Bahasa Tubuh: Ditampilkan sebagai status pills dengan dot indikator solid statis:
      1. Kontak Mata: Persentase fokus pandangan mata ke lensa.
      2. Postur: Status tegak vs miring.
      3. Bibir / Suara: Status bukaan artikulasi (Jelas / Normal / Kurang Terbuka).
      4. Tangan: Status gestur (Normal vs Menyentuh Wajah).
    * Kontrol Bawah: Tombol utama PTT (Push-To-Talk) oranye terakota (`bg-amber-700 hover:bg-amber-800`, `min-h-[52px]`), switch mode PTT / Hands-Free, serta toggle kamera dan audio.
  - **Panel Kanan (42%)**:
    * Transkrip Percakapan Real-Time: Alur riwayat tanya jawab terstruktur dengan penghitung interaksi.
    * Inline AI Vision Alert Card: Kartu peringatan visual kontekstual (`bg-amber-50/90 border border-amber-300`) yang muncul otomatis ketika postur miring atau tangan menyentuh wajah terdeteksi secara berulang.
    * Pemutar Ulang Audio: Tombol interaktif untuk memutar kembali suara pertanyaan Bina.
- **Pengalaman Layar Seluler Mobile-First (`< 768px`)**:
  - Susunan vertikal penuh (`h-screen flex flex-col`): stage video proporsional (~38vh), deretan horizontal chip telemetri dengan scroll halus, transkrip scrollable mandiri, dan sticky footer CTA jangkauan ibu jari (`min-h-[48px]`) dengan padding lingkungan aman `env(safe-area-inset-bottom)`.
- **Standar Anti-Slop Visual Ketat**:
  - Dilarang keras menggunakan pill atau titik berkedip AI (`animate-pulse` pada status dot). Seluruh indikator telemetri wajib menggunakan status dot solid (`●`).
  - Dilarang keras menggunakan karakter em-dash (garis pisah panjang); gunakan tanda hubung biasa `-` atau titik dua `:`.

### UX-20: Standar Laporan Evaluasi Wawancara (Post-Interview Scorecard Bento Grid & Accordion)
Pada modul laporan evaluasi purna wawancara (`src/pages/simulasi/komponen/LaporanEvaluasiWawancara.tsx`):
- **Palet Warna & Hirarki Visual Terakreditasi**:
  - Latar Halaman: `#FAF8F5` (warm ivory stone).
  - Kartu & Kontainer: `#FFFFFF` dengan border halus `#E5E7EB`.
  - Warna Aksen Utama: `#EA580C` (oranye terakota) & soft amber (`#FFFBEB`, `#FEF3C7`).
  - Kekuatan / Skor Tinggi: `#16A34A` (emerald) & soft green (`#F0FDF4`, `#DCFCE7`).
  - Teks Utama: `#18181B` (zinc-900) dengan rasio kontras WCAG AA (>= 4.5:1).
- **Header Laporan**:
  - Tombol kembali ke Studio Wawancara, Judul Laporan Evaluasi, Metadata sesi (Posisi, Mode, Durasi), serta tombol tindakan "Latih Ulang Sesi" dan "Unduh Laporan PDF".
- **Bento Grid 3 Kolom Ringkasan**:
  1. *Skor Keseluruhan*: Circular SVG ring gauge (84/100, radius 54, circumference ~339.29, status "Sangat Baik - Siap Wawancara Kerja", dan chip persentil "Top 8% Kandidat Finansial").
  2. *Rincian 4 Pilar Metrik*: Rincian progres bar terkalibrasi (Metode CAR: 88%, Komunikasi: 85%, Penguasaan Teknis: 82%, Bahasa Tubuh & Postur MediaPipe: 78%).
  3. *Ringkasan Eksekutif Bina AI*: Avatar resmi Bina, kutipan evaluasi tajam berbobot (bebas kalimat klise AI), dan catatan gestur dominan kandidat.
- **Accordion Evaluasi Per Pertanyaan**:
  - Header Accordion: Pertanyaan nyata posisi profesional, skor numerik individual, badge kontak mata MediaPipe, dan chevron pembuka.
  - Body Accordion:
    * Transkrip jawaban kandidat dilengkapi pemutar audio simulasi frekuensi suara.
    * Grid Komparasi 2 Sisi: Kotak hijau kekuatan jawaban vs Kotak oranye catatan kritis dan koreksi postur MediaPipe bertanda waktu konkret (misal: `[01:14] Sudut kemiringan kepala 12°`, `[07:40] Tangan menyentuh leher 2x`).
    * Kotak Rekomendasi Jawaban Ideal dari Bina: Polesan formulasi STAR/CAR untuk meningkatkan daya saing kandidat.
- **Responsivitas Mobile (< 768px)**:
  - Bento kartu 3-kolom bertransformasi menjadi susunan vertikal 1-kolom.
  - Komparasi 2-sisi bertumpuk rapi secara vertikal tanpa pergeseran horizontal.
  - Tombol tindakan utama disajikan dalam format sticky footer bar bawah dengan target sentuh ergonomis minimum 44px (`min-h-[44px]`).
  - Mode cetak PDF (`window.print()`) otomatis mengekspansi seluruh accordion agar dokumen tercetak utuh dan menyembunyikan navigasi interaktif melalui stylesheet `@media print`.




