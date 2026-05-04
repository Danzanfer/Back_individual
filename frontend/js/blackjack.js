const COLORES_DEFAULT = {
pelo:'#3b1f0a', piel:'#f5cba7', ojos:'#3b1f8c',
ropa:'#ff6b6b', pantalon:'#2a2a5a', zapatos:'#1a1a3a'
};

const g = {
  apuesta: 10,
  mazo: [], manoJ: [], manoD: [],
  activo: false,
  partidas: 0, ganadas: 0, perdidas: 0,
  racha: 0, rachaMax: 0
};

const PALOS = ['♠','♥','♦','♣'];
const VALS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

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

function esRoja(p) { return p==='♥'||p==='♦'; }

function cartaEl(c, oculta=false) {
  const d = document.createElement('div');
  d.className = 'carta' + (oculta ? ' oculta' : esRoja(c.p) ? ' roja' : ' negra');
  
  // SOLUCIÓN: Usar comillas invertidas (backticks) para el HTML
  if (!oculta) {
    d.innerHTML = `
      <div class="carta-top">${c.v}<br>${c.p}</div>
      <div class="carta-centro">${c.p}</div>
      <div class="carta-bot">${c.v}<br>${c.p}</div>
    `;
  }
  return d;
}

function renderMano(elId, mano, ocultarSegunda=false) {
const el = document.getElementById(elId);
if (!el) return;
el.innerHTML = '';
mano.forEach((c,i) => el.appendChild(cartaEl(c, ocultarSegunda && i===1)));
}

function actualizarScores(ocultarD=true) {
const sj = calcMano(g.manoJ);
const sjEl = document.getElementById('score-jugador');
const sdEl = document.getElementById('score-dealer');
if (sjEl) {
sjEl.textContent = sj;
sjEl.className = 'score-badge' + (sj>21?' bust':sj===21?' bj':'');
}
if (sdEl) {
if (!ocultarD) {
const sd = calcMano(g.manoD);
sdEl.textContent = sd;
sdEl.className = 'score-badge' + (sd>21?' bust':sd===21?' bj':'');
} else {
sdEl.textContent = '?'; sdEl.className = 'score-badge';
}
}
}

function actualizarStats() {
const stP = document.getElementById('st-partidas');
const stG = document.getElementById('st-ganadas');
const stL = document.getElementById('st-perdidas');
const stR = document.getElementById('st-racha');
const stM = document.getElementById('st-racha-max');

if (stP) stP.textContent = g.partidas;
if (stG) stG.textContent = g.ganadas;
if (stL) stL.textContent = g.perdidas;
if (stR) {
stR.textContent = g.racha;
stR.className = 'stat-val' + (g.racha>0?' pos':g.racha<0?' neg':'');
}
if (stM) stM.textContent = g.rachaMax;
}

function setMensaje(t, tipo='') {
const el = document.getElementById('mensaje');
if(el) { el.textContent = t; el.className = tipo; }
}

function actualizarNavCoins() {
if (typeof Coins !== 'undefined') Coins.init();
}

function repartir() {
if (typeof Coins !== 'undefined' && Coins.get() < g.apuesta) {
const modal = document.getElementById('modal-sin-coins');
if (modal) modal.classList.remove('hidden');
return;
}

if (typeof Coins !== 'undefined') {
Coins.restar(g.apuesta);
}
actualizarNavCoins();

g.mazo = crearMazo();
g.manoJ = [robar(), robar()];
g.manoD = [robar(), robar()];
g.activo = true;
g.partidas++;

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

const scoreAntes = calcMano(g.manoJ);
if (scoreAntes >= 17) {
let stats = JSON.parse(localStorage.getItem('bj_stats') || '{}');
stats.decisiones_riesgo = (stats.decisiones_riesgo || 0) + 1;
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

function terminar(tipoRes) {
g.activo = false;
let mensaje = "";
let esGanada = false;
let esEmpate = false;

switch(tipoRes) {
case 'win': case 'bust-d':
mensaje = "¡GANASTE!";
esGanada = true;
break;
case 'bj':
mensaje = "¡BLACKJACK!";
esGanada = true;
break;
case 'lose': case 'bust-j':
mensaje = "¡PERDISTE!";
break;
case 'push':
mensaje = "EMPATE";
esEmpate = true;
break;
}

const aviso = document.getElementById('aviso');
if (aviso) {
aviso.textContent = mensaje;
aviso.classList.add('visible');
}

if (esGanada) {
const mult = (tipoRes === 'bj') ? 2.5 : 2;
if (typeof Coins !== 'undefined') {
Coins.sumar(Math.floor(g.apuesta * mult));
}
g.ganadas++;
g.racha++;
} else if (esEmpate) {
if (typeof Coins !== 'undefined') {
Coins.sumar(g.apuesta);
}
g.racha = 0;
} else {
g.perdidas++;
g.racha = 0;
}

if (g.racha > g.rachaMax) g.rachaMax = g.racha;

if (typeof registrarMetricaBJ === 'function') {
registrarMetricaBJ(g.apuesta, esGanada);
}

actualizarStats();
actualizarNavCoins();
guardarEstado();

if (typeof sincronizarPerfilIA === 'function') {
sincronizarPerfilIA();
}

setTimeout(() => {
if (aviso) aviso.classList.remove('visible');
document.getElementById('btn-deal').disabled = false;
document.getElementById('btn-hit').disabled  = true;
document.getElementById('btn-stand').disabled = true;
document.querySelectorAll('.chip').forEach(c => c.disabled = false);
}, 2000);
}

function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

function bjBindChips() {
document.querySelectorAll('.chip').forEach(chip => {
chip.addEventListener('click', () => {
document.querySelectorAll('.chip').forEach(c => c.classList.remove('activa'));
chip.classList.add('activa');
g.apuesta = parseInt(chip.dataset.val);
const disp = document.getElementById('apuesta-display');
if (disp) disp.textContent = g.apuesta;
});
});
}

function bjBindBotones() {
const d = document.getElementById('btn-deal');
const h = document.getElementById('btn-hit');
const s = document.getElementById('btn-stand');
if(d) d.onclick = repartir;
if(h) h.onclick = hit;
if(s) s.onclick = stand;
}

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
if (s) {
g.partidas = s.partidas || 0;
g.ganadas = s.ganadas || 0;
g.perdidas = s.perdidas || 0;
g.rachaMax = s.rachaMax || 0;
}
}

function bjInit() {
cargarEstado();
if (typeof Coins !== 'undefined') Coins.init();
actualizarStats();
g.mazo = crearMazo();
bjBindChips();
bjBindBotones();
}

window.bjActualizarApuestaSeleccionada = function(valor) {
g.apuesta = parseInt(valor);
const display = document.getElementById('apuesta-display');
if (display) display.textContent = valor;
};