"""
SQLite-based API cache.
Saqlash: api_cache(cache_key, data, fetched_at)
"""
import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone

DB_PATH = Path(__file__).parent / "db.sqlite3"


def init_cache():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS api_cache (
            cache_key  TEXT PRIMARY KEY,
            data       TEXT NOT NULL,
            fetched_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def set_cache(key: str, data) -> None:
    ts = datetime.now(timezone.utc).isoformat()
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT OR REPLACE INTO api_cache VALUES (?,?,?)",
        (key, json.dumps(data, ensure_ascii=False), ts)
    )
    conn.commit()
    conn.close()


def get_cache(key: str):
    """Returns (data, fetched_at) or None."""
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute(
        "SELECT data, fetched_at FROM api_cache WHERE cache_key=?", (key,)
    ).fetchone()
    conn.close()
    if row:
        try:
            return json.loads(row[0]), row[1]
        except Exception:
            pass
    return None


def age_seconds(fetched_at: str) -> float:
    """Seconds since this entry was cached."""
    try:
        t = datetime.fromisoformat(fetched_at)
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        return (datetime.now(timezone.utc) - t).total_seconds()
    except Exception:
        return float("inf")


def get_status() -> dict:
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT cache_key, fetched_at FROM api_cache WHERE cache_key != '_sync' ORDER BY fetched_at DESC"
    ).fetchall()
    conn.close()

    entries = [
        {
            "key":        r[0],
            "fetched_at": r[1],
            "age_sec":    int(age_seconds(r[1])),
        }
        for r in rows
    ]
    return {
        "total":            len(entries),
        "last_entry_at":    entries[0]["fetched_at"] if entries else None,
        "last_entry_age_s": entries[0]["age_sec"]    if entries else None,
        "entries":          entries[:100],
    }
