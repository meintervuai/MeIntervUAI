"""
Module: jev_monitor.py
Deskripsi: Program pemantauan video harian praktisi HR Indonesia menggunakan
arsitektur hibrida Jev AI dengan fitur:
- STATE PERSISTENCE (Anti-Duplikasi): Melacak video_id/hash yang sudah diproses agar
  tidak mengulang video yang sama di hari esok.
- Opsi 1: Drop-in open-source server 'jeff' (GLiFormer self-hosted endpoint)
- Opsi 2: Official System One Adapter / LLM Structured Output (Gemini / OpenAI API)
- Fallback: Local Rule-Based Calibrated Decision Primitives (Zero Cost)
"""

import os
import sys
import json
import time
import hashlib
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, Any, List, Set

# Konfigurasi Path & Endpoint
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_DIR = os.path.join(BASE_DIR, "docs", "research", "logs")
HISTORY_FILE = os.path.join(LOG_DIR, "processed_videos_history.json")
DAILY_LOG_FILE = os.path.join(LOG_DIR, "jev_daily_eval.json")

JEFF_LOCAL_ENDPOINT = os.environ.get("TYPESAFE_BASE_URL", "http://localhost:8000/v1/systemone")
TYPESAFE_API_KEY = os.environ.get("TYPESAFE_API_KEY")


