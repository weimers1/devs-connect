import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

//Model To handle numerous Certifications 1 UserProfile -> too many Certifications
const Certifications = sequelize.define("Certifications", {
     id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },  
    certName: {
    type: DataTypes.STRING,
    allowNull: false
    } ,
    issuer: {
    type:DataTypes.STRING,
    allowNull: false,
    },
    dateEarned: {
    type: DataTypes.STRING,
    allowNull: false,
    },
    dateExpiration: { //Some CERTS DON'T EXPIRE
    type: DataTypes.STRING,
    allowNull: true,
    },
    credentialID: {
    type: DataTypes.STRING,
    allowNull: true,
    },
    credentialURL: { //Some certs don't have URL
    type: DataTypes.STRING,
    allowNull: true,

    }
})

export default Certifications;