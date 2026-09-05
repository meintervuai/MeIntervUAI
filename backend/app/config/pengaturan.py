"""Konfigurasi backend dari environment (SUPABASE_URL, SUPABASE_KEY, dst)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Pengaturan(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


pengaturan = Pengaturan()