# Router Pengaturan Pengguna: kelola identitas profil, ganti email/password, preferensi bahasa, dan ulasan.
# Mendukung feedback ulasan aplikasi bintang 1-5 untuk tim Customer Success.

from typing import Optional
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from app.services.supabase_service import get_supabase_client, buat_id_terstruktur

router = APIRouter(prefix="/api/pengaturan", tags=["Pengaturan"])

class PermintaanUbahIdentitas(BaseModel):
    pengguna_id: str
    nama_lengkap: Optional[str] = None
    nomor_telepon: Optional[str] = None
    url_foto_profil: Optional[str] = None
    preferensi_bahasa: Optional[str] = None
    umur: Optional[int] = None
    jenis_kelamin: Optional[str] = None
    status_pekerjaan: Optional[str] = None
    role_impian: Optional[str] = None

class PermintaanUbahEmail(BaseModel):
    pengguna_id: str
    email_baru: EmailStr

class PermintaanLupaPassword(BaseModel):
    email: EmailStr

class PermintaanUlasanAplikasi(BaseModel):
    pengguna_id: str
    bintang_rating: int
    isi_ulasan: Optional[str] = None

class PermintaanHapusFoto(BaseModel):
    pengguna_id: str

@router.put("/identitas")
async def perbarui_identitas(data: PermintaanUbahIdentitas):
    """
    Memperbarui nama lengkap, kontak, foto profil, preferensi bahasa, umur, status pekerjaan, dan role impian.
    Juga menyinkronkan nama_lengkap ke tabel pengguna.
    """
    sb = get_supabase_client()
    try:
        payload = {}
        if data.nama_lengkap is not None:
            payload["nama_lengkap"] = data.nama_lengkap
        if data.nomor_telepon is not None:
            payload["nomor_telepon"] = data.nomor_telepon
        if data.url_foto_profil is not None:
            payload["url_foto_profil"] = data.url_foto_profil
        if data.preferensi_bahasa is not None:
            payload["preferensi_bahasa"] = data.preferensi_bahasa
        if data.umur is not None:
            payload["umur"] = data.umur
        if data.jenis_kelamin is not None:
            payload["jenis_kelamin"] = data.jenis_kelamin
        if data.status_pekerjaan is not None:
            payload["status_pekerjaan"] = data.status_pekerjaan
        if data.role_impian is not None:
            payload["role_impian"] = data.role_impian

        # Cek apakah profil sudah ada
        cek = sb.table("profil_pengguna").select("profil_id").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        if not cek.data:
            payload["profil_id"] = buat_id_terstruktur("prof")
            payload["pengguna_id"] = data.pengguna_id
            sb.table("profil_pengguna").insert(payload).execute()
        else:
            sb.table("profil_pengguna").update(payload).eq("pengguna_id", data.pengguna_id).execute()

        # Update nama_pengguna di tabel pengguna jika nama_lengkap diisi
        if data.nama_lengkap:
            try:
                sb.table("pengguna").update({"nama_pengguna": data.nama_lengkap}).eq("pengguna_id", data.pengguna_id).execute()
            except Exception:
                pass

        return {
            "status": "sukses",
            "pesan": "Identitas profil berhasil diperbarui."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal memperbarui identitas: {str(e)}"
        )

@router.post("/foto-profil")
async def unggah_foto_profil(pengguna_id: str = Form(...), berkas: UploadFile = File(...)):
    """
    Mengunggah berkas foto profil ke Supabase Storage (bucket foto-profil),
    mengganti foto lama jika ada, dan memperbarui url_foto_profil di tabel profil_pengguna.
    Maksimal ukuran berkas asli sebelum kompresi 5MB.
    """
    sb = get_supabase_client()
    try:
        konten = await berkas.read()
        if len(konten) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ukuran berkas melebihi batas maksimal 5MB."
            )

        ekstensi = berkas.filename.split(".")[-1].lower() if berkas.filename and "." in berkas.filename else "jpg"
        if ekstensi not in ["jpg", "jpeg", "png", "webp"]:
            ekstensi = "jpg"

        nama_berkas_storage = f"avatar_{pengguna_id}.{ekstensi}"
        tipe_konten = berkas.content_type or f"image/{ekstensi}"

        # Upload atau timpa ke Supabase Storage
        sb.storage.from_("foto-profil").upload(
            nama_berkas_storage,
            konten,
            {"content-type": tipe_konten, "upsert": "true"}
        )

        url_publik = sb.storage.from_("foto-profil").get_public_url(nama_berkas_storage)
        # Tambahkan query string cache-buster agar browser langsung menampilkan gambar terbaru
        url_publik_versi = f"{url_publik}?v={buat_id_terstruktur('img')}"

        sb.table("profil_pengguna").update({
            "url_foto_profil": url_publik_versi
        }).eq("pengguna_id", pengguna_id).execute()

        return {
            "status": "sukses",
            "pesan": "Foto profil berhasil diunggah dan disimpan.",
            "url_foto_profil": url_publik_versi
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal mengunggah foto profil: {str(e)}"
        )

@router.delete("/foto-profil")
async def hapus_foto_profil(data: PermintaanHapusFoto):
    """
    Menghapus foto profil dari storage dan mengosongkan url_foto_profil di database.
    """
    sb = get_supabase_client()
    try:
        # Coba hapus file dari bucket
        for ext in ["jpg", "jpeg", "png", "webp"]:
            try:
                sb.storage.from_("foto-profil").remove([f"avatar_{data.pengguna_id}.{ext}"])
            except Exception:
                pass

        sb.table("profil_pengguna").update({
            "url_foto_profil": None
        }).eq("pengguna_id", data.pengguna_id).execute()

        return {
            "status": "sukses",
            "pesan": "Foto profil berhasil dihapus."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal menghapus foto profil: {str(e)}"
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
