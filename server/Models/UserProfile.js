import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const UserProfile = sequelize.define('UserProfile', {
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
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 150,
            isInt: true,
        },
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 500],
        },
    },
    profileImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    career: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    school: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default UserProfile;
