import re
from pydantic import BaseModel, field_validator

def validar_forca_senha(senha: str) -> str:
    if len(senha) < 8:
        raise ValueError("A senha precisa ter pelo menos 8 caracteres.")
    if not re.search(r"[A-Z]", senha):
        raise ValueError("A senha precisa ter pelo menos uma letra maiúscula.")
    if not re.search(r"[a-z]", senha):
        raise ValueError("A senha precisa ter pelo menos uma letra minúscula.")
    if not re.search(r"\d", senha):
        raise ValueError("A senha precisa ter pelo menos um número.")
    return senha

class UsuarioCadastro(BaseModel):
    nome: str
    sobrenome: str
    username: str
    email: str
    senha: str
    confirmar_senha: str

    @field_validator("nome", "sobrenome")
    @classmethod
    def validar_nome(cls, valor):
        valor = valor.strip()
        if len(valor) < 2:
            raise ValueError("Informe seu nome.")
        return valor

    @field_validator("username")
    @classmethod
    def validar_username(cls, valor):
        valor = valor.strip()
        if len(valor) < 3:
            raise ValueError("O nome de usuário precisa ter pelo menos 3 caracteres.")
        if " " in valor:
            raise ValueError("O nome de usuário não pode conter espaços.")
        return valor

    @field_validator("email")
    @classmethod
    def validar_email(cls, valor):
        valor = valor.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", valor):
            raise ValueError("Informe um e-mail válido.")
        return valor

    @field_validator("senha")
    @classmethod
    def validar_senha(cls, valor):
        return validar_forca_senha(valor)

    @field_validator("confirmar_senha")
    @classmethod
    def validar_confirmacao(cls, valor, info):
        senha = info.data.get("senha")
        if senha and valor != senha:
            raise ValueError("As senhas não coincidem.")
        return valor

class UsuarioLogin(BaseModel):
    username: str
    senha: str

class RespostaQuiz(BaseModel):
    categoria_slug: str
    acertou: bool
    usou_dica: bool = False

class RecuperarSenha(BaseModel):
    email: str

class RedefinirSenha(BaseModel):
    token: str
    nova_senha: str
    confirmar_nova_senha: str

class CompraSkin(BaseModel):
    skin_id: str

class EquiparSkin(BaseModel):
    personagem_id: str
    skin_id: str
