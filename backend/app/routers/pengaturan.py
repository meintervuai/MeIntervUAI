# Router Pengaturan Pengguna: kelola identitas profil, ganti email/password, preferensi bahasa, dan ulasan.
# Mendukung feedback ulasan aplikasi bintang 1-5 untuk tim Customer Success.

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.services.supabase_service import get_supabase_client, buat_id_terstruktur

router = APIRouter(prefix="/api/pengaturan", tags=["Pengaturan"])

class PermintaanUbahIdentitas(BaseModel):
    pengguna_id: str
    nama_lengkap: Optional[str] = None
    nomor_telepon: Optional[str] = None
    url_foto_profil: Optional[str] = None
    preferensi_bahasa: Optional[str] = None

class PermintaanUbahEmail(BaseModel):
    pengguna_id: str
    email_baru: EmailStr

class PermintaanLupaPassword(BaseModel):
    email: EmailStr

class PermintaanUlasanAplikasi(BaseModel):
    pengguna_id: str
    bintang_rating: int
    isi_ulasan: Optional[str] = None

@router.put("/identitas")
async def perbarui_identitas(data: PermintaanUbahIdentitas):
    """
    Memperbarui nama lengkap, nomor telepon, foto profil, dan preferensi bahasa.
    """
    sb = get_supabase_client()
    try:
        payload = {}
        if data.nama_lengkap:
            payload["nama_lengkap"] = data.nama_lengkap
        if data.nomor_telepon:
            payload["nomor_telepon"] = data.nomor_telepon
        if data.url_foto_profil:
            payload["url_foto_profil"] = data.url_foto_profil
        if data.preferensi_bahasa:
            payload["preferensi_bahasa"] = data.preferensi_bahasa

        sb.table("profil_pengguna").update(payload).eq("pengguna_id", data.pengguna_id).execute()

        return {
            "status": "sukses",
            "pesan": "Identitas profil berhasil diperbarui."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal memperbarui identitas: {str(e)}"
        )

@router.post("/ubah-email")
async def ajukan_ubah_email(data: PermintaanUbahEmail):
    """
    Mengajukan perubahan email ke Supabase Auth dengan verifikasi email baru.
    """
    sb = get_supabase_client()
    try:
        # Update user email via Supabase
        sb.auth.update_user({"email": data.email_baru})
        sb.table("pengguna").update({"email": data.email_baru}).eq("pengguna_id", data.pengguna_id).execute()

        return {
            "status": "sukses",
            "pesan": "Email konfirmasi telah dikirimkan ke alamat email baru Anda."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal mengubah email: {str(e)}"
        )

@router.post("/lupa-password")
async def ajukan_reset_password(data: PermintaanLupaPassword):
    """
    Memicu email instruksi pemulihan kata sandi via Supabase Auth.
    """
    sb = get_supabase_client()
    try:
        sb.auth.reset_password_email(data.email)
        return {
            "status": "sukses",
            "pesan": "Tautan pemulihan kata sandi telah dikirimkan ke email Anda."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal memproses pemulihan kata sandi: {str(e)}"
        )

@router.post("/ulasan")
async def kirim_ulasan_aplikasi(data: PermintaanUlasanAplikasi):
    """
    Menyimpan ulasan dan rating kepuasan aplikasi kandidat (1-5 bintang) untuk tim CSM.
    """
    sb = get_supabase_client()
    try:
        if data.bintang_rating < 1 or data.bintang_rating > 5:
            raise ValueError("Rating bintang harus antara 1 sampai 5.")

        ulasan_id = buat_id_terstruktur("ulas")
        sb.table("ulasan_aplikasi").insert({
            "ulasan_id": ulasan_id,
            "pengguna_id": data.pengguna_id,
            "bintang_rating": data.bintang_rating,
            "isi_ulasan": data.isi_ulasan or "",
            "status_tanggapan": "menunggu"
        }).execute()

        return {
            "status": "sukses",
            "pesan": "Terima kasih atas ulasan Anda! Masukan Anda sangat berharga bagi kami.",
            "ulasan_id": ulasan_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal menyimpan ulasan: {str(e)}"
        )
