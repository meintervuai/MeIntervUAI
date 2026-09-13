"""Konfigurasi backend dari environment (SUPABASE_URL, SUPABASE_KEY, dst)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Pengaturan(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    cors_origins: str = "http://localhost:5173"
    google_api_key_1: str = ""
    google_api_key_2: str = ""
    openrouter_api_key: str = ""
    rapidapi_key: str = ""

    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")


pengaturan = Pengaturan()