import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Ensure correct database configuration import path

const Community = sequelize.define('Community', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, //  Fix: Safely auto-generates string keys for AWS
        primaryKey: true,
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    description: { 
        type: DataTypes.TEXT 
    },
    createdBy: { 
        type: DataTypes.STRING, // Changed from INTEGER to match Stytch user UUID configurations
        allowNull: false 
    },
    rules: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
    icon: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    color: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    image: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    memberCount: { 
        type: DataTypes.INTEGER, 
        defaultValue: 1 
    },
    isPrivate: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    // Fix: Turned into VIRTUAL fields so they don't corrupt your database schema creation
    isMember: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getDataValue('isMember') ?? false;
        },
        set(value) {
            this.setDataValue('isMember', Boolean(value));
        }
    },
    isOwner: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getDataValue('isOwner') ?? false;
        },
        set(value) {
            this.setDataValue('isOwner', Boolean(value));
        }
    }
}, {
    tableName: 'communities', //  Fix: Forces your AWS database table name to align with your controller query
    timestamps: true
});

export default Community;
