# Router Simulasi Wawancara Adaptif & Suara Bina (routers/simulasi.py)
# Standar BE-01 (Rate limit AI), BE-02 (Pydantic v2 & Anti-SQLi), BE-03 (Single Dynamic Cognitive HR Engine)
# Mengadopsi Riset Praktisi HR & Karakter Resmi AI Bina (Head of Talent Acquisition & Lead Career Evaluator).
# Mode Teks & Mode Suara (Full Interactive Audio Mode dengan Edge-TTS Microsoft Neural 'id-ID-ArdiNeural' & Whisper Groq).

import time
import os
import json
import re
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from app.services.supabase_service import get_supabase_client, buat_id_terstruktur
from app.services.bina_service import hasilkan_respon_bina, evaluasi_biner_relevansi_kerja, bangun_sapaan_awal_bina
from app.services.audio_service import (
    sintesis_suara_bina_base64,
    transkripsi_suara_groq
)

router = APIRouter(prefix="/api/simulasi", tags=["Simulasi Wawancara"])

# Pelacak rate limit memori untuk simulasi pesan (BE-01: 20 request/menit per user)
riwayat_pesan_user: Dict[str, List[float]] = {}

def cek_rate_limit_simulasi(pengguna_id: str, limit_per_menit: int = 20):
    sekarang = time.time()
    daftar_waktu = riwayat_pesan_user.get(pengguna_id, [])
    daftar_waktu = [t for t in daftar_waktu if sekarang - t < 60]
    if len(daftar_waktu) >= limit_per_menit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Batas laju percakapan tercapai. Silakan jeda sejenak sebelum mengirim pesan."
        )
    daftar_waktu.append(sekarang)
    riwayat_pesan_user[pengguna_id] = daftar_waktu

def deteksi_anomali_input(jawaban: str, target_role: str) -> tuple[str, str]:
    """
    Deterministic Guardrail Interceptor:
    Mencegah kata kasar/toxic dan tautan URL luar agar sesi tetap profesional.
    """
    j = jawaban.strip().lower()

    # 1. Deteksi Kata Kasar / Vulgar / Toxic / Godaan
    toxic_words = [
        "memek", "kontol", "anjing", "babi", "bangsat", "ngentot", "taek", "bajingan", "tolol", 
        "goblok", "itil", "pantek", "asu", "kampang", "sayang", "bebeb", "cantik", "pacaran", "jodoh"
    ]
    if any(tw in j for tw in toxic_words):
        return (
            "TOXIC",
            f"Saya adalah Bina, Head of Talent Acquisition MeIntervUAI. Saya mengharapkan etika dan profesionalisme yang ketat selama sesi wawancara ini. Sikap tidak pantas tidak memiliki tempat di lingkungan kerja profesional. Mari kita kembali fokus ke evaluasi kompetensi Anda untuk posisi {target_role}."
        )

    # 2. Deteksi URL / Link Promosi / Copas Artikel Berita
    if re.search(r"https?://|www\.|\.com|\.id|\.net|\.org|kmp\.im|bit\.ly", j):
        return (
            "URL_ARTICLE_COPAS",
            f"Di meja wawancara ini, kami ingin mendengarkan pemikiran, pengalaman, dan jawaban asli dari Anda, bukan kutipan tautan atau artikel berita dari luar. Mari kita kembali fokus ke posisi {target_role}."
        )

    return ("NORMAL", "")

# Biaya Token per Mode Simulasi Wawancara (Standar BE-01 & DB-04)
TARIF_SIMULASI_MODE: Dict[str, int] = {
    "teks": 10,
    "suara": 15,
    "audio": 15,
    "video": 25,
}

def normalisasi_mode_simulasi(mode: Optional[str]) -> str:
    """
    Menormalisasi parameter mode simulasi wawancara menjadi format standar: teks, suara, atau video.
    Menangani huruf kecil, spasi kosong, dan alias umum (suara/audio/voice -> suara, video/vid -> video).
    Default: 'teks'.
    """
    if not mode:
        return "teks"
    m = mode.strip().lower()
    if m in ["suara", "audio", "voice"]:
        return "suara"
    if m in ["video", "vid"]:
        return "video"
    return "teks"

