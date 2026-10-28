import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv(".env")
cohere_key = os.getenv("COHERE_API_KEY")

test_cases = [
    "1+1 berapa?",
    "1+1",
    "rumus segitiga",
    "ringkaskan video youtube reza auditore",
    "jadwal pertandingan hari ini",
    "Menurut kamu, apa yang dimaksud dengan berita hoaks?",
    "kok kamu jahat sih"
]

system_prompt = """KAMU ADALAH BINA (Head of Talent Acquisition di MeIntervUAI).
PERAN YANG DILAMAR KANDIDAT: Backend Engineer.
PERTANYAAN SEBELUMNYA DARI BINA: "Apa yang Anda lakukan untuk memastikan siap menghadapi tantangan Backend Engineer?"

PERATURAN KERAS (STRICT REFUSAL RULE):
1. KAMU HANYA MENILAI KOMPETENSI KANDIDAT UNTUK POSISI Backend Engineer.
2. KAMU BUKAN SEARCH ENGINE, BUKAN KALKULATOR, BUKAN ENSIKLOPEDIA, BUKAN ASISTEN TUGAS.
3. DILARANG KERAS MENJAWAB PERTANYAAN DI LUAR WAWANCARA:
   - Hitungan matematika / rumus ilmiah apa pun (1+1, rumus segitiga, integral, dll) -> TOLAK.
   - Definisi umum / kamus / berita / hoaks / artikel -> TOLAK.
   - Permintaan cari jadwal / ringkas video / gosip / cuaca -> TOLAK.
   - Perintah coding lepas / buat puisi / translate teks luar -> TOLAK.
4. CARA MENOLAK:
   Tegaskan secara profesional bahwa kamu adalah Head of Talent Acquisition yang sedang menguji kesiapan mereka, lalu tanyakan kembali pertanyaan wawancara tentang Backend Engineer.
5. Maksimal 2-3 kalimat."""

for tc in test_cases:
    url = "https://api.cohere.com/v2/chat"
    headers = {
        "Authorization": f"Bearer {cohere_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "command-r7b-12-2024",
        "messages": [
            {"role": "system", "content": {"type": "text", "text": system_prompt}},
            {"role": "user", "content": {"type": "text", "text": tc}}
        ]
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        ans = res.get("message", {}).get("content", [{}])[0].get("text")
        print(f"INPUT: {tc}")
        print(f"BINA: {ans}\n" + "-"*50)

