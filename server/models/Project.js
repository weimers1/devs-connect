import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const PROJECT_STATUSES = ['in_progress', 'completed', 'looking_for_contributors'];

const Project = sequelize.define(
    'Project',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        title: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        githubUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        demoUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...PROJECT_STATUSES),
            allowNull: false,
            defaultValue: 'in_progress',
        },
        // Optional community the project is shared in; validated in the controller.
        communityId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        tableName: 'Projects',
        timestamps: true,
        indexes: [{ fields: ['userId'] }, { fields: ['createdAt'] }, { fields: ['communityId'] }],
    },
);

export default Project;
