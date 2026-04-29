import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar las Rutas
// rutas de usuario empezarán por /api/jugador
app.use('/api/jugador', usuarioRoutes);

// Encendido del servidor y sincronización con Postgres
const iniciarServidor = async () => {
  try {
    await db.authenticate();
    await db.sync({ alter: true }); 
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor de mi_casino corriendo en puerto ${PORT}`);
      console.log(`✅ Conectado a mi_casino_db en Docker`);
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

iniciarServidor();