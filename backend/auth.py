import os

from datetime import datetime, timedelta

from dotenv import load_dotenv

from jose import JWTError, jwt

from passlib.context import CryptContext

from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)


load_dotenv()


# ============================================================
# JWT
# ============================================================

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY não foi configurada no arquivo .env"
    )


ALGORITHM = "HS256"

EXPIRA_EM_MINUTOS = 60 * 24


# ============================================================
# SENHAS
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ============================================================
# BEARER
# ============================================================

security_scheme = HTTPBearer()


# ============================================================
# HASH
# ============================================================

def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


def verificar_senha(
    senha_pura: str,
    senha_hash: str
) -> bool:

    try:
        return pwd_context.verify(
            senha_pura,
            senha_hash
        )

    except Exception:
        return False


# ============================================================
# TOKEN JWT
# ============================================================

def criar_token(dados: dict) -> str:

    payload = dados.copy()

    expira = (
        datetime.utcnow()
        + timedelta(
            minutes=EXPIRA_EM_MINUTOS
        )
    )

    payload["exp"] = expira

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def verificar_token(token: str):

    try:

        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

    except JWTError:

        return None


# ============================================================
# USUÁRIO ATUAL
# ============================================================

def usuario_atual(
    credenciais: HTTPAuthorizationCredentials =
    Depends(security_scheme)
):

    token = credenciais.credentials

    payload = verificar_token(token)

    if payload is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado."
        )

    username = payload.get("sub")

    if not username:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido."
        )

    return username