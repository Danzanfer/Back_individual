import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import Usuario from './models/Usuario.js';
import Prediccion from './models/Prediccion.js';
import TransaccionCoins from './models/TransaccionCoins.js';
import prediccionRoutes from './routes/prediccionRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors());

app.use(express.json());

// Definición de relaciones centralizada para evitar errores de inicialización
Usuario.hasMany(Prediccion, { 
  foreignKey: 'usuario_id', 
  as: 'predicciones' 
});
Prediccion.belongsTo(Usuario, { 
  foreignKey: 'usuario_id', 
  as: 'usuario' 
});

Usuario.hasMany(TransaccionCoins, {
  foreignKey: 'usuario_id',
  as: 'transacciones'
});
TransaccionCoins.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

app.use('/api/auth', authRoutes);
app.use('/api/predicciones', prediccionRoutes);

const conectarDB = async () => {
  try {
    await db.authenticate();
    await db.sync({ force: false, alter: true });
    console.log('✅ Conexión exitosa y tablas sincronizadas: usuarios, predicciones, transacciones_coins');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

conectarDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});