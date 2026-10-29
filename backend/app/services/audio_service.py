# Service Audio AI MeIntervUAI (services/audio_service.py)
# Standar: BE-01, BE-02, BE-03, BE-05
# Mengelola:
# 1. Text-To-Speech (TTS):
#    - Prioritas 1: Fish Audio Cloud API (fish-speech / s2.1-pro) berbasis LLM contextual understanding
#    - Prioritas 2: Google Gemini Flash Lite TTS ('Charon' - Suara Pria Eksekutif Bilingual)
#    - Prioritas 3 (Fallback Cepat): Microsoft Neural 'id-ID-ArdiNeural' via edge-tts
# 2. Speech-To-Text (STT): Menggunakan Groq Whisper Large V3 Turbo (~300ms) atau Direct Web Speech API.

import os
import io
import re
import wave
import base64
import asyncio
from typing import Optional
import httpx
from groq import Groq

# Model Suara Resmi Karakter Bina MeIntervUAI
# Menggunakan Microsoft Neural Multilingual 'en-US-BrianMultilingualNeural'
# Mampu melafalkan teks Bahasa Indonesia dengan lancar sekaligus mengeksekusi istilah bahasa Inggris secara native tanpa perlu kamus manual.
SUARA_EDGE_DEFAULT = "en-US-BrianMultilingualNeural"
FISH_API_BASE_URL = "https://api.fish.audio/v1/tts"

