"""Controller simulasi wawancara & evaluasi respons interaktif (FR-09, FR-10, FR-11)."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.config.keamanan import pengguna_aktif_opsional
from app.services.ai.layanan_wawancara import evaluasi_dan_respons_interaktif
from app.utils.respons_standar import balasan_sukses

router = APIRouter(prefix="/api/simulasi", tags=["simulasi"])


class PermintaanEvaluasiJawaban(BaseModel):
    sesi_id: Optional[str] = Field(None, description="ID sesi wawancara")
    pertanyaan: str = Field(..., description="Pertanyaan yang diajukan")
    jawaban: str = Field(..., description="Jawaban kandidat")
    posisi_target: Optional[str] = Field("", description="Posisi pekerjaan target")
    perusahaan_target: Optional[str] = Field("", description="Perusahaan target")
    kategori: Optional[str] = Field("Umum", description="Kategori pertanyaan (Teknis/STAR/HRD)")
    jawaban_ideal: Optional[str] = Field("", description="Panduan jawaban ideal")
    urutan: Optional[int] = Field(1, description="Nomor urut pertanyaan")


@router.post("/evaluasi-interaktif")
async def evaluasi_jawaban_interaktif(
    payload: PermintaanEvaluasiJawaban,
    pengguna=Depends(pengguna_aktif_opsional),
):
    """Evaluasi jawaban kandidat secara semantik dan susun respons percakapan pewawancara."""
    hasil = await evaluasi_dan_respons_interaktif(
        pertanyaan=payload.pertanyaan,
        jawaban=payload.jawaban,
        posisi_target=payload.posisi_target or "",
        perusahaan_target=payload.perusahaan_target or "",
        kategori=payload.kategori or "Umum",
        jawaban_ideal=payload.jawaban_ideal or "",
        urutan=payload.urutan or 1,
    )

    return balasan_sukses(
        data=hasil,
        pesan="Evaluasi jawaban berhasil diproses.",
    )
