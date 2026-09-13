"""Layanan AI Pewawancara Interaktif MENTERVU AI.

Gateway LLM multi-key (Gemini 1 -> Gemini 2 -> OpenRouter) dengan fallback heuristik semantik lokal
untuk mengevaluasi jawaban kandidat secara realistis dan menyusun respon percakapan alami.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, Optional

import httpx

from app.config.pengaturan import pengaturan

logger = logging.getLogger(__name__)

# Daftar kata kunci menyerah / tidak tahu
KATA_KUNCI_TIDAK_TAHU = [
    "gak tau",
    "nggak tau",
    "tidak tahu",
    "ngga tau",
    "gatau",
    "ndak tau",
    "ga faham",
    "tidak paham",
    "kurang tahu",
    "belum tahu",
    "idk",
    "dont know",
    "don't know",
    "no idea",
    "skip",
    "lewat",
    "entah",
    "kurang paham",
    "belum pernah",
]


def _deteksi_jawaban_tidak_tahu_atau_ngawur(teks: str) -> Optional[Dict[str, Any]]:
    """Deteksi cepat apakah jawaban berupa penolakan, ketidaktahuan, atau spam kata."""
    pembersih = teks.strip().lower()
    kata_list = pembersih.split()
    total_kata = len(kata_list)

    if total_kata == 0 or pembersih in ["-", ".", "?", "...", "!"]:
        return {
            "skor": 0,
            "kategori_kualitas": "kosong",
            "reaksi_pewawancara": "Saya melihat Anda belum memberikan jawaban untuk pertanyaan ini. Tidak apa-apa, mari kita beralih ke pertanyaan berikutnya.",
            "evaluasi_singkat": "Kandidat tidak memberikan jawaban sama sekali. Pertanyaan dilewati tanpa poin.",
            "rekomendasi_star": "Upayakan selalu mencoba menjawab dengan kerangka logika dasar meskipun belum menguasai topik secara mendalam.",
        }

    # Cek frase 'tidak tahu'
    for fr in KATA_KUNCI_TIDAK_TAHU:
        if fr in pembersih and total_kata <= 12:
            return {
                "skor": 15,
                "kategori_kualitas": "tidak_tahu",
                "reaksi_pewawancara": "Baik, kejujuran Anda kami apresiasi. Tidak masalah jika Anda belum familiar dengan hal ini, mari kita eksplorasi kompetensi Anda di topik lain.",
                "evaluasi_singkat": "Kandidat menyatakan belum mengetahui topik pertanyaan. Nilai teknikal rendah namun menunjukkan kejujuran.",
                "rekomendasi_star": "Bila tidak tahu, sampaikan kejujuran disusul kesediaan belajar atau analogi pemecahan masalah serupa yang pernah dihadapi.",
            }

    # Cek spam karakter berulang (contoh: "asdfghjkl", "hahahaha", "zzzzz")
    if total_kata <= 3 and any(len(k) > 7 and len(set(k)) <= 4 for k in kata_list):
        return {
            "skor": 5,
            "kategori_kualitas": "ngawur",
            "reaksi_pewawancara": "Tampaknya jawaban Anda belum terkait dengan pertanyaan wawancara kita. Sebagai pewawancara, saya berharap kita bisa berdiskusi secara profesional.",
            "evaluasi_singkat": "Jawaban berupa karakter acak atau tidak bermakna (spam). Tidak ada relevansi.",
            "rekomendasi_star": "Fokus pada pertanyaan dan berikan jawaban yang relevan dengan konteks peran yang dilamar.",
        }

    return None


def _evaluasi_heuristik_lokal(
    pertanyaan: str,
    jawaban: str,
    posisi_target: str,
    perusahaan_target: str,
    kategori: str,
    urutan: int,
) -> Dict[str, Any]:
    """Fallback evaluasi lokal cerdas bila LLM gateway sedang offline."""
    cek_khusus = _deteksi_jawaban_tidak_tahu_atau_ngawur(jawaban)
    if cek_khusus:
        return cek_khusus

    kata_count = len(jawaban.split())
    nama_pt = perusahaan_target or "perusahaan kami"

    # Evaluasi berbasis indikator kata profesional & metode STAR
    indikator_star = ["karena", "sehingga", "proyek", "hasil", "kendala", "solusi", "menggunakan", "tim", "berhasil"]
    cocok_star = sum(1 for ind in indikator_star if ind in jawaban.lower())

    if kata_count < 10:
        skor = 40
        reaksi = f"Terima kasih atas tanggapan singkat Anda. Di {nama_pt}, kami sangat mengutamakan penjabaran tindakan konkrit. Mari kita gali lebih dalam di pertanyaan selanjutnya."
        evaluasi = "Jawaban terlalu singkat, kurang memaparkan contoh tindakan nyata dan konteks situasi."
        kategori_kualitas = "kurang"
    elif kata_count < 25:
        skor = 65 + min(15, cocok_star * 3)
        reaksi = f"Baik, saya menangkap garis besar pendekatan Anda. Penjelasan Anda sudah menyentuh inti masalah."
        evaluasi = "Jawaban cukup baik dan relevan, namun hasil kuantitatif (metode STAR - Result) masih dapat diperkuat."
        kategori_kualitas = "cukup"
    else:
        skor = 75 + min(20, cocok_star * 4)
        reaksi = f"Penjelasan yang sangat baik dan terstruktur! Anda menggambarkan pengalaman praktis yang sangat relevan untuk standar {posisi_target} di {nama_pt}."
        evaluasi = "Struktur jawaban jelas dan komprehensif, mencerminkan pemahaman kerja nyata dan pola pikir solutif."
        kategori_kualitas = "baik"

    return {
        "skor": min(95, skor),
        "kategori_kualitas": kategori_kualitas,
        "reaksi_pewawancara": reaksi,
        "evaluasi_singkat": evaluasi,
        "rekomendasi_star": "Pertahankan struktur STAR (Situation, Task, Action, Result) dengan angka/metrik terukur pada bagian hasil.",
    }


async def _panggil_gemini(api_key: str, prompt_system: str, prompt_user: str) -> Optional[Dict[str, Any]]:
    """Panggil Google Gemini Flash via REST API."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    payload = {
        "system_instruction": {"parts": [{"text": prompt_system}]},
        "contents": [{"parts": [{"text": prompt_user}]}],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json",
        },
    }

    async with httpx.AsyncClient(timeout=12.0) as klien:
        resp = await klien.post(url, json=payload)
        if resp.status_code == 200:
            data = resp.json()
            teks = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(teks)
    return None


