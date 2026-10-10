# Prinsip Dasar & Klasifikasi Aturan Antislop Vibecoding

## Apa Itu "Slop"?
**Slop** adalah keluaran (kode, UI, copy teks, skema database) yang terlihat seperti buatan mesin karena dihasilkan dari **kebiasaan default generik**, bukan dari **keputusan sadar**.

Tanda-tanda slop:
1. Terlihat generik dan cocok untuk proyek apa pun tanpa identitas khusus.
2. Mengulang tren populer tanpa alasan fungsional (misal: glassmorphism di semua komponen, glow neon berlebihan, tombol tidak berfungsi).
3. Tidak memiliki alasan "mengapa" (*why*) yang dapat diartikulasikan.

Kebalikannya bukan sekadar "rapi", melainkan **spesifik dan memiliki alasan kuat** (setiap keputusan desain atau kode dapat dijelaskan dalam satu kalimat).

---

## Tingkatan Aturan (Rule Tiers)

| Tingkatan | Makna | Konsekuensi |
| :--- | :--- | :--- |
| **Hard Gate** | Pelanggaran = Ditolak mutlak (*cannot be done*). | Wajib dipenuhi sebelum pekerjaan dinyatakan selesai. |
| **Purpose-Gate** | Teknik diizinkan hanya jika ada alasan fungsional tertulis. | Jika tidak ada alasan jelas, teknik harus dihapus/disederhanakan. |
| **Quality Locks** | Standar konsistensi dan kerapian kode. | Dijaga konsisten di seluruh modul. |

---

## Aturan Inti
- **Pertanyaan Validasi Identitas**: Jika logo dan nama produk diganti, apakah desain ini masih memiliki karakter uniknya sendiri? Jika tidak, desain terlalu generik.
- **Standar Pengerjaan (Craftsmanship)**:
  - C-1: *Intentionality* (setiap elemen memiliki alasan).
  - C-2: *Functional Completeness* (setiap tombol berfungsi nyata, tidak ada tombol mati).
  - C-3: *Content-Driven Composition* (tata letak disusun berdasarkan kebutuhan konten, bukan template AI).
  - C-4: *Resilience* (responsif di semua ukuran 320px–1920px dan tahan rotasi).
  - C-5: *Evidence Over Claims* (informasi dan data bersifat jujur, bukan klaim palsu).
