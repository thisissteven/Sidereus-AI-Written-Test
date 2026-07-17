"""
Thread-safe in-memory cache with per-entry TTL.
"""

import hashlib
import threading
import time
from typing import Any, Optional

from backend.app.config import settings


class InMemoryCache:
    """Simple dict-backed cache with optional TTL per entry."""

    def __init__(self, default_ttl: int = 3600) -> None:
        self._store: dict[str, tuple[Any, float]] = {}
        self._lock = threading.Lock()
        self._default_ttl = default_ttl

    # ── public API ───────────────────────────────────────────────────────

    def get(self, key: str) -> Optional[Any]:
        """Return cached value or *None* if missing / expired."""
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expiry = entry
            if expiry and time.time() > expiry:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Store *value* under *key*.  Uses default TTL when *ttl* is None."""
        effective_ttl = ttl if ttl is not None else self._default_ttl
        expiry = time.time() + effective_ttl if effective_ttl > 0 else 0.0
        with self._lock:
            self._store[key] = (value, expiry)

    def delete(self, key: str) -> bool:
        """Remove an entry.  Returns True if it existed."""
        with self._lock:
            return self._store.pop(key, None) is not None

    def clear(self) -> None:
        """Drop every entry."""
        with self._lock:
            self._store.clear()

    def cleanup(self) -> int:
        """Evict all expired entries.  Returns how many were removed."""
        now = time.time()
        removed = 0
        with self._lock:
            expired_keys = [
                k for k, (_, expiry) in self._store.items()
                if expiry and now > expiry
            ]
            for k in expired_keys:
                del self._store[k]
                removed += 1
        return removed


# ── helpers ──────────────────────────────────────────────────────────────────

def md5_hash(data: bytes) -> str:
    """Return the hex MD5 digest of *data* (useful as cache key for files)."""
    return hashlib.md5(data).hexdigest()


# Singleton used throughout the app
cache = InMemoryCache(default_ttl=settings.CACHE_TTL)
