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
    use_detected: bool = Form(False),
    user=Depends(get_current_user)
):
    grams = None
    if amount is not None and unit:
        grams = amount * 100 if unit == "portion" else amount

    # Si el usuario da "usar lo detectado", ignoramos la descripción para evitar mismatch
    effective_description = "" if use_detected else (description or "")

    try:
        result = await analyze_food_image(
            image=image,
            description=effective_description,
            goal=goal.value,
            grams=grams
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Defensa: nunca regreses None / no-dict
    if not isinstance(result, dict):
        raise HTTPException(status_code=500, detail="Respuesta inválida del motor de análisis")

    # Si el servicio ya trae status, lo respetamos
    status = result.get("status")

    # Si NO trae status, inferimos basado en el contrato actual
    if not status:
        # En el contrato actual, si no hay valores_nutricionales, es mismatch o invalid
        if result.get("valores_nutricionales") is None:
            descripcion = (result.get("descripcion") or "").lower()
            if any(word in descripcion for word in [
                "no es comida",
                "no contiene alimento",
                "no se observa alimento",
                "persona",
                "objeto",
                "paisaje"
            ]):
                result["status"] = "invalid_image"
            else:
                result["status"] = "mismatch"
        else:
            result["status"] = "ok"

    # Permisos de guardado por suscripción
    result["can_save"] = getattr(user, "subscription_level", "free") != "free"

    # ✅ CRÍTICO: retornar SIEMPRE
    return result
