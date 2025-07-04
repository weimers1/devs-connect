import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

//Messages Table
const Messages = sequelize.define('Messages', {
    //Increment ID Upon Being Added to the DB
     
     id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Name of the User table
            key: 'id',
          
        },
        onUpdate: 'CASCADE', //Without this, deleting a user breaks all their messages
        onDelete: 'CASCADE',
    },
    
  
    content: {
        // Session tracking and verifies the user is logged and security.
        type: DataTypes.STRING,
        allowNull: false,
        
    }
}, { 
    timestamps: true,
    
});

console.log(Messages === sequelize.models.Messages);
export default Messages;
