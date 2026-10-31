import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL não foi configurada no arquivo .env"
    )


# Railway/PostgreSQL
#
# O connect_args abaixo evita alguns problemas comuns
# de conexão SSL quando a URL do Railway é usada localmente.
connect_args = {}

if DATABASE_URL.startswith("postgresql"):
    connect_args = {
        "sslmode": os.getenv("DB_SSLMODE", "require")
    }


engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()