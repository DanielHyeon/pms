from functools import lru_cache
from typing import List

#from pydantic import BaseSettings, Field, HttpUrl
from pydantic_settings import BaseSettings
from pydantic import Field, HttpUrl



class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    PROJECT_NAME: str = Field(default="PMS Backend")
    VERSION: str = Field(default="1.0.0")
    API_V1_STR: str = Field(default="/api/v1")
    SECRET_KEY: str = Field(default="super-secret-development-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)
    REFRESH_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24 * 7)
    ALGORITHM: str = Field(default="HS256")
    DATABASE_URL: str = Field(
        default="sqlite:///./pms.db",
        description="SQLAlchemy connection string. Defaults to SQLite for local development.",
    )
    BACKEND_CORS_ORIGINS: List[HttpUrl] | List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )
    USE_IN_MEMORY_STORE: bool = Field(
        default=True,
        description="When True, use the seeded in-memory datastore instead of a database.",
    )
    OPENAI_API_KEY: str | None = Field(default=None, description="Optional OpenAI API key for AI services.")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance."""

    return Settings()


settings = get_settings()
