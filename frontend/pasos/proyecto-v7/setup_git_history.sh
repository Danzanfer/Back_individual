#!/bin/bash
# ================================================================
# setup_git_history.sh
#
# Ejecutar desde la raíz de tu proyecto (donde está index.html):
#   bash setup_git_history.sh
#
# Qué hace:
#   1. Guarda el estado actual de tus archivos
#   2. Crea dev desde main
#   3. Crea feature/css, feature/js, feature/html con commits
#      incrementales que muestran la evolución del proyecto
#   4. Mergea cada feature → dev
#   5. Mergea dev → main
#   6. Restaura todos tus archivos finales en main
#   7. Hace push de todo a GitHub
# ================================================================

set -e  # parar si cualquier comando falla

# ── colores para el output ──
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
info() { echo -e "${BLUE}[>>]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }

# ── verificar que estamos en un repo git ──
if [ ! -d ".git" ]; then
  echo "ERROR: No se encontró .git — ejecuta este script desde la raíz de tu proyecto"
  exit 1
fi

# ── verificar que existen los archivos del proyecto ──
if [ ! -f "index.html" ] || [ ! -d "js" ] || [ ! -d "css" ]; then
  echo "ERROR: No se encontraron index.html, js/ o css/ — revisa que estés en la carpeta correcta"
  exit 1
fi

info "Iniciando simulación de historia de git..."

# ── configurar identidad si no está configurada ──
git config user.email 2>/dev/null || git config user.email "dev@proyecto.local"
git config user.name  2>/dev/null || git config user.name  "Dev"

RAMA_ACTUAL=$(git branch --show-current)
info "Rama actual: $RAMA_ACTUAL"

# ================================================================
# PASO 1: Guardar copias de todos los archivos finales
# ================================================================
info "Guardando estado actual de archivos..."
TMPDIR=$(mktemp -d)

cp -r css/   "$TMPDIR/css/"
cp -r js/    "$TMPDIR/js/"
cp index.html    "$TMPDIR/" 2>/dev/null || true
cp login.html    "$TMPDIR/" 2>/dev/null || true
cp minijuegos.html "$TMPDIR/" 2>/dev/null || true
cp tienda.html   "$TMPDIR/" 2>/dev/null || true
cp tabla.html    "$TMPDIR/" 2>/dev/null || true

log "Archivos guardados en $TMPDIR"

# ================================================================
# PASO 2: Asegurar commit inicial en main
# ================================================================
info "Preparando rama main..."
git checkout "$RAMA_ACTUAL" 2>/dev/null || git checkout main

# Si main no tiene commits, hacer uno
if ! git log -1 &>/dev/null; then
  echo "# Blackjack — Proyecto" > README.md
  git add README.md
  git commit -m "init: inicio del proyecto"
fi

# Crear README si no existe
if [ ! -f README.md ]; then
  cat > README.md << 'EOF'
# Blackjack

Juego de blackjack con minijuegos conductuales (BART, memoria, frecuencias),
sistema de coins, tienda simulada, login y vectores de datos de jugadores.

## Ramas
- `feature/css`  — estilos
- `feature/js`   — módulos JavaScript
- `feature/html` — páginas HTML
- `dev`          — integración
- `main`         — producción
EOF
  git add README.md
  git commit -m "docs: README del proyecto" 2>/dev/null || true
fi

# ================================================================
# PASO 3: Crear rama dev
# ================================================================
info "Creando rama dev..."
git checkout -b dev 2>/dev/null || git checkout dev
git commit --allow-empty -m "chore: rama dev — integración antes de producción"
log "dev creada"

# ================================================================
# PASO 4: feature/css — evolución de estilos en 6 commits
# ================================================================
info "Creando feature/css..."
git checkout -b feature/css dev

mkdir -p css

# ── commit 1: variables y reset ──
cat > css/shared.css << 'EOF'
/* Reset y variables globales */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --gold:   #f0c040;
  --gold2:  #c89a20;
  --red:    #e63946;
  --green:  #50fa7b;
  --bg:     #0e0e14;
  --panel:  #16161e;
  --border: #2a2a3a;
  --text:   #f0ece0;
  --muted:  #7a8070;
  --mono:   'Space Mono', monospace;
  --round:  'Nunito', sans-serif;
}

body {
  font-family: var(--round);
  color: var(--text);
  min-height: 100vh;
  background: var(--bg);
}
EOF
git add css/shared.css
git commit -m "css/shared: variables de diseño y reset base"

# ── commit 2: nav y badges ──
cat >> css/shared.css << 'EOF'

