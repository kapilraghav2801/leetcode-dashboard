from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.schemas import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token, get_current_admin
from app.core.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    settings = get_settings()
    if body.username != settings.admin_username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(body.password, settings.admin_password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": body.username})
    return TokenResponse(access_token=token)


@router.get("/me")
def me(username: str = Depends(get_current_admin)):
    # used by frontend to validate token on load
    return {"username": username, "role": "admin"}
