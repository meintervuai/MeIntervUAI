# Router Simulasi Wawancara Adaptif (routers/simulasi.py)
# Standar BE-01 (Rate limit AI), BE-02 (Pydantic v2 & Anti-SQLi),
# Mengadopsi Riset Praktisi HR & Metode Jev Decision Primitives.
# Nama Influencer/Pakar HANYA sebagai rujukan data riset di docs/research/,
# BUKAN sebagai nama persona di chat (Etika & Profesionalisme: Pewawancara HR & User).
# Menggunakan LLM Cohere Command-R7B / Gemini sebagai otak dialog adaptif dinamis.

import time
import os
import json
import re
import urllib.request
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.supabase_service import get_supabase_client, buat_id_terstruktur
from app.services.bina_service import hasilkan_respon_bina, evaluasi_biner_relevansi_kerja

router = APIRouter(prefix="/api/simulasi", tags=["Simulasi Wawancara"])

# Pelacak rate limit memori untuk simulasi pesan (BE-01: 20 request/menit per user)
riwayat_pesan_user: Dict[str, List[float]] = {}

def deteksi_anomali_input(jawaban: str, target_role: str, pertanyaan_terakhir: str = "") -> tuple[str, str]:
    """
    Tier 1 Deterministic Guardrail Interceptor:
    Mencegah prompt injection, trolling, kata kasar, ketikan spam acak, tautan URL luar,
    rumus matematika, serta pertanyaan balik non-pekerjaan agar Bina 100% konsisten
    berada dalam persona Head of Talent Acquisition.
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
            f"Saya adalah Bina, Head of Talent Acquisition MeIntervUAI. Saya mengharapkan etika, tata krama, dan profesionalisme yang ketat selama sesi wawancara ini. Sikap tidak pantas tidak memiliki tempat di lingkungan kerja profesional. Mari kita kembali fokus ke evaluasi kompetensi Anda untuk posisi {target_role}."
        )

    # 2. Deteksi URL / Link Promosi / Copas Artikel Berita (misal: 'kompas.com', 'https://', 'kmp.im')
    if re.search(r"https?://|www\.|\.com|\.id|\.net|\.org|kmp\.im|bit\.ly", j):
        return (
            "URL_ARTICLE_COPAS",
            f"Di meja wawancara ini, kami ingin mendengarkan pemikiran, pengalaman, dan jawaban asli dari Anda, bukan kutipan tautan atau artikel berita dari luar. Mari kita kembali fokus ke posisi {target_role}."
        )

    # 3. Deteksi Hitungan Matematika / Rumus Murni (misal: '1+1', '1 + 1 = 2', 'rumus segitiga')
    if re.search(r"^\s*\d+\s*[\+\-\*\/\^%]\s*\d+", j) or re.search(r"rumus\s+(segitiga|lingkaran|fisika|kimia|matematika|luas|keliling)", j):
        return (
            "MATH_OR_FORMULA",
            f"Sebagai Head of Talent Acquisition, fokus saya adalah memvalidasi kualifikasi profesional Anda untuk peran {target_role}, bukan menguji soal matematika dasar atau rumus pelajaran sekolah. Mari kita fokus kembali ke kompetensi kerja Anda."
        )

    # 4. Deteksi Spam / Keyboard Mash / Teks Acak (misal: 'asda', 'asdakdaldmalsiaer')
    kata_kata = [w for w in re.split(r"\s+", j) if w]
    kata_acak_pendek = ["asda", "asd", "qwe", "qwerty", "tes", "test", "123", "abc", "zzz", "xxx"]
    
    is_mash = False
    if len(kata_kata) == 1:
        kata_tunggal = kata_kata[0]
        vokal = len(re.findall(r"[aiueo]", kata_tunggal))
        total_huruf = len(re.findall(r"[a-z]", kata_tunggal))
        rasio_vokal = vokal / max(total_huruf, 1)

        if kata_tunggal in kata_acak_pendek:
            is_mash = True
        elif total_huruf >= 6 and (rasio_vokal < 0.18 or rasio_vokal > 0.82 or bool(re.search(r"(.)\1{3,}", kata_tunggal)) or bool(re.search(r"[^aiueo\s]{6,}", kata_tunggal))):
            is_mash = True
        elif total_huruf >= 12 and any(k in kata_tunggal for k in ["asda", "aldm", "daldm", "siaer", "kljs", "fdsk"]):
            is_mash = True

    if is_mash:
        return (
            "SPAM_RANDOM",
            f"Respons yang Anda ketik tidak memiliki struktur kalimat profesional yang bermakna. Di posisi {target_role}, kejelasan artikulasi dan komunikasi adalah syarat mutlak. Mohon berikan tanggapan yang terstruktur dan relevan dengan pertanyaan wawancara."
        )

    # 5. Deteksi Pengulangan Sapaan Menghindar (misal: 'hai', 'halo', 'p', 'woi')
    sapaan_pendek = ["hai", "halo", "hello", "p", "oi", "woi", "pagi", "siang", "malam"]
    if j in sapaan_pendek or re.fullmatch(r"^(hai|halo|hello|p|oi)\s*([!?.]*)$", j):
        return (
            "SAPAAN_MENGHINDAR",
            f"Kita sudah melewati perkenalan awal. Sikap menghindar atau sekadar mengulang sapaan menunjukkan kurangnya kesiapan menghadapi wawancara kerja yang sebenarnya. Bisa kita langsung masuk ke substansi pengalaman dan kapabilitas Anda di bidang {target_role}?"
        )

    # 6. Deteksi Pertanyaan AI Persona / Model / Pengembang (misal: 'kamu model siapa', 'gpt', 'claude')
    if any(k in j for k in ["model siapa", "kamu gpt", "kamu ai", "cohere", "gemini", "claude", "chatgpt", "openai", "llm", "kamu siapa", "kamu apa"]):
        return (
            "AI_PERSONA_QUESTION",
            f"Saya adalah Bina, Head of Talent Acquisition & Lead Career Evaluator di MeIntervUAI. Peran saya di sini murni sebagai pewawancara profesional untuk menguji kompetensi dan portofolio Anda. Mari kita maksimalkan waktu simulasi ini untuk mengeksplorasi kesiapan Anda di peran {target_role}."
        )

    # 7. Deteksi Pertanyaan Out of Topic / Ensiklopedia / Trivia Bebas
    pola_trivia = [
        r"hewan apa", r"siapa presiden", r"bikin puisi", r"cuaca", 
        r"resep", r"buatkan", r"bantu bikin", r"hidung terpanjang", r"kapal angkasa",
        r"cerita dong", r"nyanyi", r"lelucon", r"bikin program", r"bikin prom",
        r"ringkas.*youtube", r"jadwal pertandingan", r"berita hoaks"
    ]
    if any(re.search(p, j) for p in pola_trivia):
        return (
            "OUT_OF_TOPIC",
            f"Sebagai Head of Talent Acquisition, waktu kita di sesi ini dikhususkan untuk menguji kualifikasi posisi {target_role}, bukan membahas ensiklopedia umum atau permintaan bantuan lepas. Mari kita fokus kembali ke kompetensi kerja Anda."
        )

    return ("NORMAL", "")

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

def evaluasi_biner_relevansi_kerja(jawaban: str, target_role: str, pertanyaan_terakhir: str) -> bool:
    """
    Evaluator Biner Universal:
    Menilai apakah input kandidat merupakan respons wawancara kerja yang wajar,
    menceritakan pengalaman/kualifikasi diri, bertanya istilah wawancara, atau sekadar konfirmasi sopan.
    Mengembalikan True (layak diproses) atau False (murni topik luar/gangguan).
    """
    cohere_key = os.environ.get("COHERE_API_KEY")
    if not cohere_key:
        return True

    j = jawaban.strip().lower()
    # Pengecualian cepat jawaban sopan / konfirmasi / istilah teknis
    if j in ["baik", "siap", "terima kasih", "oke", "ya", "lanjut", "lah mana pertanyaannya", "lah mana pertanyyaannya?"]:
        return True
    if len(j) < 40 and any(w in j for w in ["apa itu", "maksudnya", "artinya apa", "itu apa"]):
        return True

    eval_prompt = (
        f"Kamu adalah AI Evaluator Relevansi Wawancara Kerja.\n"
        f"POSISI YANG SEDANG DILAMAR: '{target_role}'.\n"
        f"PERTANYAAN SEBELUMNYA DARI PEWAWANCARA: '{pertanyaan_terakhir}'\n"
        f"INPUT DARI KANDIDAT: '{jawaban}'\n\n"
        "TUGAS:\n"
        "Tentukan apakah input kandidat di atas berkaitan dengan konteks wawancara kerja, "
        "menceritakan pengalaman diri, merespons pertanyaan, atau bertanya klarifikasi profesional?\n"
        "Jika berupa resep masakan, lirik lagu, berita/tokoh politik luar, matematika/sains murni, atau lelucon lepas, jawab 'TIDAK'.\n\n"
        "Jawab HANYA satu kata: 'YA' atau 'TIDAK'."
    )

    url = "https://api.cohere.com/v2/chat"
    headers = {"Authorization": f"Bearer {cohere_key}", "Content-Type": "application/json"}
    data = {
        "model": "command-r7b-12-2024",
        "messages": [{"role": "user", "content": {"type": "text", "text": eval_prompt}}]
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=6) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            teks = res.get("message", {}).get("content", [{}])[0].get("text", "").strip().upper()
            return "YA" in teks
    except Exception as e:
        print("Biner evaluation error:", e)
        return True

def generate_respon_pewawancara_llm(target_role: str, jawaban_kandidat: str, riwayat_chat: List[Dict[str, Any]], tipe_pewawancara: str, is_oot: bool = False) -> str:
    """
    Menghasilkan respon wawancara dinamis menggunakan persona 'Bina' (Head of Talent Acquisition MeIntervUAI).
    Otak Bina menyerap seluruh riset praktisi HR:
    - Tidak pernah mengulang template kaku.
    - Menantang jawaban pendek/asal-asalan secara taktis dengan membimbing kandidat.
    - Mengejar bukti konkret metode STAR/CAR dan skenario krisis realistis.
    - Jika is_oot=True, Bina merespons dengan gaya HR profesional yang menolak topik luar secara elegan
      dan SELALU mengajukan pertanyaan wawancara kerja yang baru.
    """
    cohere_key = os.environ.get("COHERE_API_KEY")
    if not cohere_key:
        return f"Terima kasih atas tanggapan Anda. Untuk peran {target_role}, bisa Anda ceritakan satu tantangan operasional paling menantang yang pernah Anda selesaikan?"

    system_prompt = f"""KAMU ADALAH BINA, Head of Talent Acquisition & Lead Career Evaluator di MeIntervUAI.
