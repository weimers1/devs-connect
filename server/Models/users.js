import { DataTypes } from "sequelize"
import sequelize from "../config/database.js";

//User Table
const User = sequelize.define(
  'User',
  {
    //Not Allowed To Be Null After Signup if redirected  to a signup page
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //Increment ID Upon Being Added to the DB
    id:  {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    }, 
    //Not Allowed To Be False 
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {isEmail: true},
    },
    createdAt: {
        defaultValue: DataTypes.NOW, //Automatically fill this field with the current timestamp
        type: DataTypes.DATE, //stores data/time data
        allowNull: false,
    },  
    dateVerified: {
        type: DataTypes.DATE,
        allowNull: true,

    },
    isActive: {
        type: DataTypes.BOOLEAN, 
        allowNull: false, 
         defaultValue: true,
    }
  },
  {

  },
);


console.log(User === sequelize.models.User); 
export default User;