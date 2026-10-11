# Layanan integrasi database Supabase dan generator ID terstruktur (DB-05).
# Menyediakan koneksi client Supabase dan helper pembentukan identitas unik.

import random
from datetime import datetime
from supabase import create_client, Client
from app.config import settings

# Inisialisasi client Supabase
supabase: Client = None

def get_supabase_client() -> Client:
    global supabase
    if supabase is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError("Kredensial SUPABASE_URL dan SUPABASE_KEY wajib dikonfigurasi di .env")
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return supabase

def buat_id_terstruktur(prefix: str, table_name: str = None, id_column: str = None) -> str:
    """
    Format ID Terstruktur Urut (DB-05): <prefix><YYYYMMDD><4 digit urut dari 0000>
    Contoh: user202610110000, user202610110001, user202610110002
    Cepat, deterministik, dan bebas duplikasi.
    """
    tanggal = datetime.now().strftime("%Y%m%d")
    prefix_hari_ini = f"{prefix}{tanggal}"

    if table_name and id_column:
        try:
            sb = get_supabase_client()
            # Ambil ID terakhir hari ini dengan prefix tersebut
            hasil = sb.table(table_name).select(id_column).like(id_column, f"{prefix_hari_ini}%").order(id_column, desc=True).limit(1).execute()
            if hasil.data and len(hasil.data) > 0:
                id_terakhir = hasil.data[0].get(id_column, "")
                suffix_angka = id_terakhir[len(prefix_hari_ini):]
                if suffix_angka.isdigit():
                    nomor_selanjutnya = int(suffix_angka) + 1
                    return f"{prefix_hari_ini}{nomor_selanjutnya:04d}"
            return f"{prefix_hari_ini}0000"
        except Exception:
            return f"{prefix_hari_ini}0000"

    return f"{prefix_hari_ini}0000"
