import express from 'express';
const router = express.Router();
import { generarPrediccionJugador } from '../controllers/prediccionController.js';

router.post('/generar', generarPrediccionJugador);


export default router;