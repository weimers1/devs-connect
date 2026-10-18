import sequelize from '../config/database.js';
import Project from '../Models/Project.js';

const queryInterface = sequelize.getQueryInterface();
const projectTable = Project.getTableName();

try {
    await sequelize.authenticate();
    const columns = await queryInterface.describeTable(projectTable);
    if (!columns.communityId) {
        await queryInterface.addColumn(projectTable, 'communityId', {
            type: Project.rawAttributes.communityId.type,
            allowNull: true,
        });
        await queryInterface.addIndex(projectTable, ['communityId']);
    }
    console.log('Project community storage is ready.');
} catch (error) {
    console.error('Failed to migrate project communities:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
