# Pedoman Kerja Agent: MeIntervUAI

File ini adalah instruksi operasional utama bagi seluruh AI coding agent yang bekerja di repositori MeIntervUAI. Agent wajib mematuhi aturan membaca rujukan dan memperbarui dokumentasi secara menyeluruh (semua dokumen terkait, bukan sebagian).

---

## 1. Aturan Wajib Baca Seluruh Dokumen Rujukan (Read All Relevant Docs First)

Sebelum menganalisis, merancang, atau memodifikasi kode, Agent **WAJIB** membaca dan merujuk dokumen di direktori `docs/` secara utuh:

| Bidang Pekerjaan | Dokumen Rujukan Utama |
| :--- | :--- |
| **Peta Proyek & Indeks Aturan** | [docs/README.md](file:///d:/MeIntervUAI/docs/README.md) |
| **Prinsip & Definisi Slop** | [docs/principles.md](file:///d:/MeIntervUAI/docs/principles.md) |
| **Alur Kerja Pengembang (WF-01 s.d WF-09)** | [docs/workflow.md](file:///d:/MeIntervUAI/docs/workflow.md) |
| **Backend & Keamanan API (FastAPI, Rate Limit)** | [docs/backend.md](file:///d:/MeIntervUAI/docs/backend.md) |
| **Frontend, Render, i18n & Tokens** | [docs/frontend.md](file:///d:/MeIntervUAI/docs/frontend.md) |
| **UI/UX, Mobile-First, Rotasi & Aksesibilitas** | [docs/ui-ux.md](file:///d:/MeIntervUAI/docs/ui-ux.md) |
| **Basis Data & Format ID Terstruktur** | [docs/database.md](file:///d:/MeIntervUAI/docs/database.md) |
| **Keputusan Arsitektur Sebelumnya** | [docs/adr-auth-otp.md](file:///d:/MeIntervUAI/docs/adr-auth-otp.md) |
| **Spesifikasi 6 Template CV ATS & Styling** | [docs/cv-templates-ats.md](file:///d:/MeIntervUAI/docs/cv-templates-ats.md) |
| **Standar Pasfoto CV Formal (Nasional & Global)** | [docs/cv-photo-standards.md](file:///d:/MeIntervUAI/docs/cv-photo-standards.md) |
| **Matriks Isian Form Dinamis 6 Template CV** | [docs/cv-form-field-matrix.md](file:///d:/MeIntervUAI/docs/cv-form-field-matrix.md) |
| **Indeks Riset Praktisi HR & Metode Jev** | [docs/research/README.md](file:///d:/MeIntervUAI/docs/research/README.md) |
| - *Riset HR: Vina Muliana* | [docs/research/hr-vina-muliana.md](file:///d:/MeIntervUAI/docs/research/hr-vina-muliana.md) |
| - *Riset HR: Eza Hazami* | [docs/research/hr-eza-hazami.md](file:///d:/MeIntervUAI/docs/research/hr-eza-hazami.md) |
| - *Riset HR: Yova Beltz & Ridha Poetri* | [docs/research/hr-yova-ridha.md](file:///d:/MeIntervUAI/docs/research/hr-yova-ridha.md) |
| - *Riset BUMN: Apri Rokhyadi* | [docs/research/hr-apri-rokhyadi.md](file:///d:/MeIntervUAI/docs/research/hr-apri-rokhyadi.md) |
| - *Riset Global & Evaluasi Atomik Jev* | [docs/research/standar-evaluasi-cv-rekruter.md](file:///d:/MeIntervUAI/docs/research/standar-evaluasi-cv-rekruter.md) |
| - *Engine Dialog Wawancara Adaptif* | [docs/research/panduan-dialog-wawancara-adaptif.md](file:///d:/MeIntervUAI/docs/research/panduan-dialog-wawancara-adaptif.md) |
| **Pengujian & Keamanan File Sensitif** | [docs/others.md](file:///d:/MeIntervUAI/docs/others.md) |

---

## 2. Aturan Wajib Perbarui Dokumentasi Menyeluruh (Update All on Change - Tanpa Kecuali)

Setiap kali ada instruksi, perubahan fitur, perbaikan bug, penambahan template/endpoint, atau keputusan baru dari pengguna:

1. **Sinkronisasi Menyeluruh (Semua Dokumen Terkait, Bukan Sebagian)**:
   - Dilarang hanya memperbarui kode tanpa memperbarui dokumen `.md`.
   - Dilarang hanya memperbarui satu dokumen jika perubahan berdampak pada dokumen lain. Seluruh dokumen terkait (`docs/*.md`, `docs/README.md`, `README.md`) wajib disinkronkan pada sesi yang sama.
   - Jika ada penambahan opsi/template (misal 6 template CV), seluruh dokumen spesifikasi (`docs/cv-templates-ats.md`, `docs/cv-form-field-matrix.md`, `docs/cv-photo-standards.md`, `docs/README.md`) wajib memuat opsi baru tersebut.
2. **Pencatatan Keputusan Arsitektur (ADR)**:
   - Jika perubahan menyangkut keputusan penting yang mengubah arsitektur atau alur data permanen, catat sebagai file baru `docs/adr-<topik>.md` dan daftarkan tautannya di `docs/README.md`.
3. **Prinsip Ringkas & Bersih (*Antislop* & *Writing for Agents*)**:
   - Tulis dokumentasi secara ringkas (*progressive disclosure*), padat, dan checkable.
   - Hindari kata-kata generik/klise, langsung ke poin teknis dan contoh implementasi.

---

## 3. Konfigurasi Lingkungan Aktif

- **Frontend**: Port `6825` (`npm run dev` di folder `frontend`)
- **Backend**: Port `8609` (`uvicorn app.main:app --reload --port 8609` di folder `backend`)
- **Proxy Vite**: Mengarahkan `/api` ke `http://localhost:8609`
- **Format ID**: Format urut `userYYYYMMDD0000` (tanpa tanda hubung, anti-duplikasi)

---

## 4. Aturan Wajib Dwibahasa (Mandatory Dual-Language Rule: FE-04)

Setiap pembuatan atau pembaruan komponen tampilan (UI/UX) di frontend:
1. **Dilarang Menulis Teks Mentah (Hardcoded Text)**: Seluruh teks antarmuka (judul, tombol, placeholder, label form, pesan error, notifikasi toast, tips, empty states) wajib didaftarkan ke modul lokalisasi `src/i18n/`:
   - Definisi tipe di `src/i18n/types.ts`
   - Terjemahan Bahasa Indonesia di `src/i18n/locales/id.ts`
   - Terjemahan Bahasa Inggris di `src/i18n/locales/en.ts`
2. **Konsumsi Melalui Hook `useBahasa()`**: Komponen tampilan wajib mengonsumsi teks melalui `const { t } = useBahasa()` sehingga otomatis berganti bahasa saat switcher `[ ID | EN ]` ditekan.
3. **Pengaturan Preferensi Bahasa**: Setiap kali menambahkan halaman atau komponen baru, pastikan teks di dalamnya langsung tersedia dalam versi ID dan EN secara simetris dan natural (bukan hasil translasi mesin mentah).

---

## 5. Aturan Multi-Device & Pemisahan Komponen Adaptif (FE-06 & UX-11)

Setiap pembuatan atau refactoring tampilan antarmuka (UI/UX):
1. **Dukungan Penuh Semua Rentang Layar (320px s.d 1920px+)**:
   - **320px – 479px**: Ponsel kecil (iPhone SE 1/Fold cover screen) — wajib bebas dari *horizontal scroll*, margin rapat, target sentuh ergonomis minimum 44px (`min-h-[44px]`).
   - **480px – 767px**: Ponsel standar & phablet.
   - **768px – 1023px**: Tablet portrait / layar sedang.
   - **1024px – 1439px**: Desktop / laptop standar.
   - **≥ 1440px – 1920px**: Monitor layar besar & ultrawide.
2. **Pemisahan Komponen Khusus Tiap Form-Factor (Separation of Device Concerns)**:
   - Komponen atau halaman yang memiliki struktur navigasi/tata letak kompleks dilarang ditumpuk dalam satu file raksasa dengan logika if-else/media-queries bertingkat yang rumit.
   - Wajib dipecah menjadi sub-komponen terisolasi sesuai peruntukan layarnya:
     - `*Mobile.tsx`: Mengatur interaksi layar sentuh, drawer, sheet, dan scroll vertikal ringkas.
     - `*Desktop.tsx`: Mengatur tata letak multi-kolom, hover states, shortcut, dan grid luas.
     - `index.tsx` / Wrapper Utama: Berperan sebagai pengorkestrasi bersih yang menyajikan varian yang tepat tanpa redundansi logika bisnis.
3. **Kemudahan Pemeliharaan (Maintainability)**:
   - Perbaikan bug pada tampilan mobile tidak boleh berisiko merusak layout desktop, dan sebaliknya.
4. **Riset Ergonomi Mobile-Native (Anti Desktop-Shrink: UX-16)**:
   - Dilarang sekadar mengecilkan ukuran layout desktop ke mobile. Komponen mobile wajib didesain melalui riset kenyamanan penggunaan satu tangan (*thumb-driven ergonomics*).
   - **Tipografi Khusus Mobile**: Body text minimal 14px (`text-sm`), dilarang teks mikro `< 12px`. Skala heading mobile proporsional (`text-xl` s.d `text-2xl`), bukan ukuran raksasa desktop yang memakan layar.
   - **Elemen & Interaksi Sentuh**: Tombol aksi utama (*primary CTA*) diposisikan di zona jangkauan ibu jari (*sticky bottom bar* atau *floating footer* dengan safe-area padding). Modal kaku digantikan dengan *Bottom Sheet* atau drawer geser yang nyaman disentuh. Input form wajib minimal 16px untuk mencegah zoom otomatis Safari.

---

## 6. Aturan Transisi Layar & Pemuatan Data: Wajib Skeleton Loading (FE-07 & UX-17)

Setiap transisi perpindahan menu, pergantian tab/halaman, atau saat fetching data awal:
1. **Dilarang Menggunakan Loading Spinner Tunggal di Tengah Layar (*Anti Full-Page Spinner Loop*)**:
   - Dilarang menampilkan layar kosong dengan spinner memutar di tengah (`animate-spin w-8 h-8 rounded-full border-orange-600`) saat berpindah halaman atau memuat konten utama. Pola ini memicu pergeseran tata letak (*Cumulative Layout Shift* / CLS) dan membuat aplikasi terasa lambat/kaku.
   - Pengecualian: Spinner putar (`animate-spin`) berukuran kecil ($\le 16\text{px}$) HANYA diperbolehkan di dalam tombol aksi (misal tombol *Submit* atau *Kirim*) sebagai feedback mikro instan.
2. **Wajib Menggunakan Skeleton Shimmer Loading (Bentuk Proporsional Konten Asli)**:
   - Transisi halaman, inisialisasi menu, dan pergantian tab wajib menyajikan kerangka *Skeleton* animasi berdenyut (`animate-pulse bg-stone-200/80 rounded-*`) yang merefleksikan geometri layout asli (header, kartu form, tab pills, dan tombol).
   - Menghasilkan pengalaman pengguna yang instan, prediktif, dan modern tanpa kedipan visual yang mengganggu (*zero jarring layout jump*).
3. **Wajib Menerapkan Client-Side Caching (Stale-While-Revalidate untuk Beban Data Berat)**:
   - Seluruh halaman modul utama (Beranda, CV Builder, Pengaturan, Profil) wajib menerapkan cache lokal browser (`localStorage` dengan kunci unik per user `*_cache_${pengguna_id}`).
   - **Prinsip Render Instan (0 ms)**: Begitu halaman dibuka, baca data dari cache lokal terlebih dahulu agar form dan konten langsung terbuka seketika tanpa memblokir layar dengan loading jaringan yang lama (3-10 detik).
   - **Background Sync yang Senyap**: Permintaan data ke database (Supabase/API) tetap diproses di latar belakang secara senyap. Jika ada versi terbaru, perbarui state tanpa memicu pergeseran tata letak (*zero jarring layout shift*).


---

## 7. Aturan Notifikasi Antarmuka: Wajib NotifikasiToast Mengambang (FE-02, UX-03, UX-16)

Setiap umpan balik aksi pengguna (sukses simpan, error API, info sistem):
1. **Dilarang Menulis Kotak Alert Statis Inline di Tengah Layout Form**:
   - Dilarang membuat tag `<div className="bg-emerald-50 border ...">` manual di tengah-tengah form atau header. Pola ini memicu dorongan tata letak mendadak (*layout push*) yang merusak ritme visual dan menggeser posisi inputan pengguna.
2. **Wajib Menggunakan Komponen Standar Reusable `NotifikasiToast`**:
   - Seluruh halaman dan komponen wajib mengimpor dan memakai `NotifikasiToast` dari `src/components/ui/NotifikasiToast.tsx`.
   - **Posisi Mengambang & Non-Intrusif (Ergonomi Multi-Device)**:
     - **Desktop & Tablet (`≥ 768px`)**: Melayang di **Pojok Kanan Bawah (`md:bottom-6 md:right-6`)** seperti pola snackbar modern agar tidak menutupi tombol simpan, header, atau aksi di bagian atas.
     - **Ponsel Mobile (`< 768px`)**: Melayang di **Bagian Atas (`top-16 inset-x-0 flex justify-center`)** di bawah header agar tidak bertabrakan dengan *Bottom App Navigation Bar* dan zona jangkauan jempol bawah.
     - Memiliki timer penutupan otomatis (*auto-dismiss* 4 detik) dan tombol tutup manual (`X`).

---

## 8. Aturan Anti Slop AI: Larangan Visual Klise & Wajib Integrasi Skills Desain (UX-02, Copy-01)

1. **Larangan Elemen Visual Klise AI (*Strictly Forbidden AI Visual Slop*)**:
   - **Dilarang Menambahkan Titik/Pill Berkedip (*Pulsing Dot Slop*)**: Dilarang menggunakan `<span className="... rounded-full bg-amber-300 animate-pulse ...">` atau badge bulat berdenyut di dalam tombol, header, atau kartu. Pola ini terlihat murahan dan merupakan ciri khas artifaktual AI coding.
   - **Dilarang Menggunakan Karakter Em-Dash (*Anti Em-Dash* —)**: Jangan pernah menggunakan karakter em-dash (`—`) pada teks UI, dokumentasi, maupun pesan sistem. Gunakan tanda hubung strip biasa (`-`), titik dua (`:`), atau struktur kalimat yang alami.
2. **Kewajiban Menjalankan Skills Khusus Saat Pengerjaan Frontend & UI/UX**:
   - Seluruh coding agent wajib mengaktifkan dan mematuhi panduan dari 4 skill utama berikut sebelum dan selama memodifikasi UI/UX, tata letak, dan salinan teks (*copywriting*):
     - **`impeccable`**: Standar estetika visual tingkat tinggi, hierarki visual ketat, dan mikro-interaksi premium.
     - **`antislop-human`**: Standar aksesibilitas (kontras WCAG AA, fokus keyboard, target sentuh ergonomis).
     - **`antislop`**: Filter penyaring seluruh pola klise dan kode generik AI.
     - **`antislop-copywriting`**: Penulisan teks UI, label, dan pesan sistem yang natural, tegas, dan manusiawi (bebas kata-kata hiperbolis atau basa-basi robotik).

---

## 9. Aturan Perintah Khusus: "jev wawancara"

Ketika pengguna memberikan perintah dengan kata kunci **`jev wawancara`**:
1. Agent **WAJIB** mengeksekusi pipeline pemantauan riset video praktisi HR dan simulasi kriteria evaluasi dialog wawancara adaptif berbasis Jev AI (`scripts/jev_monitor.py`).
2. Menghubungkan temuan riset terbaru dari 5 praktisi (Vina Muliana, Eza Hazami, Yova Beltz, Ridha Poetri, Apri Rokhyadi) langsung ke parameter evaluasi dialog wawancara adaptif di [docs/research/panduan-dialog-wawancara-adaptif.md](file:///d:/MeIntervUAI/docs/research/panduan-dialog-wawancara-adaptif.md).
3. Menyajikan laporan hasil evaluasi atomik Jev (Probabilitas Relevansi, Topik, Urgensi, & Dampak Rubrik) secara ringkas, bersih, dan bebas slop.








