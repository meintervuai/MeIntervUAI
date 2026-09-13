"""Controller lowongan kerja & rekomendasi AI Smart Matching (FR-16, FR-17, FR-18)."""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.config.keamanan import pengguna_aktif_opsional
from app.services.ai.layanan_lowongan import analisis_dan_rekomendasi_lowongan
from app.utils.respons_standar import balasan_sukses

router = APIRouter(prefix="/api/lowongan", tags=["lowongan"])


class PermintaanSmartMatching(BaseModel):
    data_cv: Optional[Dict[str, Any]] = Field(None, description="Data profil CV pengguna")
    kata_kunci: Optional[str] = Field("", description="Filter kata kunci posisi atau perusahaan")
    sistem_kerja: Optional[str] = Field("Semua", description="Filter sistem kerja: Semua, Remote, Hybrid, On-site")
    urutan: Optional[str] = Field("skor", description="Urutan hasil: skor, gaji, terbaru")


@router.post("/analisis-kecocokan")
async def analisis_kecocokan_lowongan(
    payload: PermintaanSmartMatching,
    pengguna=Depends(pengguna_aktif_opsional),
):
    """Analisis profil CV pengguna secara dinamis dan hasilkan rekomendasi lowongan terkurasi AI."""
    hasil = await analisis_dan_rekomendasi_lowongan(
        data_cv=payload.data_cv,
        filter_opsi={
            "kata_kunci": payload.kata_kunci or "",
            "sistem_kerja": payload.sistem_kerja or "Semua",
            "urutan": payload.urutan or "skor",
        },
    )

    return balasan_sukses(
        data={
            "total": len(hasil),
            "rekomendasi": hasil,
            "filter_diterapkan": {
                "kata_kunci": payload.kata_kunci,
                "sistem_kerja": payload.sistem_kerja,
            },
        },
        pesan="Rekomendasi lowongan kerja berhasil dianalisis oleh AI.",
    )


@router.get("/rekomendasi")
async def rekomendasi_lowongan_ai(
    kata_kunci: Optional[str] = Query(None, description="Pencarian judul atau perusahaan"),
    sistem_kerja: Optional[str] = Query(None, description="Filter sistem kerja: On-site, Hybrid, Remote"),
    pengguna=Depends(pengguna_aktif_opsional),
):
    """Ambil daftar rekomendasi lowongan kerja hasil pencocokan AI CV pengguna."""
    hasil = await analisis_dan_rekomendasi_lowongan(
        data_cv=None,
        filter_opsi={
            "kata_kunci": kata_kunci or "",
            "sistem_kerja": sistem_kerja or "Semua",
        },
    )

    return balasan_sukses(
        data={
            "total": len(hasil),
            "rekomendasi": hasil,
        },
        pesan="Rekomendasi lowongan kerja berhasil dimuat.",
    )


@router.get("")
async def daftar_lowongan(
    kata_kunci: Optional[str] = Query(None, description="Pencarian judul atau perusahaan"),
    tipe_kerja: Optional[str] = Query(None, description="Filter tipe kerja: Full-time, Remote, dsb."),
    sistem_kerja: Optional[str] = Query(None, description="Filter sistem kerja: On-site, Hybrid, Remote"),
    pengguna=Depends(pengguna_aktif_opsional),
):
    """Ambil daftar katalog lowongan kerja yang ditenagai oleh AI Smart Matching."""
    hasil = await analisis_dan_rekomendasi_lowongan(
        data_cv=None,
        filter_opsi={
            "kata_kunci": kata_kunci or "",
            "sistem_kerja": sistem_kerja or "Semua",
        },
    )

    return balasan_sukses(
        data={
            "total": len(hasil),
            "filter": {
                "kata_kunci": kata_kunci,
                "tipe_kerja": tipe_kerja,
                "sistem_kerja": sistem_kerja,
            },
            "daftar": hasil,
        },
        pesan="Katalog lowongan ditenagai oleh AI Smart Matching MENTERVU AI.",
    )
