import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Users tagged on a project by its owner.
const ProjectCollaborator = sequelize.define(
    'ProjectCollaborator',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Projects', key: 'id' },
            onDelete: 'CASCADE',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onDelete: 'CASCADE',
        },
    },
    {
        tableName: 'ProjectCollaborators',
        timestamps: true,
        indexes: [{ unique: true, fields: ['projectId', 'userId'] }, { fields: ['userId'] }],
    },
);

export default ProjectCollaborator;
