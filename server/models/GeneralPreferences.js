import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const GeneralPreferences = sequelize.define('GeneralPreferences', {
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
    language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'English',
        validate: {
            isIn: [['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese']]
        },
    },
    time_zone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC',
        validate: {
            notEmpty: true
        },
    },
    
});

export default GeneralPreferences;
