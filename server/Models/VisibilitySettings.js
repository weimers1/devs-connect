import sequelize from "../config/database.js";
import { DataTypes } from 'sequelize';

const VisibilitySettings = sequelize.define("Visibility_Settings", {
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
    Profile_Visibility: { //Profile Visibility 
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Everyone',
        validate: {
            isIn: [['Everyone', 'Only_Me', 'Connections_Only']]
        }
    },
    Communities_Visibility: { //Communities Visibility 
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Everyone',
        validate: {
            isIn: [['Everyone', 'Only_Me', 'Connections_Only']]
        }
    },
      Connections_Visibility: { //Connections Visibility  (Who can see your connections)
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Everyone',
        validate: {
            isIn: [['Everyone', 'Only_Me', 'Connections_Only']]
        }
    },
})

export default VisibilitySettings;