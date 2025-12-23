from fastapi import FastAPI
from app.api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine
from app.db.base import Base
from app.db.models import user  # asegura el import
#app = FastAPI(title="FastAPI Backend Dockerized")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# ruta + version
app.include_router(api_router, prefix="/api/v1")

#@app.get("/")
#def root():
#    return {"status": "ok", "message": "FastAPI running in Docker!"}
