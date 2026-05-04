const casino_datos = {
  guardarDato(clave, valor) {
    try {
      const raw = localStorage.getItem('jugador_actual');
      if (!raw) return;

      let jugador = JSON.parse(raw);
      if (!jugador.datos_conductuales) jugador.datos_conductuales = {};
      
      jugador.datos_conductuales[clave] = valor;
      
      localStorage.setItem('datos_conductuales', JSON.stringify(jugador.datos_conductuales));
      localStorage.setItem('jugador_actual', JSON.stringify(jugador));

      if (typeof Vector !== 'undefined' && typeof Vector.guardar === 'function') {
        Vector.guardar();
      }
      
      this.renderDatos();

      const clavesIA = ['Memoria: eficiencia', 'BART: resultado neto', 'BART: score', 'frecuencia_pago'];
      if (clavesIA.includes(clave)) {
        if (typeof sincronizarPerfilIA === 'function') {
          sincronizarPerfilIA();
        }
      }
    } catch (e) {
      console.error("Error en guardarDato:", e);
    }
  },

  registrarMetricaBJ(monto, esGanada) {
    try {
      const raw = localStorage.getItem('bj_stats') || '{"partidas":0,"ganadas":0,"totalPerdido":0,"totalApostado":0,"rachaMax":0}';
      const bj = JSON.parse(raw);
      
      bj.partidas++;
      bj.totalApostado += monto;
      
      if (esGanada) {
        bj.ganadas++;
      } else {
        bj.totalPerdido += monto;
      }
      
      localStorage.setItem('bj_stats', JSON.stringify(bj));

      if (typeof Vector !== 'undefined' && typeof Vector.guardar === 'function') {
        Vector.guardar();
      }

      if (typeof sincronizarPerfilIA === 'function') {
        sincronizarPerfilIA();
      }
    } catch (e) {
      console.error("Error en registrarMetricaBJ:", e);
    }
  },

  renderDatos() {
    const lista = document.getElementById('datos-lista');
    if (!lista) return;

    const raw = localStorage.getItem('jugador_actual');
    let datos = {};
    
    if (raw) {
      const jugador = JSON.parse(raw);
      datos = jugador.datos_conductuales || {};
    } else {
      datos = JSON.parse(localStorage.getItem('datos_conductuales') || '{}');
    }

    if (Object.keys(datos).length === 0) {
      lista.innerHTML = '<div class="dato-row" style="color:var(--muted)">No hay datos aún...</div>';
      return;
    }

    lista.innerHTML = Object.entries(datos).map(([k, v]) => `
      <div class="dato-row">
        <span class="dato-key">${k}</span>
        <span class="dato-val">${v}</span>
      </div>
    `).join('');
  }
};

window.guardarDato = (c, v) => casino_datos.guardarDato(c, v);
window.registrarMetricaBJ = (m, e) => casino_datos.registrarMetricaBJ(m, e);
window.renderDatos = () => casino_datos.renderDatos();

document.addEventListener('DOMContentLoaded', () => {
  window.renderDatos();
  setTimeout(() => {
    if (typeof sincronizarPerfilIA === 'function') {
      sincronizarPerfilIA();
    }
  }, 1000);
});