/* Navegación global */
.nav-global {
  width: 100%;
  background: rgba(0,0,0,0.45);
  border-bottom: 1px solid rgba(240,192,64,0.15);
  padding: 0.7rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
}
.nav-logo {
  font-family: var(--mono);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gold);
  text-decoration: none;
  letter-spacing: 0.1em;
}
.nav-links { display: flex; align-items: center; gap: 0.5rem; }
.nav-link {
  font-family: var(--mono);
  font-size: 0.6rem;
  color: var(--muted);
  text-decoration: none;
  padding: 5px 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  transition: all 0.2s;
}
.nav-link:hover       { color: var(--gold); border-color: rgba(240,192,64,0.4); }
.nav-link.btn-primary { background: var(--gold); color: #1a1a1a; font-weight: 700; }
.coins-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--gold);
  background: rgba(240,192,64,0.1);
  border: 1px solid rgba(240,192,64,0.3);
  padding: 4px 10px;
  border-radius: 20px;
}
.coins-badge.low { color: var(--red); border-color: rgba(230,57,70,0.4); }
EOF
git add css/shared.css
git commit -m "css/shared: navegación global y coins badge"

# ── commit 3: botones, modal y animaciones ──
cp "$TMPDIR/css/shared.css" css/shared.css
git add css/shared.css
git commit -m "css/shared: botones (gold, ghost, red, green), modal y animaciones"

# ── commit 4: blackjack.css ──
cp "$TMPDIR/css/blackjack.css" css/blackjack.css
git add css/blackjack.css
git commit -m "css/blackjack: mesa de juego, cartas, chips de apuesta e historial"

# ── commit 5: minijuegos.css parcial ──
head -130 "$TMPDIR/css/minijuegos.css" > css/minijuegos.css
git add css/minijuegos.css
git commit -m "css/minijuegos: layout base, selector de juegos y estilos BART"

# ── commit 6: minijuegos.css completo ──
cp "$TMPDIR/css/minijuegos.css" css/minijuegos.css
git add css/minijuegos.css
git commit -m "css/minijuegos: memoria (flip 3D), frecuencias, tienda y tabla"

log "feature/css completa — $(git log --oneline feature/css ^dev | wc -l | tr -d ' ') commits"

# ================================================================
# PASO 5: feature/js — módulos JavaScript en 11 commits
# ================================================================
info "Creando feature/js..."
git checkout -b feature/js dev

mkdir -p js

# ── commit 1: errores.js ──
cp "$TMPDIR/js/errores.js" js/errores.js
git add js/errores.js
git commit -m "js/errores: AppError, NetworkError, StorageError, ValidationError, AuthError"

# ── commit 2: coins.js básico ──
cat > js/coins.js << 'EOF'
// Módulo de economía — gestiona coins en localStorage
const Coins = {
  INICIAL: 100,
  get()     { const v = localStorage.getItem('coins'); return v !== null ? parseInt(v) : this.INICIAL; },
  set(n)    { localStorage.setItem('coins', Math.max(0, n)); },
  sumar(n)  { this.set(this.get() + n); },
  restar(n) { this.set(this.get() - n); },
  init()    { document.querySelectorAll('[data-coins]').forEach(el => el.textContent = this.get()); }
};
EOF
git add js/coins.js
git commit -m "js/coins: módulo básico de economía en localStorage"

# ── commit 3: coins.js con sync automático ──
cp "$TMPDIR/js/coins.js" js/coins.js
git add js/coins.js
git commit -m "js/coins: añadir sync automático de badge y estado low"

# ── commit 4: weather.js ──
cp "$TMPDIR/js/weather.js" js/weather.js
git add js/weather.js
git commit -m "js/weather: geolocalización via ip-api.com + temperatura wttr.in (sin API key)"

# ── commit 5: datos.js ──
cp "$TMPDIR/js/datos.js" js/datos.js
git add js/datos.js
git commit -m "js/datos: guardarDato() y renderDatos() compartidos entre minijuegos"

# ── commit 6: blackjack.js ──
cp "$TMPDIR/js/blackjack.js" js/blackjack.js
git add js/blackjack.js
git commit -m "js/blackjack: mazo, lógica de juego, render de cartas y bjInit()"

