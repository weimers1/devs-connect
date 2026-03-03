import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const DisplaySettings = sequelize.define('DisplaySettings', {
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
    theme: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'light',
        validate: {
            isIn: [['light', 'dark']],
        },
    },
    fontSize: {
        type: DataTypes.ENUM('small', 'medium', 'large'),
        allowNull: false,
        defaultValue: 'medium',
    },
});

export default DisplaySettings;
