import { Router } from 'express';
import usuarioController from '../controllers/usuarioController.js';

const router = Router();

// Definimos ruta POST para recibir el vector
// URL completa: http://localhost:3000/api/jugador/perfil
router.post('/perfil', usuarioController.registrarDatosJugador);

// ruta para ver el historial de un jugador
router.get('/historial/:username', usuarioController.verHistorial);

export default router;