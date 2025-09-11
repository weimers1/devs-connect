import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

//Career Table
const Career = sequelize.define(
    'Career',
    {
        //Increment ID Upon Being Added to the DB
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        // added createdAt and updatedAt defaults since sequelize wasn't doing it by default
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
    },
    {}
);

console.log(Career === sequelize.models.Career);
export default Career;
