import Usuario from '../models/Usuario.js';

class UsuarioService {
  async procesarYGuardarVector(datosRaw) {
    try {
      
      const payload = {
        username: datosRaw.jugador_actual?.username || 'Invitado',
        
        // Perfil de Riesgo
        bart_riesgo: parseFloat(datosRaw.datos_conductuales?.['BART: score ajustado']) || 0,
        bart_explosiones: parseInt(datosRaw.datos_conductuales?.['BART: globos explotados']) || 0,
        
        // Agilidad Mental
        mem_eficiencia: parseInt(datosRaw.datos_conductuales?.['Memoria: eficiencia']) || 0,
        mem_velocidad: parseFloat(datosRaw.datos_conductuales?.['Memoria: tiempo usado']) || 0,
        
        // Juego
        bj_winrate: this._calcularWinrate(datosRaw.bj_stats),
        coins: datosRaw.coins || 0,

        // CONTEXTO 
        ciudad: datosRaw.weather_cache?.ciudad || null,
        clima: datosRaw.weather_cache?.temp || null
      };

      // Guardamos en la tabla mi_casino_db
      const registro = await Usuario.create(payload);
      return registro;

    } catch (error) {
      console.error("Error en UsuarioService:", error);
      throw new Error("Error al procesar los datos del jugador.");
    }
  }

  _calcularWinrate(stats) {
    if (!stats || !stats.partidas || stats.partidas === 0) return 0;
    return parseFloat((stats.ganadas / stats.partidas).toFixed(2));
  }
}

export default new UsuarioService();