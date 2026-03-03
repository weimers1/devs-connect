import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  communityId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('posts', 'lfg', 'qanda'), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  title: { type: DataTypes.STRING },
  codeSnippet: { type: DataTypes.TEXT },
  language: { type: DataTypes.STRING },
  projectType: { type: DataTypes.STRING },
  skillsNeeded: { type: DataTypes.JSON },
  duration: { type: DataTypes.STRING },
  question: { type: DataTypes.TEXT },
  isAnswered: { type: DataTypes.BOOLEAN, defaultValue: false },
  bestAnswer: { type: DataTypes.TEXT },
  tags: { type: DataTypes.JSON },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Set up associations
Post.associate = (models) => {
  Post.belongsTo(models.User, { foreignKey: 'userId' });
};

export default Post;