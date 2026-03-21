import json
import redis
from app.core.config import get_settings

_client = None


def get_redis():
    global _client
    if _client is None:
        settings = get_settings()
        if settings.redis_url:
            _client = redis.from_url(settings.redis_url, decode_responses=True)
    return _client


def cache_get(key: str):
    r = get_redis()
    if r is None:
        return None
    try:
        val = r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def cache_set(key: str, value, ttl: int = 3600):
    r = get_redis()
    if r is None:
        return
    try:
        r.set(key, json.dumps(value), ex=ttl)
    except Exception:
        pass


def cache_delete(key: str):
    r = get_redis()
    if r is None:
        return
    try:
        r.delete(key)
    except Exception:
        pass
