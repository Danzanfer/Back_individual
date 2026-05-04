// ── FRECUENCIAS AUDITIVAS ──
// Barrido automático de 20Hz a 20000Hz
// El tono sube solo — el jugador presiona cuando deja de escucharlo
// 3 intentos máximo, resultado = mediana de los 3

const FREQ_MIN  = 200;    // empezar en 200Hz (claramente audible)
const FREQ_MAX  = 20000;
const DURACION  = 25000;  // 25 segundos de barrido
const MAX_INTENTOS_FREQ = 3;

let freqCtx, freqOsc, freqGain;
let freqActual, freqBarriendo, freqAnimFrame;
let freqInicioMs, freqResultados;

function frecuenciasInit() {
  freqBarriendo  = false;
  freqActual     = FREQ_MIN;
  freqResultados = JSON.parse(localStorage.getItem('freq_resultados') || '[]');
  frecuenciasRender();
}

function frecuenciasRender() {
  const P = document.getElementById('juego-panel');
  const hechos = freqResultados.length;
  const quedan = MAX_INTENTOS_FREQ - hechos;

  if (hechos >= MAX_INTENTOS_FREQ) {
    frecuenciasMostrarFinal();
    return;
  }

  P.innerHTML = `
    <h2>👂 Frecuencias</h2>

    <div class="freq-intentos">
      <span>intentos:</span>
      ${Array.from({length:MAX_INTENTOS_FREQ}, (_,i) =>
        `<div class="intento-dot ${i < hechos ? 'hecho' : i === hechos ? 'activo' : ''}"></div>`
      ).join('')}
      <span style="color:var(--muted)">${quedan} restante${quedan>1?'s':''}</span>
    </div>

    <div class="freq-wrap">
      <div class="freq-display" id="freq-display">— Hz</div>

      <div class="freq-barra-wrap">
        <div class="freq-barra-track">
          <div class="freq-barra-fill" id="freq-barra" style="width:0%"></div>
        </div>
        <div class="freq-labels">
          <span>200 Hz</span>
          <span>5 kHz</span>
          <span>10 kHz</span>
          <span>20 kHz</span>
        </div>
      </div>

      <div style="font-family:var(--mono);font-size:0.62rem;color:var(--muted);text-align:center" id="freq-instruccion">
        Pulsa INICIAR — el tono subirá solo.<br>Presiona el botón rojo cuando dejes de escucharlo.
      </div>

      <button class="btn btn-gold"  id="freq-iniciar">▶ Iniciar barrido</button>
      <button class="btn btn-red"   id="freq-ya-no"   style="display:none">🔇 Ya no lo escucho</button>
      <button class="btn btn-ghost" id="freq-repetir"  style="display:none">Repetir este intento</button>
    </div>
  `;

  document.getElementById('freq-iniciar').addEventListener('click', frecuenciasIniciar);
}

function frecuenciasIniciar() {
  // iniciar AudioContext
  if (!freqCtx) freqCtx = new (window.AudioContext || window.webkitAudioContext)();

  freqOsc  = freqCtx.createOscillator();
  freqGain = freqCtx.createGain();
  freqOsc.connect(freqGain);
  freqGain.connect(freqCtx.destination);

  freqOsc.type = 'sine';
  freqOsc.frequency.setValueAtTime(FREQ_MIN, freqCtx.currentTime);

  // fade in suave
  freqGain.gain.setValueAtTime(0, freqCtx.currentTime);
  freqGain.gain.linearRampToValueAtTime(0.3, freqCtx.currentTime + 0.3);

  // barrido logarítmico de FREQ_MIN a FREQ_MAX en DURACION ms
  freqOsc.frequency.exponentialRampToValueAtTime(
    FREQ_MAX,
    freqCtx.currentTime + DURACION / 1000
  );

  freqOsc.start();
  freqInicioMs = performance.now();
  freqBarriendo = true;

  // actualizar UI
  document.getElementById('freq-iniciar').style.display = 'none';
  document.getElementById('freq-ya-no').style.display   = '';
  document.getElementById('freq-repetir').style.display = '';
  document.getElementById('freq-instruccion').textContent = 'El tono está subiendo... presiona cuando no lo escuches.';

  document.getElementById('freq-ya-no').addEventListener('click', frecuenciasParar);
  document.getElementById('freq-repetir').addEventListener('click', frecuenciasRepetir);

  // animación de la barra y display
  function animar() {
    if (!freqBarriendo) return;
    const elapsed = performance.now() - freqInicioMs;
    const pct     = Math.min(elapsed / DURACION, 1);

    // frecuencia actual (escala logarítmica)
    const hz = FREQ_MIN * Math.pow(FREQ_MAX / FREQ_MIN, pct);
    freqActual = hz;

    const display = document.getElementById('freq-display');
    const barra   = document.getElementById('freq-barra');
    if (display) {
      display.textContent = hz < 1000
        ? Math.round(hz) + ' Hz'
        : (hz/1000).toFixed(1) + ' kHz';
      display.className = 'freq-display activo';
    }
    if (barra) barra.style.width = (pct * 100) + '%';

    // si llegó al máximo sin que el jugador presione — guardar 20kHz
    if (pct >= 1) {
      freqBarriendo = false;
      frecuenciasConfirmarResultado(FREQ_MAX, '20 kHz (máximo)');
      return;
    }

    freqAnimFrame = requestAnimationFrame(animar);
  }

  freqAnimFrame = requestAnimationFrame(animar);
}

