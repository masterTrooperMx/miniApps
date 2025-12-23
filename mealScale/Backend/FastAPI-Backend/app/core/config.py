from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Backend"
    DATABASE_URL: str
    GOOGLE_CLIENT_ID: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"

settings = Settings()
