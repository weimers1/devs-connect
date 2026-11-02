import sequelize from '../config/database.js';
import User from './User.js';
import { DataTypes } from 'sequelize';

//User connections
const Connections = sequelize.define('Connections', {
  connection_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,

  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },

}, {
  tableName: 'connections',
  timestamps: false,
});

export default Connections;