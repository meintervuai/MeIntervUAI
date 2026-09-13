"""Keamanan: verifikasi JWT Supabase untuk melindungi endpoint."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config.klien_supabase import klien

pengaman = HTTPBearer(auto_error=False)


async def pengguna_aktif(
    kredensial: HTTPAuthorizationCredentials | None = Depends(pengaman),
):
    """Dependency: validasi `Authorization: Bearer <JWT>` dan balas user Supabase."""
    if kredensial is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak ditemukan"
        )
    try:
        respons = klien.auth.get_user(kredensial.credentials)
    except Exception as galat:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak valid"
        ) from galat

    if respons is None or respons.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak valid"
        )
    return respons.user


async def pengguna_aktif_opsional(
    kredensial: HTTPAuthorizationCredentials | None = Depends(pengaman),
):
    """Dependency: validasi `Authorization: Bearer <JWT>` secara opsional (tidak melempar 401 bila tidak ada token)."""
    if kredensial is None:
        return None
    try:
        respons = klien.auth.get_user(kredensial.credentials)
        if respons and respons.user:
            return respons.user
    except Exception:  # noqa: BLE001
        return None
    return None