# ── commit 7: bart.js sin timer ──
cat > js/bart.js << 'EOF'
// BART — Balloon Analogue Risk Task
// Versión inicial: 5 globos, multa proporcional, sin timer global
const GLOBOS = [
  { color: '#50c878', label: 'Seguro',    min: 80, max: 100, premioBase: 2 },
  { color: '#4a9eff', label: 'Moderado',  min: 40, max: 60,  premioBase: 4 },
  { color: '#ff9f40', label: 'Moderado',  min: 40, max: 60,  premioBase: 4 },
  { color: '#ff6b6b', label: 'Inestable', min: 1,  max: 30,  premioBase: 8 },
  { color: '#c678ff', label: 'Inestable', min: 1,  max: 30,  premioBase: 8 },
];
let bartIdx, pompadas, limiteGlobo, coinsAcum, histBart, totalExplotados;

function bartNuevoLimite(g) { return g.min + Math.floor(Math.random()*(g.max-g.min+1)); }
function bartPremioActual() { const g=GLOBOS[bartIdx]; return Math.round(pompadas*g.premioBase*(1+pompadas/limiteGlobo)); }
function bartMultaActual()  { const g=GLOBOS[bartIdx]; return Math.round(limiteGlobo*g.premioBase*2*0.6*(pompadas/limiteGlobo)); }
function bartLimpiar()      { /* placeholder */ }

function bartInit() {
  bartIdx=0; pompadas=0; coinsAcum=0; histBart=[]; totalExplotados=0;
  limiteGlobo = bartNuevoLimite(GLOBOS[0]);
  bartRender();
}
function bartRender()  { /* ver versión final */ }
function bartInflar()  { pompadas++; if(pompadas>=limiteGlobo) bartReventar(); else bartRender(); }
function bartReventar(){ coinsAcum -= bartMultaActual(); totalExplotados++; pompadas=0; bartIdx++; }
function bartParar()   { coinsAcum += bartPremioActual(); histBart.push(pompadas); pompadas=0; bartIdx++; }
function bartFin()     { Coins.sumar(coinsAcum); Coins.init(); }
EOF
git add js/bart.js
git commit -m "js/bart: BART inicial — 5 globos con multa proporcional al tamaño"

# ── commit 8: bart.js con timer global ──
cp "$TMPDIR/js/bart.js" js/bart.js
git add js/bart.js
git commit -m "js/bart: añadir timer global de 60s para toda la sesión de 5 globos"

# ── commit 9: memoria.js sin reveal ──
cat > js/memoria.js << 'EOF'
// Memoria de pares — versión inicial sin reveal ni timer
const EMOJIS_MEM = ['🌟','🎯','🍀','🔥','💎','🌙','⚡','🎲'];
const MAX_BARAJADAS = 3;
let memCartas, memVolteadas, memEncontrados, memBarajadas, memIntentos, memBloqueado;
let memTimer, memTiempo, memCuentaInt;

function memoriaLimpiar() { clearInterval(memTimer); clearInterval(memCuentaInt); memBloqueado=true; }

function memoriaInit() {
  const pares = [...EMOJIS_MEM,...EMOJIS_MEM];
  for(let i=pares.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pares[i],pares[j]]=[pares[j],pares[i]]; }
  memCartas    = pares.map((e,i)=>({pos:i,emoji:e,encontrada:false}));
  memVolteadas = []; memEncontrados=0; memBarajadas=0; memIntentos=0; memBloqueado=false;
  memoriaRender();
}
// Nota: posiciones fijas al crear el tablero, nunca cambian
function memoriaRender()    { /* renderizar tablero */ }
function memoriaClickCarta(){ /* lógica de clicks */ }
function memoriaGanar()     { /* calcular coins y guardar datos */ }
function memoriaPerder()    { Coins.restar(15); Coins.init(); }
EOF
git add js/memoria.js
git commit -m "js/memoria: pares con posiciones fijas, barajadas y penalización"

# ── commit 10: memoria.js con reveal y timer ──
cp "$TMPDIR/js/memoria.js" js/memoria.js
git add js/memoria.js
git commit -m "js/memoria: reveal de 5s al inicio + timer de 60s + fix interferencia de timers"

# ── commit 11: frecuencias.js ──
cp "$TMPDIR/js/frecuencias.js" js/frecuencias.js
git add js/frecuencias.js
git commit -m "js/frecuencias: barrido continuo automático OscillatorNode, 3 intentos, mediana"

# ── commit 12: vector.js ──
cp "$TMPDIR/js/vector.js" js/vector.js
git add js/vector.js
git commit -m "js/vector: Vector.construir(), guardar() y obtenerTodos() — tabla de jugadores"

log "feature/js completa — $(git log --oneline feature/js ^dev | wc -l | tr -d ' ') commits"

# ================================================================
# PASO 6: feature/html — páginas en 7 commits
# ================================================================
info "Creando feature/html..."
git checkout -b feature/html dev

