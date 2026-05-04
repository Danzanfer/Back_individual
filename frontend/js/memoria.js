// ── MEMORIA DE PARES ──
// Reglas:
// - Las posiciones de las cartas se fijan al inicio y NUNCA cambian
// - Al fallar un par, las cartas se voltean boca abajo pero NO cambian de posición
// - 3 barajadas máximo (=errores), a la 4ª se pierde
// - Timer de 60s para toda la partida

const EMOJIS_MEM = ['🌟','🎯','🍀','🔥','💎','🌙','⚡','🎲'];
const MAX_BARAJADAS = 3;
const TIEMPO_MEM = 60;

let memCartas, memVolteadas, memEncontrados;
let memBarajadas, memIntentos, memBloqueado;
let memTimer, memTiempo, memCuentaInt;

function memoriaLimpiar() {
  clearInterval(memTimer);
  clearInterval(memCuentaInt);
  memTimer = null;
  memCuentaInt = null;
  memBloqueado = true;
}

function memoriaInit() {
  // crear tablero con posiciones fijas
  const pares = [...EMOJIS_MEM, ...EMOJIS_MEM];
  for (let i = pares.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [pares[i],pares[j]] = [pares[j],pares[i]];
  }
  // cada carta tiene: posición fija (idx), emoji fijo, estado visible/encontrada
  memCartas     = pares.map((e, i) => ({ pos: i, emoji: e, encontrada: false, visible: false }));
  memVolteadas  = [];
  memEncontrados = 0;
  memBarajadas  = 0;
  memIntentos   = 0;
  memBloqueado  = true;
  memTiempo     = TIEMPO_MEM;
  memoriaLimpiar();

  // FASE 1: mostrar todas las cartas 5 segundos
  memoriaRevelar();
}

function memoriaRevelar() {
  const P = document.getElementById('juego-panel');
  let cuenta = 5;

  function renderReveal() {
    P.innerHTML = `
      <h2>🃏 Memoria de Pares</h2>
      <div style="font-family:var(--mono);font-size:0.65rem;color:var(--muted);text-align:center">
        Memoriza — se ocultan en <strong style="color:var(--gold);font-size:1.1rem">${cuenta}</strong>s
      </div>
      <div class="mem-grid" style="grid-template-columns:repeat(4,1fr)">
        ${memCartas.map(c => `
          <div class="mem-carta volteada" style="cursor:default">
            <div class="cara-back">🂠</div>
            <div class="cara-front">${c.emoji}</div>
          </div>`).join('')}
      </div>
    `;
  }

  renderReveal();

  memCuentaInt = setInterval(() => {
    cuenta--;
    if (cuenta <= 0) {
      clearInterval(memCuentaInt);
      memCuentaInt = null;
      memBloqueado = false;
      memoriaRender();
      memoriaIniciarTimer();
    } else {
      renderReveal();
    }
  }, 1000);
}

function memoriaIniciarTimer() {
  clearInterval(memTimer);
  memTimer = setInterval(() => {
    memTiempo--;
    // actualizar solo el span del timer sin re-renderizar todo
    const el = document.getElementById('mem-timer-val');
    if (el) {
      el.textContent = memTiempo + 's';
      el.style.color = memTiempo <= 10 ? 'var(--red)' : memTiempo <= 20 ? 'var(--gold)' : 'var(--muted)';
    }
    if (memTiempo <= 0) {
      clearInterval(memTimer);
      memoriaPerder('tiempo agotado');
    }
  }, 1000);
}

function memoriaRender(destacar = {}) {
  const P = document.getElementById('juego-panel');

  P.innerHTML = `
    <h2>🃏 Memoria de Pares</h2>

    <div class="mem-header">
      <div class="mem-stat">
        <span class="mem-stat-label">pares</span>
        <span class="mem-stat-val">${memEncontrados}/${EMOJIS_MEM.length}</span>
      </div>
      <div class="mem-stat">
        <span class="mem-stat-label">tiempo</span>
        <span class="mem-stat-val" id="mem-timer-val" style="color:var(--muted)">${memTiempo}s</span>
      </div>
      <div class="mem-stat">
        <span class="mem-stat-label">errores restantes</span>
        <span class="mem-stat-val" style="color:${memBarajadas>=MAX_BARAJADAS?'var(--red)':'var(--gold)'}">
          ${MAX_BARAJADAS - memBarajadas}
        </span>
      </div>
    </div>

    <div class="barajadas-bar">
      ${Array.from({length:MAX_BARAJADAS}, (_,i) =>
        `<div class="barajada-dot ${i < memBarajadas ? 'usada' : ''}"></div>`
      ).join('')}
    </div>

    <div class="mem-grid" style="grid-template-columns:repeat(4,1fr)">
      ${memCartas.map((c, i) => {
        const estaVisible = memVolteadas.includes(i) || c.encontrada;
        const claseExtra  = c.encontrada ? 'encontrada' : (destacar[i] || '');
        return `
          <div class="mem-carta ${estaVisible ? 'volteada' : ''} ${claseExtra}"
               data-pos="${i}">
            <div class="cara-back">🂠</div>
            <div class="cara-front">${c.emoji}</div>
          </div>`;
      }).join('')}
    </div>
  `;

  if (!memBloqueado) {
    document.querySelectorAll('.mem-carta:not(.encontrada)').forEach(el => {
      el.addEventListener('click', () => memoriaClickCarta(parseInt(el.dataset.pos)));
    });
  }
}

