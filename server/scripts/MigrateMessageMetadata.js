import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const queryInterface = sequelize.getQueryInterface();

try {
    const columns = await queryInterface.describeTable('messages');
    const fields = [
        ['message_type', {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'text',
        }],
        ['status', {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'sent',
        }],
        ['read_at', {
            type: DataTypes.DATE,
            allowNull: true,
        }],
    ];

    for (const [name, definition] of fields) {
        if (!columns[name]) {
            await queryInterface.addColumn('messages', name, definition);
            console.log(`Added messages.${name}`);
        }
    }
} finally {
    await sequelize.close();
}
