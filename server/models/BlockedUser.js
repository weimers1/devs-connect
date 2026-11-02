import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const BlockedUser = sequelize.define(
    'BlockedUser',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        blockerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
        },
        blockedUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
        },
    },
    {
        tableName: 'BlockedUsers',
        indexes: [{ unique: true, fields: ['blockerId', 'blockedUserId'] }],
    },
);

export default BlockedUser;
