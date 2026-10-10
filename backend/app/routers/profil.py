# Router Profil Pengguna & Onboarding: mengelola data umur, pekerjaan, gender, dan dream role.
# Terhubung dengan status saldo token aktual.

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.supabase_service import get_supabase_client

router = APIRouter(prefix="/api/profil", tags=["Profil & Onboarding"])

class PermintaanPembaruanProfil(BaseModel):
    pengguna_id: str
    umur: Optional[int] = None
    status_pekerjaan: Optional[str] = None
    jenis_kelamin: Optional[str] = None
    industri_impian: Optional[str] = None
    role_impian: Optional[str] = None

@router.get("/{pengguna_id}")
async def ambil_profil_pengguna(pengguna_id: str):
    """
    Mengambil data profil onboarding dan status saldo token pengguna.
    """
    sb = get_supabase_client()
    try:
        profil = sb.table("profil_pengguna").select("*").eq("pengguna_id", pengguna_id).limit(1).execute()
        saldo = sb.table("saldo_token").select("*").eq("pengguna_id", pengguna_id).limit(1).execute()

        # Cek apakah pengguna sudah memiliki CV yang tersimpan
        cv_data = sb.table("cv_pengguna").select("cv_id, skor_ats").eq("pengguna_id", pengguna_id).limit(1).execute()
        cv_tersedia = len(cv_data.data) > 0 if cv_data.data else False

        data_profil = profil.data[0] if profil.data else {}
        data_saldo = saldo.data[0] if saldo.data else {"jumlah_saldo": 100, "total_terpakai": 0}

        return {
            "status": "sukses",
            "profil": data_profil,
            "saldo_token": data_saldo,
            "cv_tersedia": cv_tersedia
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Data profil tidak ditemukan: {str(e)}"
        )

@router.put("/")
async def simpan_onboarding_profil(data: PermintaanPembaruanProfil):
    """
    Menyimpan atau memperbarui data onboarding (umur, status pekerjaan, gender, role impian).
    """
    sb = get_supabase_client()
    try:
        update_payload = {}
        if data.umur is not None:
            update_payload["umur"] = data.umur
        if data.status_pekerjaan:
            update_payload["status_pekerjaan"] = data.status_pekerjaan
        if data.jenis_kelamin:
            update_payload["jenis_kelamin"] = data.jenis_kelamin
        if data.industri_impian:
            update_payload["industri_impian"] = data.industri_impian
        if data.role_impian:
            update_payload["role_impian"] = data.role_impian

        sb.table("profil_pengguna").update(update_payload).eq("pengguna_id", data.pengguna_id).execute()

        return {
            "status": "sukses",
            "pesan": "Data profil onboarding berhasil diperbarui."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal memperbarui data profil: {str(e)}"
        )
