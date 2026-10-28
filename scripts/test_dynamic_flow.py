import json
import urllib.request

test_sequence = [
    ("boleh saya tanya ROI itu apa ya?", "Digital Marketing Lead"),
    ("baik", "Digital Marketing Lead"),
    ("lah mana pertanyaannya?", "Digital Marketing Lead")
]

print("MEMULAI PENGUJIAN ALUR DINAMIS KANDIDAT...")
for pesan, role in test_sequence:
    url = "http://localhost:8609/api/simulasi/jawab"
    payload = {
        "sesi_id": "sesi_test",
        "pengguna_id": "user202610280001",
        "target_role": role,
        "jawaban_kandidat": pesan,
        "riwayat_chat": [
            {
                "pengirim": "pewawancara",
                "nama": "Bina",
                "peran": "Head of Talent Acquisition",
                "teks": "Apa yang Anda lakukan untuk memastikan bahwa strategi digital marketing Anda dapat mengoptimalkan ROI?"
            }
        ]
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            teks = data.get("pesan_pewawancara", {}).get("teks", "")
            kat = data.get("kategori_guardrail", "LLM_RESPONSE")
            print(f"\n[USER]: \"{pesan}\"")
            print(f"[STATUS]: {kat}")
            print(f"[BINA]: {teks}")
    except Exception as e:
        print(f"Error pada {pesan}: {e}")

