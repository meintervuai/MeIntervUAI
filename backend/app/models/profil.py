"""Model data: akses tabel Supabase (PostgREST) — database.md §5."""

from app.config.klien_supabase import klien

TABEL_PROFIL = "profil"
TABEL_ANALISIS_CV = "analisis_cv"

KOLOM_PROFIL = (
    "id, email, nama_lengkap, url_avatar, status_akun, posisi_target, bahasa, "
    "batas_panggilan_harian, token_hari_ini, kuota_tambahan, terakhir_reset_kuota, peran"
)


def ambil_profil(uid: str):
    """Ambil satu baris profil (database.md §5.1)."""
    respons = klien.table(TABEL_PROFIL).select(KOLOM_PROFIL).eq("id", uid).single().execute()
    return respons.data


def perbarui_profil(uid: str, perubahan: dict):
    """Perbarui sebagian kolom profil (hanya kolom yang diizinkan controller)."""
    respons = (
        klien.table(TABEL_PROFIL)
        .update(perubahan)
        .eq("id", uid)
        .select(KOLOM_PROFIL)
        .single()
        .execute()
    )
    return respons.data


def muat_kuota(uid: str) -> dict:
    """Kuota AI harian (database.md §9): lazy reset → hitung batas/terpakai/sisa."""
    try:
        klien.rpc("reset_kuota_harian", {"profil_uid": uid}).execute()
    except Exception:  # noqa: BLE001 — reset bersifat best-effort
        pass

    respons = (
        klien.table(TABEL_PROFIL)
        .select("batas_panggilan_harian, token_hari_ini, kuota_tambahan")
        .eq("id", uid)
        .single()
        .execute()
    )
    data = respons.data or {}
    batas = max(0, (data.get("batas_panggilan_harian") or 20) + (data.get("kuota_tambahan") or 0))
    terpakai = data.get("token_hari_ini") or 0
    return {"batas": batas, "terpakai": terpakai, "sisa": max(0, batas - terpakai)}


def analisis_cv_terakhir(uid: str):
    """Analisis CV terbaru milik pengguna (atau None) — untuk ringkasan Home."""
    respons = (
        klien.table(TABEL_ANALISIS_CV)
        .select(
            "id, riwayat_cv_id, skor_kelengkapan, skor_daya_tarik, "
            "rekomendasi_posisi, rekomendasi_perbaikan, dibuat_pada"
        )
        .eq("profil_id", uid)
        .order("dibuat_pada", desc=True)
        .limit(1)
        .execute()
    )
    baris = respons.data or []
    return baris[0] if baris else None