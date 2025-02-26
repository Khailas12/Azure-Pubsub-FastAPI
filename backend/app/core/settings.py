import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AZURE_WEBPUBSUB_CONNECTION_STRING = os.getenv("AZURE_WEBPUBSUB_CONNECTION_STRING")
    HUB_NAME = os.getenv("HUB_NAME")
    SECRET_KEY = os.getenv("SECRET_KEY", "") 
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token expiry minutes

    @staticmethod
    def validate():
        if not Settings.AZURE_WEBPUBSUB_CONNECTION_STRING:
            raise ValueError("AZURE_WEBPUBSUB_CONNECTION_STRING is not set in the environment variables.")
        if not Settings.HUB_NAME:
            raise ValueError("HUB_NAME is not set in the environment variables.")
        if not Settings.SECRET_KEY:
            raise ValueError("SECRET_KEY is not set in the environment variables.")

settings = Settings()
settings.validate()