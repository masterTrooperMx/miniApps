from sqlalchemy.orm import Session
from app.db.models.user import User
from datetime import datetime, timedelta

def create_user(db: Session, email: str, name: str):
    user = User(email=email, name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_or_create_google_user(db: Session, payload: dict):
    user = db.query(User).filter(
        User.google_sub == payload["sub"]
    ).first()

    if user:
        return user

    user = User(
        email=payload["email"],
        email_verified=payload.get("email_verified", False),
        full_name=payload.get("name"),
        given_name=payload.get("given_name"),
        family_name=payload.get("family_name"),
        picture_url=payload.get("picture"),
        locale=payload.get("locale"),
        google_sub=payload["sub"],
        subscription_level="free",
        subscription_since=datetime.utcnow(),
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user