import { DataTypes } from "sequelize"
import sequelize from "../config/database.js";

//User Table
const Session = sequelize.define(
  'Session',
  {
     //Increment ID Upon Being Added to the DB
    id:  {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    }, 
     createdAt: {
        defaultValue: DataTypes.NOW,
        type: DataTypes.DATE,
        allowNull: false,
    },  
    dateVerified: {
        type: DataTypes.DATE,
        allowNull: false,   
    },
    isActive: {
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true, // Set the default value to true for isActive co
    },
    token:  { // Session tracking and verifies the user is logged and security.
    type: DataTypes.STRING,
    allowNull: false, 
    }
  },
  {

  },
);

console.log(Session === sequelize.models.Session);
export default Session;