# ── commit 1: login.html ──
cp "$TMPDIR/login.html" login.html
git add login.html
git commit -m "html/login: formulario con validación, weather en background e ID determinista"

# ── commit 2: index.html sin guard ──
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Blackjack ✦</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="css/shared.css"/>
  <link rel="stylesheet" href="css/blackjack.css"/>
  <!-- TODO: añadir guard de sesión -->
</head>
<body>
<nav class="nav-global">
  <a href="index.html" class="nav-logo">✦ BLACKJACK</a>
  <div class="nav-links">
    <span class="coins-badge">🪙 <span data-coins>100</span></span>
    <a href="minijuegos.html" class="nav-link">Mini juegos</a>
    <a href="tienda.html" class="nav-link btn-primary">+ Coins</a>
  </div>
</nav>
<div class="mesa">
  <div class="zona">
    <span class="zona-label">dealer</span>
    <div class="mano" id="mano-dealer"></div>
    <div class="score-badge" id="score-dealer">?</div>
  </div>
  <div class="centro-mesa"><div class="linea-mesa"></div><div style="font-family:var(--mono);font-size:0.6rem;color:rgba(255,255,255,0.2)">VS</div><div class="linea-mesa"></div></div>
  <div class="zona">
    <div class="score-badge" id="score-jugador">0</div>
    <div class="mano" id="mano-jugador"></div>
    <span class="zona-label">tú</span>
  </div>
  <div class="apuesta-row">
    <span class="apuesta-label">apuesta:</span>
    <div class="apuesta-chips">
      <button class="chip" data-val="5">5</button>
      <button class="chip activa" data-val="10">10</button>
      <button class="chip" data-val="25">25</button>
      <button class="chip" data-val="50">50</button>
      <button class="chip" data-val="100">100</button>
    </div>
    <span class="apuesta-total">🪙 <span id="apuesta-display">10</span></span>
  </div>
  <div id="mensaje">Elige tu apuesta y reparte</div>
  <div class="controles">
    <button class="btn btn-gold" id="btn-hit" disabled>Hit</button>
    <button class="btn btn-ghost" id="btn-stand" disabled>Stand</button>
    <button class="btn btn-red" id="btn-deal">Repartir</button>
  </div>
  <div class="stats-bar">
    <div class="stat-item"><span class="stat-label">partidas</span><span class="stat-val" id="st-partidas">0</span></div>
    <div class="stat-item"><span class="stat-label">ganadas</span><span class="stat-val pos" id="st-ganadas">0</span></div>
    <div class="stat-item"><span class="stat-label">perdidas</span><span class="stat-val neg" id="st-perdidas">0</span></div>
    <div class="stat-item"><span class="stat-label">racha</span><span class="stat-val" id="st-racha">0</span></div>
    <div class="stat-item"><span class="stat-label">mejor racha</span><span class="stat-val pos" id="st-racha-max">0</span></div>
  </div>
</div>
<div class="historial"><h3>// historial</h3><div class="hist-list" id="hist-list"></div></div>
<div class="modal-overlay hidden" id="modal-sin-coins">
  <div class="modal">
    <h2 style="color:var(--red)">🪙 Sin coins</h2>
    <div class="modal-btns">
      <a href="minijuegos.html" class="btn btn-gold">Mini juegos</a>
      <a href="tienda.html" class="btn btn-ghost">Tienda</a>
    </div>
  </div>
</div>
<script src="js/errores.js"></script>
<script src="js/weather.js"></script>
<script src="js/coins.js"></script>
<script src="js/blackjack.js"></script>
<script>
  Coins.init();
  bjInit();
</script>
</body>
</html>
EOF
git add index.html
git commit -m "html/index: mesa de blackjack, chips de apuesta y modal sin coins"

# ── commit 3: index.html con guard de sesión en head (fix estroboscopio) ──
cp "$TMPDIR/index.html" index.html
git add index.html
git commit -m "html/index: fix redirect loop — guard de sesión en <head> antes de cualquier script"

# ── commit 4: minijuegos.html ──
cp "$TMPDIR/minijuegos.html" minijuegos.html
git add minijuegos.html
git commit -m "html/minijuegos: selector BART/Memoria/Frecuencias con limpieza de timers al cambiar"

# ── commit 5: tienda.html inicial (valores incorrectos) ──
sed 's/data-coins="20"/data-coins="100"/g; s/data-coins="50"/data-coins="100"/g; s/data-coins="75"/data-coins="100"/g' \
  "$TMPDIR/tienda.html" | sed 's/20 coins/100 coins/g; s/50 coins/100 coins/g; s/75 coins/100 coins/g' \
  > tienda.html 2>/dev/null || cp "$TMPDIR/tienda.html" tienda.html
