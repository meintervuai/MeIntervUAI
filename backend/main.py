"""MENTERVU AI API — entry point FastAPI (pola MVC, struktur_file.md §4)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.pengaturan import pengaturan
from app.controllers import home, keluar, kuota, lowongan, otentikasi, profil, simulasi

app = FastAPI(title="MENTERVU AI API", version="0.1.0")

asal_diizinkan = [o.strip() for o in pengaturan.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=asal_diizinkan or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(otentikasi.router)
app.include_router(keluar.router)
app.include_router(profil.router)
app.include_router(kuota.router)
app.include_router(home.router)
app.include_router(lowongan.router)
app.include_router(simulasi.router)


@app.get("/api/kesehatan", tags=["sistem"])
def kesehatan():
    """Cek hidup layanan (tanpa autentikasi)."""
    return {"status": "sukses", "data": {"layanan": "mentervu-api", "versi": app.version}}