function memoriaClickCarta(pos) {
  if (memBloqueado) return;
  if (memVolteadas.includes(pos)) return;
  if (memCartas[pos].encontrada) return;

  memVolteadas.push(pos);
  memoriaRender();

  if (memVolteadas.length === 2) {
    memBloqueado = true;
    memIntentos++;
    const [a, b] = memVolteadas;

    if (memCartas[a].emoji === memCartas[b].emoji) {
      setTimeout(() => {
        memCartas[a].encontrada = true;
        memCartas[b].encontrada = true;
        memEncontrados++;
        memVolteadas = [];
        memBloqueado = false;
        // guardar pares en tiempo real
        guardarDato('Memoria: pares encontrados', `${memEncontrados}/${EMOJIS_MEM.length}`);
        if (memEncontrados === EMOJIS_MEM.length) {
          clearInterval(memTimer);
          memoriaGanar();
        } else {
          memoriaRender();
        }
      }, 500);
    } else {
      memoriaRender({ [a]: 'error', [b]: 'error' });
      setTimeout(() => {
        memBarajadas++;
        memVolteadas = [];
        if (memBarajadas > MAX_BARAJADAS) {
          clearInterval(memTimer);
          memoriaPerder('errores agotados');
        } else {
          memBloqueado = false;
          memoriaRender();
        }
      }, 900);
    }
  }
}

function memoriaGanar() {
  const tiempoUsado = TIEMPO_MEM - memTiempo;
  const eficiencia  = Math.round((EMOJIS_MEM.length / memIntentos) * 100);
  const coins       = Math.min(10 + Math.round(eficiencia * 0.3), 40);
  Coins.sumar(coins);
  Coins.init();
  guardarDato('Memoria: resultado',       'completado ✓');
  guardarDato('Memoria: intentos',        memIntentos);
  guardarDato('Memoria: errores',         memBarajadas);
  guardarDato('Memoria: tiempo usado',    `${tiempoUsado}s`);
  guardarDato('Memoria: eficiencia',      `${eficiencia}%`);
  guardarDato('Memoria: coins ganadas',   `+${coins} 🪙`);

  if (typeof window.marcarMinijuegoJugado === 'function') {
    window.marcarMinijuegoJugado('memoria');
  } else {
    localStorage.setItem('memoria_jugado', 'true');
  }

  const P = document.getElementById('juego-panel');
  P.innerHTML = `
    <h2>🃏 ¡Completado!</h2>
    <div class="resultado-box">
      <div class="coins-ganadas">+${coins} 🪙</div>
      <div class="resultado-detalle">
        ${EMOJIS_MEM.length} pares · ${memIntentos} intentos · ${memBarajadas} errores · ${eficiencia}% eficiencia
      </div>
    </div>
  `;
}

function memoriaPerder(motivo) {
  const multa = 15;
  Coins.restar(multa);
  Coins.init();
  const d = JSON.parse(localStorage.getItem('datos_conductuales') || '{}');
  guardarDato('Memoria: resultado',        `fallido (${motivo})`);
  guardarDato('Memoria: errores',          memBarajadas);
  guardarDato('Memoria: intentos',         memIntentos);
  guardarDato('Memoria: partidas fallidas', (parseInt(d['Memoria: partidas fallidas']||0)+1));

  if (typeof window.marcarMinijuegoJugado === 'function') {
    window.marcarMinijuegoJugado('memoria');
  } else {
    localStorage.setItem('memoria_jugado', 'true');
  }

  const P = document.getElementById('juego-panel');
  P.innerHTML = `
    <h2>🃏 ${motivo === 'tiempo agotado' ? '⏱ Tiempo agotado' : '🔥 Demasiados errores'}</h2>
    <div class="resultado-box">
      <div class="coins-perdidas">-${multa} 🪙</div>
      <div class="resultado-detalle">${motivo === 'tiempo agotado' ? 'Se acabó el tiempo.' : 'Cuatro errores — tablero destruido.'}</div>
    </div>
  `;
}
