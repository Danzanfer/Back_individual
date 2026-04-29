// ── BART — timer global de 60s para los 5 globos ──

const GLOBOS = [
  { color: '#50c878', label: 'Seguro',    min: 15, max: 25, premioBase: 2 },
  { color: '#4a9eff', label: 'Moderado',  min: 10, max: 20,  premioBase: 4 },
  { color: '#ff9f40', label: 'Moderado',  min: 8, max: 15,  premioBase: 4 },
  { color: '#ff6b6b', label: 'Inestable', min: 3,  max: 10,  premioBase: 8 },
  { color: '#c678ff', label: 'Inestable', min: 1,  max: 6,  premioBase: 8 },
];

const TIEMPO_TOTAL = 60;

let bartIdx, pompadas, limiteGlobo, coinsAcum, histBart, totalExplotados;
let timerBART, tiempoRestante;

function bartLimpiar() {
  clearInterval(timerBART);
  timerBART = null;
}

function bartInit() {
  bartIdx        = 0;
  pompadas       = 0;
  coinsAcum      = 0;
  histBart       = [];
  totalExplotados = 0;
  tiempoRestante = TIEMPO_TOTAL;
  clearInterval(timerBART);
  
  mezclarGlobos(GLOBOS);

  limiteGlobo = bartNuevoLimite(GLOBOS[0]);
  bartRender();
  bartIniciarTimer();
}

function bartNuevoLimite(g) {
  return g.min + Math.floor(Math.random() * (g.max - g.min + 1));
}

function bartPremioActual() {
  const g = GLOBOS[bartIdx];
  return Math.round(pompadas * g.premioBase * (1 + pompadas / limiteGlobo));
}

function bartMultaActual() {
  const g = GLOBOS[bartIdx];
  const max = Math.round(limiteGlobo * g.premioBase * 2);
  return Math.round(max * 0.6 * (pompadas / limiteGlobo));
}

function bartIniciarTimer() {
  clearInterval(timerBART);
  timerBART = setInterval(() => {
    tiempoRestante--;
    bartActualizarTimer();
    if (tiempoRestante <= 0) {
      clearInterval(timerBART);
      // tiempo agotado — cobrar lo acumulado y terminar
      if (pompadas > 0) {
        // el globo actual: parar automáticamente
        const premio = bartPremioActual();
        histBart.push(pompadas);
        coinsAcum += premio;
      }
      bartFin();
    }
  }, 1000);
}

function bartActualizarTimer() {
  const el = document.getElementById('bart-timer-val');
  if (!el) return;
  el.textContent = tiempoRestante + 's';
  const timerEl = document.getElementById('bart-timer-wrap');
  if (timerEl) timerEl.className = 'timer-global' + (tiempoRestante <= 10 ? ' urgente' : '');
}

function bartRender() {
  const P = document.getElementById('juego-panel');
  if (bartIdx >= 5) { bartFin(); return; }

  const g   = GLOBOS[bartIdx];
  const pct = Math.min(pompadas / limiteGlobo, 1);
  const r   = 28 + pct * 80;

  P.innerHTML = `
    <h2>🎈 BART — Globo ${bartIdx+1}/5</h2>

    <div id="bart-timer-wrap" class="timer-global">
      ⏱ <span id="bart-timer-val">${tiempoRestante}s</span> restantes
    </div>

    <div style="font-family:var(--mono);font-size:0.6rem;color:var(--muted)">
    
    </div>

    <div class="globo-escena">
      <svg width="${Math.max(r*2+24,120)}" height="${Math.max(r*2+50,140)}"
           viewBox="0 0 ${r*2+24} ${r*2+50}">
        <ellipse cx="${r+12}" cy="${r*2+42}" rx="${r*0.55}" ry="${r*0.12}" fill="rgba(0,0,0,0.35)"/>
        <circle  cx="${r+12}" cy="${r+12}"   r="${r}" fill="${g.color}" opacity="${0.75+pct*0.2}"/>
        <ellipse cx="${r*0.6+12}" cy="${r*0.55+12}" rx="${r*0.18}" ry="${r*0.11}" fill="white" opacity="0.35"/>
        <path    d="M${r+12} ${r*2+12} Q${r+22} ${r*2+30} ${r+12} ${r*2+46}"
                 stroke="${g.color}" stroke-width="1.5" fill="none" opacity="0.7"/>
      </svg>
    </div>

    <div class="globo-stats">
      <div class="gs"><span class="gs-label">pompadas</span><span class="gs-val gold">${pompadas}</span></div>
      <div class="gs"><span class="gs-label">premio si paras</span><span class="gs-val pos">+${bartPremioActual()} 🪙</span></div>
      <div class="gs"><span class="gs-label">multa si explota</span><span class="gs-val neg">-${bartMultaActual()} 🪙</span></div>
      <div class="gs"><span class="gs-label">acumulado</span><span class="gs-val ${coinsAcum>=0?'pos':'neg'}">${coinsAcum>=0?'+':''}${coinsAcum} 🪙</span></div>
    </div>

    <div class="bart-btns">
      <button class="btn btn-gold"  id="bart-inflar">Inflar 🎈</button>
      <button class="btn btn-ghost" id="bart-parar" ${pompadas===0?'disabled':''}>
        Parar (+${bartPremioActual()} 🪙)
      </button>
    </div>
  `;

  document.getElementById('bart-inflar').addEventListener('click', bartInflar);
  document.getElementById('bart-parar').addEventListener('click',  bartParar);
}

