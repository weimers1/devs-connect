import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const Certifications = sequelize.define('Certifications', {
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
    certName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    issuer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dateEarned: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    dateExpiration: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    credentialID: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    credentialURL: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default Certifications;
