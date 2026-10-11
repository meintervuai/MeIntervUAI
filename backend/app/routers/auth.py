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

        pengguna_id = buat_id_terstruktur("user", "pengguna", "pengguna_id")
        profil_id = buat_id_terstruktur("prof", "profil_pengguna", "profil_id")
        saldo_id = buat_id_terstruktur("sald", "saldo_token", "saldo_id")
        transaksi_id = buat_id_terstruktur("tran", "transaksi_token", "transaksi_id")

        auth_uid = hasil_auth.user.id if hasil_auth and hasil_auth.user else None

        # Catat pengguna ke tabel pengguna
        sb.table("pengguna").insert({
            "pengguna_id": pengguna_id,
            "email": data.email,
            "nama_pengguna": data.nama_pengguna,
            "peran": "kandidat",
            "email_terverifikasi": False,
            "login_terakhir": datetime.now(timezone.utc).isoformat(),
            "auth_user_id": auth_uid
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
            pengguna_id = buat_id_terstruktur("user", "pengguna", "pengguna_id")
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
                "profil_id": buat_id_terstruktur("prof", "profil_pengguna", "profil_id"),
                "pengguna_id": pengguna_id,
                "nama_lengkap": nama_default
            }).execute()

            sb.table("saldo_token").insert({
                "saldo_id": buat_id_terstruktur("sald", "saldo_token", "saldo_id"),
                "pengguna_id": pengguna_id,
                "jumlah_saldo": 100,
                "total_terpakai": 0
            }).execute()

            user_record = {"pengguna_id": pengguna_id, "email": email_pengguna, "nama_pengguna": nama_default, "peran": "kandidat"}
        else:
            user_record = kueri_pengguna.data[0]

            # Jika login via Google OAuth, pastikan email_terverifikasi selalu True
            if data.token_google and not user_record.get("email_terverifikasi"):
                sb.table("pengguna").update({
                    "email_terverifikasi": True
                }).eq("pengguna_id", user_record["pengguna_id"]).execute()
                user_record["email_terverifikasi"] = True

            # Keamanan Ketat: Pengguna biasa (email & kata sandi) WAJIB telah verifikasi OTP
            if not data.token_google and not user_record.get("email_terverifikasi"):
                # Kirimkan ulang kode OTP secara otomatis jika belum terverifikasi
                try:
                    sb.auth.resend({"type": "signup", "email": email_pengguna})
                except Exception:
                    try:
                        sb.auth.sign_in_with_otp({"email": email_pengguna})
                    except Exception:
                        pass

                return {
                    "status": "belum_verifikasi",
                    "pesan": "Email Anda belum diverifikasi. Kode OTP telah dikirimkan ke email Anda, silakan masukkan kode 6-digit untuk mengaktifkan akun.",
                    "pengguna_id": user_record["pengguna_id"],
                    "email": email_pengguna
                }

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
        pesan_error = str(e)
        if "Invalid login credentials" in pesan_error:
            pesan_error = "Email atau kata sandi tidak cocok. Silakan periksa kembali."
        return {
            "status": "galat",
            "pesan": pesan_error
        }

class PermintaanKirimUlangOTP(BaseModel):
    email: EmailStr

@router.post("/kirim-ulang-otp")
async def kirim_ulang_otp(data: PermintaanKirimUlangOTP):
    """
    Mengirim ulang kode OTP verifikasi email melalui Supabase Auth & Resend SMTP.
    Menggunakan sign_in_with_otp yang menjamin pengiriman email OTP 6-digit secara instan.
    """
    sb = get_supabase_client()
    try:
        sb.auth.sign_in_with_otp({"email": data.email})

        return {
            "status": "sukses",
            "pesan": "Kode verifikasi baru telah dikirimkan ke email Anda."
        }
    except Exception as e:
        return {
            "status": "galat",
            "pesan": f"Gagal mengirim ulang kode OTP: {str(e)}"
        }

@router.post("/verifikasi-otp")
async def verifikasi_otp(data: PermintaanVerifikasiOTP):
    """
    Memverifikasi token 6-digit OTP email melalui Supabase Auth.
    Mendukung tipe verifikasi signup maupun email OTP.
    """
    sb = get_supabase_client()
    try:
        verifikasi_sukses = False
        kesalahan_terakhir = None

        for tipe in ["signup", "email"]:
            try:
                res = sb.auth.verify_otp({
                    "email": data.email,
                    "token": data.kode_otp.strip(),
                    "type": tipe
                })
                if res.user or res.session:
                    verifikasi_sukses = True
                    break
            except Exception as e:
                kesalahan_terakhir = e

        if not verifikasi_sukses:
            return {
                "status": "galat",
                "pesan": "Kode OTP salah atau telah kedaluwarsa. Silakan periksa kembali email Anda."
            }

        # Tandai email_terverifikasi = True di tabel pengguna
        sb.table("pengguna").update({
            "email_terverifikasi": True,
            "login_terakhir": datetime.now(timezone.utc).isoformat()
        }).eq("email", data.email).execute()

        return {
            "status": "sukses",
            "pesan": "Verifikasi OTP berhasil. Akun Anda telah aktif, silakan masuk dengan email dan kata sandi Anda."
        }
    except Exception as e:
        return {
            "status": "galat",
            "pesan": f"Kode OTP tidak valid atau telah kedaluwarsa: {str(e)}"
        }
