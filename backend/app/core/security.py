"""Mock auth security layer. Replace with real JWT in production."""
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.core.config import settings

MOCK_TOKENS = {
    "mock-token-admin": {"user_id": "u1", "role": "admin"},
    "mock-token-user": {"user_id": "u2", "role": "company_user"},
}


def create_mock_token(user_id: str, role: str) -> str:
    token_key = f"mock-token-{role.replace('company_user', 'user')}"
    return token_key


def decode_mock_token(token: str) -> dict | None:
    return MOCK_TOKENS.get(token)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
