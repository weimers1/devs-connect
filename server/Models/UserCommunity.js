import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const UserCommunity = sequelize.define('UserCommunity', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  communityId: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('member', 'admin', 'moderator'), defaultValue: 'member' },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export default UserCommunity;