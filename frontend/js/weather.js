

const Weather = {

  _cache: null,

  async obtener() {
    if (this._cache) return this._cache;

    try {
      const guardado = storageGet('weather_cache');
      if (guardado && (Date.now() - guardado.ts) < 3600000) {
        this._cache = guardado;
        return this._cache;
      }
    } catch (e) {
      manejarError(e, 'Weather.obtener/cache');
    }

    const resultado = {
      ciudad:    'desconocida',
      pais:      'desconocido',
      temp:      null,
      condicion: null,
      ts:        Date.now(),
    };

    try {
      const res = await fetch('http://ip-api.com/json/?fields=city,country,status');
      if (!res.ok) throw new NetworkError(`ip-api respondió ${res.status}`, res.url);
      const data = await res.json();
      if (data.status === 'success') {
        resultado.ciudad = data.city  || 'desconocida';
        resultado.pais   = data.country || 'desconocido';
      }
    } catch (e) {
      manejarError(new NetworkError(e.message, 'ip-api.com'), 'Weather.localización');
    }

    try {
      if (resultado.ciudad !== 'desconocida') {
        const ciudad = encodeURIComponent(resultado.ciudad);
        const res = await fetch(`https://wttr.in/${ciudad}?format=j1`);
        if (!res.ok) throw new NetworkError(`wttr.in respondió ${res.status}`, res.url);
        const data = await res.json();
        const current = data?.current_condition?.[0];
        if (current) {
          resultado.temp      = current.temp_C + '°C';
          resultado.condicion = current.weatherDesc?.[0]?.value || null;
        }
      }
    } catch (e) {
      manejarError(new NetworkError(e.message, 'wttr.in'), 'Weather.temperatura');
    }

    try {
      storageSet('weather_cache', resultado);
    } catch (e) {
      manejarError(e, 'Weather.guardarCache');
    }

    this._cache = resultado;
    return resultado;
  },

  limpiarCache() {
    this._cache = null;
    try { localStorage.removeItem('weather_cache'); } catch (e) {}
  }
};
