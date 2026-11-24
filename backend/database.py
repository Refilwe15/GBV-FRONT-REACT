import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def _normalize_database_url(url: str) -> str:
    """Convert postgres URL to asyncpg and clean query params Neon/asyncpg accept."""
    if not url:
        return "sqlite+aiosqlite:///./test.db"

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    u = urlparse(url)
    qs = parse_qs(u.query)

    # asyncpg uses ssl=; drop unsupported channel_binding
    cleaned = {}
    if "sslmode" in qs or "ssl" in qs or "neon" in (u.hostname or ""):
        cleaned["ssl"] = "require"

    return urlunparse((u.scheme, u.netloc, u.path, "", urlencode(cleaned), ""))


DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db"))

# Neon pooler (PgBouncer) works best with NullPool + no statement cache
_is_neon = "neon.tech" in DATABASE_URL
_engine_kwargs = {
    "echo": False,
}
if _is_neon:
    _engine_kwargs["poolclass"] = NullPool
    _engine_kwargs["connect_args"] = {"statement_cache_size": 0}

engine = create_async_engine(DATABASE_URL, **_engine_kwargs)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
