from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nome = Column(
        String,
        nullable=True
    )

    sobrenome = Column(
        String,
        nullable=True
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=True
    )

    username = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    senha_hash = Column(
        String,
        nullable=False
    )

    reset_token_hash = Column(
        String,
        nullable=True,
        index=True
    )

    reset_token_expira_em = Column(
        DateTime(timezone=True),
        nullable=True
    )

    creditos = Column(Integer, default=0, nullable=False)

    pontuacoes = relationship(
        "Pontuacao",
        back_populates="usuario",
        cascade="all, delete-orphan"
    )


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nome = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    slug = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    categoria_pai_id = Column(
        Integer,
        ForeignKey("categorias.id"),
        nullable=True
    )

    # IMPORTANTE:
    # No seu PostgreSQL essa coluna é INTEGER.
    #
    # 0 = área normal
    # 1 = modo geral
    #
    # NÃO trocar para Boolean sem alterar o banco.
    eh_modo_geral = Column(
        Integer,
        default=0,
        nullable=False
    )

    subcategorias = relationship(
        "Categoria",
        backref="pai",
        remote_side=[id]
    )

    perguntas = relationship(
        "Pergunta",
        back_populates="categoria"
    )

    pontuacoes = relationship(
        "Pontuacao",
        back_populates="categoria"
    )


class Pergunta(Base):
    __tablename__ = "perguntas"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    categoria_id = Column(
        Integer,
        ForeignKey("categorias.id"),
        nullable=False
    )

    dificuldade = Column(
        String,
        nullable=False
    )

    enunciado = Column(
        String,
        nullable=False
    )

    alternativas = Column(
        String,
        nullable=False
    )

    resposta_correta = Column(
        String,
        nullable=False
    )

    explicacao = Column(
        String,
        nullable=True
    )

    categoria = relationship(
        "Categoria",
        back_populates="perguntas"
    )


class Pontuacao(Base):
    __tablename__ = "pontuacoes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    categoria_id = Column(
        Integer,
        ForeignKey("categorias.id"),
        nullable=False
    )

    pontos = Column(
        Integer,
        default=0,
        nullable=False
    )

    sequencia_atual = Column(
        Integer,
        default=0,
        nullable=False
    )

    melhor_sequencia = Column(
        Integer,
        default=0,
        nullable=False
    )

    nivel_atual = Column(
        String,
        default="easy",
        nullable=False
    )

    titulo = Column(
        String,
        default="Iniciante",
        nullable=False
    )

    atualizado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    usuario = relationship(
        "Usuario",
        back_populates="pontuacoes"
    )

    categoria = relationship(
        "Categoria",
        back_populates="pontuacoes"
    )

class SkinComprada(Base):
    __tablename__ = "skins_compradas"
    __table_args__ = (UniqueConstraint("usuario_id", "skin_id", name="uq_usuario_skin"),)

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    skin_id = Column(String, nullable=False, index=True)
    comprada_em = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class SkinEquipada(Base):
    __tablename__ = "skins_equipadas"
    __table_args__ = (UniqueConstraint("usuario_id", "personagem_id", name="uq_usuario_personagem_skin"),)

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    personagem_id = Column(String, nullable=False, index=True)
    skin_id = Column(String, nullable=False)
    atualizado_em = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
