# Router CSM Publik: Pusat bantuan, form tiket kontak Customer Success, dan FAQ publik.
# Terbuka untuk umum tanpa wajib login.

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.services.supabase_service import get_supabase_client, buat_id_terstruktur

router = APIRouter(prefix="/api/csm", tags=["CSM Publik"])

class PermintaanTiketPublik(BaseModel):
    nama_pengirim: str
    email_pengirim: EmailStr
    kategori_kendala: str
    subjek_pesan: str
    isi_pesan: str

@router.post("/tiket-publik")
async def kirim_tiket_bantuan(data: PermintaanTiketPublik):
    """
    Mengirimkan tiket kendala/pertanyaan dari pengunjung publik ke Customer Success Management.
    """
    sb = get_supabase_client()
    try:
        tiket_id = buat_id_terstruktur("tikt")
        sb.table("tiket_bantuan_csm").insert({
            "tiket_id": tiket_id,
            "nama_pengirim": data.nama_pengirim,
            "email_pengirim": data.email_pengirim,
            "kategori_kendala": data.kategori_kendala,
            "subjek_pesan": data.subjek_pesan,
            "isi_pesan": data.isi_pesan,
            "status_tiket": "menunggu"
        }).execute()

        return {
            "status": "sukses",
            "pesan": "Tiket bantuan Anda telah diterima. Tim Customer Success akan segera menghubungi Anda.",
            "tiket_id": tiket_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengirim tiket bantuan: {str(e)}"
        )

@router.get("/faq-publik")
async def daftar_faq_publik():
    """
    Daftar pertanyaan yang sering diajukan (FAQ) seputar simulasi wawancara dan kuota token.
    """
    return {
        "status": "sukses",
        "faq": [
            {
                "pertanyaan": "Berapa banyak kuota token gratis yang saya dapatkan?",
                "jawaban": "Setiap pendaftar baru secara otomatis mendapatkan 100 Token Gratis yang dapat digunakan untuk analisis CV dan simulasi wawancara."
            },
            {
                "pertanyaan": "Mengapa tombol Mulai Simulasi di Beranda terkunci?",
                "jawaban": "Pewawancara AI membutuhkan data riwayat dan pengalaman dari CV Anda untuk menghasilkan pertanyaan adaptif yang realistis. Isi minimal 1 bagian CV untuk membuka simulasi."
            },
            {
                "pertanyaan": "Apakah video wawancara saya direkam ke server?",
                "jawaban": "Tidak. Seluruh deteksi postur dan tatapan mata diproses secara lokal di peramban Anda menggunakan MediaPipe. Privasi kamera Anda terlindungi 100%."
            },
            {
                "pertanyaan": "Bagaimana jika saldo token saya habis?",
                "jawaban": "Anda dapat menghubungi tim Customer Success melalui formulir bantuan di halaman ini untuk mengajukan penambahan kuota token pendampingan."
            }
        ]
    }

@router.get("/ulasan-publik")
async def ambil_ulasan_publik():
    """
    Mengambil daftar ulasan aplikasi nyata dari database Supabase untuk landing page publik.
    """
    sb = get_supabase_client()
    try:
        ulasan = sb.table("ulasan_aplikasi").select("ulasan_id, bintang_rating, isi_ulasan, dibuat_pada, pengguna(nama_pengguna, profil_pengguna(role_impian))").order("dibuat_pada", desc=True).limit(10).execute()
        return {
            "status": "sukses",
            "ulasan": ulasan.data or []
        }
    except Exception as e:
        return {
            "status": "sukses",
            "ulasan": []
        }

