
# Memoria del Proyecto: Plataforma de Juego con Análisis Conductual (IA)

## 1. Concepto del Proyecto
Este proyecto no es solo un casino virtual; es un experimento de integración tecnológica. He desarrollado una plataforma donde el juego (Blackjack) y la psicología del jugador se encuentran. El sistema captura cómo se comporta el usuario frente al riesgo y la eficiencia para que una Inteligencia Artificial pueda perfilarlo en tiempo real.

## 2. Arquitectura y Stack Tecnológico
Para que todo funcione sin problemas, dividí el ecosistema en tres grandes bloques que se comunican constantemente:

* **Backend Principal (Node.js & Express):** Es el director de orquesta. Gestiona la lógica de negocio, el sistema de autenticación (con bcrypt para proteger contraseñas), las sesiones y la base de datos PostgreSQL.
* **Servicio de Inteligencia Artificial (Python & Flask):** Aquí reside el cerebro. Usando un modelo de Machine Learning (K-Means), este microservicio recibe métricas conductuales y devuelve un perfil de jugador (Arriesgado, Conservador, etc.).
* **Frontend (JavaScript Vanilla):** Una interfaz limpia y rápida que se comunica con la API para mostrar el progreso, los juegos y las predicciones de la IA.

## 3. El Flujo de Datos y el Modelo
Lo que hace especial a este backend es cómo procesa la información:
1.  **Captura:** Mientras el usuario juega al Blackjack o a los minijuegos (como el de los globos BART o memoria), el sistema genera un "vector" de datos.
2.  **Inferencia:** El backend de Node.js envía estos datos al servicio de Python.
3.  **Adaptación:** El modelo procesa las variables y devuelve una configuración de juego personalizada. Todo esto ocurre de forma transparente para el usuario.

## 4. Evolución y Desarrollo (Commits)
El desarrollo fue un proceso incremental que se puede ver en el historial del código:
* **Fase de Cimientos:** Configuración de contenedores con Docker para que el proyecto sea fácil de instalar en cualquier parte.
* **Fase de Datos:** Diseño del esquema de la base de datos y la conexión mediante Sequelize/TypeORM para asegurar que los "coins" y estadísticas del jugador persistan.
* **Fase de Integración de IA:** Creación del endpoint `/predict` y la lógica de comunicación entre Node.js y Flask mediante Axios.
* **Fase de Pulido:** Implementación de manejadores de errores y validaciones para que el sistema sea resistente a fallos.