Kamu sedang memimpin sesi wawancara kerja tatap muka profesional untuk posisi: '{target_role}'.

ATURAN PALING MUTLAK GAYA BICARA MANUSIAWI (ANTI-AI SLOP):
1. DILARANG KERAS MENGGUNAKAN DAFTAR ANGKA, BULLET POINT, ATAU BOLD HEADING! (Jangan pernah menuliskan **1.**, **2.**, **3.**, dll). Tidak ada pewawancara manusia yang berbicara dalam bentuk daftar buletin kepada kandidat. Bicara dalam kalimat mengalir natural.
2. HANYA AJUKAN TEPAT SATU PERTANYAAN SETIAP GILIRAN! Dilarang membombardir kandidat dengan 2 sampai 5 pertanyaan sekaligus.
3. REAKTIF & BERKEPRIBADIAN HR NYATA:
   - Jika kandidat malas, pasrah, atau ogah-ogahan (misal: 'malas ah', 'gak mau'):
     Bereaksi lugas: ingatkan bahwa inisiatif adalah syarat mutlak untuk peran {target_role}, dan rasa malas adalah red flag fatal di meja rekrutmen. Lalu tantang apa yang biasanya memotivasi mereka.
   - Jika kandidat arogan atau toksik (misal: 'saya individualis, people are stupid'):
     Tegur langsung dengan tajam namun tetap santun: ingatkan bahwa seorang Lead wajib berkolaborasi dan memimpin manusia, bukan bekerja terisolasi. Tanyakan bagaimana mereka bisa memimpin jika memandang rendah tim.
   - Jika kandidat menanyakan tokoh luar, gosip, atau topik di luar kerja (misal: 'who is elon musk', 'siapa prabowo'):
     Tepis secara santai: "Kita sedang tidak membahas figur publik di sini. Fokus saya ada pada kapabilitas Anda sendiri untuk posisi {target_role}." Lalu ajukan pertanyaan kerja.
   - Jika kandidat bertanya istilah teknis dari pertanyaan sebelumnya (misal: 'ROI itu apa'):
     Jelaskan dalam 1 kalimat padat artinya, lalu tantang bagaimana mereka menerapkannya.
   - Jika kandidat menjawab pengalaman kerja nyata:
     Apresiasi secara natural dan gunakan metode STAR/CAR untuk membedah aksi mandiri dan dampak angkanya.
