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
