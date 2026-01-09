import base64
import json
import logging
from openai import OpenAI
from fastapi import UploadFile

client = OpenAI()
logger = logging.getLogger(__name__)

# ---------- PROMPTS ----------

SYSTEM_PROMPT = """
Eres un nutricionista profesional y analista de alimentos.

Reglas obligatorias:
- Analiza únicamente lo que se observa en la imagen.
- Si el alimento no puede identificarse con alta confianza, indícalo explícitamente.
- No inventes ingredientes.
- No incluyas marcas comerciales.
- Usa valores nutricionales promedio estándar.
- Devuelve UNICAMENTE un JSON válido.
- NO incluyas explicaciones fuera del JSON.
- NO incluyas markdown.
- NO incluyas texto adicional.
- NO agregues texto antes ni después.
- NO uses bloques ```json.
Si la imagen no corresponde con la descripción proporcionada:
- No inventes información nutricional
- Indica explícitamente que hay una discrepancia
- Devuelve status = "mismatch"
Si la imagen NO contiene un alimento:
- Devuelve status_sugerido = "invalid_image"
- No devuelvas información nutricional
- Explica brevemente qué aparece en la imagen

Todas las cantidades nutricionales deben expresarse por 100 gramos.
El índice glucémico debe clasificarse como: bajo, medio o alto.
""".strip()


def build_user_prompt(description: str, goal: str, grams: float | None) -> str:
    return f"""
Analiza la siguiente imagen de un alimento.

Descripción adicional del usuario:
"{description}"

Objetivo del análisis:
"{goal}"

Cantidad consumida en gramos:
{grams}

Si la cantidad es null, solo devuelve información por 100 gramos.

Devuelve la información respetando estrictamente el esquema JSON definido.
""".strip()


# ---------- UTILIDADES ----------

async def encode_image(image: UploadFile) -> str:
    content = await image.read()
    return base64.b64encode(content).decode("utf-8")

def normalize_ai_result(parsed: dict) -> dict:
    nv = parsed.get("nutritional_values_per_100g", {})

    return {
        "status": "ok",
        "alimento": parsed.get("food"),
        "cantidad_g": 100,
        "valores_nutricionales": {
            "calorias_kcal": nv.get("calorias_kcal"),
            "proteinas_g": nv.get("proteinas_g"),
            "grasas_g": nv.get("grasas_totales_g"),
            "grasas_saturadas_g": nv.get("grasas_saturadas_g"),
            "carbohidratos_g": nv.get("carbohidratos_totales_g"),
            "azucares_g": nv.get("azucares_g"),
            "fibra_g": nv.get("fibra_dietetica_g"),
            "sodio_mg": nv.get("sodio_mg"),
        },
        "indice_glucemico": nv.get("indice_glucemico")
    }

# ---------- LLAMADA PRINCIPAL ----------

async def analyze_food_image(
    image: UploadFile,
    description: str,
    goal: str,
    grams: float | None
) -> dict:
    """
    Llama a OpenAI con imagen + prompt y devuelve JSON parseado.
    """

    image_base64 = await encode_image(image)

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": build_user_prompt(description, goal, grams)
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{image_base64}"
                    }
                ]
            }
        ],
        max_output_tokens=800,
        temperature=0.2
    )

    raw_output = response.output_text.strip()
    logger.info("Raw AI result type: %s", type(raw_output))
    logger.info("Raw AI result content: %s", raw_output)
    print("Raw AI result type: %s", type(raw_output))
    print("Raw AI result content: %s", raw_output)

    try:
        parsed = json.loads(raw_output)
    except json.JSONDecodeError:
        return {
            "status": "error",
            "descripcion": "La IA devolvió una respuesta no interpretable",
            "raw": raw_output
        }
    # Normalización mínima para el front
    try:
        result = normalize_ai_result(parsed)
    except Exception as e:
        return {
            "status": "error",
            "description": "error al normalizar la respuesta de la IA"
        }
    if not isinstance(result, dict):
        return {
            "status": "error",
            "description": "Respuesta invalida del motor de analisis"
        }
    return result