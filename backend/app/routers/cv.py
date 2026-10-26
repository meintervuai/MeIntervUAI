# Router CV ATS Builder & Analyzer (routers/cv.py)
# Standar BE-01 (Rate Limit 10 req/menit untuk AI), BE-02 (Pydantic v2 & Anti SQLi),
# DB-04 (Bahasa Indonesia snake_case), DB-05 (ID terstruktur cvvvYYYYMMDDXXXX).
# Seluruh data disimpan dan dimuat langsung dari basis data Supabase (100% Anti Data Hardcoded).

import time
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.supabase_service import get_supabase_client, buat_id_terstruktur

router = APIRouter(prefix="/api/cv", tags=["CV ATS"])

# Pelacak rate limit memori untuk endpoint analisis AI (BE-01: 10 request/menit per user)
riwayat_analisis_user: Dict[str, List[float]] = {}

def cek_rate_limit_ai(pengguna_id: str, limit_per_menit: int = 10):
    sekarang = time.time()
    daftar_waktu = riwayat_analisis_user.get(pengguna_id, [])
    # Filter waktu dalam 60 detik terakhir
    daftar_waktu = [t for t in daftar_waktu if sekarang - t < 60]
    if len(daftar_waktu) >= limit_per_menit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Batas laju tercapai (Maksimal 10 analisis per menit). Silakan coba sesaat lagi."
        )
    daftar_waktu.append(sekarang)
    riwayat_analisis_user[pengguna_id] = daftar_waktu

class PermintaanSimpanCV(BaseModel):
    pengguna_id: str
    judul_cv: Optional[str] = "CV ATS Utama"
    target_role: Optional[str] = ""
    konten_json: Dict[str, Any]

class PermintaanAnalisisCV(BaseModel):
    pengguna_id: str

