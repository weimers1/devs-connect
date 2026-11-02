import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Privacy_Security = sequelize.define('Privacy_Security', {
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
    phone: {
        //Change Phone Number
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9]{10}$/, // Assuming a 10-digit phone number
        },
    },
    two_factor_auth: {
        type: DataTypes.JSON,
        defaultValue: null,
    },
});

export default Privacy_Security;