class PermintaanMulaiSimulasi(BaseModel):
    pengguna_id: str
    target_role: str
    mode: Optional[str] = "teks" # teks, suara, video

class PermintaanKirimJawaban(BaseModel):
    sesi_id: str
    pengguna_id: str
    target_role: str
    jawaban_kandidat: str
    riwayat_chat: List[Dict[str, Any]]

class PermintaanTTS(BaseModel):
    teks: str

@router.get("/kelayakan/{pengguna_id}")
async def cek_kelayakan_simulasi(pengguna_id: str):
    """
    Memeriksa kelayakan pengguna untuk mengakses studio simulasi wawancara.
    Aturan Mutlak:
    1. Minimal kontak (nama/email) dan riwayat edukasi harus terisi di CV.
    2. Ekstraksi daftar posisi rekomendasi dinamis dari database (CV target_role, riwayat pengalaman, dan hasil analisis AI sebelumnya).
    3. Memberitahukan apakah CV sudah pernah dianalisis AI atau belum (tanpa memicu analisis ulang).
    """
    sb = get_supabase_client()
    try:
        # 1. Ambil data CV pengguna
        cv_res = sb.table("cv_pengguna").select("*").eq("pengguna_id", pengguna_id).limit(1).execute()
        
        cv_ada = bool(cv_res.data and len(cv_res.data) > 0)
        if not cv_ada:
            return {
                "status": "sukses",
                "bisa_simulasi": False,
                "alasan": "CV belum dibuat. Silakan lengkapi data profil kontak dan edukasi di menu CV Builder terlebih dahulu.",
                "cv_tersedia": False,
                "kontak_terisi": False,
                "edukasi_terisi": False,
                "cv_teranalisis": False,
                "posisi_rekomendasi": [],
                "target_posisi_utama": ""
            }

        cv = cv_res.data[0]
        konten = cv.get("konten_json", {}) or {}
        data_kontak = konten.get("data_kontak", {}) or {}
        riwayat_edukasi = konten.get("riwayat_edukasi", []) or []
        pengalaman_kerja = konten.get("pengalaman_kerja", []) or []

        kontak_terisi = bool(data_kontak.get("nama_lengkap") and (data_kontak.get("email") or data_kontak.get("telepon")))
        edukasi_terisi = len(riwayat_edukasi) > 0

        bisa_simulasi = kontak_terisi and edukasi_terisi

        # 2. Periksa apakah sudah pernah dianalisis oleh AI
        rekomendasi_ai = cv.get("rekomendasi_ai") or {}
        cv_teranalisis = bool(cv.get("skor_ats", 0) > 0 or (isinstance(rekomendasi_ai, dict) and rekomendasi_ai.get("target_role")))

        # 3. Kumpulkan posisi rekomendasi murni dari database (Zero Hardcode)
        posisi_set = []

        # Sumber A: Target role di CV atau rekomendasi AI
        target_role_cv = cv.get("target_role", "").strip()
        target_role_ai = rekomendasi_ai.get("target_role", "").strip() if isinstance(rekomendasi_ai, dict) else ""
        if target_role_cv and target_role_cv not in posisi_set:
            posisi_set.append(target_role_cv)
        if target_role_ai and target_role_ai not in posisi_set:
            posisi_set.append(target_role_ai)

        # Sumber B: Jabatan/posisi dari riwayat pengalaman kerja kandidat
        for p in pengalaman_kerja:
            posisi_exp = p.get("posisi", "").strip()
            if posisi_exp and posisi_exp not in posisi_set:
                posisi_set.append(posisi_exp)

        # Sumber C: Role impian dari profil pengguna
        profil_res = sb.table("profil_pengguna").select("role_impian").eq("pengguna_id", pengguna_id).limit(1).execute()
        if profil_res.data and len(profil_res.data) > 0:
            role_impian = profil_res.data[0].get("role_impian", "").strip()
            if role_impian and role_impian not in posisi_set:
                posisi_set.append(role_impian)

        target_posisi_utama = posisi_set[0] if posisi_set else ""

        alasan = ""
        if not bisa_simulasi:
            if not kontak_terisi and not edukasi_terisi:
                alasan = "Data kontak dan riwayat edukasi belum diisi. Silakan lengkapi di CV Builder."
            elif not kontak_terisi:
                alasan = "Informasi kontak (nama/email) belum lengkap di CV Builder."
            else:
                alasan = "Minimal cantumkan 1 riwayat pendidikan di CV Builder agar simulasi wawancara dapat dibuka."

        return {
            "status": "sukses",
            "bisa_simulasi": bisa_simulasi,
            "alasan": alasan,
            "cv_tersedia": True,
            "kontak_terisi": kontak_terisi,
            "edukasi_terisi": edukasi_terisi,
            "cv_teranalisis": cv_teranalisis,
            "skor_ats": cv.get("skor_ats", 0),
            "posisi_rekomendasi": posisi_set,
            "target_posisi_utama": target_posisi_utama
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memeriksa kelayakan simulasi: {str(e)}")

@router.post("/mulai")
async def mulai_sesi_wawancara(data: PermintaanMulaiSimulasi):
    """
    Menginisialisasi sesi simulasi wawancara baru.
    Memotong token sesuai mode:
    - Teks: 10 token
    - Suara/Audio: 15 token
    - Video: 25 token
    Menyusun sapaan awal profesional oleh Bina, serta menyertakan audio suara (base64) jika mode suara atau video aktif.
    """
    cek_rate_limit_simulasi(data.pengguna_id)
    sb = get_supabase_client()
    mode_standar = normalisasi_mode_simulasi(data.mode)
    biaya_token = TARIF_SIMULASI_MODE.get(mode_standar, 10)

    try:
        # 1. Cek saldo token pengguna
        saldo_res = sb.table("saldo_token").select("saldo_id, jumlah_saldo, total_terpakai").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        if not saldo_res.data or saldo_res.data[0]["jumlah_saldo"] < biaya_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Saldo token tidak mencukupi untuk memulai simulasi mode {mode_standar}. Diperlukan {biaya_token} token."
            )

        saldo_info = saldo_res.data[0]
        saldo_lama = saldo_info["jumlah_saldo"]
        saldo_baru = saldo_lama - biaya_token
        total_terpakai_baru = saldo_info.get("total_terpakai", 0) + biaya_token

        # 2. Ambil data CV pengguna untuk personalisasi sapaan SEBELUM memotong token (mencegah orphan deduction)
        cv_res = sb.table("cv_pengguna").select("konten_json").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        konten_cv = {}
        if cv_res.data and len(cv_res.data) > 0:
            konten_cv = cv_res.data[0].get("konten_json", {}) or {}

        teks_sapaan = bangun_sapaan_awal_bina(data.target_role, konten_cv)

        audio_url = ""
        if mode_standar in ["suara", "video"]:
            try:
                audio_url = await sintesis_suara_bina_base64(teks_sapaan)
            except Exception as ea:
                print("Audio synthesis error on start:", ea)

        # 3. Potong token di database
        sb.table("saldo_token").update({
            "jumlah_saldo": saldo_baru,
            "total_terpakai": total_terpakai_baru
        }).eq("pengguna_id", data.pengguna_id).execute()

        # 4. Catat mutasi di tabel transaksi_token (buku besar)
        transaksi_id = buat_id_terstruktur("tran", "transaksi_token", "transaksi_id")
        sb.table("transaksi_token").insert({
            "transaksi_id": transaksi_id,
            "pengguna_id": data.pengguna_id,
            "jenis_transaksi": f"simulasi_{mode_standar}",
            "jumlah_token": -biaya_token,
            "saldo_sebelum": saldo_lama,
            "saldo_sesudah": saldo_baru,
            "keterangan": f"Simulasi Wawancara Kerja Mode {mode_standar.capitalize()} ({data.target_role})"
        }).execute()

        sesi_id = buat_id_terstruktur("sesi", "transaksi_token", "transaksi_id")

        pesan_awal = {
            "id": f"msg_{int(time.time()*1000)}",
            "pengirim": "pewawancara",
            "nama": "Bina",
            "peran": "Head of Talent Acquisition",
            "teks": teks_sapaan,
            "audio_url": audio_url,
            "waktu": "Baru saja"
        }

        return {
            "status": "sukses",
            "sesi_id": sesi_id,
            "saldo_token": saldo_baru,
            "pesan_awal": pesan_awal
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memulai simulasi: {str(e)}")

@router.post("/jawab")
async def tangani_jawaban_chat(data: PermintaanKirimJawaban):
    """
    Mode Teks: Menerima jawaban kandidat dan menghasilkan respons cerdas dari Bina
    menggunakan Single Dynamic Cognitive Engine berbasis 4 pilar riset HR.
    """
    cek_rate_limit_simulasi(data.pengguna_id)

    # 1. Filter Deterministic Guardrail (Kata Kasar / URL Copas)
    kategori_fisik, respon_fisik = deteksi_anomali_input(data.jawaban_kandidat, data.target_role)
    if kategori_fisik in ["TOXIC", "URL_ARTICLE_COPAS"]:
        pesan_guardrail = {
            "id": f"msg_{int(time.time()*1000)}",
            "pengirim": "pewawancara",
            "nama": "Bina",
            "peran": "Head of Talent Acquisition",
            "teks": respon_fisik,
            "waktu": "Baru saja"
        }
        return {
            "status": "sukses",
            "kategori_guardrail": kategori_fisik,
            "pesan_pewawancara": pesan_guardrail
        }

    # 2. Ambil pertanyaan terakhir dari riwayat
    pertanyaan_terakhir = "Ceritakan tentang diri, latar belakang, dan motivasi kerja Anda."
    for msg in reversed(data.riwayat_chat):
        if msg.get("pengirim") == "pewawancara":
            pertanyaan_terakhir = msg.get("teks", "")
            break

    # 3. Evaluasi Relevansi Kerja (Biner Universal)
    is_relevan = evaluasi_biner_relevansi_kerja(
        jawaban=data.jawaban_kandidat,
        target_role=data.target_role,
        pertanyaan_terakhir=pertanyaan_terakhir
    )

    # 4. Ambil data CV kandidat untuk grounding respon Bina
    sb = get_supabase_client()
    konten_cv = {}
    try:
        cv_res = sb.table("cv_pengguna").select("konten_json").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        if cv_res.data and len(cv_res.data) > 0:
            konten_cv = cv_res.data[0].get("konten_json", {}) or {}
    except Exception as ecv:
        print("[Simulasi Jawab] Info: Data CV tidak ditemukan / offline:", ecv)

    # 5. Dialog Utama Adaptif Bina (Memanggil bina_service)
    teks_balasan = hasilkan_respon_bina(
        target_role=data.target_role,
        jawaban_kandidat=data.jawaban_kandidat,
        riwayat_chat=data.riwayat_chat,
        cv_data=konten_cv,
        is_oot=not is_relevan
    )

    pesan_baru = {
        "id": f"msg_{int(time.time()*1000)}",
        "pengirim": "pewawancara",
        "nama": "Bina",
        "peran": "Head of Talent Acquisition",
        "teks": teks_balasan,
        "waktu": "Baru saja"
    }

    return {
        "status": "sukses",
        "pesan_pewawancara": pesan_baru
    }

@router.post("/suara/proses")
async def proses_interaksi_suara(
    audio_file: UploadFile = File(...),
    sesi_id: str = Form(...),
    pengguna_id: str = Form(...),
    target_role: str = Form(...),
    live_transcript: str = Form(""),
    riwayat_chat_json: str = Form("[]")
):
    """
    Mode Suara AI Interaktif (Voice Mode ala Gemini / GPT):
    1. Menerima rekaman audio kandidat (WebM/WAV/MP3) beserta live_transcript browser.
    2. Transkripsi suara kandidat menjadi teks via Groq Whisper Large V3 Turbo dengan fallback live_transcript.
    3. Evaluasi dan hasilkan respons adaptif dari Bina.
    4. Sintesis suara balasan Bina menggunakan Microsoft Neural 'id-ID-ArdiNeural' (suara pria ramah, tegas, artikulatif).
    5. Kembalikan teks transkrip kandidat, teks balasan Bina, dan audio Base64 data URL untuk diputar langsung di frontend.
    """
    cek_rate_limit_simulasi(pengguna_id)

    try:
        riwayat_chat = json.loads(riwayat_chat_json)
    except Exception:
        riwayat_chat = []

    # 1. Prioritaskan Live Transcript dari Browser (Zero-Latency STT)
    teks_transkripsi_kandidat = ""
    if live_transcript and live_transcript.strip() and not live_transcript.startswith("🎙️"):
        teks_transkripsi_kandidat = live_transcript.strip()

    # Jika live transcript browser tidak tersedia, baru fallback transkripsi file audio via Whisper Groq
    if not teks_transkripsi_kandidat:
        audio_bytes = await audio_file.read()
        if audio_bytes and len(audio_bytes) >= 100:
            try:
                fname = audio_file.filename if audio_file.filename and "." in audio_file.filename else "rekaman.webm"
                teks_transkripsi_kandidat = transkripsi_suara_groq(
                    audio_bytes,
                    filename=fname
                )
            except Exception as e:
                print("Transkripsi suara Groq error/unreachable:", e)

    if not teks_transkripsi_kandidat or not teks_transkripsi_kandidat.strip():
        teks_transkripsi_kandidat = "(Suara jawaban kandidat tidak tertangkap jelas)"

    # 2. Filter Guardrail Fisik
    kategori_fisik, respon_fisik = deteksi_anomali_input(teks_transkripsi_kandidat, target_role)
    if kategori_fisik in ["TOXIC", "URL_ARTICLE_COPAS"]:
        audio_bina = await sintesis_suara_bina_base64(respon_fisik)
        return {
            "status": "sukses",
            "transkripsi_kandidat": teks_transkripsi_kandidat,
            "kategori_guardrail": kategori_fisik,
            "pesan_pewawancara": {
                "id": f"msg_{int(time.time()*1000)}",
                "pengirim": "pewawancara",
                "nama": "Bina",
                "peran": "Head of Talent Acquisition",
                "teks": respon_fisik,
                "audio_url": audio_bina,
                "waktu": "Baru saja"
            }
        }

    # 3. Ambil pertanyaan terakhir
    pertanyaan_terakhir = "Ceritakan tentang diri, latar belakang, dan motivasi kerja Anda."
    for msg in reversed(riwayat_chat):
        if msg.get("pengirim") == "pewawancara":
            pertanyaan_terakhir = msg.get("teks", "")
            break

    # 4. Evaluasi Relevansi Kerja & Buat Respon Bina
    is_relevan = evaluasi_biner_relevansi_kerja(
        jawaban=teks_transkripsi_kandidat,
        target_role=target_role,
        pertanyaan_terakhir=pertanyaan_terakhir
    )

    # Ambil data CV kandidat untuk grounding respon Bina di mode suara
    sb = get_supabase_client()
    konten_cv = {}
    try:
        cv_res = sb.table("cv_pengguna").select("konten_json").eq("pengguna_id", pengguna_id).limit(1).execute()
        if cv_res.data and len(cv_res.data) > 0:
            konten_cv = cv_res.data[0].get("konten_json", {}) or {}
    except Exception as ecv:
        print("[Simulasi Suara] Info: Data CV tidak ditemukan / offline:", ecv)

    teks_balasan = hasilkan_respon_bina(
        target_role=target_role,
        jawaban_kandidat=teks_transkripsi_kandidat,
        riwayat_chat=riwayat_chat,
        cv_data=konten_cv,
        is_oot=not is_relevan
    )

    # 5. Sintesis Suara Bina (Microsoft Neural Voice Ardi)
    try:
        audio_bina = await sintesis_suara_bina_base64(teks_balasan)
    except Exception as ea:
        print("TTS error on voice reply:", ea)
        audio_bina = ""

    return {
        "status": "sukses",
        "transkripsi_kandidat": teks_transkripsi_kandidat,
        "pesan_pewawancara": {
            "id": f"msg_{int(time.time()*1000)}",
            "pengirim": "pewawancara",
            "nama": "Bina",
            "peran": "Head of Talent Acquisition",
            "teks": teks_balasan,
            "audio_url": audio_bina,
            "waktu": "Baru saja"
        }
    }

@router.post("/tts")
async def sintesis_teks_ke_suara(data: PermintaanTTS):
    """
    Endpoint utilitas untuk mengonversi teks apa pun dari Bina menjadi audio base64 MP3.
    """
    try:
        audio_b64 = await sintesis_suara_bina_base64(data.teks)
        return {
            "status": "sukses",
            "audio_url": audio_b64
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal sintesis teks ke suara: {str(e)}")
