import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

//User connections
const Connections = sequelize.define('Connections', {
  connection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },

}, {
  tableName: 'connections',
  timestamps: false,
});

export default Connections;