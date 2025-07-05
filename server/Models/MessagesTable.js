import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

//Messages Table
const Messages = sequelize.define('Messages', {
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
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    content: {
        type: DataTypes.TEXT, // Changed to TEXT for longer messages
        allowNull: false,
    },
    message_type: {
        type: DataTypes.ENUM('text', 'image', 'file'),
        defaultValue: 'text',
    },
    status: {
        type: DataTypes.ENUM('sent', 'delivered', 'read'),
        defaultValue: 'sent',
    },
    conversation_id: {
        type: DataTypes.STRING,
        allowNull: false,
        // Format: smaller_user_id-larger_user_id (e.g., "1-5")
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
    // Indexes removed to prevent duplicate key errors
    // Add them back later when needed for performance
});

export default Messages;
