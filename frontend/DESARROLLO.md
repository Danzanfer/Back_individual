# Blackjack — Documentación de desarrollo

## Índice

1. [Descripción del proyecto](#descripción)
2. [Estructura de archivos](#estructura)
3. [Historia del desarrollo](#historia)
4. [Decisiones técnicas](#decisiones-técnicas)
5. [Bugs encontrados y soluciones](#bugs)
6. [Módulos JavaScript](#módulos-javascript)
7. [Sistema de economía](#sistema-de-economía)
8. [Minijuegos conductuales](#minijuegos-conductuales)
9. [Datos recopilados](#datos-recopilados)
10. [APIs externas](#apis-externas)
11. [Flujo de git](#flujo-de-git)

---

## Descripción

Juego de blackjack en vanilla JS con tres capas de propósito:

- **Entretenimiento**: mesa de blackjack funcional con apuestas variables
- **Conductual**: minijuegos (BART, memoria, frecuencias auditivas) que recopilan datos psicológicos del jugador sin que este lo perciba como un test
- **Educativo/crítico**: la tienda simulada y la tabla de vectores exponen el modelo de monetización de los juegos free-to-play y el valor de los datos conductuales

El proyecto surgió como prototipo de aprendizaje dentro de un bootcamp de desarrollo web full-stack, enfocado en vanilla JS, HTML semántico y CSS sin frameworks.

---

## Estructura

```
├── login.html          ← entrada obligatoria, genera player ID
├── index.html          ← mesa de blackjack
├── minijuegos.html     ← BART, memoria, frecuencias
├── tienda.html         ← compra simulada de coins
├── tabla.html          ← tabla de vectores de jugadores
├── css/
│   ├── shared.css      ← variables, nav, botones, modal, utils
│   ├── blackjack.css   ← mesa, cartas, chips, historial
│   └── minijuegos.css  ← BART, memoria, frecuencias, tienda, tabla
└── js/
    ├── errores.js      ← clases de error personalizadas
    ├── coins.js        ← economía compartida via localStorage
    ├── weather.js      ← geolocalización y temperatura (sin API key)
    ├── datos.js        ← datos conductuales compartidos
    ├── vector.js       ← construcción y guardado de vectores
    ├── blackjack.js    ← lógica del juego de cartas
    ├── bart.js         ← minijuego BART
    ├── memoria.js      ← minijuego de pares
    └── frecuencias.js  ← test auditivo de frecuencias
```

---

## Historia del desarrollo

### Fase 1 — Muñeco SVG y editor de avatar

El proyecto empezó como una aplicación de diseño colectivo de un muñeco SVG. El concepto era doble: una interfaz lúdica de personalización y un panel que mostraba en tiempo real todos los datos que se recopilaban de la interacción.

**Decisión técnica clave**: usar SVG inline en el HTML en lugar de imágenes JPG/PNG. Esto permitió que cada parte del muñeco (pelo, ojos, ropa, etc.) fuera un nodo del DOM manipulable directamente con JavaScript mediante `setAttribute('fill', color)`. Un `input[type="color"]` dispara el evento `input` en tiempo real y actualiza el atributo SVG al instante.

El muñeco pasó por varias iteraciones:
- Primera versión: formas geométricas básicas (rectángulos y elipses), visualmente muy primitivo
- Segunda versión: estilo chibi con cabeza grande, pestañas, brillo en los ojos, mejillas con gradiente radial, flequillo con múltiples capas SVG
- Decisión final: el muñeco quedó como avatar del jugador en el blackjack, no como juego central

**Colectivo con localStorage**: cada diseño guardado se almacenaba en un array en localStorage. La métrica colectiva se calculaba con frecuencia de colores por agrupación en buckets RGB (paso de 32) en lugar de promedio — porque el promedio de rojo y azul da púrpura, que nadie eligió.

### Fase 2 — Minijuegos conductuales

La idea original de añadir minijuegos como "peaje" para personalizar el muñeco evolucionó hacia un sistema de economía de coins.

**BART (Balloon Analogue Risk Task)**: test psicológico clásico para medir tolerancia al riesgo. El usuario infla un globo y gana más cuanto más grande esté, pero si explota pierde dinero. La métrica real no es cuánto infló sino el promedio de pompadas en los globos que *no* explotaron (BART ajustado), porque los que explotan retiran la decisión al jugador. Se diseñaron 5 globos con rangos distintos: seguro (80-100 infladas), moderado (40-60), inestable (1-30). La multa al explotar es proporcional al tamaño del globo en el momento de la explosión, lo que castiga la "avaricia extrema".

**Memoria de pares**: el tablero se muestra completo durante 5 segundos al inicio para que el jugador lo memorice. Las posiciones de las cartas se fijan al crear el tablero y nunca cambian aunque se cometan errores — solo se voltean boca abajo. A la cuarta barajada el tablero se destruye y se cobra una penalización. Hay un timer de 60 segundos para toda la partida. La métrica clave es la eficiencia: pares encontrados dividido entre intentos totales.

**Frecuencias auditivas**: usa la Web Audio API del navegador (`AudioContext`, `OscillatorNode`, `exponentialRampToValueAtTime`) para hacer un barrido continuo de 200Hz a 20kHz en 25 segundos. El jugador presiona un botón cuando deja de escuchar el tono. La pérdida auditiva en frecuencias altas es un marcador biológico de edad: a los 18 años se escuchan hasta ~18-20kHz, a los 40 hasta ~12kHz, a los 55 hasta ~8kHz. El resultado final es la mediana de 3 intentos. Antes de confirmar cada resultado se pregunta si hubo error de audio y se puede repetir ese intento sin que cuente.

### Fase 3 — Blackjack como juego central

Se decidió que el blackjack sería el juego principal. Los minijuegos generan coins y el blackjack las gasta. La tienda permite comprar más coins simulando el modelo free-to-play.

El blackjack implementa las reglas estándar: mazo de 52 cartas barajado con Fisher-Yates, ases valen 11 o 1 según convenga, el dealer se planta en 17+, blackjack natural paga 1.5x la apuesta.

Las cartas se renderizan como elementos HTML con CSS (no imágenes), con animación de entrada mediante `@keyframes cartaEntra`. El dealer juega con `async/await` y `setTimeout` para que las cartas aparezcan una a una con delay visible.

### Fase 4 — Login, weather y vectores de datos

**Login**: demostrativo, cualquier usuario/contraseña funciona. Genera un ID determinista a partir del username usando un hash simple (`charCodeAt` con XOR), de modo que el mismo usuario siempre obtiene el mismo ID. Esto permite reconocer al jugador entre sesiones sin un backend real.

**Weather**: usa dos APIs sin API key. `ip-api.com` devuelve ciudad y país a partir de la IP del usuario. `wttr.in` devuelve temperatura y condición meteorológica a partir de la ciudad. Ambas tienen fallback silencioso — si fallan, el vector se construye igualmente con los campos como `null`.

**Vector de datos**: al final se construye un objeto estructurado con todos los datos recopilados: identificación del jugador, localización, estadísticas de blackjack, métricas de los tres minijuegos, y saldo de coins. Se guarda en localStorage en una tabla de vectores y se muestra en `tabla.html` con columnas coloreadas según el tipo de dato.

---

## Decisiones técnicas

### Por qué vanilla JS sin frameworks

El bootcamp usa vanilla JS. Mantener todo en JS puro sin React, Vue ni jQuery fue un requisito explícito. Esto llevó a un patrón de "render functions" — funciones que reconstruyen el innerHTML de un contenedor según el estado actual — en lugar de reactividad automática.

### Por qué un archivo JS por módulo

Cada módulo tiene responsabilidad única:
- `coins.js` solo gestiona el saldo
- `datos.js` solo persiste datos conductuales
- `bart.js` solo contiene la lógica del BART

Esto permite que `minijuegos.html` cargue solo los scripts que necesita, y que el selector de juegos sepa exactamente qué función llamar (`bartInit()`, `memoriaInit()`, `frecuenciasInit()`).

### localStorage como "base de datos"

Sin backend, todo persiste en localStorage. Los módulos usan `storageGet()` y `storageSet()` definidos en `errores.js` que envuelven `JSON.parse/stringify` en try-catch y lanzan `StorageError` si algo falla.

### CSS con variables y sin utilidades

Se usa un sistema de variables CSS (`--gold`, `--red`, `--panel`, etc.) definidas en `:root` que mantienen coherencia visual entre páginas. No se usó Tailwind ni ningún framework de utilidades.

---

## Bugs

### El estroboscopio (el más grave)

**Síntoma**: al entrar a `index.html` tras el login, la página parpadeaba como un estroboscopio y el juego no funcionaba.

**Causa**: el guard de sesión estaba al final del `<body>`, después de que `blackjack.js` ya había ejecutado todo su código a nivel de módulo. Si cualquier cosa fallaba en esa fase, el `catch` del guard capturaba el error y redirigía a `login.html`. Login veía sesión válida y mandaba de vuelta a `index.html`. Loop infinito → parpadeo.

**Solución**: el guard de sesión se movió a un script inline en el `<head>`, antes de cualquier otro recurso. Usa `localStorage` directamente sin depender de ningún módulo. Si no hay sesión válida, `window.location.replace('login.html')` detiene toda la carga. `replace()` en lugar de `href` evita que la página quede en el historial del navegador, cortando el loop.

Todo el código de inicialización de `blackjack.js` se encapsuló en `bjInit()` para que no haya código ejecutable a nivel de módulo. `bjInit()` se llama explícitamente desde un script inline al final del body, sin ningún `catch` que redirija.

### Los timers de memoria interferían con otros juegos

**Síntoma**: al seleccionar BART o frecuencias desde el selector, de repente aparecía el tablero de memoria interrumpiendo el otro juego.

**Causa**: el `setInterval` de la cuenta regresiva de 5 segundos del reveal inicial de memoria era una variable local dentro de `memoriaRevelar()`. Al cambiar de juego, ese interval seguía corriendo. Cuando llegaba a 0, llamaba `memoriaRender()` y sobreescribía el panel con el tablero de memoria.

**Solución**: la variable se convirtió en `memCuentaInt` global. Se creó `memoriaLimpiar()` que cancela tanto `memTimer` como `memCuentaInt`. El selector de juegos llama `bartLimpiar()` y `memoriaLimpiar()` antes de iniciar cualquier juego.

### El timer de memoria saltaba de 58 a 38 segundos

**Causa**: el timer actualizaba el elemento del DOM con `setInterval`, pero ese elemento desaparecía cada vez que `memoriaRender()` reconstruía el `innerHTML` completo del panel. Al reconstruir, se creaba un nuevo span con el valor inicial, mientras el interval seguía decrementando una variable que ya no tenía nodo en el DOM donde mostrarse. Al siguiente re-render, aparecía el valor actual de la variable (ya decrementado varios segundos).

**Solución**: el `setInterval` del timer solo actualiza el texto del span `#mem-timer-val` directamente en el DOM, sin re-renderizar todo el panel. `memoriaRender()` solo se llama al voltear cartas o al cambiar el estado del tablero, nunca como efecto del timer.

### Las posiciones de las cartas cambiaban al cometer errores

**Causa**: la función de "barajar" al fallar un par reorganizaba los emojis en el array `memCartas`, cambiando qué emoji estaba en cada posición.

**Solución**: las posiciones del tablero se fijan al crear el array en `memoriaInit()` y nunca cambian. Al fallar, solo se voltean las cartas boca abajo (`memVolteadas = []`) sin tocar las posiciones. El jugador ve las mismas cartas en los mismos sitios — tiene que recordar dónde estaban.

### coins.js mostraba 100 en todos los paquetes de la tienda

**Causa**: los cuatro paquetes tenían `data-coins="100"` en el HTML.

**Solución**: los valores se cambiaron a 20, 50, 75 y 100 coins respectivamente, con precios de €0.29, €0.59, €0.79 y €0.99.

---

## Módulos JavaScript

### errores.js

Define cinco clases de error personalizadas:

```
AppError         ← base, con codigo y fecha
  ├── NetworkError   ← fallo de fetch, guarda la URL
  ├── StorageError   ← fallo de localStorage
  ├── ValidationError ← campo inválido, guarda nombre del campo
  └── AuthError      ← fallo de autenticación
```

También define `manejarError(error, contexto)` que loguea en consola con el nivel apropiado, y `storageGet/storageSet` que envuelven localStorage.

### coins.js

Objeto singleton `Coins` con métodos `get()`, `set()`, `sumar()`, `restar()`, `init()`. `_sync()` actualiza todos los elementos `[data-coins]` del DOM y añade/quita la clase `low` a los badges cuando el saldo baja de 20.

### weather.js

Objeto `Weather` con cache de 1 hora en localStorage. Hace dos fetches en secuencia: primero `ip-api.com` para ciudad y país, luego `wttr.in` para temperatura y condición. Si cualquiera falla, los campos quedan como `null` y el vector se construye igualmente.

### vector.js

`Vector.construir()` lee todos los datos de localStorage y los ensambla en un objeto con campos tipados. `Vector.guardar()` lo añade a `tabla_vectores` en localStorage, actualizando si el jugador ya existe. `Vector.COLUMNAS` define el orden y etiquetas de las columnas de la tabla HTML.

### blackjack.js

Implementa mazo, shuffle Fisher-Yates, cálculo de mano con ases flexibles (11→1 si bust), render de cartas como HTML, lógica del dealer con `async/await`, persistencia de estadísticas. Todo el código de binding de eventos y arranque está dentro de `bjInit()`.

### bart.js

Un único `setInterval` controla el tiempo global de 60 segundos para los 5 globos. Si el tiempo se agota con pompadas activas, cobra el premio del globo actual y termina. El globo crece visualmente mediante SVG dinámico — el radio aumenta con `pct = pompadas / limiteGlobo`. No muestra indicador de riesgo para no influir en la decisión del jugador. La multa al explotar es `premioMax × 0.6 × (pompadas / limiteGlobo)`.

### memoria.js

Dos timers globales: `memCuentaInt` para la cuenta regresiva del reveal inicial (5 segundos), `memTimer` para el tiempo de juego (60 segundos). Las posiciones del tablero son inmutables. El timer actualiza solo el span del DOM sin reconstruir el panel. `memoriaLimpiar()` cancela ambos timers y es llamada antes de cambiar de juego.

### frecuencias.js

Usa `AudioContext`, `OscillatorNode` y `GainNode`. El barrido es logarítmico mediante `exponentialRampToValueAtTime(FREQ_MAX, currentTime + DURACION)` — logarítmico porque así percibe el oído humano las frecuencias. `requestAnimationFrame` actualiza la barra de progreso y el display de Hz en tiempo real. Al parar, pregunta si el resultado fue correcto antes de guardarlo. La mediana de los 3 intentos es más robusta que el promedio ante valores atípicos.

---

## Sistema de economía

```
Inicio           → 100 coins
Blackjack ganado → +apuesta (5/10/25/50/100 según chip)
Blackjack natural → +apuesta × 1.5
Blackjack perdido → -apuesta
BART completado  → variable, puede ser negativo
Memoria ganada   → +10 a +40 según eficiencia
Memoria fallida  → -15
Frecuencias      → +25 por intento confirmado
Tienda           → +20 / +50 / +75 / +100 (simulado)
```

Cuando el saldo baja de 20, el badge del nav se pone rojo. A 0 coins, el modal de blackjack redirige a minijuegos o tienda.

---

## Minijuegos conductuales

### BART — Balloon Analogue Risk Task

Mide **tolerancia al riesgo**. Correlaciona con comportamiento de apuestas, consumo de sustancias y decisiones financieras impulsivas. El dato real es el BART ajustado: promedio de pompadas en globos que no explotaron (los que explotan se excluyen porque la decisión fue quitada al jugador).

Perfiles:
- Score > 15: alto buscador de riesgo
- Score 8-15: riesgo moderado
- Score < 8: averso al riesgo

### Memoria de pares

Mide **memoria de trabajo y capacidad cognitiva**. La eficiencia (pares / intentos) indica qué tan sistemática fue la exploración. Los errores (barajadas usadas) miden la retención entre turnos. El tiempo restante al completar mide velocidad de procesamiento.

### Frecuencias auditivas

Mide **edad biológica estimada**. La pérdida auditiva en frecuencias altas es acumulativa y predecible:

| Frecuencia máxima escuchada | Rango de edad estimado |
|---|---|
| ≥ 18 kHz | < 20 años |
| ≥ 15 kHz | 20–30 años |
| ≥ 12 kHz | 30–40 años |
| ≥ 8 kHz  | 40–50 años |
| ≥ 5 kHz  | 50–60 años |
| < 5 kHz  | 60+ años |

Precisión estimada ~80%. El barrido es logarítmico porque el oído humano percibe las frecuencias en escala logarítmica (igual que el volumen en decibelios).

---

## Datos recopilados

El vector final por jugador contiene:

| Campo | Fuente |
|---|---|
| jugador_id | Hash del username en login |
| username | Login |
| timestamp | Momento de guardar el vector |
| ciudad | ip-api.com |
| pais | ip-api.com |
| temperatura | wttr.in |
| condicion | wttr.in |
| bj_partidas | blackjack.js |
| bj_ganadas | blackjack.js |
| bj_perdidas | blackjack.js |
| bj_racha_max | blackjack.js |
| bart_score | bart.js (BART ajustado) |
| bart_perfil | bart.js (calculado) |
| bart_explot | bart.js |
| bart_neto | bart.js (coins ganadas/perdidas) |
| mem_resultado | memoria.js |
| mem_pares | memoria.js (pares encontrados en tiempo real) |
| mem_intentos | memoria.js |
| mem_errores | memoria.js |
| mem_eficiencia | memoria.js |
| mem_tiempo | memoria.js |
| freq_edad | frecuencias.js (mediana de 3 tests) |
| freq_hz | frecuencias.js |
| freq_tests | frecuencias.js |
| coins_actuales | coins.js |

---

## APIs externas

### ip-api.com

- URL: `http://ip-api.com/json/?fields=city,country,status`
- Sin API key
- Devuelve ciudad y país a partir de la IP del cliente
- Límite: 45 requests/minuto en el plan gratuito
- Se cachea en localStorage durante 1 hora

### wttr.in

- URL: `https://wttr.in/{ciudad}?format=j1`
- Sin API key
- Devuelve condición meteorológica actual en JSON
- Usa la ciudad obtenida de ip-api como parámetro

Ambas APIs tienen fallback silencioso mediante `manejarError()`. Si fallan, los campos de localización y weather quedan como `null` en el vector.

---

## Flujo de git

El proyecto se desarrolló con el siguiente esquema de ramas:

```
main ← commit inicial + README
  └── dev
        ├── feature/css
        │     ├── shared: variables y reset
        │     ├── shared: nav y coins badge
        │     ├── shared: botones, modal y animaciones
        │     ├── blackjack: mesa, cartas, chips
        │     ├── minijuegos: layout base y BART
        │     └── minijuegos: memoria, frecuencias y tienda
        │
        ├── feature/js
        │     ├── errores.js
        │     ├── coins.js básico
        │     ├── coins.js con sync automático
        │     ├── weather.js
        │     ├── datos.js
        │     ├── blackjack.js
        │     ├── bart.js sin timer
        │     ├── bart.js con timer global 60s
        │     ├── memoria.js sin reveal
        │     ├── memoria.js con reveal y timer
        │     ├── frecuencias.js
        │     └── vector.js
        │
        └── feature/html
              ├── login.html
              ├── index.html (sin guard)
              ├── index.html (fix redirect loop)
              ├── minijuegos.html
              ├── tienda.html (valores incorrectos)
              ├── tienda.html (fix + búsqueda)
              └── tabla.html

dev → merge css → merge js → merge html
main ← merge dev (release)
```

Los commits de bart y memoria muestran la evolución real del código: primero sin timer, luego con timer. Los commits de index.html muestran el bug del redirect loop y su corrección. Los commits de tienda muestran la corrección de los valores de coins.

---

## Notas finales

Este proyecto fue desarrollado durante un bootcamp de desarrollo web full-stack en Bilbao como ejercicio de aprendizaje de vanilla JS. El concepto de recopilar datos conductuales mediante una interfaz de juego tiene base en psicología experimental (el BART fue desarrollado por Lejuez et al., 2002) y en la crítica a los modelos de monetización de los juegos free-to-play que explotan el mismo tipo de vulnerabilidades conductuales que el BART mide.
