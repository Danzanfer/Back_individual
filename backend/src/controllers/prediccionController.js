import Prediccion from '../models/Prediccion.js';
import axios from 'axios';

export const generarPrediccionJugador = async (req, res) => {
  // Los nombres de las variables deben coincidir con lo que envías desde el Frontend
  const { usuarioId, bart_riesgo, mem_eficiencia, bj_winrate, coins } = req.body;

  try {
    // 1. Petición al contenedor de Flask
    const respuestaFlask = await axios.post('http://mi_casino_flask:5000/predict', {
      bart_riesgo,
      mem_eficiencia,
      bj_winrate,
      coins
    });

    const cluster = respuestaFlask.data.perfil_jugador; // Recibimos 0, 1 o 2

    // 2. Mapeo del Cluster a los nombres de tu modelo de entrenamiento
    const mapeoPerfiles = {
      0: 'Estratega',
      1: 'Casual',
      2: 'Agresivo'
    };

    const nombrePerfil = mapeoPerfiles[cluster] || 'Desconocido';

    // 3. Crear el registro en la DB con Sequelize
    const nuevaPrediccion = await Prediccion.create({
      perfil_ia: nombrePerfil,
      usuarioId: usuarioId,
      probabilidad: 1.0
    });

    return res.status(201).json({
      ok: true,
      perfil: nombrePerfil,
      datos: nuevaPrediccion
    });

  } catch (error) {
    console.error('Error en PrediccionController:', error.message);
    return res.status(500).json({
      ok: false,
      msg: 'Hubo un error al procesar la predicción con la IA'
    });
  }
};