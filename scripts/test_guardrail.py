import re

def deteksi_anomali_input(jawaban: str, target_role: str = "Digital Marketing Lead") -> tuple[str, str]:
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
        
    # 2. Deteksi Spam / Keyboard Mash / Teks Acak (misal: 'asda', 'asdakdaldmalsiaer')
    vokal = len(re.findall(r"[aiueo]", j))
    total_huruf = len(re.findall(r"[a-z]", j))
    rasio_vokal = vokal / max(total_huruf, 1)
    
    kata_acak_pendek = ["asda", "asd", "qwe", "qwerty", "tes", "test", "123", "abc", "zzz", "xxx"]
    is_mash = False
    if j in kata_acak_pendek:
        is_mash = True
    elif total_huruf >= 6 and (rasio_vokal < 0.18 or rasio_vokal > 0.82 or bool(re.search(r"(.)\1{3,}", j)) or bool(re.search(r"[^aiueo\s]{5,}", j))):
        is_mash = True
    elif total_huruf >= 12 and any(k in j for k in ["asda", "aldm", "daldm", "siaer", "kljs", "fdsk"]):
        is_mash = True

    if is_mash:
        return (
            "SPAM_RANDOM",
            f"Respons yang Anda ketik tidak memiliki struktur kalimat profesional yang bermakna. Di posisi {target_role}, kejelasan artikulasi dan komunikasi adalah syarat mutlak. Mohon berikan tanggapan yang terstruktur dan relevan dengan pertanyaan wawancara."
        )

    # 3. Deteksi Pengulangan Sapaan Menghindar (misal: 'hai', 'halo', 'p', 'woi')
    sapaan_pendek = ["hai", "halo", "hello", "p", "oi", "woi", "pagi", "siang", "malam", "tes"]
    if j in sapaan_pendek or re.fullmatch(r"^(hai|halo|hello|p|oi)\s*([!?.]*)$", j):
        return (
            "SAPAAN_MENGHINDAR",
            f"Kita sudah melewati perkenalan awal. Sikap menghindar atau sekadar mengulang sapaan menunjukkan kurangnya kesiapan menghadapi wawancara kerja yang sebenarnya. Bisa kita langsung masuk ke substansi pengalaman dan kapabilitas Anda di bidang {target_role}?"
        )

    # 4. Deteksi Pertanyaan AI Persona / Model / Pengembang (misal: 'kamu model siapa', 'gpt', 'claude')
    if any(k in j for k in ["model siapa", "kamu gpt", "kamu ai", "cohere", "gemini", "claude", "chatgpt", "openai", "llm", "kamu siapa", "kamu apa"]):
        return (
            "AI_PERSONA_QUESTION",
            f"Saya adalah Bina, AI Head of Talent Acquisition & Lead Career Evaluator di MeIntervUAI. Peran saya di sini murni sebagai pewawancara profesional untuk menguji kompetensi dan portofolio Anda. Mari kita maksimalkan waktu simulasi ini untuk mengeksplorasi kesiapan Anda di peran {target_role}."
        )

    # 5. Deteksi Pertanyaan Out of Topic / Trivia Umum / Permintaan di luar wawancara
    pola_trivia = [
        r"apa itu", r"itu apa", r"hewan apa", r"siapa presiden", r"bikin puisi", r"cuaca", 
        r"resep", r"artinya apa", r"buatkan", r"bantu bikin", r"hidung terpanjang", r"kapal angkasa",
        r"cerita dong", r"nyanyi", r"lelucon", r"coding python", r"bikin program", r"bikin prom"
    ]
    if any(re.search(p, j) for p in pola_trivia):
        return (
            "OUT_OF_TOPIC",
            f"Sebagai Head of Talent Acquisition, saya hadir khusus untuk menguji kompetensi, pola pikir, dan kesiapan Anda pada posisi {target_role}, bukan untuk menjawab ensiklopedia umum atau permintaan bantuan lepas. Mari kita fokus kembali ke evaluasi profesional Anda."
        )

    return ("NORMAL", "")

test_inputs = [
    "hai",
    "hai!",
    "asda",
    "asdakdaldmalsiaer",
    "memek",
    "hai sayang",
    "kamu ai model siapa ya? gpt meta gemini claude?",
    "kamu bisa bantu bikin prom sederhana tentang pembuatan kapal angkasa?",
    "google itu apa ya?",
    "hewan dengan hidung terpanjang itu apa ya?",
    "Saya pernah memimpin tim marketing 5 orang meningkatkan GMV 30% dalam 6 bulan."
]

for inp in test_inputs:
    kat, res = deteksi_anomali_input(inp)
    print(f"[{kat}] \"{inp}\"\n-> {res[:95]}...\n")

