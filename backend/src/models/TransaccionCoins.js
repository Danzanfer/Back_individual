import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const TransaccionCoins = db.define('TransaccionCoins', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  tipo_transaccion: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.STRING },
  saldo_anterior: { type: DataTypes.INTEGER },
  saldo_nuevo: { type: DataTypes.INTEGER }
}, {
  timestamps: true,
  tableName: 'transacciones_coins',
  underscored: true,
  freezeTableName: true
});

export default TransaccionCoins;
