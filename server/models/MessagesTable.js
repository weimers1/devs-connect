import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

//Messages Table
const Messages = sequelize.define(
    'Messages',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        //Id To Identify The Sender which also is tied to the Users Table
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
        //Need to identify the receiver_id And tie it to the user
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        //Content, what they're sending Text provides 65k text amount
        content: {
            type: DataTypes.TEXT, // Changed to TEXT for longer messages
            allowNull: false,
        },
        //For now we have text, but in the future we can implement the image/gifs even files
        message_type: {
            type: DataTypes.ENUM('text', 'image', 'file'),
            defaultValue: 'text',
        },
        //What the status of the message is
        status: {
            type: DataTypes.ENUM('sent', 'delivered', 'read'),
            defaultValue: 'sent',
        },
        //This is the conversation id (users who share a conversation id for example 1-2 they can send messages back and forth)
        conversation_id: {
            type: DataTypes.STRING,
            allowNull: false,
            // Format: smaller_user_id-larger_user_id (e.g., "1-5")
        },
        //This will be able to determine when the message was read at
        read_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        indexes: [
            {
                fields: ['conversation_id', 'createdAt']
            },
            {
                fields: ['sender_id']
            },
            {
                fields: ['receiver_id']
            }
        ]
    }
);

export default Messages;
