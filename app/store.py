"""Persistência do formulário de contato (LGPD: mínimo necessário, com TTL)."""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path

from sqlalchemy import DateTime, Integer, String, Text, create_engine, delete, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

CONSENT_VERSION = "2026-11"


class Base(DeclarativeBase):
    pass


class Contato(Base):
    __tablename__ = "contatos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    protocolo: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    nome: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(160), index=True)
    assunto: Mapped[str] = mapped_column(String(60), default="oportunidade")
    mensagem: Mapped[str] = mapped_column(Text)
    consent_version: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


@dataclass
class Store:
    engine: object
    data_dir: Path

    @classmethod
    def open(cls, data_dir: Path) -> Store:
        data_dir = Path(data_dir)
        data_dir.mkdir(parents=True, exist_ok=True)
        engine = create_engine(f"sqlite:///{data_dir / 'contatos.db'}", future=True)
        Base.metadata.create_all(engine)
        return cls(engine=engine, data_dir=data_dir)

    def salvar(self, *, nome: str, email: str, assunto: str, mensagem: str) -> str:
        protocolo = "CH-" + secrets.token_hex(3).upper()
        with Session(self.engine) as session:
            session.add(
                Contato(
                    protocolo=protocolo,
                    nome=nome,
                    email=email,
                    assunto=assunto or "oportunidade",
                    mensagem=mensagem,
                    consent_version=CONSENT_VERSION,
                )
            )
            session.commit()
        return protocolo

    def total(self) -> int:
        with Session(self.engine) as session:
            return int(session.scalar(select(func.count()).select_from(Contato)) or 0)

    def expurgar(self, dias: int) -> int:
        """Rotina de retenção: apaga contatos mais antigos que `dias`."""
        corte = datetime.now(UTC) - timedelta(days=dias)
        with Session(self.engine) as session:
            result = session.execute(delete(Contato).where(Contato.created_at < corte))
            session.commit()
            return int(result.rowcount or 0)
