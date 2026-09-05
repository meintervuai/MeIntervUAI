"""Klien Supabase sisi server (service key — melewati RLS, hanya di backend)."""

from supabase import Client, create_client

from app.config.pengaturan import pengaturan

# Normalisasi: root .env memakai SUPABASE_URL berakhiran /rest/v1/,
# sedangkan supabase-py membutuhkan URL dasar proyek.
url = pengaturan.supabase_url
if "/rest/v1" in url:
    url = url.split("/rest/v1")[0].rstrip("/")

if not url or not pengaturan.supabase_key:
    raise RuntimeError("SUPABASE_URL / SUPABASE_KEY belum diisi di backend/.env")

klien: Client = create_client(url, pengaturan.supabase_key)