function frecuenciasParar() {
  if (!freqBarriendo) return;
  freqBarriendo = false;
  cancelAnimationFrame(freqAnimFrame);

  // fade out
  freqGain.gain.linearRampToValueAtTime(0, freqCtx.currentTime + 0.2);
  setTimeout(() => { try { freqOsc.stop(); } catch(e) {} }, 250);

  const hz    = freqActual;
  const label = hz < 1000 ? Math.round(hz) + ' Hz' : (hz/1000).toFixed(1) + ' kHz';

  // actualizar display como parado
  const display = document.getElementById('freq-display');
  if (display) { display.textContent = label; display.className = 'freq-display'; }
  const barra = document.getElementById('freq-barra');
  // mantener posición

  document.getElementById('freq-ya-no').style.display   = 'none';
  document.getElementById('freq-iniciar').style.display = 'none';

  frecuenciasConfirmarResultado(hz, label);
}

function frecuenciasConfirmarResultado(hz, label) {
  const P = document.getElementById('juego-panel');
  const edad = frecuenciasEdad(hz);
  const hechos = freqResultados.length;

  // preguntar si fue correcto antes de guardar
  const existente = P.querySelector('.freq-wrap');
  if (existente) {
    // añadir botones de confirmación al panel existente
    const confirmDiv = document.createElement('div');
    confirmDiv.style.cssText = 'display:flex;gap:0.8rem;flex-wrap:wrap;justify-content:center;margin-top:0.5rem';
    confirmDiv.innerHTML = `
      <div style="font-family:var(--mono);font-size:0.65rem;color:var(--muted);text-align:center;width:100%">
        Resultado: <strong style="color:var(--gold)">${label}</strong> — ¿fue correcto?
      </div>
      <button class="btn btn-green" id="freq-confirmar">Sí, guardar</button>
      <button class="btn btn-ghost" id="freq-repetir2">No, repetir</button>
    `;
    existente.appendChild(confirmDiv);
  } else {
    P.innerHTML += `
      <div style="display:flex;gap:0.8rem;flex-wrap:wrap;justify-content:center">
        <div style="font-family:var(--mono);font-size:0.65rem;color:var(--muted);text-align:center;width:100%">
          Resultado: <strong style="color:var(--gold)">${label}</strong> — ¿fue correcto?
        </div>
        <button class="btn btn-green" id="freq-confirmar">Sí, guardar</button>
        <button class="btn btn-ghost" id="freq-repetir2">No, repetir</button>
      </div>
    `;
  }

  document.getElementById('freq-confirmar')?.addEventListener('click', () => {
    freqResultados.push({ hz, label, edad });
    localStorage.setItem('freq_resultados', JSON.stringify(freqResultados));
    Coins.sumar(25);
    Coins.init();

    // guardar en datos conductuales tras cada intento
    guardarDato('Frecuencias: último resultado',   `${label} → ${edad}`);
    guardarDato('Frecuencias: tests completados',  `${freqResultados.length}/3`);

    if (freqResultados.length >= MAX_INTENTOS_FREQ) {
      frecuenciasMostrarFinal();
    } else {
      frecuenciasRender();
    }
  });

  document.getElementById('freq-repetir2')?.addEventListener('click', frecuenciasRepetir);
}

function frecuenciasRepetir() {
  freqBarriendo = false;
  cancelAnimationFrame(freqAnimFrame);
  try { freqOsc?.stop(); } catch(e) {}
  freqCtx = null; freqOsc = null; freqGain = null;
  frecuenciasRender();
}

function frecuenciasEdad(hz) {
  if (hz >= 18000) return '< 20 años';
  if (hz >= 15000) return '20–30 años';
  if (hz >= 12000) return '30–40 años';
  if (hz >= 8000)  return '40–50 años';
  if (hz >= 5000)  return '50–60 años';
  return '60+ años';
}

function frecuenciasMediana(vals) {
  const s = [...vals].sort((a,b)=>a-b);
  const m = Math.floor(s.length/2);
  return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
}

function frecuenciasMostrarFinal() {
  const P = document.getElementById('juego-panel');
  const hzVals    = freqResultados.map(r => r.hz);
  const medHz     = frecuenciasMediana(hzVals);
  const edadFinal = frecuenciasEdad(medHz);
  const medLabel  = medHz < 1000 ? Math.round(medHz) + ' Hz' : (medHz/1000).toFixed(1) + ' kHz';

  if (typeof window.marcarMinijuegoJugado === 'function') {
    window.marcarMinijuegoJugado('frecuencias');
  } else {
    localStorage.setItem('frecuencias_jugado', 'true');
  }

  guardarDato('Frecuencias: edad estimada (mediana)', edadFinal);
  guardarDato('Frecuencias: frecuencia mediana',       medLabel);
  guardarDato('Frecuencias: tests completados',        '3/3');

  P.innerHTML = `
    <h2>👂 Test completado</h2>
    <div class="resultado-box">
      <div class="coins-ganadas">+25 🪙 por test</div>
      <div class="resultado-detalle">mediana de ${freqResultados.length} tests</div>
    </div>

    <div class="freq-wrap">
      <div style="font-family:var(--mono);font-size:0.6rem;color:var(--muted)">Edad estimada:</div>
      <div class="freq-edad">${edadFinal}</div>

      <div class="freq-resultados">
        ${freqResultados.map((r,i) => `
          <div class="freq-res-row">
            <span class="freq-res-key">Test ${i+1}</span>
            <span class="freq-res-val">${r.label} → ${r.edad}</span>
          </div>`).join('')}
      </div>
    </div>
  `;
}
