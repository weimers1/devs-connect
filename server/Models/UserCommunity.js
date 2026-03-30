import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const UserCommunity = sequelize.define('UserCommunity', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  communityId: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('member', 'admin', 'owner', 'banned'), defaultValue: 'member' },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  BanStatus: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
  Review: {type: DataTypes.INTEGER,  Max:5, allowNull: true, defaultValue: 0  }
});

export default UserCommunity;