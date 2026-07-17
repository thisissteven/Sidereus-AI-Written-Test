"""
Application configuration using pydantic-settings.
Loads from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Global application settings, overridable via environment variables."""

    # --- AI / OpenRouter Configuration ---
    AI_API_KEY: str = "sk-rU3bW4t6MVvtz6NOIocvHzp2NfoIMNQSb79on3VLqOSjmWwz"
    AI_BASE_URL: str = "https://api.chatanywhere.tech/v1"
    AI_MODEL: str = "deepseek-v4-pro"

    # --- Cache ---
    CACHE_TTL: int = 3600  # seconds

    # --- Upload limits ---
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10 MB

    model_config = {"env_prefix": "RESUME_", "case_sensitive": False}


# Singleton instance used throughout the app
settings = Settings()
