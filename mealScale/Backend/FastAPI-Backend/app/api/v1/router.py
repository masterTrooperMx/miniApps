from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, protected, analyze

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"]
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)

api_router.include_router(
    protected.router, 
    prefix="/protected", 
    tags=["Protected"]
)

api_router.include_router(
    analyze.router,
    tags=["Analysis"]
)