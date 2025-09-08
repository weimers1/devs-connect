import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const DisplaySettings = sequelize.define('DisplaySettings', {
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
    theme: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'light',
        validate: {
            isIn: [['light', 'dark']]
        }
    },
    font_size: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'medium',
        validate: {
            isIn: [['small', 'medium', 'large']]
        }
    },
   
}
);

export default DisplaySettings;