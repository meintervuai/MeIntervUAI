# File aplikasi utama FastAPI untuk platform MeIntervUAI.
# Mengonfigurasi middleware CORS, exception handlers, dan mendaftarkan router API.

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import auth, csm_publik, profil, pengaturan, cv, simulasi

app = FastAPI(
    title="MeIntervUAI Backend API",
    description="Layanan backend untuk simulasi wawancara kerja AI, CV ATS Builder, dan CSM Support.",
    version="1.0.0"
)

# Konfigurasi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Di produksi dapat dibatasi ke domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrasi Router
app.include_router(auth.router)
app.include_router(csm_publik.router)
app.include_router(profil.router)
app.include_router(pengaturan.router)
app.include_router(cv.router)
app.include_router(simulasi.router)

@app.get("/")
async def root():
    return {
        "nama_layanan": "MeIntervUAI Gateway",
        "status": "aktif",
        "versi": "1.0.0"
    }

@app.get("/api/kesehatan")
async def cek_kesehatan():
    return {"status": "sehat", "layanan": "MeIntervUAI API"}
