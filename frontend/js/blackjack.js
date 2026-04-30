const COLORES_DEFAULT = {
  pelo:'#3b1f0a', piel:'#f5cba7', ojos:'#3b1f8c',
  ropa:'#ff6b6b', pantalon:'#2a2a5a', zapatos:'#1a1a3a'
};

const g = {
  apuesta: 10,
  mazo: [], manoJ: [], manoD: [],
  activo: false,
  partidas: 0, ganadas: 0, perdidas: 0,
  racha: 0, rachaMax: 0,
};

// ── MAZO ──
const PALOS = ['♠','♥','♦','♣'];
const VALS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function crearMazo() {
  const m = PALOS.flatMap(p => VALS.map(v => ({ p, v })));
  for (let i = m.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [m[i],m[j]] = [m[j],m[i]];
  }
  return m;
}

function robar() {
  if (g.mazo.length < 10) g.mazo = crearMazo();
  return g.mazo.pop();
}

function valorCarta(c) {
  if (['J','Q','K'].includes(c.v)) return 10;
  if (c.v === 'A') return 11;
  return parseInt(c.v);
}

function calcMano(mano) {
  let total = 0, ases = 0;
  mano.forEach(c => { total += valorCarta(c); if (c.v==='A') ases++; });
  while (total > 21 && ases-- > 0) total -= 10;
  return total;
}

// ── RENDER ──
function esRoja(p) { return p==='♥'||p==='♦'; }

function cartaEl(c, oculta=false) {
  const d = document.createElement('div');
  d.className = 'carta' + (oculta ? ' oculta' : esRoja(c.p) ? ' roja' : ' negra');
  if (!oculta) d.innerHTML = `
    <div class="carta-top">${c.v}<br>${c.p}</div>
    <div class="carta-centro">${c.p}</div>
    <div class="carta-bot">${c.v}<br>${c.p}</div>`;
  return d;
}

function renderMano(elId, mano, ocultarSegunda=false) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  mano.forEach((c,i) => el.appendChild(cartaEl(c, ocultarSegunda && i===1)));
}

function actualizarScores(ocultarD=true) {
  const sj = calcMano(g.manoJ);
  const sjEl = document.getElementById('score-jugador');
  const sdEl = document.getElementById('score-dealer');
  sjEl.textContent = sj;
  sjEl.className = 'score-badge' + (sj>21?' bust':sj===21?' bj':'');
  if (!ocultarD) {
    const sd = calcMano(g.manoD);
    sdEl.textContent = sd;
    sdEl.className = 'score-badge' + (sd>21?' bust':sd===21?' bj':'');
  } else {
    sdEl.textContent = '?'; sdEl.className = 'score-badge';
  }
}

function actualizarStats() {
  document.getElementById('st-partidas').textContent = g.partidas;
  document.getElementById('st-ganadas').textContent  = g.ganadas;
  document.getElementById('st-perdidas').textContent = g.perdidas;
  const rEl = document.getElementById('st-racha');
  rEl.textContent = g.racha;
  rEl.className = 'stat-val' + (g.racha>0?' pos':g.racha<0?' neg':'');
  document.getElementById('st-racha-max').textContent = g.rachaMax;
}

function addHist(texto, tipo) {
  const list = document.getElementById('hist-list');
  const item = document.createElement('div');
  item.className = `hist-item ${tipo}`;
  item.textContent = `#${g.partidas} — ${texto}`;
  list.prepend(item);
  while (list.children.length > 25) list.removeChild(list.lastChild);
}

function setMensaje(t, tipo='') {
  const el = document.getElementById('mensaje');
  el.textContent = t; el.className = tipo;
}

function actualizarNavCoins() {
  Coins.init();
}

// ── JUEGO ──
function repartir() {
  if (Coins.get() < g.apuesta) {
    document.getElementById('modal-sin-coins').classList.remove('hidden');
    return;
  }
  g.mazo = crearMazo();
  g.manoJ = [robar(), robar()];
  g.manoD = [robar(), robar()];
  g.activo = true;

  renderMano('mano-jugador', g.manoJ);
  renderMano('mano-dealer',  g.manoD, true);
  actualizarScores(true);
  setMensaje('');

  document.querySelectorAll('.chip').forEach(c => c.disabled = true);
  document.getElementById('btn-hit').disabled   = false;
  document.getElementById('btn-stand').disabled = false;
  document.getElementById('btn-deal').disabled  = true;

  if (calcMano(g.manoJ) === 21) terminar('bj');
}

function hit() {
  if (!g.activo) return;

  
  const scoreAntesDePedir = calcMano(g.manoJ);
  if (scoreAntesDePedir >= 17) {
    console.log("Riesgo detectado: Hit con " + scoreAntesDePedir);
    
    
    let stats = JSON.parse(localStorage.getItem('bj_stats') || '{}');
    
    
    stats.decisiones_riesgo = (stats.decisiones_riesgo || 0) + 1;
    stats.ultimo_score_riesgo = scoreAntesDePedir;
    
    
    localStorage.setItem('bj_stats', JSON.stringify(stats));
  }

  g.manoJ.push(robar());
  renderMano('mano-jugador', g.manoJ);
  actualizarScores(true);
  if (calcMano(g.manoJ) > 21) terminar('bust-j');
}


