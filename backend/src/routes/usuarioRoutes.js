import { Router } from 'express';
import { registrarDatosJugador } from '../controllers/usuarioController.js';

const router = Router();


router.post('/perfil', registrarDatosJugador);


router.get('/', (req, res) => {
    res.json({ 
        estado: "Conectado", 
        mensaje: "La API de jugadores está respondiendo correctamente" 
    });
});

export default router;