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
        allowNull: false,
        defaultValue: {
            enabled: false,
            method: null, // e.g., 'sms', 'email', 'authenticator'
            secret: null, // Store the secret key for 2FA
        },
    },
});

export default Privacy_Security;
