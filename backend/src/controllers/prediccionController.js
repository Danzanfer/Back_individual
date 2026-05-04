import axios from 'axios';
import Prediccion from '../models/Prediccion.js';
import Usuario from '../models/Usuario.js';

export const postPrediccion = async (req, res) => {
    const { jugador_actual, datos_conductuales, bj_stats, coins } = req.body;

    try {
        // 1. Asegurar que el usuario existe (lo busca o lo crea)
        // Esto evita que la DB rechace la predicción por falta de usuario
        const [usuario] = await Usuario.findOrCreate({
            where: { id: jugador_actual.id },
            defaults: { 
                username: `jugador_${jugador_actual.id.slice(0, 5)}`,
                coins: coins || 0
            }
        });

        // 2. Llamada a la IA en Flask
        const datosParaIA = {
            ...datos_conductuales,
            ...bj_stats,
            coins
        };

        const respuestaIA = await axios.post('http://mi_casino_flask:5000/predict', datosParaIA);

        // 3. Guardar la predicción vinculada al usuario
        const nuevaPrediccion = await Prediccion.create({
            perfil_ia: respuestaIA.data.perfil || 'Desconocido',
            probabilidad: 1.0, // O el valor que devuelva tu IA
            usuario_id: usuario.id 
        });

        console.log(`✅ Predicción guardada para el usuario: ${usuario.id}`);

        // 4. Respuesta al cliente
        res.json({
            ok: true,
            perfil: respuestaIA.data.perfil,
            configuracion_juego: respuestaIA.data.configuracion_juego,
            id_registro: nuevaPrediccion.id
        });

    } catch (error) {
        console.error('❌ Error en el flujo de predicción:', error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error interno en el servidor o comunicación con IA',
            error: error.message
        });
    }
};