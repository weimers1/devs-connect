import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TermsAcceptance = sequelize.define(
    'TermsAcceptance',
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
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        terms_version: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        age_confirmed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            validate: {
                isTrue(value) {
                    if (value !== true) {
                        throw new Error('Age confirmation must be true');
                    }
                },
            },
        },
        accepted_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'terms_acceptances',
        timestamps: true,
        indexes: [
            {
                fields: ['userId', 'terms_version'],
            },
        ],
    }
);

export default TermsAcceptance;