async function stand() {
  if (!g.activo) return;
  document.getElementById('btn-hit').disabled   = true;
  document.getElementById('btn-stand').disabled = true;

  renderMano('mano-dealer', g.manoD, false);
  actualizarScores(false);

  while (calcMano(g.manoD) < 17) {
    await esperar(550);
    g.manoD.push(robar());
    renderMano('mano-dealer', g.manoD, false);
    actualizarScores(false);
  }

  const sj = calcMano(g.manoJ), sd = calcMano(g.manoD);
  if (sd > 21)       terminar('bust-d');
  else if (sj > sd)  terminar('win');
  else if (sd > sj)  terminar('lose');
  else               terminar('push');
}

function terminar(res) {
  g.activo = false;
  g.partidas++;

  renderMano('mano-dealer', g.manoD, false);
  actualizarScores(false);

  const tabla = {
    'bj':     { delta: Math.round(g.apuesta*1.5), msg: `✦ Blackjack! +${Math.round(g.apuesta*1.5)} 🪙`, tipo:'win'  },
    'bust-j': { delta: -g.apuesta, msg: `💥 Te pasaste. -${g.apuesta} 🪙`,     tipo:'lose' },
    'bust-d': { delta: +g.apuesta, msg: `🎉 Dealer bust. +${g.apuesta} 🪙`,    tipo:'win'  },
    'win':    { delta: +g.apuesta, msg: `✓ Ganaste. +${g.apuesta} 🪙`,         tipo:'win'  },
    'lose':   { delta: -g.apuesta, msg: `✗ Perdiste. -${g.apuesta} 🪙`,        tipo:'lose' },
    'push':   { delta: 0,          msg: `— Empate.`,                            tipo:'push' },
  };

  const { delta, msg, tipo } = tabla[res];
  
  // Envolvemos el registro en un try/catch para que no trabe el juego
  try {
    if (tipo !== 'push' && typeof registrarMetricaBJ === 'function') { 
        registrarMetricaBJ(g.apuesta, tipo === 'win'); 
    }
  } catch (e) { console.error("Error registrando métrica IA:", e); }
  
  Coins.sumar(delta);

  if (tipo==='win')  { g.ganadas++;  g.racha = Math.max(0,g.racha)+1; }
  if (tipo==='lose') { g.perdidas++; g.racha = Math.min(0,g.racha)-1; }
  if (tipo==='push') { g.racha = 0; }
  g.rachaMax = Math.max(g.rachaMax, g.racha);

  setMensaje(msg, tipo);
  addHist(msg, tipo);
  actualizarStats();
  actualizarNavCoins();
  guardarEstado();

  // ASEGÚRATE DE QUE ESTO SE EJECUTE:
  document.querySelectorAll('.chip').forEach(c => c.disabled = false);
  document.getElementById('btn-hit').disabled   = true;
  document.getElementById('btn-stand').disabled = true;
  document.getElementById('btn-deal').disabled  = false; // Esto es lo que te permite jugar de nuevo
}   
  

function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── CHIPS ──
function bjBindChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('activa'));
      chip.classList.add('activa');
      g.apuesta = parseInt(chip.dataset.val);
      document.getElementById('apuesta-display').textContent = g.apuesta;
    });
  });
}

// ── BOTONES ──
function bjBindBotones() {
  document.getElementById('btn-deal').addEventListener('click',  repartir);
  document.getElementById('btn-hit').addEventListener('click',   hit);
  document.getElementById('btn-stand').addEventListener('click', stand);
}

// ── PERSISTENCIA ──
function guardarEstado() {
  const statsPrevios = JSON.parse(localStorage.getItem('bj_stats') || '{}');
  
  localStorage.setItem('bj_stats', JSON.stringify({
    ...statsPrevios,
    partidas: g.partidas,
    ganadas: g.ganadas,
    perdidas: g.perdidas,
    rachaMax: g.rachaMax
  }));
}

function cargarEstado() {
  const s = JSON.parse(localStorage.getItem('bj_stats') || 'null');
  if (s) { g.partidas=s.partidas; g.ganadas=s.ganadas; g.perdidas=s.perdidas; g.rachaMax=s.rachaMax; }
}

// ── INIT — llamado desde index.html después de que el DOM esté listo ──
function bjInit() {
  cargarEstado();
  Coins.init();
  actualizarStats();
  g.mazo = crearMazo();
  bjBindChips();
  bjBindBotones();
}

window.bjActualizarApuestaSeleccionada = function(valor) {
    // Actualiza el valor numérico en el objeto global del juego 
    if (typeof g !== 'undefined') {
        g.apuesta = parseInt(valor);
    }
    
    // Actualiza visualmente el número de la apuesta en el display
    const display = document.getElementById('apuesta-display');
    if (display) {
        display.textContent = valor;
    }
    
    console.log("Juego sincronizado:", valor);
};