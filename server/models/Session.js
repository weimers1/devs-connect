import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Session = sequelize.define('Session', {
    //Increment ID Upon Being Added to the DB
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Name of the User table
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Set the default value to true for isActive
    },
    isExtended: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Set the default value to false; column will be used to tell whether a session has been extended
    },
    token: {
        // Session tracking and verifies the user is logged and security.
        type: DataTypes.STRING,
        allowNull: false,
    },
});

console.log(Session === sequelize.models.Session);
export default Session;
