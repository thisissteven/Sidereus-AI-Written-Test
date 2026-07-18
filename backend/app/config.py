"""
Application configuration using pydantic-settings.
Loads from environment variables with sensible defaults.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    """Global application settings, overridable via environment variables."""

    # --- AI / OpenRouter Configuration ---
    AI_API_KEY: str
    AI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    AI_MODEL: str = "gemini-flash-latest"

    # --- Cache ---
    REDIS_URL: str
    CACHE_TTL: int = 3600  # seconds

    # --- Upload limits ---
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10 MB

    model_config = SettingsConfigDict(
            env_file=ROOT_DIR / ".env",
            case_sensitive=False,
        )

# Singleton instance used throughout the app
settings = Settings()
