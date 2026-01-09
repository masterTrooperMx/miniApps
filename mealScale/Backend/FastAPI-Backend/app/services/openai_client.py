# app/services/openai_client.py

import base64
import json
import logging
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)
client = OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """
Analiza la imagen proporcionada.
Si NO hay comida visible, responde con:
{
  "status": "invalid_image",
  "descripcion": "La imagen no contiene alimentos"
}

Si hay comida pero NO coincide con la descripción del usuario, responde con:
{
  "status": "mismatch",
  "descripcion": "La imagen muestra X, no Y"
}

Si hay comida válida, responde con:
{
  "status": "ok",
  "food": "...",
  "nutritional_values_per_100g": {
    "calorias_kcal": number,
    "proteinas_g": number,
    "grasas_totales_g": number,
    "grasas_saturadas_g": number,
    "carbohidratos_g": number,
    "azucares_g": number,
    "fibra_dietetica_g": number,
    "sodio_mg": number,
    "indice_glucemico": "bajo|medio|alto"
  }
}

Devuelve ÚNICAMENTE JSON válido. No agregues texto adicional.
"""

def encode_image(file):
    return base64.b64encode(file.file.read()).decode("utf-8")

async def analyze_food_image(image, description: str, goal: str, grams: float | None):
    try:
        image_b64 = encode_image(image)
    except Exception as e:
        return {
            "status": "error",
            "descripcion": "No se pudo procesar la imagen"
        }

    user_prompt = f"""
Descripción del usuario: "{description}"
Objetivo: {goal}
Cantidad en gramos: {grams if grams else "100"}
"""

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": user_prompt},
                        {"type": "input_image", "image_base64": image_b64},
                    ],
                },
            ],
            max_output_tokens=800,
            temperature=0.2,
        )
    except Exception as e:
        logger.exception("OpenAI request failed")
        return {
            "status": "error",
            "descripcion": "Error al consultar el motor de análisis"
        }

    ai_text = response.output_text.strip()
    logger.info("Raw AI result: %s", ai_text)

    try:
        parsed = json.loads(ai_text)
    except json.JSONDecodeError:
        return {
            "status": "error",
            "descripcion": "La IA devolvió una respuesta no interpretable",
            "raw": ai_text,
        }

    # 🔒 CASOS SEMÁNTICOS DIRECTOS
    status = parsed.get("status")
    if status in {"invalid_image", "mismatch", "error"}:
        return parsed

    # 🔒 NORMALIZACIÓN DE RESULTADO OK
    nv = parsed.get("nutritional_values_per_100g") or {}

    return {
        "status": "ok",
        "alimento": parsed.get("food"),
        "cantidad_g": grams or 100,
        "valores_nutricionales": {
            "calorias_kcal": nv.get("calorias_kcal"),
            "proteinas_g": nv.get("proteinas_g"),
            "grasas_g": nv.get("grasas_totales_g"),
            "grasas_saturadas_g": nv.get("grasas_saturadas_g"),
            "carbohidratos_g": nv.get("carbohidratos_g"),
            "azucares_g": nv.get("azucares_g"),
            "fibra_g": nv.get("fibra_dietetica_g"),
            "sodio_mg": nv.get("sodio_mg"),
        },
        "indice_glucemico": nv.get("indice_glucemico"),
    }
