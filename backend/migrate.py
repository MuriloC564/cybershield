import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def tentar_executar(conn, sql: str):
    try:
        conn.execute(text(sql))
        print(f"OK: {sql.strip()}")
    except Exception as e:
        if "already exists" in str(e).lower():
            print(f"JÁ EXISTE: {sql.strip()} -> {e}")
        else:
            raise

with engine.connect() as conn:
    tentar_executar(conn, """
        ALTER TABLE usuarios
        ADD COLUMN nome VARCHAR
    """)

    tentar_executar(conn, """
        ALTER TABLE usuarios
        ADD COLUMN sobrenome VARCHAR
    """)

    tentar_executar(conn, """
        ALTER TABLE usuarios
        ADD COLUMN email VARCHAR
    """)

    tentar_executar(conn, """
        ALTER TABLE usuarios
        ADD COLUMN reset_token_hash VARCHAR
    """)

    tentar_executar(conn, """
        ALTER TABLE usuarios
        ADD COLUMN reset_token_expira_em TIMESTAMP
    """)

    conn.commit()

print("Migração concluída.")