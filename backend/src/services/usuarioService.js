import Usuario from '../models/Usuario.js';
import Prediccion from '../models/Prediccion.js';
import axios from 'axios';

class UsuarioService {
  async procesarYGuardarVector(datosRaw) {
    try {
      const payload = {
        username: datosRaw.jugador_actual?.username || 'Invitado',
        bart_riesgo: parseFloat(datosRaw.datos_conductuales?.['BART: score ajustado']) || 0,
        bart_explosiones: parseInt(datosRaw.datos_conductuales?.['BART: globos explotados']) || 0,
        mem_eficiencia: parseInt(datosRaw.datos_conductuales?.['Memoria: eficiencia']) || 0,
        mem_velocidad: parseFloat(datosRaw.datos_conductuales?.['Memoria: tiempo usado']) || 0,
        bj_winrate: this._calcularWinrate(datosRaw.bj_stats),
        coins: datosRaw.coins || 0,
        ciudad: datosRaw.weather_cache?.ciudad || null,
        clima: datosRaw.weather_cache?.temp || null
      };

      // Crear el usuario
      const registroUsuario = await Usuario.create(payload);

      try {
        // Llamada al modelo
        const respuestaIA = await axios.post('http://mi_casino_flask_container:5000/predict', {
          bart_riesgo: payload.bart_riesgo,
          mem_eficiencia: payload.mem_eficiencia,
          bj_winrate: payload.bj_winrate,
          coins: payload.coins
        });

        const cluster = respuestaIA.data.perfil_jugador;
        
        // Mapeo de perfiles
        const perfiles = {
          0: "Conservador / Bajo Riesgo",
          1: "Moderado / Estratégico",
          2: "Arriesgado / Impulsivo"
        };
        const perfilTexto = perfiles[cluster] || `Cluster ${cluster}`;

        // ACTUALIZAR la tabla 'usuarios'
        await registroUsuario.update({
          perfil_psicologico: perfilTexto,
          probabilidad_fuga: 0.15 // Aquí podrías poner un valor real si tu IA lo da
        });

        // INSERTAR en la tabla 'prediccions'
        await Prediccion.create({
          perfil_ia: cluster.toString(),
          probabilidad: 0.85, // Ejemplo
          usuarioId: registroUsuario.id
        });

        // Devolver el perfil para la respuesta del API
        registroUsuario.setDataValue('perfil_ia', cluster);

      } catch (errorIA) {
        console.error("Error conectando con Flask:", errorIA.message);
        registroUsuario.setDataValue('perfil_ia', "Offline");
      }

      return registroUsuario;

    } catch (error) {
      console.error("Error en UsuarioService:", error);
      throw new Error("Error al procesar datos.");
    }
  }

  _calcularWinrate(stats) {
    if (!stats || !stats.partidas || stats.partidas === 0) return 0;
    return parseFloat((stats.ganadas / stats.partidas).toFixed(2));
  }
}

export default new UsuarioService();