async def _panggil_openrouter(api_key: str, prompt_system: str, prompt_user: str) -> Optional[Dict[str, Any]]:
    """Panggil OpenRouter via REST API sebagai fallback cadangan."""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mentervu.ai",
        "X-Title": "MENTERVU AI",
    }
    payload = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [
            {"role": "system", "content": prompt_system + "\nKeluarkan HANYA JSON murni tanpa markdown."},
            {"role": "user", "content": prompt_user},
        ],
        "temperature": 0.3,
    }

    async with httpx.AsyncClient(timeout=14.0) as klien:
        resp = await klien.post(url, headers=headers, json=payload)
        if resp.status_code == 200:
            data = resp.json()
            konten = data["choices"][0]["message"]["content"]
            konten_bersih = re.sub(r"^```json\s*", "", konten)
            konten_bersih = re.sub(r"\s*```$", "", konten_bersih).strip()
            return json.loads(konten_bersih)
    return None


async def evaluasi_dan_respons_interaktif(
    pertanyaan: str,
    jawaban: str,
    posisi_target: str,
    perusahaan_target: str,
    kategori: str = "Umum",
    jawaban_ideal: str = "",
    urutan: int = 1,
) -> Dict[str, Any]:
    """Mengevaluasi jawaban pengguna dan menyusun respon percakapan pewawancara."""
    cek_cepat = _deteksi_jawaban_tidak_tahu_atau_ngawur(jawaban)
    if cek_cepat:
        return cek_cepat

    nama_pt = perusahaan_target or "perusahaan teknologi terkemuka"
    posisi = posisi_target or "Profesional"

    prompt_system = f"""
Anda adalah Senior Recruiter & Technical Hiring Manager profesional di {nama_pt} yang sedang melakukan wawancara kerja kandidat untuk posisi {posisi}.
Karakter Anda: Profesional, hangat, artikulatif, objektif, dan bersikap layaknya pewawancara manusia nyata.

Tugas Anda:
1. Analisis jawaban kandidat terhadap pertanyaan yang diajukan.
2. Berikan penilaian skor (0 - 100) yang ketat dan objektif:
   - Jika jawaban tidak relevan/ngawur/lirik lagu/spam: Skor 0 - 20.
   - Jika menyatakan 'tidak tahu' atau menyerah: Skor 10 - 25.
   - Jika sangat singkat tanpa substansi: Skor 30 - 50.
   - Jika relevan namun belum terstruktur: Skor 60 - 74.
   - Jika relevan, menggunakan pendekatan STAR, dan memberi contoh konkrit: Skor 75 - 95.
3. Buat "reaksi_pewawancara": 1-2 kalimat tanggapan lisan langsung terhadap isi jawaban kandidat (seperti pewawancara sungguhan mengomentari poin kandidat sebelum berpindah topik).
4. Buat "evaluasi_singkat": Catatan evaluasi profesional mengenai kekuatan atau kelemahan jawaban kandidat.
5. Buat "rekomendasi_star": Saran perbaikan berbasis STAR (Situation, Task, Action, Result).

Wajib menghasilkan format JSON valid dengan skema berikut:
{{
  "skor": <integer 0-100>,
  "kategori_kualitas": "<ngawur|tidak_tahu|kurang|cukup|baik|sangat_baik>",
  "reaksi_pewawancara": "<string reaksi lisan alami>",
  "evaluasi_singkat": "<string kritik evaluasi>",
  "rekomendasi_star": "<string saran STAR>"
}}
"""

    prompt_user = f"""
Pertanyaan Wawancara: "{pertanyaan}"
Kategori Pertanyaan: {kategori}
Panduan Jawaban Ideal: {jawaban_ideal or 'Relevan dengan konteks industri dan posisi.'}

Jawaban Kandidat:
\"\"\"{jawaban}\"\"\"

Evaluasi jawaban kandidat sekarang dalam format JSON.
"""

    if pengaturan.google_api_key_1:
        try:
            res = await _panggil_gemini(pengaturan.google_api_key_1, prompt_system, prompt_user)
            if res and "skor" in res:
                return res
        except Exception as e:
            logger.warning(f"Gagal memanggil Gemini 1: {e}")

    if pengaturan.google_api_key_2:
        try:
            res = await _panggil_gemini(pengaturan.google_api_key_2, prompt_system, prompt_user)
            if res and "skor" in res:
                return res
        except Exception as e:
            logger.warning(f"Gagal memanggil Gemini 2: {e}")

    if pengaturan.openrouter_api_key:
        try:
            res = await _panggil_openrouter(pengaturan.openrouter_api_key, prompt_system, prompt_user)
            if res and "skor" in res:
                return res
        except Exception as e:
            logger.warning(f"Gagal memanggil OpenRouter: {e}")

    return _evaluasi_heuristik_lokal(
        pertanyaan=pertanyaan,
        jawaban=jawaban,
        posisi_target=posisi,
        perusahaan_target=nama_pt,
        kategori=kategori,
        urutan=urutan,
    )