function bartInflar() {
  pompadas++;
  if (pompadas >= limiteGlobo) {
    bartReventar();
  } else {
    bartRender();
  }
}

function bartReventar() {
  const multa = bartMultaActual();
  coinsAcum -= multa;
  totalExplotados++;
  pompadas = 0;
  bartIdx++;

  const P = document.getElementById('juego-panel');
  P.innerHTML = `
    <h2>💥 ¡Explotó!</h2>
    <div id="bart-timer-wrap" class="timer-global">⏱ <span id="bart-timer-val">${tiempoRestante}s</span> restantes</div>
    <div style="font-size:4rem">💥</div>
    <div class="resultado-box">
      <div class="coins-perdidas">-${multa} 🪙</div>
      <div class="resultado-detalle">Acumulado: <strong style="color:${coinsAcum>=0?'var(--green)':'var(--red)'}">${coinsAcum>=0?'+':''}${coinsAcum} 🪙</strong></div>
    </div>
    <button class="btn btn-gold" id="bart-sig">${bartIdx < 5 ? 'Siguiente globo →' : 'Ver resultados'}</button>
  `;

  document.getElementById('bart-sig').addEventListener('click', () => {
    if (bartIdx >= 5) bartFin();
    else {
      limiteGlobo = bartNuevoLimite(GLOBOS[bartIdx]);
      bartRender();
    }
  });
}

function bartParar() {
  const premio = bartPremioActual();
  histBart.push(pompadas);
  coinsAcum += premio;
  pompadas = 0;
  bartIdx++;
  if (bartIdx >= 5) bartFin();
  else {
    limiteGlobo = bartNuevoLimite(GLOBOS[bartIdx]);
    bartRender();
  }
}

function bartFin() {
  clearInterval(timerBART);
  const P = document.getElementById('juego-panel');

  const ajustado = histBart.length
    ? (histBart.reduce((a,b)=>a+b,0)/histBart.length).toFixed(1)
    : 0;
  const perfil = ajustado > 15 ? 'alto buscador de riesgo'
               : ajustado > 8  ? 'riesgo moderado'
               : 'averso al riesgo';

  Coins.sumar(coinsAcum);
  Coins.init();
  guardarDato('BART: score ajustado',    `${ajustado} pompadas/globo`);
  guardarDato('BART: perfil de riesgo',  perfil);
  guardarDato('BART: globos explotados', `${totalExplotados}/5`);
  guardarDato('BART: resultado neto',    `${coinsAcum>=0?'+':''}${coinsAcum} 🪙`);

  P.innerHTML = `
    <h2>🎈 BART completado</h2>
    <div class="resultado-box">
      ${coinsAcum >= 0
        ? `<div class="coins-ganadas">+${coinsAcum} 🪙</div>`
        : `<div class="coins-perdidas">${coinsAcum} 🪙</div>`}
      <div class="resultado-detalle">
        Score: ${ajustado} pompadas/globo · Explotados: ${totalExplotados}/5
      </div>
    </div>
    <div style="font-family:var(--mono);font-size:0.65rem;color:var(--gold)">Perfil: ${perfil}</div>
    <button class="btn btn-gold" id="bart-replay">Jugar de nuevo</button>
  `;
  document.getElementById('bart-replay').addEventListener('click', bartInit);
}


function mezclarGlobos(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
