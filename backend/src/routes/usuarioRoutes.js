import { Router } from 'express';
import { registrarDatosJugador } from '../controllers/usuarioController.js';

const router = Router();

router.post('/perfil', registrarDatosJugador);


export default router;