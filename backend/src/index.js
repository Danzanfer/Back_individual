import express from 'express';
import db from './config/db.js';
import Usuario from './models/Usuario.js';
import Prediccion from './models/Prediccion.js';
import prediccionRoutes from './routes/prediccionRoutes.js';

const app = express();
app.use(express.json());

// CONFIGURACIÓN DE RELACIONES (Rompe la importación circular)
Usuario.hasMany(Prediccion, { 
  foreignKey: 'usuario_id', 
  as: 'predicciones' 
});
Prediccion.belongsTo(Usuario, { 
  foreignKey: 'usuario_id', 
  as: 'usuario' 
});

app.use('/api/predicciones', prediccionRoutes);

const conectarDB = async () => {
  try {
    await db.authenticate();
    // force: true borrará las tablas Prediccion/Usuarios mal creadas
    await db.sync({ force: true });
    console.log('✅ Base de datos sincronizada: usuarios y predicciones creadas.');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

conectarDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});