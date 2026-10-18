import { randomUUID } from 'crypto';
import User from '../models/User.js';
import sequelize from '../config/database.js';

const queryInterface = sequelize.getQueryInterface();
const userTable = User.getTableName();

try {
    await sequelize.authenticate();

    const tables = await queryInterface.showAllTables();
    if (!tables.some((table) => String(table) === String(userTable))) {
        throw new Error(`Expected user table "${userTable}" does not exist.`);
    }

    const columns = await queryInterface.describeTable(userTable);
    if (!columns.publicId) {
        await queryInterface.addColumn(userTable, 'publicId', {
            type: User.rawAttributes.publicId.type,
            allowNull: true,
        });
    }

    const [users] = await sequelize.query(
        `SELECT id FROM \`${userTable}\` WHERE publicId IS NULL OR publicId = ''`,
    );
    for (const user of users) {
        await sequelize.query(
            `UPDATE \`${userTable}\` SET publicId = ? WHERE id = ? AND (publicId IS NULL OR publicId = '')`,
            { replacements: [randomUUID(), user.id] },
        );
    }

    const [duplicates] = await sequelize.query(
        `SELECT publicId FROM \`${userTable}\` GROUP BY publicId HAVING COUNT(*) > 1 LIMIT 1`,
    );
    if (duplicates.length > 0) {
        throw new Error('Duplicate public user IDs exist; resolve them before retrying.');
    }

    await queryInterface.changeColumn(userTable, 'publicId', {
        type: User.rawAttributes.publicId.type,
        allowNull: false,
    });
    let indexes = await queryInterface.showIndex(userTable);
    const stytchIndexes = indexes.filter(
        (index) =>
            index.unique &&
            index.fields.length === 1 &&
            index.fields[0].attribute === 'stytchUserId',
    );
    if (indexes.length >= 64 && stytchIndexes.length > 1) {
        const retainedIndex =
            stytchIndexes.find((index) => index.name === 'stytchUserId') ||
            stytchIndexes[0];
        for (const index of stytchIndexes) {
            if (index.name !== retainedIndex.name) {
                await queryInterface.removeIndex(userTable, index.name);
            }
        }
        indexes = await queryInterface.showIndex(userTable);
    }

    if (!indexes.some(
        (index) =>
            index.name === 'users_public_id_unique' ||
            (index.unique && index.fields?.some((field) => field.attribute === 'publicId')),
    )) {
        await queryInterface.addIndex(userTable, ['publicId'], {
            unique: true,
            name: 'users_public_id_unique',
        });
    }

    console.log('Public user UUIDs are ready.');
} catch (error) {
    console.error('Failed to migrate public user UUIDs:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
