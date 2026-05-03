function guardarDato(clave, valor) {
  try {
    // Recuperamos el perfil completo del jugador
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
    
    renderDatos();

    if (clave === 'Memoria: eficiencia' || clave === 'BART: resultado neto') {
      console.log("Métrica crítica registrada. Sincronizando con IA...");
      if (typeof sincronizarPerfilIA === 'function') {
        sincronizarPerfilIA();
      }
    }
  } catch (e) {
    console.error("Error en guardarDato:", e);
  }
}

function registrarMetricaBJ(monto, esGanada) {
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
  } catch (e) {
    console.error("Error en registrarMetricaBJ:", e);
  }
}

function renderDatos() {
  const lista = document.getElementById('datos-lista');
  if (!lista) return;

  // Intentamos leer de la fuente centralizada primero
  const raw = localStorage.getItem('jugador_actual');
  let datos = {};
  
  if (raw) {
    const jugador = JSON.parse(raw);
    datos = jugador.datos_conductuales || {};
  } else {
    // Backup: leer de la clave directa
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