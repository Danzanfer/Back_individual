import { Router } from 'express';
import { postPrediccion } from '../controllers/prediccionController.js';

const router = Router();

// Configuramos la ruta POST
router.post('/', postPrediccion); 

export default router;