# Kamus Normalisasi Fonetik Profesional (Grapheme-to-Phoneme / G2P)
# Menyelaraskan istilah kerja, jabatan, dan istilah teknis bahasa Inggris agar diucapkan
# secara fasih dan natural oleh mesin TTS fallback Bahasa Indonesia (id-ID-ArdiNeural) tanpa terdengar kaku.
KAMUS_FONETIK_INGGRIS_INDONESIA = {
    # 1. Branding Resmi MeIntervUAI ("Me" "Inter" "v" "YOU" "AI")
    r"\bmeintervuai\b": "Me Inter viyu Ey Ay",
    r"\bmeintervu\b": "Me Inter viyu",
    r"\bintervuai\b": "Inter viyu Ey Ay",
    r"\bintervu\b": "Inter viyu",

    # 2. Posisi, Jabatan & Level Karir
    r"\baccounting\b": "Ekaunting",
    r"\baccountant\b": "Ekauntan",
    r"\bcontroller\b": "Kontroler",
    r"\bfinancial\b": "Finensyel",
    r"\bfinance\b": "Fainens",
    r"\banalyst\b": "Enelis",
    r"\bdeveloper\b": "Defelofer",
    r"\bengineer\b": "Enjiner",
    r"\bengineering\b": "Enjiniring",
    r"\bsoftware\b": "Softwer",
    r"\bhardware\b": "Hardwer",
    r"\bmanager\b": "Menejer",
    r"\bproject management\b": "Projek Menejmen",
    r"\bproject\b": "Projek",
    r"\blead\b": "Lid",
    r"\bleader\b": "Lider",
    r"\bhead of\b": "Hed of",
    r"\btalent acquisition\b": "Telent Ekuisisyen",
    r"\brecruiter\b": "Rikruter",
    r"\bhuman resources\b": "Hyumen Risorsis",
    r"\bhr\b": "Eych Ar",
    r"\bhrd\b": "Ha Er De",
    r"\bmarketing\b": "Marketing",
    r"\bdesigner\b": "Disainer",
    r"\bproduct\b": "Prodak",
    r"\bofficer\b": "Ofiser",
    r"\bsupervisor\b": "Supervaisor",

    # 3. Metrik, Istilah Bisnis, Keuangan & Operasional
    r"\bcash flow\b": "Kesh Flou",
    r"\bbudget\b": "Bajet",
    r"\bbudgeting\b": "Bajeting",
    r"\bforecast\b": "Forkes",
    r"\bforecasting\b": "Forkesting",
    r"\bquarter\b": "Kuarter",
    r"\brevenue\b": "Refenyu",
    r"\bprofit\b": "Profit",
    r"\bebitda\b": "Ibitda",
    r"\baudit\b": "Audit",
    r"\bauditing\b": "Auditing",
    r"\bauditor\b": "Auditor",
    r"\btax\b": "Teks",
    r"\bcompliance\b": "Komplayens",
    r"\bbalance sheet\b": "Belens Sit",
    r"\bgeneral ledger\b": "Jenderal Lejer",
    r"\breconciliation\b": "Rekonsiliesyen",

    # 4. Metode Wawancara & Evaluasi
    r"\bstar\b": "Star",
    r"\bcar\b": "C A R",
    r"\bsituation\b": "Sityueisyen",
    r"\btask\b": "Tesk",
    r"\baction\b": "Eksyen",
    r"\bresult\b": "Risalt",
    r"\bcontext\b": "Konteks",
    r"\bframework\b": "Fremwork",
    r"\bportfolio\b": "Portofolio",
    r"\bresume\b": "Resyume",
    r"\bcurriculum vitae\b": "Kurikulum Vite",
    r"\bcv\b": "Si Vi",
    r"\bats\b": "Ey Ti Es",
    r"\bdeadline\b": "Dedlain",
    r"\bmilestone\b": "Mailstoun",
    r"\bteamwork\b": "Tim work",
    r"\bleadership\b": "Lidersyip",
    r"\bsoft skills?\b": "Soft skil",
    r"\bhard skills?\b": "Hard skil",
    r"\bproblem solving\b": "Problem solving",
    r"\bcritical thinking\b": "Kritikel tingking",
    r"\boverview\b": "Oferfyu",
    r"\bfeedback\b": "Fidbek",
    r"\bsharing\b": "Syering",
    r"\bmeeting\b": "Miting",

    # 5. Teknologi & Coding (Tech & Engineering)
    r"\bai\b": "Ey Ay",
    r"\bapi\b": "Ey Pi Ay",
    r"\bui\b": "Yu Ay",
    r"\bux\b": "Yu Eks",
    r"\bdatabase\b": "Deitabeis",
    r"\bbackend\b": "Bek end",
    r"\bfrontend\b": "Front end",
    r"\bfullstack\b": "Ful stek",
    r"\bcloud\b": "Klaud",
    r"\bdevops\b": "Def Ops",
    r"\bgithub\b": "Git Hab",
    r"\bgit\b": "Git",
    r"\bpython\b": "Paifon",
    r"\bjavascript\b": "Jafaskrip",
    r"\btypescript\b": "Taipskrip",
    r"\breact\b": "Riekt",
    r"\bvue\b": "Vyu",
    r"\bnext\.js\b": "Neks Je Es",
    r"\bnode\.js\b": "Noud Je Es",
    r"\bdocker\b": "Doker",
    r"\bkubernetes\b": "Kubernitis",
    r"\bmachine learning\b": "Mesyin lerning",
    r"\bdeep learning\b": "Dip lerning",
    r"\bprompt engineering\b": "Promt enjiniring",
    r"\bsprint\b": "Sprint",
    r"\bscrum\b": "Skram",
    r"\bagile\b": "Ejail",
}

def normalisasi_teks_untuk_suara(teks: str) -> str:
    """
    Menormalkan teks sebelum disintesis oleh TTS agar pelafalan kata bahasa Inggris
    dan istilah teknis diucapkan dengan intonasi fasih, alami, dan tidak kaku.
    """
    if not teks:
        return ""

    import re
    teks_hasil = teks.replace("**", "").replace("*", "").replace("`", "").replace("#", "").strip()

    # Terapkan pemetaan fonetik regex case-insensitive
    for pola, pengganti in KAMUS_FONETIK_INGGRIS_INDONESIA.items():
        teks_hasil = re.sub(pola, pengganti, teks_hasil, flags=re.IGNORECASE)

    return teks_hasil

