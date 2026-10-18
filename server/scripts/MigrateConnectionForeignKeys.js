import sequelize from '../config/database.js';
import User from '../models/User.js';

const queryInterface = sequelize.getQueryInterface();
const userTable = User.getTableName();
const dependentTables = [
    { name: 'connections', columns: ['user1_id', 'user2_id'] },
    { name: 'messages', columns: ['sender_id', 'receiver_id'] },
];

try {
    await sequelize.authenticate();

    const tables = await queryInterface.showAllTables();
    const userTableExists = tables.some(
        (table) => String(table) === String(userTable),
    );
    if (!userTableExists) {
        throw new Error(`Expected user table "${userTable}" does not exist.`);
    }

    const actualTables = new Map(
        tables.map((table) => [String(table).toLowerCase(), String(table)]),
    );
    const availableTables = dependentTables
        .map(({ name, columns }) => ({
            name: actualTables.get(name),
            columns,
        }))
        .filter((table) => table.name);

    if (!availableTables.length) {
        throw new Error('Neither the connections nor messages table exists.');
    }

    for (const { name, columns } of availableTables) {
        const [orphanResult] = await sequelize.query(
            `SELECT COUNT(*) AS orphanCount
             FROM \`${name}\` child
             LEFT JOIN \`${userTable}\` firstUser ON firstUser.id = child.\`${columns[0]}\`
             LEFT JOIN \`${userTable}\` secondUser ON secondUser.id = child.\`${columns[1]}\`
             WHERE firstUser.id IS NULL OR secondUser.id IS NULL`,
        );
        const orphanCount = Number(orphanResult[0]?.orphanCount || 0);
        if (orphanCount > 0) {
            throw new Error(
                `Found ${orphanCount} row(s) in "${name}" that do not match "${userTable}". ` +
                'No foreign keys were changed; reconcile these rows before retrying.',
            );
        }
    }

    for (const { name, columns } of availableTables) {
        const constraints = await sequelize.query(
            `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME IN (?, ?)
               AND REFERENCED_TABLE_NAME IS NOT NULL`,
            {
                replacements: [name, ...columns],
                type: sequelize.QueryTypes.SELECT,
            },
        );

        for (const column of columns) {
            const columnConstraints = constraints.filter(
                (constraint) => constraint.COLUMN_NAME === column,
            );
            const correctConstraint = columnConstraints.some(
                (constraint) =>
                    String(constraint.REFERENCED_TABLE_NAME) === String(userTable) &&
                    constraint.REFERENCED_COLUMN_NAME === 'id',
            );

            for (const constraint of columnConstraints) {
                const pointsToExpectedUser =
                    String(constraint.REFERENCED_TABLE_NAME) === String(userTable) &&
                    constraint.REFERENCED_COLUMN_NAME === 'id';
                if (!pointsToExpectedUser) {
                    await queryInterface.removeConstraint(
                        name,
                        constraint.CONSTRAINT_NAME,
                    );
                    console.log(
                        `Removed stale foreign key ${constraint.CONSTRAINT_NAME} from ${name}.${column}.`,
                    );
                }
            }

            if (!correctConstraint) {
                await queryInterface.addConstraint(name, {
                    fields: [column],
                    type: 'foreign key',
                    name: `fk_${name}_${column}_users`,
                    references: {
                        model: userTable,
                        key: 'id',
                    },
                });
                console.log(`Added ${name}.${column} foreign key to ${userTable}.id.`);
            }
        }
    }

    console.log('Message and connection foreign keys now reference the application user table.');
} catch (error) {
    console.error('Failed to migrate message and connection foreign keys:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
