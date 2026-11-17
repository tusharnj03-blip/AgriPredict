from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./agripredict.db"
    JWT_SECRET_KEY: str = "change-this-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    WEATHER_API_KEY: str = ""
    ENVIRONMENT: str = "development"

    # Permanent admin account (set via environment variables only)
    ADMIN_NAME: str = "System Administrator"
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""

    # Security
    LOGIN_RATE_LIMIT: str = "10/minute"
    MIN_PASSWORD_LENGTH: int = 8

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

