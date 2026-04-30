import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Usuario = db.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: { type: DataTypes.STRING, allowNull: false },

  // --- Descriptores de Comportamiento (Para la IA) ---
  bart_riesgo:     { type: DataTypes.FLOAT },   // Score ajustado
  bart_explosiones: { type: DataTypes.INTEGER }, // Globos explotados
  mem_eficiencia:  { type: DataTypes.INTEGER }, // % acierto
  mem_velocidad:   { type: DataTypes.FLOAT },   // Tiempo de reacción

  // --- Estadísticas de Juego ---
  bj_winrate: { type: DataTypes.FLOAT },
  coins:      { type: DataTypes.INTEGER },

  // --- Resultados del Modelo Python (.pkl) ---
  // Aquí guardaremos lo que Flask prediga
  perfil_psicologico: { type: DataTypes.STRING }, // Ej: "Impulsivo", "Conservador"
  probabilidad_fuga:  { type: DataTypes.FLOAT },  // Probabilidad de que deje de jugar
  
  // --- Contexto ---
  ciudad: { type: DataTypes.STRING },
  clima:  { type: DataTypes.STRING }
}, {
  timestamps: true,
  tableName: 'usuarios'
});

export default Usuario;