import usuarioService from '../services/usuarioService.js';

export const registrarDatosJugador = async (req, res) => {
  try {
    // body: JSON desde el casino
    const datos = req.body;

    // Validación básica: si no hay datos
    if (!datos || Object.keys(datos).length === 0) {
      return res.status(400).json({ 
        error: "No se recibieron datos del jugador" 
      });
    }

    const resultado = await usuarioService.procesarYGuardarVector(datos);

    return res.status(201).json({
      mensaje: "Análisis de comportamiento guardado",
      id_proceso: resultado.id,
      usuario: resultado.username,
      perfil_ia: resultado.getDataValue('perfil_ia') // <--- Agrega esta línea
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: "Error interno al procesar el perfil psicométrico" 
    });
  }
};

