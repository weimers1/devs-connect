import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PostLike = sequelize.define('PostLike', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Posts',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    tableName: 'PostLikes',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['postId', 'userId']
        }
    ]
});

export default PostLike;