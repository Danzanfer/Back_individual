import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Usuario = db.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING },
  bart_riesgo: { type: DataTypes.FLOAT },
  bart_explosiones: { type: DataTypes.INTEGER },
  mem_eficiencia: { type: DataTypes.INTEGER },
  mem_velocidad: { type: DataTypes.FLOAT },
  bj_winrate: { type: DataTypes.FLOAT },
  coins: { type: DataTypes.INTEGER },
  perfil_psicologico: { type: DataTypes.STRING },
  probabilidad_fuga: { type: DataTypes.FLOAT },
  ciudad: { type: DataTypes.STRING },
  clima: { type: DataTypes.STRING }
}, {
  timestamps: true,
  tableName: 'usuarios',
  underscored: true,
  freezeTableName: true
});


export default Usuario;