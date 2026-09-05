"""Endpoint profil (FR-02): lihat & ubah data diri."""

from fastapi import APIRouter, Depends, HTTPException

from app.config.keamanan import pengguna_aktif
from app.models import profil as model_profil
from app.schemas.permintaan_profil import PerubahanProfil
from app.utils.respons_standar import balasan_sukses

router = APIRouter(prefix="/api/profil", tags=["profil"])

BAHASA_DIIZINKAN = {"id", "en"}


@router.get("")
def lihat_profil(pengguna=Depends(pengguna_aktif)):
    return balasan_sukses(model_profil.ambil_profil(pengguna.id))


@router.patch("")
def ubah_profil(
    perubahan: PerubahanProfil, pengguna=Depends(pengguna_aktif)
):
    data = perubahan.model_dump(exclude_none=True)
    if "bahasa" in data and data["bahasa"] not in BAHASA_DIIZINKAN:
        raise HTTPException(status_code=422, detail="bahasa hanya boleh 'id' atau 'en'")
    if not data:
        raise HTTPException(status_code=422, detail="Tidak ada perubahan yang dikirim")
    hasil = model_profil.perbarui_profil(pengguna.id, data)
    return balasan_sukses(hasil)