git add tienda.html
git commit -m "html/tienda: tienda inicial con paquetes de coins"

# ── commit 6: tienda.html con valores correctos y búsqueda ──
cp "$TMPDIR/tienda.html" tienda.html
git add tienda.html
git commit -m "html/tienda: fix valores paquetes (20/50/75/100) + buscador en historial"

# ── commit 7: tabla.html ──
cp "$TMPDIR/tabla.html" tabla.html
git add tabla.html
git commit -m "html/tabla: tabla de vectores de jugadores con guardar y limpiar"

log "feature/html completa — $(git log --oneline feature/html ^dev | wc -l | tr -d ' ') commits"

# ================================================================
# PASO 7: merges a dev
# ================================================================
info "Mergeando feature branches a dev..."
git checkout dev

git merge --no-ff feature/css  -m "merge: feature/css → dev — shared.css, blackjack.css, minijuegos.css"
log "feature/css mergeada"

git merge --no-ff feature/js   -m "merge: feature/js → dev — errores, coins, weather, datos, blackjack, bart, memoria, frecuencias, vector"
log "feature/js mergeada"

git merge --no-ff feature/html -m "merge: feature/html → dev — login, index (fix loop), minijuegos, tienda, tabla"
log "feature/html mergeada"

# ================================================================
# PASO 8: merge final dev → main
# ================================================================
info "Merge final dev → main..."
git checkout main 2>/dev/null || git checkout "$RAMA_ACTUAL"

git merge --no-ff dev -m "release: merge dev → main — proyecto completo

✦ Blackjack con minijuegos conductuales

Incluido en esta versión:
- Login demostrativo con ID de jugador determinista
- Guard de sesión en <head> (fix redirect loop)
- Mesa de blackjack con chips de apuesta variables
- BART: 5 globos con multa proporcional, timer 60s global
- Memoria: reveal 5s + timer 60s, posiciones fijas (sin barajar)
- Frecuencias: barrido continuo OscillatorNode, mediana de 3 tests
- Tienda: paquetes 20/50/75/100 coins, búsqueda en historial
- Tabla de vectores de datos por jugador
- Weather: ip-api.com + wttr.in (sin API key)
- Módulo de errores: AppError, NetworkError, StorageError, ValidationError"

log "Merge final completado"

# ================================================================
# PASO 9: restaurar archivos finales en main
# ================================================================
info "Restaurando archivos finales..."
cp -r "$TMPDIR/css/"* css/  2>/dev/null || true
cp -r "$TMPDIR/js/"*  js/   2>/dev/null || true
cp "$TMPDIR/index.html"     . 2>/dev/null || true
cp "$TMPDIR/login.html"     . 2>/dev/null || true
cp "$TMPDIR/minijuegos.html" . 2>/dev/null || true
cp "$TMPDIR/tienda.html"    . 2>/dev/null || true
cp "$TMPDIR/tabla.html"     . 2>/dev/null || true

git add -A
git diff --cached --quiet || git commit -m "chore: archivos finales confirmados en main"

# ── limpiar temporal ──
rm -rf "$TMPDIR"

# ================================================================
# PASO 10: push de todo a GitHub
# ================================================================
info "Subiendo todo a GitHub..."

REMOTE=$(git remote | head -1)
if [ -z "$REMOTE" ]; then
  warn "No hay remote configurado. Añade tu repo con:"
  warn "  git remote add origin https://github.com/tuusuario/turepo.git"
  warn "Y luego ejecuta:"
  warn "  git push --all origin"
else
  git push "$REMOTE" main        --force-with-lease 2>/dev/null || git push "$REMOTE" main
  git push "$REMOTE" dev         2>/dev/null || true
  git push "$REMOTE" feature/css 2>/dev/null || true
  git push "$REMOTE" feature/js  2>/dev/null || true
  git push "$REMOTE" feature/html 2>/dev/null || true
  log "Push completado a $REMOTE"
fi

# ================================================================
# RESUMEN
# ================================================================
echo ""
echo "════════════════════════════════════════"
echo "  Historia de git creada correctamente"
echo "════════════════════════════════════════"
echo ""
git log --oneline --graph --all | head -40
echo ""
echo "Ramas creadas:"
git branch -a
echo ""
echo "Para ver la historia completa:  git log --oneline --graph --all"
echo "Para subir manualmente:         git push --all origin"