def sintesis_suara_fish_audio_bytes(teks: str) -> Optional[bytes]:
    """
    Sintesis suara menggunakan Fish Audio Cloud API (fish-speech / s2.1-pro-free).
    LLM-based TTS memahami konteks kalimat dan pelafalan istilah asing (English)
    di tengah kalimat bahasa Indonesia secara otomatis tanpa kamus fonetik manual.
    """
    api_key = os.environ.get("FISH_AUDIO_API_KEY", "").strip()
    if not api_key:
        return None

    voice_id = os.environ.get("FISH_AUDIO_VOICE_ID", "").strip()
    model_name = os.environ.get("FISH_AUDIO_MODEL", "s2.1-pro-free").strip()

    payload = {
        "text": teks.strip(),
        "format": "mp3"
    }
    if voice_id:
        payload["reference_id"] = voice_id

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "model": model_name
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(FISH_API_BASE_URL, json=payload, headers=headers)
            if resp.status_code == 200 and resp.content:
                return resp.content
            print(f"[FishAudio] Status {resp.status_code}: {resp.text[:150]}")
    except Exception as e:
        print("[FishAudio] Error:", e)

    return None

async def sintesis_suara_edgetts_bytes(teks: str, voice: str = SUARA_EDGE_DEFAULT) -> bytes:
    """
    Sintesis suara menggunakan Microsoft Neural Multilingual (en-US-BrianMultilingualNeural).
    Mampu membaca teks campuran Bahasa Indonesia dan Bahasa Inggris secara natural dan mulus.
    """
    import edge_tts
    # Untuk model Multilingual Neural, kirim teks bersih tanpa memaksakan modifikasi ejaan kasar
    teks_bersih = teks.replace("**", "").replace("*", "").replace("`", "").replace("#", "").strip()
    communicate = edge_tts.Communicate(teks_bersih, voice=voice, rate="+0%", pitch="+0Hz")
    audio_buffer = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.extend(chunk["data"])
    return bytes(audio_buffer)

async def sintesis_suara_bina_base64(teks: str) -> str:
    """
    Mengubah teks ucapan Bina menjadi string Base64 Data URL audio yang siap diputar di browser.
    Hierarki Eksekusi:
    1. Fish Audio Cloud API (fish-speech LLM) - jika FISH_AUDIO_API_KEY terpasang.
    2. Microsoft Neural Multilingual 'en-US-BrianMultilingualNeural' (edge-tts) - native multilingual (ID-EN) cepat & stabil.
    """
    if not teks or not teks.strip():
        return ""

    # 1. Coba Fish Audio jika API key tersedia
    if os.environ.get("FISH_AUDIO_API_KEY", "").strip():
        try:
            fish_bytes = await asyncio.to_thread(sintesis_suara_fish_audio_bytes, teks)
            if fish_bytes:
                encoded = base64.b64encode(fish_bytes).decode("utf-8")
                return f"data:audio/mp3;base64,{encoded}"
        except Exception as e_fish:
            print("[FishAudio] Fallback:", e_fish)

    # 2. Microsoft Neural Multilingual (en-US-BrianMultilingualNeural)
    try:
        mp3_bytes = await sintesis_suara_edgetts_bytes(teks)
        encoded = base64.b64encode(mp3_bytes).decode("utf-8")
        return f"data:audio/mp3;base64,{encoded}"
    except Exception as e_edge:
        print("[EdgeTTS] Error:", e_edge)
        return ""

def transkripsi_suara_groq(file_bytes: bytes, filename: str = "kandidat_audio.webm") -> str:
    """
    Mengubah audio kandidat menjadi teks menggunakan Groq API (whisper-large-v3-turbo).
    """
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY belum dikonfigurasi di environment backend.")

    client = Groq(api_key=groq_api_key)
    file_obj = (filename, io.BytesIO(file_bytes))
    
    transcription = client.audio.transcriptions.create(
        file=file_obj,
        model="whisper-large-v3-turbo",
        response_format="verbose_json",
        language="id",
        temperature=0.0
    )
    
    return transcription.text.strip()
