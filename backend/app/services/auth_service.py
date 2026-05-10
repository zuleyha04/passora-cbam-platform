"""Auth service layer."""
from app.repositories.mock_user_repository import authenticate_user, find_user_by_id
from app.core.security import create_mock_token, decode_mock_token


def login(email: str, password: str) -> dict | None:
    user = authenticate_user(email, password)
    if not user:
        return None
    token = create_mock_token(user["id"], user["role"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "company_id": user.get("company_id"),
        },
    }


def get_current_user(token: str) -> dict | None:
    payload = decode_mock_token(token)
    if not payload:
        return None
    return find_user_by_id(payload["user_id"])
