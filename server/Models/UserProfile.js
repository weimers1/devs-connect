import sequelize from "../config/database.js";
import { DataTypes } from 'sequelize';
    //Profile Information IN settings
const UserProfile = sequelize.define('UserProfile', {
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
       
        location: {
        type: DataTypes.STRING,
        allowNull: true //Not required to submit location 
        },
        age: {
        type: DataTypes.INTEGER,
        allowNull: true, //Not required to submit age
        validate: {
            len: [0, 3],
            isNumeric: true
        }

        },
        gender: {
        type: DataTypes.STRING,
        allowNull: true //Not required to submit gender
        },
        bio:  {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 500]
        
        }
    },
        pfp: {
        type: DataTypes.STRING,
        allowNull: true 
        },
        career: {
        type: DataTypes.STRING,
        allowNull: true
        },
        school: {
        type: DataTypes.STRING,
        allowNull: true
        }
    }     
);// Sync model (remove after first run)


export default UserProfile;