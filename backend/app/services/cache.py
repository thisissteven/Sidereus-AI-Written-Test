"""
Redis cache using Upstash Redis with TTL support.
"""

import hashlib
import json
from typing import Any, Optional

import redis

from backend.app.config import settings


class RedisCache:
    """Redis-backed cache with JSON serialization."""

    def __init__(self, default_ttl: int = 3600) -> None:
        self._default_ttl = default_ttl

        self._client = redis.Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )

    # ── public API ────────────────────────────────────────────────

    def get(self, key: str) -> Optional[Any]:
        """Return cached value or None if missing/expired."""

        value = self._client.get(key)

        if value is None:
            return None

        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value

    def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> None:
        """Store value with TTL."""

        effective_ttl = (
            ttl
            if ttl is not None
            else self._default_ttl
        )

        self._client.set(
            key,
            json.dumps(value),
            ex=effective_ttl,
        )

    def delete(self, key: str) -> bool:
        """Delete cache entry."""

        return self._client.delete(key) > 0

    def clear(self) -> None:
        """Clear all cache."""

        self._client.flushdb()


# ── helpers ──────────────────────────────────────────────────────


def md5_hash(data: bytes) -> str:
    """Hash binary data (PDF files)."""

    return hashlib.md5(data).hexdigest()


def text_hash(data: str) -> str:
    """Hash text content."""

    return hashlib.md5(
        data.encode("utf-8")
    ).hexdigest()


# ── singleton ────────────────────────────────────────────────────

cache = RedisCache(
    default_ttl=settings.CACHE_TTL
)