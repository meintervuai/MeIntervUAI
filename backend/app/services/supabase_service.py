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

def buat_id_terstruktur(prefix: str) -> str:
    """
    Format ID Terstruktur (DB-05): <prefix><YYYYMMDD><4 random digits>
    Contoh: peng202610104821
    """
    tanggal = datetime.now().strftime("%Y%m%d")
    digit_acak = f"{random.randint(1000, 9999)}"
    return f"{prefix}{tanggal}{digit_acak}"
