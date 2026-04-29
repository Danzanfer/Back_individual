import usuarioService from '../services/usuarioService.js';

const registrarDatosJugador = async (req, res) => {
  try {
    // body: JSON desde el casino
    const datos = req.body;

    // Validación básica: si no hay datos
    if (!datos || Object.keys(datos).length === 0) {
      return res.status(400).json({ 
        error: "No se recibieron datos del jugador" 
      });
    }

    // Mapeo y guarder en postgres del service
    const resultado = await usuarioService.procesarYGuardarVector(datos);

    // Respuesta exitosa (201: Created)
    return res.status(201).json({
      mensaje: "Análisis de comportamiento guardado",
      id_proceso: resultado.id, // El UUID que mencionamos antes
      usuario: resultado.username
    });

  } catch (error) {
    return res.status(500).json({ 
      error: "Error interno al procesar el perfil psicométrico" 
    });
  }
};

export default { registrarDatosJugador };