4. GAYA BAHASA:
   - Bahasa Indonesia profesional, tegas, berwibawa, anggun, dan manusiawi layaknya praktisi HR senior di Jakarta.
   - Panjang respon MAKSIMAL 2-3 kalimat padat dan SELALU diakhiri dengan 1 pertanyaan kerja yang spesifik."""

    # Format percakapan riwayat untuk LLM
    messages_payload = [{"role": "system", "content": system_prompt}]
    for msg in riwayat_chat[-6:]:
        role = "assistant" if msg.get("pengirim") == "pewawancara" else "user"
        teks = msg.get("teks", "")
        messages_payload.append({"role": role, "content": {"type": "text", "text": teks}})

    # Tambahkan instruksi khusus jika input terbukti di luar konteks kerja
    user_content = jawaban_kandidat
    if is_oot:
        user_content = (
            f"[KANDIDAT MENGETIK TOPIK DI LUAR WAWANCARA: '{jawaban_kandidat}']. "
            f"Instruksi Bina: Jangan meladeni topik tersebut sama sekali. "
            f"Tegur secara profesional dan ajukan 1 pertanyaan wawancara kerja baru untuk posisi {target_role}."
        )

    messages_payload.append({"role": "user", "content": {"type": "text", "text": user_content}})

    url = "https://api.cohere.com/v2/chat"
    headers = {
        "Authorization": f"Bearer {cohere_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "command-r7b-12-2024",
        "messages": messages_payload
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=12) as resp:
            hasil = json.loads(resp.read().decode("utf-8"))
            teks_balasan = hasil.get("message", {}).get("content", [{}])[0].get("text", "").strip()
            
            # Post-Processing Sanitizer: Bersihkan jika masih ada kebocoran bot AI atau artifak json/token
            leakage_patterns = [
                r"saya adalah (model )?ai",
                r"saya tidak (memiliki kemampuan|dapat|bisa) (menonton|mengakses internet)",
                r"saya dirancang untuk",
                r"sebagai model bahasa"
            ]
            for lp in leakage_patterns:
                if re.search(lp, teks_balasan, re.IGNORECASE):
                    teks_balasan = (
                        f"Sebagai Head of Talent Acquisition MeIntervUAI, fokus saya adalah mengevaluasi kapabilitas "
                        f"dan kesiapan Anda untuk posisi {target_role}. Mari kita kembali ke substansi evaluasi kerja Anda."
                    )
                    break

            # Bersihkan artifak seperti '=true' atau 'true' di awal baris respons
            teks_balasan = re.sub(r"^(=?true|=?false)\s*", "", teks_balasan, flags=re.IGNORECASE).strip()
                    
            if teks_balasan:
                return teks_balasan
    except Exception as e:
        print("Fallback LLM error:", e)

    # Fallback jika API sedang gangguan
    return f"Menarik. Di bidang {target_role}, ketegasan komunikasi adalah kunci utama. Dari pengalaman yang pernah Anda lewati, apa kontribusi nyata yang paling Anda banggakan?"

    # Format percakapan riwayat untuk LLM
    messages_payload = [{"role": "system", "content": system_prompt}]
    for msg in riwayat_chat[-6:]: # Ambil 6 riwayat terakhir
        role = "assistant" if msg.get("pengirim") == "pewawancara" else "user"
        teks = msg.get("teks", "")
        messages_payload.append({"role": role, "content": {"type": "text", "text": teks}})

    # Tambahkan jawaban terbaru
    messages_payload.append({"role": "user", "content": {"type": "text", "text": jawaban_kandidat}})

    url = "https://api.cohere.com/v2/chat"
    headers = {
        "Authorization": f"Bearer {cohere_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "command-r7b-12-2024",
        "messages": messages_payload
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=12) as resp:
            hasil = json.loads(resp.read().decode("utf-8"))
            teks_balasan = hasil.get("message", {}).get("content", [{}])[0].get("text", "").strip()
            
            # Post-Processing Sanitizer: Bersihkan jika masih ada kebocoran bot AI atau artifak json/token
            leakage_patterns = [
                r"saya adalah (model )?ai",
                r"saya tidak (memiliki kemampuan|dapat|bisa) (menonton|mengakses internet)",
                r"saya dirancang untuk",
                r"sebagai model bahasa"
            ]
            for lp in leakage_patterns:
                if re.search(lp, teks_balasan, re.IGNORECASE):
                    teks_balasan = (
                        f"Sebagai Head of Talent Acquisition MeIntervUAI, fokus saya adalah mengevaluasi kapabilitas "
                        f"dan kesiapan Anda untuk posisi {target_role}. Mari kita kembali ke substansi evaluasi kerja Anda."
                    )
                    break

            # Bersihkan artifak seperti '=true' atau 'true' di awal baris respons
            teks_balasan = re.sub(r"^(=?true|=?false)\s*", "", teks_balasan, flags=re.IGNORECASE).strip()
                    
            if teks_balasan:
                return teks_balasan
    except Exception as e:
        print("Fallback LLM error:", e)

    # Fallback jika API sedang gangguan
    return f"Menarik. Di bidang {target_role}, ketegasan komunikasi adalah kunci utama. Dari pengalaman yang pernah Anda lewati, apa kontribusi nyata yang paling Anda banggakan?"

@router.post("/mulai")
async def mulai_sesi_wawancara(data: PermintaanMulaiSimulasi):
    """
    Menginisialisasi sesi simulasi wawancara baru.
    Memotong 10 Token, memuat data CV, dan membuka sapaan awal profesional
    tanpa nama influencer asli.
    """
    cek_rate_limit_simulasi(data.pengguna_id)
    sb = get_supabase_client()
    BIAYA_TOKEN = 10 if data.mode == "teks" else 15 if data.mode == "suara" else 25

    try:
        # Cek saldo token
        saldo_res = sb.table("saldo_token").select("saldo_id, jumlah_saldo, total_terpakai").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        if not saldo_res.data or saldo_res.data[0]["jumlah_saldo"] < BIAYA_TOKEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Saldo token tidak mencukupi untuk memulai simulasi {data.mode}. Diperlukan {BIAYA_TOKEN} token."
            )

        saldo_info = saldo_res.data[0]
        saldo_lama = saldo_info["jumlah_saldo"]
        saldo_baru = saldo_lama - BIAYA_TOKEN
        total_terpakai_baru = saldo_info.get("total_terpakai", 0) + BIAYA_TOKEN

        # Potong token & catat mutasi
        sb.table("saldo_token").update({
            "jumlah_saldo": saldo_baru,
            "total_terpakai": total_terpakai_baru
        }).eq("pengguna_id", data.pengguna_id).execute()

        transaksi_id = buat_id_terstruktur("tran", "transaksi_token", "transaksi_id")
        sb.table("transaksi_token").insert({
            "transaksi_id": transaksi_id,
            "pengguna_id": data.pengguna_id,
            "jenis_transaksi": f"simulasi_{data.mode}",
            "jumlah_token": -BIAYA_TOKEN,
            "saldo_sebelum": saldo_lama,
            "saldo_sesudah": saldo_baru,
            "keterangan": f"Simulasi Wawancara Kerja Mode {data.mode.capitalize()} ({data.target_role})"
        }).execute()

        sesi_id = buat_id_terstruktur("sesi", "transaksi_token", "transaksi_id")

        # Ambil data CV pengguna untuk personalisasi sapaan
        cv_res = sb.table("cv_pengguna").select("konten_json").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        nama_kandidat = "Kandidat"
        if cv_res.data and len(cv_res.data) > 0:
            c = cv_res.data[0].get("konten_json", {})
            nama_kandidat = c.get("data_kontak", {}).get("nama_lengkap", "Kandidat")

        # Sapaan awal profesional oleh Bina
        pesan_awal = {
            "id": f"msg_{int(time.time()*1000)}",
            "pengirim": "pewawancara",
            "nama": "Bina",
            "peran": "Head of Talent Acquisition",
            "teks": f"Halo {nama_kandidat}! Saya Bina, Head of Talent Acquisition di MeIntervUAI. Senang sekali bisa bertemu dengan Anda di sesi simulasi wawancara untuk posisi {data.target_role}. Sesi ini dirancang untuk mengasah ketajaman komunikasi dan kesiapan Anda menghadapi wawancara kerja yang sesungguhnya. Untuk memulai obrolan kita, bisa ceritakan secara ringkas latar belakang Anda dan apa motivasi terbesar Anda melamar posisi {data.target_role}?",
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

def klasifikasi_intent_ai_gatekeeper(jawaban: str, target_role: str, riwayat_chat: List[Dict[str, Any]]) -> tuple[bool, str]:
    """
    Semantic AI Gatekeeper (Prinsip Dinamis & Human-Centric):
    Mendeteksi apakah input kandidat memiliki relevansi dengan sesi wawancara,
    atau melenceng ke topik umum.
    Pengecualian Penting:
    - Klarifikasi istilah teknis (misal: 'ROI itu apa?', 'maksudnya microservices apa?')
      DIANGGAP RELEVAN agar Bina bisa menjelaskan singkat lalu menguji kandidat.
    - Jawaban singkat konfirmasi ('ya', 'baik', 'terima kasih') DIANGGAP RELEVAN agar
      Bina melanjutkan ke pertanyaan baru, bukan mengulang teguran.
    """
    cohere_key = os.environ.get("COHERE_API_KEY")
    if not cohere_key:
        return (False, "")

    # Ambil pertanyaan terakhir dari Bina
    pertanyaan_terakhir = "Bisa ceritakan latar belakang dan kualifikasi Anda?"
    for msg in reversed(riwayat_chat):
        if msg.get("pengirim") == "pewawancara":
            pertanyaan_terakhir = msg.get("teks", "")
            break

    # Pengecualian cepat: Kandidat bertanya istilah teknis dari pertanyaan Bina sebelumnya
    j = jawaban.strip().lower()
    if re.search(r"apa itu [a-z0-9_-]+|maksudnya|itu apa ya|boleh tanya.*apa", j) and len(j) < 60:
        return (False, "") # Biarkan LLM Bina menjelaskan istilah lalu menguji balik

    # Pengecualian cepat: Kandidat menjawab sopan / singkat / konfirmasi ('baik', 'terima kasih', 'lanjut')
    if j in ["baik", "terima kasih", "terima kasih atas kesempatannya", "siap", "oke baik", "lah mana pertanyaannya", "lah mana pertanyyaannya?"]:
        return (False, "") # Biarkan LLM Bina merespon secara alami dan memberikan pertanyaan baru!

    system_gatekeeper = f"""PERAN: AI Semantic Gatekeeper Evaluasi Wawancara Kerja.
