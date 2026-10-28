# Standar Backend: IntervU AI (BE-01 s.d BE-02)

Ruang lingkup: API, layanan, autentikasi, validasi input, keamanan, dan batas laju (*rate limiting*).

## Aturan

### BE-01: Batas Laju Permintaan (Rate Limit per User & IP)
Setiap endpoint wajib memiliki batasan kuota konkret untuk mencegah banjir bot dan pembengkakan biaya API:
- Endpoint Autentikasi (`/api/auth/*`): **5 percakapan/menit per IP**.
- Endpoint Umum (`/api/profil`, `/api/csm`, `/api/pengaturan`): **60 request/menit per user** (atau 100/menit per IP tanpa login).
- Endpoint Berat AI (`/api/cv/analisis`, `/api/simulasi/*`): **10-20 request/menit per user** + verifikasi saldo token.
- Saat kuota terlampaui: Mengembalikan kode status **HTTP 429 Too Many Requests** beserta header `Retry-After`.

### BE-02: Pencegahan Injeksi SQL & Sanitasi Input
- Gunakan kueri berparameter (*parameterized query*) melalui client Supabase; dilarang menggabungkan string kueri secara langsung (*string concatenation*).
- Validasi seluruh skema input request menggunakan model **Pydantic v2** yang ketat.
- Lindungi keluaran terhadap serangan Cross-Site Scripting (XSS).
- Batasi ukuran body request dan gunakan timeout pada setiap pemanggilan layanan pihak ketiga.

### BE-03: Single Dynamic Cognitive HR Engine (Anti-Jailbreak & Human-Like Conversation)
Pada modul simulasi wawancara adaptif (`/api/simulasi/jawab`):
- **Bukan Filter Regex Blacklist Rapuh**: Dilarang mengandalkan daftar kata terlarang satu per satu untuk menyaring input pengguna.
- **Universal Relevance Evaluator (Biner)**: Input pengguna diverifikasi secara semantik melalui model biner cepat untuk memastikan kandidat berada dalam koridor evaluasi profesional (kualifikasi diri, klarifikasi teknis, atau konfirmasi alur kerja).
- **Cognitive Reframing (Zero-Leakage Guarantee)**:
  - Jika input di luar nalar/topik acak (resep masakan, politik luar, lirik lagu, matematika sekolah), sistem membalikkan konteks secara dinamis sebagai bahan evaluasi sikap/fokus profesional tanpa pernah membacakan artikel ensiklopedia atau mengulang template teguran kaku.
  - Jika kandidat menanyakan istilah teknis dari pertanyaan sebelumnya (seperti *ROI*, *microservices*, *kpi*), sistem menjelaskan definisinya dalam 1 kalimat padat dan langsung menantang balik pemahaman kandidat.
- **Larangan Format AI Slop (Human Persona Standard)**:
  - Dilarang keras menggunakan penomoran daftar (**1.**, **2.**, **3.**), bullet point, atau bold heading.
  - Dilarang membombardir kandidat dengan banyak pertanyaan sekaligus dalam 1 giliran; wajib **tepat 1 pertanyaan** per giliran.
  - Bina wajib bereaksi secara manusiawi dan reaktif terhadap sikap arogan, malas, maupun trolling kandidat (misal: membedah 'malas' sebagai red flag fatal, atau menantang klaim individualis dalam kepemimpinan tim).
- **Sanitasi Artifak Token**: Menjamin tidak ada artifak token prompt (seperti `=true`, `=false`, atau sisa json mentah) yang lolos ke antarmuka pengguna.
