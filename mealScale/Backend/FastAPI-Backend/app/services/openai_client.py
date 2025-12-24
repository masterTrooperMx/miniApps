import base64
import json
from openai import OpenAI
from fastapi import UploadFile

client = OpenAI()


# ---------- PROMPTS ----------

SYSTEM_PROMPT = """
Eres un nutricionista profesional y analista de alimentos.

Reglas obligatorias:
- Analiza únicamente lo que se observa en la imagen.
- Si el alimento no puede identificarse con alta confianza, indícalo explícitamente.
- No inventes ingredientes.
- No incluyas marcas comerciales.
- Usa valores nutricionales promedio estándar.
- Devuelve SIEMPRE un JSON válido.
- NO incluyas explicaciones fuera del JSON.
- NO incluyas markdown.
- NO incluyas texto adicional.

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

    raw_output = response.output_text

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        raise ValueError("La IA devolvió un JSON inválido")
