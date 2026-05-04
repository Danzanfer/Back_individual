
const casino_datos = {
  _vectorCompleto(vector) {
    if (!vector) return false;
    
    // ✅ Sincronizado con api.js
    const tieneBJ = typeof vector.bj_partidas === 'number';
    
    const tieneBART = vector.bart_score !== null && 
                      vector.bart_score !== undefined && 
                      vector.bart_score !== '';
    
    const tieneMemoria = vector.mem_eficiencia !== null && 
                         vector.mem_eficiencia !== undefined && 
                         vector.mem_eficiencia !== '';
    
   
    const tieneCoins = typeof vector.coins_actuales === 'number';

    return tieneBJ && tieneBART && tieneMemoria && tieneCoins;
  },

  _chequearSincronizarIA() {
    if (typeof Vector === 'undefined' || typeof sincronizarPerfilIA !== 'function') return;

    try {
      const vector = Vector.construir();
      if (this._vectorCompleto(vector)) {
        sincronizarPerfilIA();
      }
    } catch (e) {
      console.warn('No se puede construir el vector completo todavía:', e);
    }
  },

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
      this._chequearSincronizarIA();
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

      this._chequearSincronizarIA();
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
    casino_datos._chequearSincronizarIA();
  }, 1000);
});
