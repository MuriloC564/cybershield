"""Configuração dos testes de smoke.

O app lê DATABASE_URL e JWT_SECRET_KEY no momento do import (database.py e auth.py),
então as variáveis de ambiente precisam existir ANTES de importar o `main`.
Nenhum segredo fica no código: o JWT é gerado aleatoriamente a cada execução.
"""
import os
import secrets
import uuid

import pytest

os.environ.setdefault("JWT_SECRET_KEY", secrets.token_hex(32))
os.environ.setdefault("DB_SSLMODE", "disable")

if not os.environ.get("DATABASE_URL"):
    pytest.exit(
        "Defina DATABASE_URL apontando para um Postgres de teste "
        "(ex.: postgresql://teste:teste@localhost:5432/cybershield).",
        returncode=2,
    )

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    # O `with` executa o lifespan (startup do app).
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def usuario_novo():
    """Dados de cadastro únicos por teste (o banco persiste durante a execução)."""
    sufixo = uuid.uuid4().hex[:10]
    senha = "Senha#Forte" + sufixo
    return {
        "nome": "Teste",
        "sobrenome": "Smoke",
        "username": f"user_{sufixo}",
        "email": f"user_{sufixo}@example.com",
        "senha": senha,
        "confirmar_senha": senha,
    }