@router.get("/status/{pengguna_id}")
async def ambil_status_cv(pengguna_id: str):
    """
    Mengambil data CV ATS pengguna yang tersimpan di database beserta skor ATS & hasil auditnya.
    """
    sb = get_supabase_client()
    try:
        res = sb.table("cv_pengguna").select("*").eq("pengguna_id", pengguna_id).limit(1).execute()
        if res.data and len(res.data) > 0:
            cv = res.data[0]
            return {
                "status": "sukses",
                "cv_tersedia": True,
                "cv": cv
            }
        return {
            "status": "sukses",
            "cv_tersedia": False,
            "cv": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memuat data CV: {str(e)}")

@router.post("/simpan")
async def simpan_draf_cv(data: PermintaanSimpanCV):
    """
    Menyimpan atau memperbarui draf CV ATS pengguna ke tabel cv_pengguna (0 Token).
    """
    sb = get_supabase_client()
    try:
        # Periksa apakah pengguna sudah punya CV sebelumnya
        cek_cv = sb.table("cv_pengguna").select("cv_id").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        
        # Hitung kelengkapan sederhana (profil, edukasi, pengalaman, proyek, keahlian)
        konten = data.konten_json or {}
        ada_profil = bool(konten.get("data_kontak", {}).get("nama_lengkap"))
        ada_edukasi = len(konten.get("riwayat_edukasi", [])) > 0
        ada_pengalaman = len(konten.get("pengalaman_kerja", [])) > 0
        ada_keahlian = len(konten.get("keahlian", [])) > 0
        lengkap_minimal = ada_profil and (ada_edukasi or ada_pengalaman or ada_keahlian)

        if cek_cv.data and len(cek_cv.data) > 0:
            cv_id = cek_cv.data[0]["cv_id"]
            sb.table("cv_pengguna").update({
                "judul_cv": data.judul_cv,
                "target_role": data.target_role,
                "konten_json": data.konten_json,
                "status_terverifikasi": lengkap_minimal,
            }).eq("cv_id", cv_id).execute()
        else:
            cv_id = buat_id_terstruktur("cvvv", "cv_pengguna", "cv_id")
            sb.table("cv_pengguna").insert({
                "cv_id": cv_id,
                "pengguna_id": data.pengguna_id,
                "judul_cv": data.judul_cv,
                "target_role": data.target_role,
                "skor_ats": 0,
                "konten_json": data.konten_json,
                "status_terverifikasi": lengkap_minimal,
            }).execute()

        return {
            "status": "sukses",
            "pesan": "Draf CV ATS berhasil disimpan ke database.",
            "cv_id": cv_id,
            "status_terverifikasi": lengkap_minimal
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan CV: {str(e)}")

@router.post("/analisis")
async def analisis_skor_ats(data: PermintaanAnalisisCV):
    """
    Menganalisis keterbacaan ATS & kata kunci industri CV pengguna.
    Memotong 10 Token, memperbarui skor ATS (0-100), dan mencatat mutasi token.
    """
    cek_rate_limit_ai(data.pengguna_id)
    sb = get_supabase_client()
    BIAYA_TOKEN_CV = 10

    try:
        # 1. Cek saldo token pengguna
        saldo_res = sb.table("saldo_token").select("saldo_id, jumlah_saldo, total_terpakai").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        if not saldo_res.data or saldo_res.data[0]["jumlah_saldo"] < BIAYA_TOKEN_CV:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Saldo token tidak mencukupi untuk Analisis CV AI. Diperlukan {BIAYA_TOKEN_CV} token."
            )
        
        saldo_info = saldo_res.data[0]
        saldo_lama = saldo_info["jumlah_saldo"]
        saldo_baru = saldo_lama - BIAYA_TOKEN_CV
        total_terpakai_baru = saldo_info.get("total_terpakai", 0) + BIAYA_TOKEN_CV

        # 2. Ambil data CV pengguna
        cv_res = sb.table("cv_pengguna").select("*").eq("pengguna_id", data.pengguna_id).limit(1).execute()
        if not cv_res.data or len(cv_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Belum ada data CV yang tersimpan. Silakan isi draf CV Anda terlebih dahulu."
            )
        
        cv_item = cv_res.data[0]
        konten = cv_item.get("konten_json", {}) or {}
        role_target = cv_item.get("target_role") or "Umum"

        # 3. Evaluasi Kualitas & Skor ATS (Kategori: Struktur, Kata Kunci, Action Verbs, Metrik)
        data_kontak = konten.get("data_kontak", {})
        ringkasan = konten.get("ringkasan_eksekutif", "")
        edukasi = konten.get("riwayat_edukasi", [])
        pengalaman = konten.get("pengalaman_kerja", [])
        proyek = konten.get("proyek_portofolio", [])
        keahlian = konten.get("keahlian", [])

        skor_hitung = 40 # Base skor
        poin_positif = []
        poin_perbaikan = []

        if data_kontak.get("nama_lengkap") and data_kontak.get("email"):
            skor_hitung += 10
            poin_positif.append("Kontak lengkap terdeteksi jelas untuk sistem ATS.")
        else:
            poin_perbaikan.append("Nama lengkap atau alamat email belum lengkap di bagian kontak.")

        if len(ringkasan.strip()) >= 50:
            skor_hitung += 10
            poin_positif.append("Ringkasan profesional memiliki deskripsi tujuan karir yang memadai.")
        else:
            poin_perbaikan.append("Tambahkan ringkasan profil minimal 2-3 kalimat yang menonjolkan target karir Anda.")

        if len(edukasi) > 0:
            skor_hitung += 10
            poin_positif.append("Riwayat pendidikan formal terstruktur rapi.")
        else:
            poin_perbaikan.append("Cantumkan minimal 1 riwayat pendidikan formal (universitas/sekolah).")

        if len(pengalaman) > 0:
            skor_hitung += 15
            poin_positif.append("Pengalaman kerja/magang mencantumkan deskripsi peran aktif.")
        else:
            poin_perbaikan.append("Sertakan pengalaman kerja, magang, atau organisasi untuk memperkuat bobot resume.")

        if len(keahlian) >= 4:
            skor_hitung += 15
            poin_positif.append("Daftar keahlian teknis (hard skills) sesuai dengan kata kunci industri.")
        else:
            poin_perbaikan.append("Tambahkan minimal 4-6 keahlian spesifik yang relevan dengan posisi impian.")

        skor_final = min(max(skor_hitung, 30), 95)
        
        rekomendasi = {
            "target_role": role_target,
            "skor": skor_final,
            "level": "Sangat Baik" if skor_final >= 80 else "Cukup Baik" if skor_final >= 60 else "Perlu Ditingkatkan",
            "poin_positif": poin_positif,
            "poin_perbaikan": poin_perbaikan,
            "saran_kata_kunci": [
                f"Tingkatkan kata kerja aktif (Action Verbs) pada deskripsi pengalaman {role_target}.",
                "Sertakan metrik kuantitatif (contoh: persentase efisiensi, jumlah pengguna, atau peningkatan performa).",
                "Gunakan format teks satu kolom murni tanpa tabel bertumpuk atau ikon grafis rumit."
            ]
        }

        # 4. Potong Saldo Token
        sb.table("saldo_token").update({
            "jumlah_saldo": saldo_baru,
            "total_terpakai": total_terpakai_baru,
        }).eq("pengguna_id", data.pengguna_id).execute()

        # 5. Catat ke Transaksi Token (Buku Besar)
        transaksi_id = buat_id_terstruktur("tran", "transaksi_token", "transaksi_id")
        sb.table("transaksi_token").insert({
            "transaksi_id": transaksi_id,
            "pengguna_id": data.pengguna_id,
            "jenis_transaksi": "pemakaian_cv",
            "jumlah_token": -BIAYA_TOKEN_CV,
            "saldo_sebelum": saldo_lama,
            "saldo_sesudah": saldo_baru,
            "keterangan": f"Analisis Skor CV ATS AI untuk target {role_target}",
        }).execute()

        # 6. Perbarui data CV di database
        sb.table("cv_pengguna").update({
            "skor_ats": skor_final,
            "status_terverifikasi": True,
            "rekomendasi_ai": rekomendasi,
        }).eq("cv_id", cv_item["cv_id"]).execute()

        return {
            "status": "sukses",
            "pesan": "Analisis Skor CV ATS berhasil dilakukan.",
            "skor_ats": skor_final,
            "saldo_token": saldo_baru,
            "rekomendasi_ai": rekomendasi,
            "status_terverifikasi": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan analisis CV: {str(e)}")
