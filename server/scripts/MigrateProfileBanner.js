import sequelize from '../config/database.js';
import UserProfile from '../Models/UserProfile.js';

const queryInterface = sequelize.getQueryInterface();
const profileTable = UserProfile.getTableName();

try {
    await sequelize.authenticate();
    const tables = await queryInterface.showAllTables();
    if (!tables.some((table) => String(table) === String(profileTable))) {
        throw new Error(`Expected profile table "${profileTable}" does not exist.`);
    }

    const columns = await queryInterface.describeTable(profileTable);
    if (!columns.bannerImageUrl) {
        await queryInterface.addColumn(profileTable, 'bannerImageUrl', {
            type: UserProfile.rawAttributes.bannerImageUrl.type,
            allowNull: true,
        });
    }
    console.log('Profile banner image storage is ready.');
} catch (error) {
    console.error('Failed to migrate profile banner storage:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
