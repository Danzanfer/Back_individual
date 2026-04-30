import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';

// IMPORTANTE: Importar modelos para que Sequelize los registre antes de sync
import './models/Usuario.js';
import './models/Prediccion.js';

import usuarioRoutes from './routes/usuarioRoutes.js';
import prediccionRoutes from './routes/prediccionRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/jugador', usuarioRoutes);
app.use('/api/predicciones', prediccionRoutes);

// Encendido del servidor y sincronización
const iniciarServidor = async () => {
  try {
    await db.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    
    // Sincroniza el código con las tablas existentes
    await db.sync({ alter: true }); 
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor de mi_casino corriendo en puerto ${PORT}`);
      console.log(`📡 Docker network: OK`);
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

iniciarServidor();