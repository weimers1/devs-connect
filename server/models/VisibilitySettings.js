import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const VisibilitySettings = sequelize.define('VisibilitySettings', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    profileVisibility: {
        type: DataTypes.ENUM('Everyone', 'OnlyMe', 'ConnectionsOnly'),
        allowNull: true,
        defaultValue: 'Everyone',
    },
    communitiesVisibility: {
        type: DataTypes.ENUM('Everyone', 'OnlyMe', 'ConnectionsOnly'),
        allowNull: true,
        defaultValue: 'Everyone',
    },
    connectionsVisibility: {
        type: DataTypes.ENUM('Everyone', 'OnlyMe', 'ConnectionsOnly'),
        allowNull: true,
        defaultValue: 'Everyone',
    },
});

export default VisibilitySettings;
