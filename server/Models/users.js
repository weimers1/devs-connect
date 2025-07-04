import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

//User Table
const User = sequelize.define(
    'User',
    {
        //Increment ID Upon Being Added to the DB
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            references: {
                id: 'sender_id', //Linking the User tables to a sender_id\
                key: id,
                receiver: 'receiver' //Linking The receiving ID to the user as well
            },
        },
        //Not Allowed To Be Null After Signup if redirected  to a signup page
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        //Not Allowed To Be False
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {}
);

console.log(User === sequelize.models.User);
export default User;
