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

### UX-17: Standar Transisi Antarmuka & Skeleton Shimmer (Anti Full-Page Spinner Loop)
- **Pengalaman Transisi Instan**: Saat berpindah antar-menu atau memuat formulir kompleks, dilarang menampilkan layar putih kosong dengan satu ikon spinner di tengah yang memutar tanpa kepastian tata letak.
- **Kerangka Skeleton Proporsional**: Wajib menggunakan blok skeleton shimmer abu-abu netral (`bg-stone-200 animate-pulse rounded-*`) yang mengikuti proporsi persis dari navigasi, kartu, input teks, dan tombol asli. Pola ini memangkas persepsi waktu tunggu (*perceived latency*) dan menghilangkan lonjakan visual mendadak (*Cumulative Layout Shift*).


