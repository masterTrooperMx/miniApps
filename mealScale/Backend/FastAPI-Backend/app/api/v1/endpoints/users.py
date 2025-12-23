from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.services.user_service import create_user
from app.api.v1.schemas.user import UserCreate

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", tags=["Users"])
def create_user_api(
    data: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user(db, data.email, data.name)

@router.get("/", tags=["Users"])
def list_users():
    return {"message": "users endpoint OK"}
