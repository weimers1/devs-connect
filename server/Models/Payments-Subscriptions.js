import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

//We will Add this later Certainly Not for the fist iteration
const Payments_Subscriptions = sequelize.define('Payments_Subscriptions', {
    id: {
        //ID
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        //ID
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
});
