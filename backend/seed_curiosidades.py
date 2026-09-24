from database import SessionLocal
from models import Categoria

def seed():
    db = SessionLocal()
    try:
        cyber = db.query(Categoria).filter(Categoria.slug == "cyber").first()
        if not cyber:
            print("Categoria Cyber não encontrada.")
            return

        ja_existe = db.query(Categoria).filter(Categoria.slug == "curiosidades").first()
        if ja_existe:
            print("Categoria Curiosidades já existe.")
            return

        curiosidades = Categoria(nome="Curiosidades", slug="curiosidades", categoria_pai_id=cyber.id)
        db.add(curiosidades)
        db.commit()
        print("Categoria Curiosidades criada com sucesso.")
    except Exception as e:
        db.rollback()
        print(f"Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()