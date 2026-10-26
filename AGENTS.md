# Pedoman Kerja Agent: MeIntervUAI

File ini adalah instruksi operasional utama bagi seluruh AI coding agent yang bekerja di repositori MeIntervUAI. Agent wajib mematuhi aturan membaca rujukan dan memperbarui dokumentasi.

---

## 1. Aturan Wajib Baca (Read First)

Sebelum menganalisis, merancang, atau memodifikasi kode, Agent **WAJIB** membaca dokumen rujukan yang sesuai di direktori `docs/`:

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

---

## 2. Aturan Wajib Perbarui (Update on Change)

Setiap kali ada instruksi, perubahan arsitektur, penambahan endpoint/fitur, atau keputusan baru dari chat pengguna:

1. **Sinkronisasi Dokumen Terkait**:
   - Jika mengubah konfigurasi server/port atau alur sistem, perbarui dokumen terkait di `docs/` serta `README.md` utama.
   - Jangan biarkan dokumentasi menjadi usang (*stale*).
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
1. **Dilarang Menulis Teks Mentah (Hardcoded Text)**: Seluruh teks antarmuka (judul, tombol, placeholder, label form, pesan error, notifikasi toast) wajib didaftarkan ke modul lokalisasi `src/i18n/`:
   - Definisi tipe di `src/i18n/types.ts`
   - Terjemahan Bahasa Indonesia di `src/i18n/locales/id.ts`
   - Terjemahan Bahasa Inggris di `src/i18n/locales/en.ts`
2. **Konsumsi Melalui Hook `useBahasa()`**: Komponen tampilan wajib mengonsumsi teks melalui `const { t } = useBahasa()` sehingga otomatis berganti bahasa saat switcher `[ ID | EN ]` ditekan.
3. **Pengaturan Preferensi Bahasa**: Setiap kali menambahkan halaman baru, pastikan teks di dalamnya langsung tersedia dalam versi ID dan EN secara simetris dan natural (bukan hasil translasi mesin mentah).

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



