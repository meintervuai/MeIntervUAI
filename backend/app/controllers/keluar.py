"""Endpoint keluar (FR-01): batalkan JWT di sisi server (server-side revocation)."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.config.keamanan import pengguna_aktif, pengaman
from app.utils.respons_standar import balasan_sukses

router = APIRouter(tags=["otentikasi"])


@router.post("/api/logout")
async def logout(kredensial=Depends(pengaman)):
    """
    Batalkan token aktif di sisi server (supabase.auth.signOut),
    lalu klien membersihkan sesi lokalnya. Membutuhkan Authorization: Bearer <JWT>.
    """
    token = kredensial.credentials if kredensial else None
    if token:
        try:
            from app.config.klien_supabase import klien

            klien.auth.signOut(token)
        except Exception:  # noqa: BLE001 — revocation bersifat best-effort
            pass
    return balasan_sukses(pesan="Sesi berhasil ditutup di sisi server.")