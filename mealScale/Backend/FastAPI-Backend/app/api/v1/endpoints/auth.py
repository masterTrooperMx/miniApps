from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.api.v1.schemas.auth import GoogleLoginRequest
from app.services.google_auth import verify_google_token
from app.services.user_service import get_or_create_google_user
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/me")
def me(user=Depends(get_current_user)):
    return user


@router.post("/google")
def google_login(
    data: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    # 1️⃣ Validar token con Google (UNA SOLA VEZ)
    payload = verify_google_token(
        token=data.id_token,
        client_id=settings.GOOGLE_CLIENT_ID
    )

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    # 2️⃣ Crear o recuperar usuario (TU SERVICIO)
    user = get_or_create_google_user(db, payload)

    if not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")

    # 3️⃣ Crear JWT con ID INTERNO
    access_token = create_access_token(
        data={
            "sub": str(user.id),                 # 🔑 CLAVE
            "email": user.email,
            "subscription": user.subscription
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
