"""Endpoint otentikasi (FR-01): validasi sesi Google/JWT Supabase."""

from fastapi import APIRouter, Depends

from app.config.keamanan import pengguna_aktif
from app.models import profil as model_profil
from app.utils.respons_standar import balasan_sukses

router = APIRouter(prefix="/api/otentikasi", tags=["otentikasi"])


@router.post("/sesi")
def validasi_sesi(pengguna=Depends(pengguna_aktif)):
    """Verifikasi token; pastikan profil ada; balas data pengguna + profil."""
    data = model_profil.ambil_profil(pengguna.id)
    return balasan_sukses(
        {
            "pengguna": {"id": pengguna.id, "email": pengguna.email},
            "profil": data,
        }
    )


@router.post("/keluar")
def sesi_keluar(pengguna=Depends(pengguna_aktif)):
    """Keluar dikelola di sisi klien (supabase.auth.signOut); endpoint hanya konfirmasi."""
    return balasan_sukses(pesan="Sesi ditutup di sisi klien.", data={"id": pengguna.id})