# 🍽️ mealScale

**mealScale** es una *mini app* educativa que demuestra un flujo completo **Frontend + Backend** para captura, análisis y procesamiento de información relacionada con alimentos.

Forma parte del monorepo **miniApps** y está pensada como proyecto de **aprendizaje**, **prototipado** y **experimentación** con buenas prácticas inspiradas en **DAMA (gestión de datos)**.

---

## 📁 Estructura del proyecto

```
mealScale/
├── Backend/
│   ├── bases_scaleMeal.txt
│   └── FastAPI-Backend/        # API REST (FastAPI)
└── Frontend/
    └── food_scanner/           # Interfaz Web (HTML, CSS, JS)
```

> El frontend y el backend están claramente separados, aunque viven dentro del mismo proyecto.

---

## 🧠 ¿Qué resuelve mealScale?

* Captura información del usuario desde una interfaz web
* Envía los datos a una API REST
* Valida, procesa y analiza la información
* Devuelve resultados estructurados en formato JSON

⚠️ **Nota**: No es una aplicación médica ni nutricional certificada. Es un prototipo educativo.

---

## 🔁 Flujo general (Frontend ↔ Backend)

![caso de uso de flujo general](./docs/mealScale-casouso.png)

---

## 🧩 Enfoque DAMA (simplificado)

| Etapa            | En mealScale                       |
| ---------------- | ---------------------------------- |
| Entrada de datos | Formularios / cámara (Frontend)    |
| Procesamiento    | Servicios y validaciones (Backend) |
| Almacenamiento   | Memoria / DB (usuarios)            |
| Salida           | JSON hacia el Frontend             |
| Gobernanza       | Logs, estructura, Docker           |

---

## 🚀 Cómo usar el proyecto

1. Levanta el **Backend** (ver README en `Backend/FastAPI-Backend`)
2. Abre el **Frontend** (ver README en `Frontend/food_scanner`)
3. Interactúa con la UI y observa las respuestas de la API

---

## 👨‍🎓 Uso educativo

mealScale es ideal para aprender:

* Arquitectura Front–Back
* APIs REST con FastAPI
* Separación de responsabilidades
* Validación y calidad de datos
* Documentación y diagramas UML

---

## Instalación
Para el front hay que hacer en el directorio del front
```
python3 -m http.server 3000
```
en el directorio de back
```
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```
cada vez que construimos el servicio.

## Uso
Prueba de interfaz login con imagen
```
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxI…IwN30.tzjWk0lYtKRoh6A52lujx5IDGP52POrlh4ZpI8JmrRc" \
  -F "image=@WhatsApp Image 2025-12-22 at 23.45.38.jpeg" \
  -F "description=rebanada pizza pepperoni" \
  -F "goal=completa" \
  -F "amount=1" \
  -F "unit=portion"
```
---
## ✍️ Autor

**MCC Jesús E. Cruz Mtz**

---

> *Mini apps pequeñas, flujos claros y aprendizaje real.*
