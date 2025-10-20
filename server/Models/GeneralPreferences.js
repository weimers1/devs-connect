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
    timeZone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC',
        validate: {
            notEmpty: true
        },
    },
    notifications: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            soundEffects: false,
            pushNotifications: false,
            emailNotifications: false,
            desktopNotifications: false,
        },
    },
    feedPreferences: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            latestPosts: false,
            mostPopular: true,
            followingOnly: false,
        },
    },
    contentFiltering: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            explicitContent: false,
            filterSpam: false,
            filterProfanity: false,
        },
    },
});

export default GeneralPreferences;
