import sequelize from '../config/database.js';
import SavedPost from '../models/SavedPost.js';

try {
    await sequelize.authenticate();
    await SavedPost.sync();
    console.log('SavedPosts table is ready.');
} catch (error) {
    console.error('Failed to create SavedPosts table:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
