from database import Base, engine
import models  # importa os modelos pra registrar as tabelas no Base.metadata

def criar_tabelas():
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas com sucesso.")

if __name__ == "__main__":
    criar_tabelas()