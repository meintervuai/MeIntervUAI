"""Endpoint kuota (FR-19): sisa kuota AI hari ini (database.md §9)."""

from fastapi import APIRouter, Depends

from app.config.keamanan import pengguna_aktif
from app.models import profil as model_profil
from app.utils.respons_standar import balasan_sukses

router = APIRouter(prefix="/api/kuota", tags=["kuota"])


@router.get("")
def sisa_kuota(pengguna=Depends(pengguna_aktif)):
    return balasan_sukses(model_profil.muat_kuota(pengguna.id))