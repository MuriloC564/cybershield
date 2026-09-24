import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))
inspector = inspect(engine)
colunas_usuario = {c["name"] for c in inspector.get_columns("usuarios")}
creditos_era_novo = "creditos" not in colunas_usuario

with engine.begin() as conn:
    conn.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS creditos INTEGER NOT NULL DEFAULT 0"))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS skins_compradas (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
            skin_id VARCHAR NOT NULL,
            comprada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_usuario_skin UNIQUE (usuario_id, skin_id)
        )
    """))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_skins_compradas_usuario_id ON skins_compradas(usuario_id)"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_skins_compradas_skin_id ON skins_compradas(skin_id)"))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS skins_equipadas (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
            personagem_id VARCHAR NOT NULL,
            skin_id VARCHAR NOT NULL,
            atualizado_em TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT uq_usuario_personagem_skin UNIQUE (usuario_id, personagem_id)
        )
    """))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_skins_equipadas_usuario_id ON skins_equipadas(usuario_id)"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_skins_equipadas_personagem_id ON skins_equipadas(personagem_id)"))
    if creditos_era_novo:
        conn.execute(text("""
            UPDATE usuarios u
            SET creditos = COALESCE((SELECT SUM(p.pontos) FROM pontuacoes p WHERE p.usuario_id = u.id), 0)
        """))

print("Migração da loja concluída.")
