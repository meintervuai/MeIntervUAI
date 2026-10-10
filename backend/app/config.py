# Modul konfigurasi sistem: memuat variabel lingkungan dari .env secara aman.
# Mengelola kredensial Supabase, Google OAuth, LLM API keys, dan batasan rate-limit.

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Cari .env dari root proyek
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = ROOT_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", ""))
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", os.getenv("VITE_SUPABASE_ANON_KEY", ""))

    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    # LLM API
    GOOGLE_API_KEY_1: str = os.getenv("GOOGLE_API_KEY_1", "")
    GOOGLE_API_KEY_2: str = os.getenv("GOOGLE_API_KEY_2", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")

    # RapidAPI
    RAPIDAPI_KEY: str = os.getenv("RAPIDAPI_KEY", "")

    # Rate Limiting Defaults (BE-01)
    RATE_LIMIT_AUTH: str = "5/minute"
    RATE_LIMIT_GENERAL: str = "60/minute"
    RATE_LIMIT_HEAVY: str = "10/minute"

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
