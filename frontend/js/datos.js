// ── MÓDULO DE PERSISTENCIA CONDUCTUAL (datos.js) ──

function guardarDato(clave, valor) {
  const d = JSON.parse(localStorage.getItem('datos_conductuales') || '{}');
  d[clave] = valor;
  localStorage.setItem('datos_conductuales', JSON.stringify(d));
  
  // Si vector.js está cargado, actualizamos el vector maestro
  if (typeof Vector !== 'undefined') Vector.guardar();
  renderDatos();
}

/**
 * Registra métricas financieras del Blackjack
 * @param {number} monto - Cantidad apostada
 * @param {boolean} esGanada - true si ganó, false si perdió
 */
function registrarMetricaBJ(monto, esGanada) {
  const bj = JSON.parse(localStorage.getItem('bj_stats') || '{"partidas":0,"ganadas":0,"totalPerdido":0,"totalApostado":0,"rachaMax":0}');
  
  bj.partidas++;
  bj.totalApostado += monto;
  
  if (esGanada) {
    bj.ganadas++;
  } else {
    bj.totalPerdido += monto;
  }
  
  localStorage.setItem('bj_stats', JSON.stringify(bj));
  if (typeof Vector !== 'undefined') Vector.guardar();
}

/**
 * Registra compras de la tienda
 * @param {number} precio - Costo del artículo
 */
function registrarMetricaTienda(precio) {
  const tienda = JSON.parse(localStorage.getItem('tienda_stats') || '{"totalGastado":0,"itemsComprados":0}');
  
  tienda.totalGastado += precio;
  tienda.itemsComprados++;
  
  localStorage.setItem('tienda_stats', JSON.stringify(tienda));
  if (typeof Vector !== 'undefined') Vector.guardar();
}

function renderDatos() {
  const lista = document.getElementById('datos-lista');
  if (!lista) return;
  const d = JSON.parse(localStorage.getItem('datos_conductuales') || '{}');
  lista.innerHTML = Object.entries(d).map(([k,v]) =>
    `<div class="dato-row"><span class="dato-key">${k}</span><span class="dato-val">${v}</span></div>`
  ).join('');
}
