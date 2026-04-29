// ── VECTOR DE DATOS DEL JUGADOR ──

const Vector = {

  // Construye el vector completo desde localStorage
  construir() {
    try {
      const jugador  = storageGet('jugador_actual', {});
      const datos    = storageGet('datos_conductuales', {});
      const bjStats  = storageGet('bj_stats', {});
      const weather  = storageGet('weather_cache', {});
      const freqRes  = storageGet('freq_resultados', []);
      const coins    = Coins.get();

      if (!jugador.id) throw new ValidationError('No hay jugador activo', 'jugador_id');

      const vector = {
        // identificación
        jugador_id:   jugador.id,
        username:     jugador.username,
        timestamp:    new Date().toISOString(),

        // localización
        ciudad:       weather.ciudad   || 'desconocida',
        pais:         weather.pais     || 'desconocido',
        temperatura:  weather.temp     || null,
        condicion:    weather.condicion || null,

        // blackjack
        bj_partidas:  bjStats.partidas  || 0,
        bj_ganadas:   bjStats.ganadas   || 0,
        bj_perdidas:  bjStats.perdidas  || 0,
        bj_racha_max: bjStats.rachaMax  || 0,

        // BART
        bart_score:   datos['BART: score ajustado']    || null,
        bart_perfil:  datos['BART: perfil de riesgo']  || null,
        bart_explot:  datos['BART: globos explotados'] || null,
        bart_neto:    datos['BART: resultado neto']    || null,

        // memoria
        mem_resultado: datos['Memoria: resultado']      || null,
        mem_pares:     datos['Memoria: pares encontrados'] || null,
        mem_intentos:  datos['Memoria: intentos']       || null,
        mem_errores:   datos['Memoria: errores']        || null,
        mem_eficiencia:datos['Memoria: eficiencia']     || null,
        mem_tiempo:    datos['Memoria: tiempo usado']   || null,

        // frecuencias
        freq_edad:    datos['Frecuencias: edad estimada (mediana)'] || datos['Frecuencias: último resultado'] || null,
        freq_hz:      datos['Frecuencias: frecuencia mediana']      || null,
        freq_tests:   datos['Frecuencias: tests completados']       || null,

        // economía
        coins_actuales: coins,
      };

      return vector;

    } catch (e) {
      manejarError(e, 'Vector.construir');
      if (e instanceof ValidationError) throw e;
      throw new AppError('Error construyendo vector: ' + e.message);
    }
  },

  // Guarda el vector en la tabla de vectores
  guardar() {
    try {
      const vector  = this.construir();
      const tabla   = storageGet('tabla_vectores', []);

      // actualizar si ya existe este jugador, si no añadir
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

  // Obtiene todos los vectores guardados
  obtenerTodos() {
    try {
      return storageGet('tabla_vectores', []);
    } catch (e) {
      manejarError(e, 'Vector.obtenerTodos');
      return [];
    }
  },

  // Columnas que se muestran en la tabla (orden y etiquetas)
  COLUMNAS: [
    { key: 'jugador_id',    label: 'ID' },
    { key: 'username',      label: 'Usuario' },
    { key: 'timestamp',     label: 'Fecha' },
    { key: 'ciudad',        label: 'Ciudad' },
    { key: 'pais',          label: 'País' },
    { key: 'temperatura',   label: 'Temp' },
    { key: 'bj_partidas',   label: 'BJ partidas' },
    { key: 'bj_ganadas',    label: 'BJ ganadas' },
    { key: 'bj_perdidas',   label: 'BJ perdidas' },
    { key: 'bart_perfil',   label: 'BART perfil' },
    { key: 'bart_score',    label: 'BART score' },
    { key: 'bart_neto',     label: 'BART neto' },
    { key: 'mem_resultado', label: 'Mem resultado' },
    { key: 'mem_pares',     label: 'Mem pares' },
    { key: 'mem_eficiencia',label: 'Mem eficiencia' },
    { key: 'freq_edad',     label: 'Edad estimada' },
    { key: 'freq_hz',       label: 'Freq máx' },
    { key: 'coins_actuales',label: 'Coins' },
  ]
};
