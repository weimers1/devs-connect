import sequelize from '../config/database.js';
import Community from '../Models/Communites.js';

const queryInterface = sequelize.getQueryInterface();
const communityTable = Community.getTableName();

try {
    await sequelize.authenticate();
    const columns = await queryInterface.describeTable(communityTable);

    if (columns.isMember) {
        await queryInterface.removeColumn(communityTable, 'isMember');
        console.log('Successfully dropped legacy isMember column from communities table.');
    } else {
        console.log('isMember column does not exist on communities table.');
    }

    if (columns.isOwner) {
        await queryInterface.removeColumn(communityTable, 'isOwner');
        console.log('Successfully dropped legacy isOwner column from communities table.');
    } else {
        console.log('isOwner column does not exist on communities table.');
    }

    console.log('Community columns migration complete.');
} catch (error) {
    console.error('Failed to migrate community columns:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}