POSISI YANG DILAMAR: '{target_role}'.
PERTANYAAN SEBELUMNYA DARI BINA (HR): "{pertanyaan_terakhir}"

TUGAS UTAMA:
Tentukan apakah input kandidat ini merupakan respons yang sah dalam konteks percakapan wawancara kerja, ATAU murni di luar konteks (OOT).

KRITERIA RELEVAN (relevan = true):
- Kandidat menjawab pertanyaan, membagikan pengalaman, keahlian, atau motivasi.
- Kandidat mengajukan klarifikasi mengenai istilah kerja atau instruksi yang sedang dibahas.
- Kandidat memberikan konfirmasi sopan atau merespons alur percakapan secara profesional.

KRITERIA TIDAK RELEVAN (relevan = false):
- Pertanyaan pengetahuan umum atau tokoh luar tanpa kaitan wawancara (misal: 'siapa itu prabowo', 'filsafat eksistensialisme itu apa', 'resep seblak').
- Teks sintaks coding acak lepas seperti `print = "hello word"` atau `=true`.
- Curhat personal atau lelucon lepas.

Keluarkan format JSON murni:
{{
  "relevan": true atau false,
  "alasan": "ringkasan 1 kalimat",
  "teguran_bina": "Jika relevan=false, buat 1-2 kalimat dari Bina (Head of Talent Acquisition) yang sopan tapi tegas, menolak topik tersebut dan memberikan pertanyaan wawancara terarah: '{pertanyaan_terakhir}'. JANGAN PERNAH menyertakan teks teknis seperti '=true' atau JSON."
}}"""

    url = "https://api.cohere.com/v2/chat"
    headers = {
        "Authorization": f"Bearer {cohere_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "command-r7b-12-2024",
        "messages": [
            {"role": "system", "content": {"type": "text", "text": system_gatekeeper}},
            {"role": "user", "content": {"type": "text", "text": jawaban}}
        ],
        "response_format": {"type": "json_object"}
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=8) as resp:
            hasil = json.loads(resp.read().decode("utf-8"))
            konten_str = hasil.get("message", {}).get("content", [{}])[0].get("text", "{}")
            obj = json.loads(konten_str)
            
            is_relevan = obj.get("relevan", False)
            if not is_relevan:
                teguran = obj.get("teguran_bina", "").strip()
                # Bersihkan jika ada kebocoran artifact seperti '=true'
                teguran = re.sub(r"^=true\s*", "", teguran, flags=re.IGNORECASE).strip()
                if not teguran:
                    teguran = (
                        f"Sebagai Head of Talent Acquisition, fokus kita adalah kualifikasi Anda di posisi {target_role}. "
                        f"Mari kita lanjutkan evaluasi kita: {pertanyaan_terakhir}"
                    )
                return (True, teguran)
    except Exception as e:
        print("Gatekeeper error:", e)

    return (False, "")

@router.post("/jawab")
async def tangani_jawaban_chat(data: PermintaanKirimJawaban):
    """
    Menerima jawaban kandidat dan menghasilkan respons cerdas dari 'Bina'
    menggunakan Single Dynamic Cognitive Engine berbasis riset HR MeIntervUAI.
    Tidak ada lagi template teguran berulang yang kaku.
    """
    cek_rate_limit_simulasi(data.pengguna_id)

    # 1. Filter Fisik Cepat (Kata Kasar Toxic / URL Copas Artikel)
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

    # 4. Dialog Utama Adaptif Bina (Memanggil bina_service khusus)
    teks_balasan = hasilkan_respon_bina(
        target_role=data.target_role,
        jawaban_kandidat=data.jawaban_kandidat,
        riwayat_chat=data.riwayat_chat,
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