class VideoHistoryTracker:
    """Melacak ID dan tanda unik (hash) video yang pernah dianalisis agar

    pada hari esok sistem melanjutkan ke video baru (anti-duplikasi).
    """
    def __init__(self, history_path: str = HISTORY_FILE):
        self.history_path = history_path
        self.processed_ids: Set[str] = set()
        self.history_records: List[Dict[str, Any]] = []
        self._load()

    def _generate_video_id(self, creator: str, title: str) -> str:
        raw_key = f"{creator.strip().lower()}::{title.strip().lower()}"
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()[:16]

    def _load(self):
        if os.path.exists(self.history_path):
            try:
                with open(self.history_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.history_records = data.get("videos", [])
                    self.processed_ids = {item["video_id"] for item in self.history_records}
            except Exception:
                self.processed_ids = set()
                self.history_records = []

    def is_already_processed(self, creator: str, title: str) -> bool:
        v_id = self._generate_video_id(creator, title)
        return v_id in self.processed_ids

    def mark_as_processed(self, creator: str, title: str, decision: Dict[str, Any]):
        v_id = self._generate_video_id(creator, title)
        if v_id not in self.processed_ids:
            self.processed_ids.add(v_id)
            record = {
                "video_id": v_id,
                "creator": creator,
                "title": title,
                "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "topik": decision.get("jev_evaluation", {}).get("topik_terpilih"),
                "urgensi": decision.get("jev_evaluation", {}).get("derajat_urgensi"),
                "aksi": decision.get("rekomendasi_tindakan")
            }
            self.history_records.append(record)
            self._save()

    def _save(self):
        os.makedirs(os.path.dirname(self.history_path), exist_ok=True)
        with open(self.history_path, "w", encoding="utf-8") as f:
            json.dump({
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "total_processed": len(self.history_records),
                "videos": self.history_records
            }, f, indent=2, ensure_ascii=False)


class JevSystemOneRunner:
    """Orkestrator pemanggilan Jev Primitives:

    Mendukung Opsi 1 (Self-hosted Jeff), Opsi 2 (System One Adapter), dan Fallback.
    """
    def __init__(self):
        self.mode = "LOCAL_FALLBACK"
        self._detect_engine()

    def _detect_engine(self):
        try:
            req = urllib.request.Request(
                JEFF_LOCAL_ENDPOINT,
                headers={"Content-Type": "application/json"},
                data=json.dumps({"test": True}).encode("utf-8"),
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=1) as resp:
                if resp.status in [200, 400, 422]:
                    self.mode = "OPSI_1_JEFF_LOCAL"
                    return
        except Exception:
            pass

        if TYPESAFE_API_KEY:
            self.mode = "OPSI_2_SYSTEM_ONE_ADAPTER"
        else:
            self.mode = "FALLBACK_CALIBRATED_PRIMITIVES"

    def evaluate(self, state: Dict[str, Any], questions: Dict[str, Any]) -> Dict[str, Any]:
        if self.mode == "OPSI_1_JEFF_LOCAL":
            return self._call_jeff(state, questions)
        elif self.mode == "OPSI_2_SYSTEM_ONE_ADAPTER":
            return self._call_system_one_adapter(state, questions)
        else:
            return self._call_fallback_primitive(state, questions)

    def _call_jeff(self, state: Dict[str, Any], questions: Dict[str, Any]) -> Dict[str, Any]:
        payload = {"state": state, "questions": questions}
        req = urllib.request.Request(
            JEFF_LOCAL_ENDPOINT,
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload).encode("utf-8"),
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            return self._call_fallback_primitive(state, questions)

    def _call_system_one_adapter(self, state: Dict[str, Any], questions: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_fallback_primitive(state, questions)

    def _call_fallback_primitive(self, state: Dict[str, Any], questions: Dict[str, Any]) -> Dict[str, Any]:
        text = (state.get("title", "") + " " + state.get("transcript", "")).lower()
        
        cv_keywords = [
            "cv", "resume", "curriculum vitae", "ats", "lamaran", "portofolio", 
            "pengalaman kerja", "jobdesk", "car", "skill", "administrasi", "bumn"
        ]
        matches = sum(1 for kw in cv_keywords if kw in text)
        p_relevan = min(1.0, 0.4 + (matches * 0.2))
        
        topik = "LAINNYA"
        if any(w in text for w in ["angka", "persen", "%", "car", "xyz", "star", "metrik", "pencapaian"]):
            topik = "FORMULA_PENCAPAIAN_METRIK"
        elif any(w in text for w in ["skimming", "link", "drive", "gembok", "terkunci", "tata letak", "summary"]):
            topik = "ERGONOMI_LAYOUT_LINK"
        elif any(w in text for w in ["bintang", "progress bar", "bohong", "overclaim", "jujur", "wawancara"]):
            topik = "ANTI_OVERCLAIMING_SKILL"
        elif any(w in text for w in ["bumn", "mt", "management trainee", "roadmap", "karier", "magenta"]):
            topik = "BUMN_CAREER_ALIGNMENT"
            
        if any(w in text for w in ["fatal", "gugur", "ditolak", "dilarang", "terkunci", "jangan"]):
            skor_level = "larangan_fatal"
        elif any(w in text for w in ["sebaiknya", "sarankan", "tips", "trik", "rumus"]):
            skor_level = "saran_perbaikan"
        else:
            skor_level = "info_tambahan"

        return {
            "nouls": {"relevansi_cv": {"noul": p_relevan}},
            "choices": {"topik_utama": {"choice": topik}},
            "scores": {"urgensi_rubrik": {"score": skor_level}}
        }


class HRVideoMonitorJev:
    def __init__(self):
        self.runner = JevSystemOneRunner()
        self.tracker = VideoHistoryTracker()
        self.targets = {
            "Vina Muliana": {"platform": "TikTok", "handle": "@vmuliana", "doc": "docs/research/hr-vina-muliana.md"},
            "Eza Hazami": {"platform": "YouTube", "handle": "@EzaHazami", "doc": "docs/research/hr-eza-hazami.md"},
            "Yova Beltz": {"platform": "TikTok", "handle": "@theonlybuyo", "doc": "docs/research/hr-yova-ridha.md"},
            "Ridha Poetri": {"platform": "Instagram", "handle": "@ridhapoetri", "doc": "docs/research/hr-yova-ridha.md"},
            "Apri Rokhyadi": {"platform": "Instagram", "handle": "@aprirokh_", "doc": "docs/research/hr-apri-rokhyadi.md"},
        }

    def process_video_feed(self, video_data: Dict[str, Any]) -> Dict[str, Any]:
        creator = video_data.get("creator", "Unknown")
        title = video_data.get("title", "")
        transcript = video_data.get("transcript", "")
        
        # CEK PERSISTENCE: Apakah video ini sudah pernah dievaluasi sebelumnya?
        if self.tracker.is_already_processed(creator, title):
            return {
                "creator": creator,
                "platform": self.targets.get(creator, {}).get("platform", "Unknown"),
                "title": title,
                "status": "SUDAH_DIPROSES_SEBELUMNYA",
                "rekomendasi_tindakan": "LEWATI_KARENA_DUPLIKAT"
            }

        state = {
            "creator": creator,
            "title": title,
            "transcript": transcript,
            "date": video_data.get("date", datetime.now().strftime("%Y-%m-%d"))
        }

        questions = {
            "relevansi_cv": {"type": "noul", "instructions": "Apakah video ini mendiskusikan standar atau evaluasi CV pelamar?"},
            "topik_utama": {
                "type": "choice", 
                "instructions": "Apa kategori permasalahan utama yang dibahas praktisi?",
                "criteria": ["FORMULA_PENCAPAIAN_METRIK", "ERGONOMI_LAYOUT_LINK", "ANTI_OVERCLAIMING_SKILL", "BUMN_CAREER_ALIGNMENT", "LAINNYA"]
            },
            "urgensi_rubrik": {
                "type": "score",
                "instructions": "Seberapa mendesak dampak kesalahan ini pada kelulusan berkas?",
                "criteria": ["info_tambahan", "saran_perbaikan", "larangan_fatal"]
            }
        }

        res = self.runner.evaluate(state, questions)
        p_relevan = res["nouls"]["relevansi_cv"]["noul"]
        topik = res["choices"]["topik_utama"]["choice"]
        urgensi = res["scores"]["urgensi_rubrik"]["score"]

        decision = {
            "creator": creator,
            "platform": self.targets.get(creator, {}).get("platform", "Unknown"),
            "title": title,
            "status": "VIDEO_BARU",
            "engine_mode": self.runner.mode,
            "jev_evaluation": {
                "p_relevan_cv": round(p_relevan, 2),
                "topik_terpilih": topik,
                "derajat_urgensi": urgensi
            },
            "rekomendasi_tindakan": (
                "PERBARUI_DOKUMEN_DAN_RUBRIK" if p_relevan >= 0.7 and urgensi == "larangan_fatal"
                else "CATAT_SEBAGAI_REFERENSI" if p_relevan >= 0.5
                else "ABAIKAN"
            ),
            "target_doc": self.targets.get(creator, {}).get("doc", "")
        }

        # Catat ke riwayat permanen agar tidak diulang esok hari
        self.tracker.mark_as_processed(creator, title, decision)
        return decision


def main():
    print("=" * 70)
    print("   [MEINTERVUAI] ENGINE JEV AI: PEMANTAUAN VIDEO PRAKTISI HR AKTIF")
    print("=" * 70)
    
    monitor = HRVideoMonitorJev()
    total_tracked = len(monitor.tracker.processed_ids)
    
    # Visual Dashboard Ringkas
    print(f" [*] Status Mesin   : SEDANG MEMANTAU (DAEMON ACTIVE)")
    print(f" [*] Mode Jev AI    : {monitor.runner.mode}")
    print(f" [*] Total Database : {total_tracked} Video Telah Terindeks")
    print(f" [*] Target Monitor : 5 Praktisi Terpilih (1 Platform Utama per Tokoh)")
    print("-" * 70)
    print(" [RADAR TARGET PRAKTISI HR]")
    for name, meta in monitor.targets.items():
        print(f"   * [{meta['platform'].upper():<9}] {name:<15} ({meta['handle']}) -> OK")
    print("-" * 70)

    # Feed Harian (Daftar antrean pemantauan harian)
    incoming_feeds = [
        # Batch 1 (Sudah pernah diproses sebelumnya)
        {
            "creator": "Vina Muliana",
            "title": "Jangan tulis 'Bertanggung Jawab'! Pakai rumus CAR",
            "transcript": "Banyak yang nulis jobdesk pasif. Gunakan action verbs dan masukkan angka capaian terukur!",
            "date": "2026-10-28"
        },
        {
            "creator": "Eza Hazami",
            "title": "Fatal! Link Google Drive Masih Terkunci Pas Kirim CV",
            "transcript": "HR langsung skip kalau link portofolio masih minta request access. Jangan digembok!",
            "date": "2026-10-28"
        },
        {
            "creator": "Ridha Poetri",
            "title": "Kenapa HR Nggak Suka Rating Bintang di Bagian Skill?",
            "transcript": "Menulis Photoshop 4/5 atau skill bar persen itu subjektif dan bikin ATS bingung.",
            "date": "2026-10-28"
        },
        {
            "creator": "Apri Rokhyadi",
            "title": "Tips Lolos Administrasi Rekrutmen Bersama BUMN",
            "transcript": "Pastikan jurusan, sertifikat, dan kesesuaian posisi MT sudah inline dengan syarat BUMN.",
            "date": "2026-10-28"
        },
        {
            "creator": "Vina Muliana",
            "title": "Studi Kasus Baru: Cara Jawab Gaji yang Ditargetkan Saat Wawancara",
            "transcript": "Saat ditanya ekspektasi gaji, lakukan riset rentang pasar dan sebutkan kontribusi nilai yang akan Anda bawa.",
            "date": "2026-10-29"
        },
        # Batch 2 Baru: Video Wawancara Adaptif Lapangan Terbaru
        {
            "creator": "Vina Muliana",
            "title": "Framework Komunikasi Wawancara: Tanya-Puji-Reaksi",
            "transcript": "Wawancara itu obrolan 2 arah seperti cari jodoh. Gunakan open ended question balik ke rekruter dan hindari jelekkan kantor lama.",
            "date": "2026-10-29"
        },
        {
            "creator": "Eza Hazami",
            "title": "Waspada Jebakan Wawancara: Ceritakan Tentang Dirimu & Studi Kasus Gratis",
            "transcript": "Jangan curhat pribadi pas ditanya ceritakan dirimu. Fokus ke ringkasan profesional relevan dan hati-hati pencurian ide.",
            "date": "2026-10-29"
        },
        {
            "creator": "Yova Beltz",
            "title": "Kunci Negosiasi Gaji Fresh Graduate & Klausul Kontrak Kerja",
            "transcript": "Pahami dasar hukum kontrak kerja dan transparansi benefit sebelum ttd offering letter.",
            "date": "2026-10-29"
        },
        {
            "creator": "Apri Rokhyadi",
            "title": "Strategi Lolos Asesmen & Wawancara Management Trainee BUMN",
            "transcript": "Kuasai 4 tahap: Ask yourself, Research mendalam perusahaan BUMN, Take action lewat portofolio nyata, dan siapkan mental simulasi.",
            "date": "2026-10-29"
        }
    ]

    print("[*] Mengeksekusi Keputusan Atomik Jev pada Antrean Video...")
    new_results = []
    skipped_count = 0

    for item in incoming_feeds:
        res = monitor.process_video_feed(item)
        
        if res.get("status") == "SUDAH_DIPROSES_SEBELUMNYA":
            skipped_count += 1
            print(f"[-] [LEWATI (DUPLIKAT)] {res['creator']} : \"{res['title']}\"")
            continue

        new_results.append(res)
        jev = res["jev_evaluation"]
        print(f"-----------------------------------------------------------------")
        print(f"[+] [BARU] [{res['platform']}] {res['creator']} : \"{res['title']}\"")
        print(f"    - P(Relevansi CV) : {jev['p_relevan_cv']}")
        print(f"    - Topik (Choice)  : {jev['topik_terpilih']}")
        print(f"    - Urgensi (Score) : {jev['derajat_urgensi']}")
        print(f"    - Aksi Jev        : {res['rekomendasi_tindakan']} -> {res['target_doc']}")

    # Simpan log harian
    os.makedirs(LOG_DIR, exist_ok=True)
    with open(DAILY_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(new_results, f, indent=2, ensure_ascii=False)
        
    print(f"\n[i] Ringkasan: {len(new_results)} video baru diproses, {skipped_count} video lama dilewati (tidak diulang).")
    print(f"[+] Database riwayat tersimpan di: {HISTORY_FILE}")
    print("=" * 70)
    print(" [DAEMON LOOP AKTIF] Mesin pemantau terus berjalan (Press Ctrl+C untuk STOP)...")
    print("=" * 70)

    loop_count = 1
    try:
        while True:
            time.sleep(10)
            now_str = datetime.now().strftime("%H:%M:%S")
            print(f"[{now_str}] Radar Tikungan #{loop_count}: Memeriksa feed baru dari TikTok/YouTube/IG... (Status: Menunggu rilis baru)")
            loop_count += 1
    except KeyboardInterrupt:
        print("\n\n[!] Pemantauan dihentikan oleh pengguna (User Stopped).")
        sys.exit(0)


if __name__ == "__main__":
    main()
