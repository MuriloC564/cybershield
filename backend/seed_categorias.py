from database import SessionLocal
from models import Categoria

def seed():
    db = SessionLocal()
    try:
        # Categorias-pai (áreas)
        cyber = Categoria(nome="Cyber", slug="cyber")
        rh = Categoria(nome="RH", slug="rh")
        geral = Categoria(nome="Modo Geral", slug="geral", eh_modo_geral=1)

        db.add_all([cyber, rh, geral])
        db.commit()
        db.refresh(cyber)
        db.refresh(rh)

        # Subcategorias (módulos) de Cyber
        phishing = Categoria(nome="Phishing", slug="phishing", categoria_pai_id=cyber.id)
        mitre = Categoria(nome="MITRE ATT&CK", slug="mitre", categoria_pai_id=cyber.id)
        historicos = Categoria(nome="Eventos Históricos", slug="eventos-historicos", categoria_pai_id=cyber.id)

        # Subcategoria de exemplo em RH (pode ajustar/expandir depois)
        rh_basico = Categoria(nome="Fundamentos de RH", slug="rh-basico", categoria_pai_id=rh.id)

        db.add_all([phishing, mitre, historicos, rh_basico])
        db.commit()
        print("Categorias criadas com sucesso.")
    except Exception as e:
        db.rollback()
        print(f"Erro ao popular categorias: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()