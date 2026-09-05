"""Endpoint home (FR-19): ringkasan dashboard — kuota + analisis terakhir."""

from fastapi import APIRouter, Depends

from app.config.keamanan import pengguna_aktif
from app.models import profil as model_profil
from app.utils.respons_standar import balasan_sukses

router = APIRouter(prefix="/api/home", tags=["home"])


@router.get("/ringkasan")
def ringkasan(pengguna=Depends(pengguna_aktif)):
    """Sumber data Home: kuota hari ini + hasil analisis CV terakhir (dari DB)."""
    kuota = model_profil.muat_kuota(pengguna.id)
    analisis = model_profil.analisis_cv_terakhir(pengguna.id)
    return balasan_sukses(
        {
            "kuota": kuota,
            "analisis_terakhir": analisis,
        }
    )