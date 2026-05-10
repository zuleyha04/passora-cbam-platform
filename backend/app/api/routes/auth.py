from fastapi import APIRouter, HTTPException, Header
from app.schemas.auth_schemas import LoginRequest, LoginResponse
from app.services.auth_service import login, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def auth_login(body: LoginRequest):
    result = login(body.email, body.password)
    if not result:
        raise HTTPException(status_code=401, detail="Geçersiz email veya şifre.")
    return result


@router.get("/me")
def me(authorization: str = Header(default="")):
    token = authorization.replace("Bearer ", "").replace("bearer ", "").strip()
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Oturum geçersiz veya süresi dolmuş.")
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "company_id": user.get("company_id"),
    }
