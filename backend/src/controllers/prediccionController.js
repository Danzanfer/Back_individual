import Prediccion from '../models/Prediccion.js';
import axios from 'axios';

export const generarPrediccionJugador = async (req, res) => {
  try {
    // 1. Extraemos la estructura real que viene de la captura de pantalla
    const { jugador_actual, datos_conductuales, bj_stats, coins } = req.body;

    // 2. Validación de seguridad
    if (!datos_conductuales || !bj_stats) {
        console.error("❌ Error: Estructura de payload incompleta", req.body);
        return res.status(400).json({ error: "Faltan datos conductuales o de estadísticas" });
    }

    // 3. Mapeo: Convierte lo que envía el Frontend a lo que espera Flask
    const winrate = bj_stats.partidas > 0 ? (bj_stats.ganadas / bj_stats.partidas) : 0;

    const datosParaFlask = {
      bart_riesgo: datos_conductuales["BART: score ajustado"] || 0.5,
      mem_eficiencia: datos_conductuales["Memoria: eficiencia"] || 80,
      bj_winrate: winrate,
      coins: coins || 5000
    };

    console.log("Enviando a Flask:", datosParaFlask);

    // 4. Petición al contenedor de Flask
    const respuestaFlask = await axios.post('http://mi_casino_flask:5000/predict', datosParaFlask);

    // 5. Procesamos la respuesta de la IA
    const cluster = respuestaFlask.data.perfil_jugador; 
    const configuracionIA = respuestaFlask.data.configuracion_juego;

    const mapeoPerfiles = {
      0: 'Estratega',
      1: 'Casual',
      2: 'Agresivo'
    };

    const nombrePerfil = mapeoPerfiles[cluster] || 'Desconocido';

    // 6. Guardamos en la base de datos Postgres
    const nuevaPrediccion = await Prediccion.create({
      perfil_ia: nombrePerfil,
      usuarioId: jugador_actual?.id || null,
      probabilidad: 1.0
    });

    // 7. Respuesta FINAL
    return res.status(201).json({
      ok: true,
      perfil: "Estratega Prueba",
      configuracion_juego: { chips: [1, 2, 3, 4, 5] }
    });

  } catch (error) {
    // Captura errores de conexión con Flask o de base de datos
    console.error('❌ Error en PrediccionController:', error.response?.data || error.message);
    
    return res.status(500).json({
      ok: false,
      msg: 'Hubo un error al procesar la predicción con la IA',
      error: error.message
    });
  }
};