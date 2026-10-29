# Project: MeIntervUAI — Adaptive Interview Simulation & Video Telemetry Suite

## Architecture
- **Backend (FastAPI)**:
  - Token Management: `app/routers/simulasi.py`, `app/services/supabase_service.py`
  - Bina Character Engine: `app/services/bina_service.py`, `app/services/audio_service.py`
  - Database: Supabase PostgreSQL (`saldo_token`, `transaksi_token`, `pengguna`, `cv_pengguna`)
- **Frontend (React 19 + TypeScript + Tailwind CSS v4)**:
  - Simulation Host Page: `src/pages/simulasi/SimulasiWawancara.tsx`
  - Pre-session Form: `src/pages/simulasi/komponen/FormPersiapanSimulasi.tsx`
  - Interaction Rooms:
    - Text Room: `src/pages/simulasi/komponen/TextRoomChat.tsx`
    - Audio Room: `src/pages/simulasi/komponen/VoiceRoomDedicated.tsx`
    - Video Room: `src/pages/simulasi/komponen/VideoRoomDedicated.tsx`
  - Posture & Telemetry Hook: `src/pages/simulasi/hooks/usePostureAnalysis.ts`
  - Localization: `src/i18n/types.ts`, `src/i18n/locales/id.ts`, `src/i18n/locales/en.ts`
- **Documentation**:
  - `docs/backend.md`, `docs/frontend.md`, `docs/ui-ux.md`, `docs/database.md`, `docs/README.md`, `README.md`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Supabase Balance Update | Update user r23agil@gmail.com balance to 1000 tokens & record ledger entry | M1 | Request §1 |
| 2 | Backend Token Deduction Logic | Enforce Text (10), Audio (15), Video (25) with mode normalization & CV pre-validation | M1 | Request §1 & Survey 2 |
| 3 | Bina Service Refactoring | Implement CV-grounded adaptive interview engine with 6 phases, STAR/CAR probing, zero AI slop, strict 1 question/turn | M2 | Request Follow-up & Survey Bina |
| 4 | Frontend Mode Selector & Token UI | Mode selector cards with explicit 25-token video badge, mobile balance display, pre-flight check, dynamic balance sync, FE-04 i18n | M3 | Request §2 & Survey 3 |
| 5 | Video Mode & MediaPipe Telemetry | Real-time posture & vision evaluation hook (`usePostureAnalysis`), Bina avatar loop, PiP user camera with skeleton, 4 telemetries, inline vision alert card | M4 | Request Follow-up & Survey Video |
| 6 | Post-Interview Scorecard | Laporan Evaluasi Simulasi Wawancara with Bento grid, 4 pillars, per-question accordion, MediaPipe telemetry, audio play, and PDF download | M5 | Request Follow-up |
| 7 | Comprehensive Documentation Sync | Full update across docs/ (backend, frontend, ui-ux, database, README) complying with AGENTS.md rule 2 | M6 | Request §3 & AGENTS.md |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Token Balance & Backend Deduction | Update r23agil@gmail.com balance to 1000 in Supabase; refactor `simulasi.py` token deduction rates (10/15/25), aliases, error handling | None | DONE |
| 2 | Bina Service & Adaptive Interview Engine | Refactor `bina_service.py` & `simulasi.py` to inject CV data, enforce 6-phase adaptive interview progression, adopt HR research principles, eliminate AI slop | M1 | DONE |
| 3 | Frontend Pre-Session Mode Selector UI | Update `FormPersiapanSimulasi.tsx` & `SimulasiWawancara.tsx` with 25-token video option, responsive balance indicator, pre-flight validation, i18n keys | M1 | DONE |
| 4 | Video Mode & MediaPipe Real-Time Vision | Create `usePostureAnalysis.ts` and `VideoRoomDedicated.tsx` with 2-column layout, PiP skeleton overlay, 4 telemetry metrics, and vision alert cards | M1 | DONE |
| 5 | Post-Interview Scorecard Report | Build `LaporanEvaluasiWawancara.tsx` with Bento grid, 4 metrics pillars, per-question accordion, and audio playback | M3, M4 | DONE |
| 6 | Comprehensive Docs Sync & E2E Verification | Update `docs/backend.md`, `docs/frontend.md`, `docs/ui-ux.md`, `docs/database.md`, `docs/README.md`, `README.md`; run full E2E validation | M1, M2, M3, M4, M5 | IN_PROGRESS |

## Interface Contracts
### `app/routers/simulasi.py` ↔ `app/services/bina_service.py`
- `bangun_sapaan_awal_bina(target_role: str, konten_json: Optional[Dict[str, Any]] = None) -> str`
- `hasilkan_respon_bina(target_role: str, jawaban_kandidat: str, riwayat_chat: List[Dict[str, Any]], konten_json: Optional[Dict[str, Any]] = None, is_oot: bool = False) -> str`
- Returns: Clean string of max 2-3 sentences with exactly 1 question, zero platitudes, no em-dashes.

### Frontend ↔ Backend `POST /api/simulasi/mulai`
- Request: `{ pengguna_id: string, target_role: string, mode: "teks" | "suara" | "video" }`
- Response: `{ status: "sukses", sesi_id: string, saldo_token: number, pesan_awal: PesanChat }`
- Error: 400 Bad Request if balance < required token cost (Teks: 10, Suara: 15, Video: 25).

### MediaPipe Hook `usePostureAnalysis` ↔ `VideoRoomDedicated.tsx`
- Hook: `usePostureAnalysis(videoRef: RefObject<HTMLVideoElement>, canvasRef: RefObject<HTMLCanvasElement>, enabled: boolean)`
- Returns: `{ eyeContactScore: number, postureStatus: "tegak" | "miring", mouthStatus: "jelas" | "kurang_terbuka", handStatus: "normal" | "sentuh_wajah", alertCard: VisionAlert | null }`

## Code Layout
- Backend:
  - `backend/app/routers/simulasi.py` (Worker M1 & M2)
  - `backend/app/services/bina_service.py` (Worker M2)
- Frontend:
  - `frontend/src/pages/simulasi/SimulasiWawancara.tsx` (Worker M3 & M4)
  - `frontend/src/pages/simulasi/komponen/FormPersiapanSimulasi.tsx` (Worker M3)
  - `frontend/src/pages/simulasi/komponen/VideoRoomDedicated.tsx` (Worker M4)
  - `frontend/src/pages/simulasi/hooks/usePostureAnalysis.ts` (Worker M4)
  - `frontend/src/i18n/types.ts`, `frontend/src/i18n/locales/id.ts`, `frontend/src/i18n/locales/en.ts` (Worker M3 & M4)
- Documentation:
  - `docs/*.md`, `README.md` (Worker M5)
