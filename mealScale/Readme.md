# meal Scale

## Descripción
Es un app que ayuda a buscar informacion nutrimental sobre la comida que ingerimos.

## Tecnologías
- HTML
- FastAPI
- Python
- Bootstrap

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

## Autor
Jesús E. Cruz Mtz, Dic 2025
