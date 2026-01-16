import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import UserCommunity from './UserCommunity.js';


const Community = sequelize.define('Community', {

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
  icon: { type: DataTypes.STRING, allowNull: true },
  color: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  memberCount: { type: DataTypes.INTEGER, defaultValue: 1 },
  isMember: {type: DataTypes.BOOLEAN, allowNull: false},
  isOwner: {type: DataTypes.BOOLEAN, allowNull: false},
  isPrivate: { type: DataTypes.BOOLEAN, defaultValue: false },

  

});

export default Community;
