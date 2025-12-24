# app/api/v1/endpoints/analyze.py

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.services.openai_client import analyze_food_image
from enum import Enum

class GoalEnum(str, Enum):
    calorias = "calorias"
    nutrimental = "nutrimental"
    indice_glucemico = "indice_glucemico"
    completa = "completa"

router = APIRouter()

@router.post("/analyze")
async def analyze_food(
    image: UploadFile = File(...),
    description: str = Form(""),
    goal: GoalEnum = Form(...),
    amount: float | None = Form(None),
    unit: str | None = Form(None),
    user=Depends(get_current_user)
):
    grams = None
    if amount and unit:
        grams = amount * 100 if unit == "portion" else amount

    try:
        result = await analyze_food_image(
            image=image,
            description=description,
            goal=goal.value,
            grams=grams
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # AQUÍ VA LA LÓGICA DE STATUS
    if result.get("informacion_nutricional_por_100g") is None:
        result["status"] = "mismatch"
    else:
        result["status"] = "ok"

    # Permisos según suscripción
    result["can_save"] = user.subscription_level != "free"

    return result
