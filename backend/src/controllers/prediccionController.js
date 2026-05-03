import Prediccion from '../models/Prediccion.js';
import axios from 'axios';

export const generarPrediccionJugador = async (req, res) => {
  try {
    const { jugador_actual, datos_conductuales, bj_stats, coins } = req.body;

    // 1. Mapeo de datos para Flask
    const winrate = (bj_stats?.partidas > 0) ? (bj_stats.ganadas / bj_stats.partidas) : 0;
    const datosParaFlask = {
      bart_riesgo: datos_conductuales?.["BART: score ajustado"] || 0.5,
      mem_eficiencia: datos_conductuales?.["Memoria: eficiencia"] || 80,
      bj_winrate: winrate,
      coins: coins || 35
    };

    console.log("📡 Intentando conectar con Flask en 127.0.0.1:5000...");

    // 2. Llamada a la IA (Flask)
    const respuestaFlask = await axios.post('http://127.0.0.1:5000/predict', datosParaFlask);
    
    const cluster = respuestaFlask.data.perfil_jugador;
    const configuracionIA = respuestaFlask.data.configuracion_juego;
    const nombrePerfil = { 0: 'Estratega', 1: 'Casual', 2: 'Agresivo' }[cluster] || 'Desconocido';

    // 3. Guardado en DB con validación de UUID
    try {
      const esUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(jugador_actual?.id);
      
      await Prediccion.create({
        perfil_ia: nombrePerfil,
        usuarioId: esUUID ? jugador_actual.id : null,
        probabilidad: 1.0
      });
      console.log(`✅ Registro guardado: Perfil ${nombrePerfil}`);
    } catch (dbError) {
      console.log("⚠️ Registro en DB saltado (ID no es UUID o error de inserción)");
    }

    // 4. Respuesta al Frontend
    return res.status(201).json({
      ok: true,
      perfil: nombrePerfil,
      configuracion_juego: configuracionIA
    });

  } catch (error) {
    console.error('❌ Error de conexión con Flask:', error.message);
    return res.status(500).json({
      ok: false,
      msg: 'La IA no responde en el puerto 5000',
      error: error.message
    });
  }
};