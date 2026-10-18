import sequelize from '../config/database.js';
import User from '../Models/User.js';

const queryInterface = sequelize.getQueryInterface();
const userTable = User.getTableName();

try {
    await sequelize.authenticate();
    const columns = await queryInterface.describeTable(userTable);
    if (!columns.githubProfileVisible) {
        await queryInterface.addColumn(userTable, 'githubProfileVisible', {
            type: User.rawAttributes.githubProfileVisible.type,
            allowNull: false,
            defaultValue: false,
        });
    }
    console.log('GitHub profile visibility storage is ready.');
} catch (error) {
    console.error('Failed to migrate GitHub profile visibility:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
