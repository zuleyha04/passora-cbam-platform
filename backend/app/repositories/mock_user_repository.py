"""Mock user repository. Replace with SQLAlchemy + PostgreSQL in production."""
import json
from pathlib import Path

_DATA_PATH = Path(__file__).parent.parent / "data" / "demo_users.json"


def _load_users() -> list[dict]:
    return json.loads(_DATA_PATH.read_text(encoding="utf-8"))


def find_user_by_email(email: str) -> dict | None:
    return next((u for u in _load_users() if u["email"] == email), None)


def find_user_by_id(user_id: str) -> dict | None:
    return next((u for u in _load_users() if u["id"] == user_id), None)


def authenticate_user(email: str, password: str) -> dict | None:
    user = find_user_by_email(email)
    if user and user["password"] == password:
        return user
    return None
