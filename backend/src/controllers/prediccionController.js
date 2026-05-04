import axios from 'axios';
import Prediccion from '../models/Prediccion.js';
import Usuario from '../models/Usuario.js';

const isUuid = (value) => {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
};

export const postPrediccion = async (req, res) => {
    const { jugador_actual, datos_conductuales, bj_stats, coins } = req.body;

    try {
        if (!jugador_actual || !jugador_actual.username) {
            return res.status(400).json({
                ok: false,
                msg: 'Falta información de jugador_actual en el payload'
            });
        }

        const usuarioWhere = isUuid(jugador_actual.id)
            ? { id: jugador_actual.id }
            : { username: jugador_actual.username };

        const [usuario] = await Usuario.findOrCreate({
            where: usuarioWhere,
            defaults: {
                username: jugador_actual.username,
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