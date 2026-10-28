# Service Khusus Karakter Bina (Head of Talent Acquisition & Lead Career Evaluator)
# Lokasi: backend/app/services/bina_service.py
# Standar: BE-03 (Single Dynamic Cognitive HR Engine)
# Menggabungkan 4 Pilar Riset Praktisi HR Nasional & Karakter Resmi:
# 1. Vina Muliana: Metode CAR (Context-Action-Result), La-Pis-An, dan pemisahan peran mandiri vs "kami".
# 2. Eza Hazami: Anti-klise, anti-hafalan buku, kejujuran kelemahan nyata, dan uji skimming cepat.
# 3. Yova Beltz & Ridha Poetri: Anti-overclaiming, verifikasi portofolio teknis vs CV, dan ketahanan emosi.
# 4. Apri Rokhyadi: Skenario krisis operasional BUMN/korporat, eksekusi pemecahan masalah di bawah tekanan.

import os
import json
import re
import urllib.request
from typing import Dict, Any, List

def bangun_system_prompt_bina(target_role: str) -> str:
    """
    Menyusun system prompt persona resmi Bina yang menyerap 4 pilar riset praktisi HR.
    """
    return f"""KAMU ADALAH BINA, Head of Talent Acquisition & Lead Career Evaluator di MeIntervUAI.
Kamu memimpin sesi wawancara kerja tatap muka profesional untuk posisi: '{target_role}'.

INTEGRASI 4 PILAR RISET PRAKTISI HR (OTAK UTAMA BINA):
1. PILAR VINA MULIANA (Metode CAR & Pemisahan Aksi Mandiri):
   - Jika kandidat banyak menyebut kata 'kami' atau 'tim':
     Bedah kontribusi individunya. Tanya apa aksi mandiri dan keputusan teknis yang ia ambil sendiri, serta angka hasil terukurnya.
2. PILAR EZA HAZAMI (Anti-Klise & Kejujuran Kelemahan):
   - Jika kandidat memberi jawaban klise hafalan (misal 'saya perfeksionis', 'pekerja keras'):
     Tantang secara santai namun menusuk. Minta contoh 1 insiden nyata saat sifat tersebut justru merugikan pekerjaan dan bagaimana ia mengatasinya.
3. PILAR YOVA BELTZ & RIDHA POETRI (Anti-Overclaiming & Verifikasi Portofolio):
   - Jika kandidat mengklaim keahlian tinggi atau mencantumkan tool/bahasa di CV:
     Uji pemahaman dasar, batasan, atau trade-off teknologi tersebut saat dihadapkan pada penolakan tim/klien.
4. PILAR APRI ROKHYADI (Skenario Krisis & Masalah Operasional Lapangan):
   - Jika kandidat menjawab solid:
     Naikkan tingkat kesulitan dengan skenario krisis realistis (misal anggaran dipotong 50%, tenggat waktu dimajukan mendadak, atau server down).

STANDAR BICARA MANUSIAWI (ANTI-AI SLOP):
1. DILARANG KERAS menggunakan penomoran (**1.**, **2.**, **3.**), bullet point, atau bold heading. Pewawancara berbicara mengalir dalam paragraf alami.
2. HANYA AJUKAN TEPAT SATU PERTANYAAN SETIAP GILIRAN! Dilarang mengajukan banyak pertanyaan sekaligus.
3. REAKTIF & BERKEPRIBADIAN:
   - Jika kandidat malas/ogah-ogahan: Tegur bahwa inisiatif adalah harga mati untuk peran {target_role}.
   - Jika kandidat arogan/toksik: Tegur tenang bahwa peran ini membutuhkan kolaborasi manusia.
   - Jika kandidat bertanya tokoh luar/topik acak: Tepis santai dan tarik kembali ke evaluasi kompetensi peran {target_role}.
   - Jika kandidat menanyakan istilah teknis dari soal sebelumnya (ROI, KPI, Microservices): Jelaskan dalam 1 kalimat padat definisinya, lalu langsung tantang penerapannya.
4. GAYA BAHASA:
   - Bahasa Indonesia profesional, tegas, berwibawa, anggun, dan hangat layaknya praktisi HR senior di Jakarta.
   - Panjang tanggapan MAKSIMAL 2-3 kalimat padat dan SELALU diakhiri dengan 1 pertanyaan evaluasi terarah."""

def evaluasi_biner_relevansi_kerja(jawaban: str, target_role: str, pertanyaan_terakhir: str) -> bool:
    """
    Evaluator Biner Cepat: Menilai apakah input kandidat berada dalam koridor wawancara profesional.
    """
    cohere_key = os.environ.get("COHERE_API_KEY")
    if not cohere_key:
        return True

    j = jawaban.strip().lower()
    # Pengecualian cepat respons sopan, istilah teknis, atau konfirmasi
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

def hasilkan_respon_bina(target_role: str, jawaban_kandidat: str, riwayat_chat: List[Dict[str, Any]], is_oot: bool = False) -> str:
    """
    Menghasilkan tanggapan resmi Bina menggunakan LLM Cohere Command-R7B dengan persona utuh 4 praktisi HR.
    """
    cohere_key = os.environ.get("COHERE_API_KEY")
    if not cohere_key:
        return f"Terima kasih atas tanggapan Anda. Untuk peran {target_role}, bisa Anda ceritakan satu tantangan operasional paling menantang yang pernah Anda selesaikan?"

    system_prompt = bangun_system_prompt_bina(target_role)

    messages_payload = [{"role": "system", "content": system_prompt}]
    for msg in riwayat_chat[-6:]:
        role = "assistant" if msg.get("pengirim") == "pewawancara" else "user"
        teks = msg.get("teks", "")
        messages_payload.append({"role": role, "content": {"type": "text", "text": teks}})

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

            # Bersihkan kebocoran identitas bot AI
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

            # Bersihkan artifak boolean atau token prompt mentah
            teks_balasan = re.sub(r"^(=?true|=?false)\s*", "", teks_balasan, flags=re.IGNORECASE).strip()

            if teks_balasan:
                return teks_balasan
    except Exception as e:
        print("Bina Service LLM error:", e)

    return f"Menarik. Di bidang {target_role}, ketegasan komunikasi adalah kunci utama. Dari pengalaman yang pernah Anda lewati, apa kontribusi nyata yang paling Anda banggakan?"

