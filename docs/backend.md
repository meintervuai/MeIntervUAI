# Standar Backend: IntervU AI (BE-01 s.d BE-02)

Ruang lingkup: API, layanan, autentikasi, validasi input, keamanan, dan batas laju (*rate limiting*).

## Aturan

### BE-01: Batas Laju Permintaan (Rate Limit per User & IP)
Setiap endpoint wajib memiliki batasan kuota konkret untuk mencegah banjir bot dan pembengkakan biaya API:
- Endpoint Autentikasi (`/api/auth/*`): **5 percakapan/menit per IP**.
- Endpoint Umum (`/api/profil`, `/api/csm`, `/api/pengaturan`): **60 request/menit per user** (atau 100/menit per IP tanpa login).
- Endpoint Berat AI (`/api/cv/analisis`, `/api/simulasi/*`): **10 request/menit per user** + verifikasi saldo token.
- Saat kuota terlampaui: Mengembalikan kode status **HTTP 429 Too Many Requests** beserta header `Retry-After`.

### BE-02: Pencegahan Injeksi SQL & Sanitasi Input
- Gunakan kueri berparameter (*parameterized query*) melalui client Supabase; dilarang menggabungkan string kueri secara langsung (*string concatenation*).
- Validasi seluruh skema input request menggunakan model **Pydantic v2** yang ketat.
- Lindungi keluaran terhadap serangan Cross-Site Scripting (XSS).
- Batasi ukuran body request dan gunakan timeout pada setiap pemanggilan layanan pihak ketiga.
