import { Router } from 'express';
import { generarPrediccionJugador } from '../controllers/prediccionController.js'; 

const router = Router();

router.post('/perfil', generarPrediccionJugador);

router.get('/', (req, res) => {
    res.json({ 
        estado: "Conectado", 
        mensaje: "La API de jugadores está respondiendo correctamente" 
    });
});

export default router;