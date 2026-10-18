import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from '../models/User.js';
//Message Table
const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    message_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'text',
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'sent',
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    conversation_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
  
}, {
    tableName: 'messages',
    timestamps: false,
});

export default Message;