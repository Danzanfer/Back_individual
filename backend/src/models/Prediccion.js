import { DataTypes } from 'sequelize';
import db from '../config/db.js';

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
  underscored: true,
  tableName: 'predicciones',
  freezeTableName: true
});

// IMPORTANTE: NO pongas belongsTo aquí.
export default Prediccion;