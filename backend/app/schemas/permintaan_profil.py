"""Skema permintaan perubahan profil (FR-02)."""

from pydantic import BaseModel, Field


class PerubahanProfil(BaseModel):
    """Kolom profil yang boleh diubah via API (sisanya dikelola sistem)."""

    nama_lengkap: str | None = Field(default=None, max_length=80)
    posisi_target: str | None = Field(default=None, max_length=80)
    bahasa: str | None = Field(default=None, pattern="^(id|en)$")