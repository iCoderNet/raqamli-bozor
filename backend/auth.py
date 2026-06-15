"""
Authentication module – SQLite + JWT
"""
import os
import hashlib
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt

DB_PATH   = Path(__file__).parent / "db.sqlite3"
SECRET    = os.getenv("SECRET_KEY", "raqamli-bozor-jwt-secret-change-me!")
ALGORITHM = "HS256"
EXPIRE_H  = int(os.getenv("TOKEN_EXPIRE_HOURS", "8"))


# ─── DB init ──────────────────────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT    UNIQUE NOT NULL,
            password_hash TEXT    NOT NULL,
            full_name     TEXT    DEFAULT '',
            role          TEXT    DEFAULT 'viewer',
            is_active     INTEGER DEFAULT 1,
            created_at    TEXT    DEFAULT (datetime('now'))
        )
    """)
    # Default admin account (admin / 12345678)
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        _insert_user(c, "admin", "12345678", "Administrator", "admin")
    conn.commit()
    conn.close()


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _insert_user(c, username, password, full_name, role):
    c.execute(
        "INSERT INTO users (username, password_hash, full_name, role) VALUES (?,?,?,?)",
        (username, _hash(password), full_name, role)
    )


# ─── User operations ──────────────────────────────────────────────────────

def verify_password(username: str, password: str) -> Optional[dict]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE username = ?",
        (username,)
    )
    row = c.fetchone()
    conn.close()
    if not row or not row[5]:          # not found or inactive
        return None
    if _hash(password) != row[2]:
        return None
    return {"id": row[0], "username": row[1], "full_name": row[3], "role": row[4]}


def list_users() -> list:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY id")
    rows = c.fetchall()
    conn.close()
    return [
        {"id": r[0], "username": r[1], "full_name": r[2],
         "role": r[3], "is_active": bool(r[4]), "created_at": r[5]}
        for r in rows
    ]


def create_user(username: str, password: str, full_name: str = "", role: str = "viewer") -> dict:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    _insert_user(c, username, password, full_name, role)
    conn.commit()
    uid = c.lastrowid
    conn.close()
    return {"id": uid, "username": username, "full_name": full_name, "role": role}


def change_password(user_id: int, new_password: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE users SET password_hash = ? WHERE id = ?", (_hash(new_password), user_id))
    conn.commit()
    conn.close()


# ─── JWT ──────────────────────────────────────────────────────────────────

def create_token(user: dict) -> str:
    payload = {
        "sub":  user["username"],
        "name": user.get("full_name", ""),
        "role": user.get("role", "viewer"),
        "exp":  datetime.now(timezone.utc) + timedelta(hours=EXPIRE_H),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except Exception:
        return None
