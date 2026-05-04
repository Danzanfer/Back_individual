# Mi Casino

Un proyecto full-stack que combina una mesa de blackjack, mini-juegos interactivos y un servicio de IA que clasifica el perfil de jugador según su comportamiento.

## ¿Qué hay aquí?

- `frontend/`: interfaz web estática con HTML, CSS y JavaScript.
- `backend/`: API Node.js/Express con Sequelize y PostgreSQL.
- `python_model/`: servicio Flask que carga un modelo de clustering para predecir perfiles de riesgo.
- `db/init.sql`: esquema inicial de la base de datos.
- `docker-compose.yml`: orquesta PostgreSQL, pgAdmin, backend y servicio de IA.

## Por qué existe

El objetivo es tener una experiencia de casino gamificada donde:
- el jugador juega blackjack,
- completa mini-juegos de riesgo y memoria,
- su comportamiento genera datos que alimentan un modelo de IA,
- y el backend guarda predicciones en la base de datos.

## Cómo usarlo

### 1. Configura tu entorno

Crea un archivo `.env` en la raíz con estas variables:

```env
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=tu_basededatos
DB_HOST=db
DB_PORT=5432
PORT=3000
```

> Nota: `DB_HOST=db` funciona con `docker-compose`, porque es el nombre del servicio.

### 2. Arranca el stack

Desde la raíz del proyecto:

```bash
docker-compose up --build
```

Esto levanta:
- `db`: PostgreSQL
- `pgadmin`: administrador web para la base de datos
- `mi_casino_flask`: servicio de modelo IA
- `mi_casino_node`: backend Node.js

### 3. Abre la app

- Frontend principal: `frontend/index.html`
- Mini-juegos: `frontend/minijuegos.html`
- Tienda: `frontend/tienda.html`
- Login: `frontend/login.html`

> Si prefieres usar el servidor local, abre los HTML directamente en el navegador.

## Cómo funciona el backend

El backend expone la ruta:

- `POST /api/predicciones`

Ese endpoint recibe el vector conductual del jugador y guarda la predicción junto al usuario.

El servidor usa Sequelize para sincronizar las tablas `usuarios` y `predicciones` con PostgreSQL.

## Servicio de modelo IA

`python_model/app.py` expone:

- `GET /health`
- `POST /predict`

El modelo espera métricas como `bart_riesgo`, `mem_eficiencia`, `bj_winrate` y `coins`, y devuelve un `perfil_ia` junto a una configuración de juego.

## Estructura rápida

```text
.
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── config/db.js
│       ├── controllers/prediccionController.js
│       ├── models/
│       ├── routes/prediccionRoutes.js
│       └── index.js
├── db/
│   └── init.sql
├── docker-compose.yml
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── minijuegos.html
│   ├── tienda.html
│   ├── css/
│   └── js/
└── python_model/
    ├── app.py
    ├── Dockerfile
    ├── requirements.txt
    └── models/
```

## Dependencias importantes

- Node.js backend: `express`, `sequelize`, `pg`, `axios`, `dotenv`, `cors`
- Python IA: `flask`, `flask-cors`, `pandas`, `scikit-learn`, `joblib`

## Consejos rápidos

- Si la app no arranca, revisa los logs de `mi_casino_node` y `mi_casino_flask`.
- Si el modelo no responde, valida que `python_model/models/modelo_kmeans.pkl` y `scaler.pkl` existan.
- Si hay errores de base de datos, comprueba `db/init.sql` y que `docker-compose` esté leyendo el `.env` correcto.

## ¿Qué puedes mejorar?

- añadir autenticación real en el frontend,
- perfeccionar el servicio de IA con más datos,
- mover el frontend a un servidor web en lugar de abrir archivos locales.

---