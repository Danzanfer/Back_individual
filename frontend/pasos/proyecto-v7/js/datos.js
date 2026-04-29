// Módulo compartido para datos conductuales
// Importar en minijuegos.html

function guardarDato(clave, valor) {
  const d = JSON.parse(localStorage.getItem('datos_conductuales') || '{}');
  d[clave] = valor;
  localStorage.setItem('datos_conductuales', JSON.stringify(d));
  renderDatos();
}

function renderDatos() {
  const lista = document.getElementById('datos-lista');
  if (!lista) return;
  const d = JSON.parse(localStorage.getItem('datos_conductuales') || '{}');
  if (!Object.keys(d).length) {
    lista.innerHTML = '<div class="dato-row"><span class="dato-key">sin datos aún</span></div>';
    return;
  }
  lista.innerHTML = Object.entries(d).map(([k,v]) =>
    `<div class="dato-row"><span class="dato-key">${k}</span><span class="dato-val">${v}</span></div>`
  ).join('');
}
