from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)
    email_verified = Column(Boolean, default=False)

    full_name = Column(String, nullable=True)
    given_name = Column(String, nullable=True)
    family_name = Column(String, nullable=True)
    picture_url = Column(String, nullable=True)
    locale = Column(String, nullable=True)

    google_sub = Column(String, unique=True, index=True, nullable=False)

    role = Column(String, default="user", nullable=False)                 # user | test |admin
    subscription_level = Column(String, default="free", nullable=False)  # free | basic | pro | max
    subscription_since = Column(DateTime(timezone=True), server_default=func.now())

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
