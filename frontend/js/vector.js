// ── VECTOR DE DATOS DEL JUGADOR (Estructura Refactorizada) ──

const Vector = {

  // Construye el vector completo desde localStorage con las nuevas features
  construir() {
    try {
      const jugador  = storageGet('jugador_actual', {});
      const datos    = storageGet('datos_conductuales', {});
      const bjStats  = storageGet('bj_stats', {});
      const tienda   = storageGet('tienda_stats', {}); // Nueva fuente
      const coins    = Coins.get();

      if (!jugador.id) throw new ValidationError('No hay jugador activo', 'jugador_id');

      const vector = {
        // identificación
        jugador_id:   jugador.id,
        username:     jugador.username,
        timestamp:    new Date().toISOString(),

        // blackjack (Features de riesgo financiero)
        bj_partidas:      bjStats.partidas || 0,
        bj_ganadas:       bjStats.ganadas  || 0,
        bj_total_perdido: bjStats.totalPerdido || 0, // Nueva feature
        bj_total_apuesta: bjStats.totalApostado || 0, // Para calcular ratio después
        bj_racha_max:     bjStats.rachaMax || 0,

        // BART (Propensión al riesgo)
        bart_score:   datos['BART: score ajustado']    || null,
        bart_pumps:   datos['BART: promedio bombeos']  || null, // Nueva feature
        bart_neto:    datos['BART: resultado neto']    || null,

        // memoria (Perfil cognitivo)
        mem_pares:      datos['Memoria: pares encontrados'] || null,
        mem_errores:    datos['Memoria: errores']        || null,
        mem_eficiencia: datos['Memoria: eficiencia']     || null, // Se guarda como "85%"
        mem_tiempo:     datos['Memoria: tiempo usado']   || null,

        // frecuencias (Edad auditiva)
        freq_hz:      datos['Frecuencias: frecuencia mediana'] || null,
        freq_edad:    datos['Frecuencias: edad estimada (mediana)'] || null,

        // economía y tienda (NUEVAS FEATURES)
        shop_total_gastado: tienda.totalGastado || 0,
        shop_items_comprados: tienda.itemsComprados || 0,
        coins_actuales:     coins,
      };

      return vector;

    } catch (e) {
      manejarError(e, 'Vector.construir');
      if (e instanceof ValidationError) throw e;
      throw new AppError('Error construyendo vector: ' + e.message);
    }
  },

  // Guarda en el localStorage (Tu estrategia original)
  guardar() {
    try {
      const vector  = this.construir();
      const tabla   = storageGet('tabla_vectores', []);

      const idx = tabla.findIndex(v => v.jugador_id === vector.jugador_id);
      if (idx >= 0) {
        tabla[idx] = vector;
      } else {
        tabla.push(vector);
      }

      storageSet('tabla_vectores', tabla);
      return vector;

    } catch (e) {
      manejarError(e, 'Vector.guardar');
      throw e;
    }
  },

  // Etiquetas para la tabla (Actualizado con las nuevas features)
  COLUMNAS: [
    { key: 'username',      label: 'Usuario' },
    { key: 'bj_partidas',   label: 'BJ Partidas' },
    { key: 'bj_total_perdido', label: 'Dinero Perdido' },
    { key: 'bart_score',    label: 'BART Score' },
    { key: 'mem_eficiencia',label: 'Mem Eficiencia' },
    { key: 'freq_hz',       label: 'Hz Máx' },
    { key: 'shop_total_gastado', label: 'Gasto Tienda' },
    { key: 'coins_actuales',label: 'Coins' },
  ]
};
