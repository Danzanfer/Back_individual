import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import Usuario from './Usuario.js';

const Prediccion = db.define('Prediccion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  perfil_ia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  probabilidad: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0 
  } 
}, {
  timestamps: true,
  tableName: 'prediccions'
});

// Relación
Prediccion.belongsTo(Usuario, { foreignKey: 'usuarioId' });

export default Prediccion;