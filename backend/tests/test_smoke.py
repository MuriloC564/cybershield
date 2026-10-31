"""Testes de smoke do backend: o app sobe, cadastra, autentica e protege rotas."""


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_cabecalhos_de_seguranca(client):
    """Cabeçalhos adicionados após o ZAP (evidência do 'depois')."""
    r = client.get("/health")
    assert "default-src 'self'" in r.headers["Content-Security-Policy"]
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["X-Frame-Options"] == "DENY"


def test_cadastro_retorna_token(client, usuario_novo):
    r = client.post("/registrar", json=usuario_novo)
    assert r.status_code == 200, r.text
    corpo = r.json()
    assert corpo["token_type"] == "bearer"
    assert corpo["access_token"]


def test_cadastro_com_senhas_diferentes_falha(client, usuario_novo):
    # A validação do schema (Pydantic) barra antes da rota: 422, não 400.
    usuario_novo["confirmar_senha"] = usuario_novo["senha"] + "x"
    r = client.post("/registrar", json=usuario_novo)
    assert r.status_code == 422

def test_cadastro_duplicado_falha(client, usuario_novo):
    assert client.post("/registrar", json=usuario_novo).status_code == 200
    r = client.post("/registrar", json=usuario_novo)
    assert r.status_code == 400


def test_login_valido_e_rota_protegida(client, usuario_novo):
    assert client.post("/registrar", json=usuario_novo).status_code == 200

    r = client.post(
        "/login",
        json={"username": usuario_novo["username"], "senha": usuario_novo["senha"]},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]

    me = client.get("/usuario/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["username"] == usuario_novo["username"]


def test_login_com_senha_errada_retorna_401(client, usuario_novo):
    assert client.post("/registrar", json=usuario_novo).status_code == 200
    r = client.post(
        "/login",
        json={"username": usuario_novo["username"], "senha": "senha-incorreta"},
    )
    assert r.status_code == 401


def test_rota_protegida_sem_token_e_negada(client):
    r = client.get("/usuario/me")
    assert r.status_code in (401, 403)


def test_token_adulterado_e_negado(client):
    r = client.get("/usuario/me", headers={"Authorization": "Bearer token.invalido.aqui"})
    assert r.status_code in (401, 403)
