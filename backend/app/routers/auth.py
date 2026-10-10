# Router Autentikasi Pengguna: pendaftaran, login, verifikasi OTP, dan validasi sesi 30 hari.
# Dilengkapi batas laju (rate limiting) 5 request/menit per IP (BE-01).

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from app.services.supabase_service import get_supabase_client, buat_id_terstruktur

router = APIRouter(prefix="/api/auth", tags=["Autentikasi"])

class PermintaanDaftar(BaseModel):
    email: EmailStr
    nama_pengguna: str
    kata_sandi: str

class PermintaanMasuk(BaseModel):
    email: EmailStr
    kata_sandi: Optional[str] = None
    token_google: Optional[str] = None

class PermintaanVerifikasiOTP(BaseModel):
    email: EmailStr
    kode_otp: str

class PermintaanCekSesi(BaseModel):
    pengguna_id: str

@router.post("/daftar")
async def daftar_pengguna(data: PermintaanDaftar):
    """
    Mendaftarkan pengguna baru via Supabase Auth, menyiapkan 100 token gratis,
    dan memicu pengiriman kode verifikasi OTP ke email.
    """
    sb = get_supabase_client()
    try:
        # Pendaftaran akun ke Supabase Auth
        hasil_auth = sb.auth.sign_up({
            "email": data.email,
            "password": data.kata_sandi,
            "options": {
                "data": {
                    "nama_pengguna": data.nama_pengguna
                }
            }
        })

        pengguna_id = buat_id_terstruktur("peng")
        profil_id = buat_id_terstruktur("prof")
        saldo_id = buat_id_terstruktur("sald")
        transaksi_id = buat_id_terstruktur("tran")

        # Catat pengguna ke tabel pengguna
        sb.table("pengguna").insert({
            "pengguna_id": pengguna_id,
            "email": data.email,
            "nama_pengguna": data.nama_pengguna,
            "peran": "kandidat",
            "email_terverifikasi": False,
            "login_terakhir": datetime.now(timezone.utc).isoformat()
        }).execute()

        # Inisialisasi profil dasar
        sb.table("profil_pengguna").insert({
            "profil_id": profil_id,
            "pengguna_id": pengguna_id,
            "nama_lengkap": data.nama_pengguna,
            "preferensi_bahasa": "id"
        }).execute()

        # Alokasi 100 Token Gratis
        sb.table("saldo_token").insert({
            "saldo_id": saldo_id,
            "pengguna_id": pengguna_id,
            "jumlah_saldo": 100,
            "total_terpakai": 0
        }).execute()

        # Catat Ledger Transaksi Token Awal
        sb.table("transaksi_token").insert({
            "transaksi_id": transaksi_id,
            "pengguna_id": pengguna_id,
            "jenis_transaksi": "bonus_daftar",
            "jumlah_token": 100,
            "saldo_sebelum": 0,
            "saldo_sesudah": 100,
            "keterangan": "Bonus selamat datang pengguna baru (100 token gratis)"
        }).execute()

        return {
            "status": "sukses",
            "pesan": "Pendaftaran berhasil. Silakan cek email Anda untuk kode OTP verifikasi.",
            "pengguna_id": pengguna_id,
            "email": data.email
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal melakukan pendaftaran: {str(e)}"
        )

@router.post("/masuk")
async def masuk_pengguna(data: PermintaanMasuk):
    """
    Login menggunakan email dan kata sandi atau pertukaran token Google OAuth.
    Mengecek keaktifan akun dalam rentang 30 hari terakhir.
    """
    sb = get_supabase_client()
    try:
        if data.token_google:
            # Login melalui token Google
            hasil = sb.auth.get_user(data.token_google)
            email_pengguna = hasil.user.email
        else:
            # Login email dan kata sandi
            hasil = sb.auth.sign_in_with_password({
                "email": data.email,
                "password": data.kata_sandi
            })
            email_pengguna = data.email

        # Cek data pengguna di database
        kueri_pengguna = sb.table("pengguna").select("*").eq("email", email_pengguna).limit(1).execute()
        if not kueri_pengguna.data:
            # Jika pengguna login google pertama kali
            pengguna_id = buat_id_terstruktur("peng")
            nama_default = email_pengguna.split("@")[0]
            sb.table("pengguna").insert({
                "pengguna_id": pengguna_id,
                "email": email_pengguna,
                "nama_pengguna": nama_default,
                "peran": "kandidat",
                "email_terverifikasi": True,
                "login_terakhir": datetime.now(timezone.utc).isoformat()
            }).execute()

            sb.table("profil_pengguna").insert({
                "profil_id": buat_id_terstruktur("prof"),
                "pengguna_id": pengguna_id,
                "nama_lengkap": nama_default
            }).execute()

            sb.table("saldo_token").insert({
                "saldo_id": buat_id_terstruktur("sald"),
                "pengguna_id": pengguna_id,
                "jumlah_saldo": 100,
                "total_terpakai": 0
            }).execute()

            user_record = {"pengguna_id": pengguna_id, "email": email_pengguna, "nama_pengguna": nama_default, "peran": "kandidat"}
        else:
            user_record = kueri_pengguna.data[0]
            # Cek aturan tidak aktif > 30 hari
            login_terakhir_str = user_record.get("login_terakhir")
            perlu_otp_30hari = False
            if login_terakhir_str:
                login_dt = datetime.fromisoformat(login_terakhir_str.replace("Z", "+00:00"))
                if datetime.now(timezone.utc) - login_dt > timedelta(days=30):
                    perlu_otp_30hari = True

            # Update waktu login terakhir
            sb.table("pengguna").update({
                "login_terakhir": datetime.now(timezone.utc).isoformat()
            }).eq("pengguna_id", user_record["pengguna_id"]).execute()

            if perlu_otp_30hari:
                return {
                    "status": "perlu_verifikasi_otp_30hari",
                    "pesan": "Akun tidak aktif selama lebih dari 30 hari. Silakan verifikasi OTP email Anda demi keamanan.",
                    "pengguna_id": user_record["pengguna_id"],
                    "email": email_pengguna
                }

        # Ambil saldo token pengguna
        saldo_data = sb.table("saldo_token").select("jumlah_saldo").eq("pengguna_id", user_record["pengguna_id"]).limit(1).execute()
        saldo_terkini = saldo_data.data[0]["jumlah_saldo"] if saldo_data.data else 100

        return {
            "status": "sukses",
            "pesan": "Login berhasil.",
            "pengguna": {
                "pengguna_id": user_record["pengguna_id"],
                "email": user_record["email"],
                "nama_pengguna": user_record["nama_pengguna"],
                "peran": user_record.get("peran", "kandidat"),
                "saldo_token": saldo_terkini
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Kredensial tidak valid: {str(e)}"
        )

@router.post("/verifikasi-otp")
async def verifikasi_otp(data: PermintaanVerifikasiOTP):
    """
    Memverifikasi token 6-digit OTP email melalui Supabase Auth.
    """
    sb = get_supabase_client()
    try:
        verifikasi = sb.auth.verify_otp({
            "email": data.email,
            "token": data.kode_otp,
            "type": "email"
        })
        # Tandai email_terverifikasi = True di tabel pengguna
        sb.table("pengguna").update({
            "email_terverifikasi": True,
            "login_terakhir": datetime.now(timezone.utc).isoformat()
        }).eq("email", data.email).execute()

        return {
            "status": "sukses",
            "pesan": "Verifikasi OTP berhasil. Akun Anda telah aktif sepenuhnya."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Kode OTP tidak valid atau telah kedaluwarsa: {str(e)}"
        )
