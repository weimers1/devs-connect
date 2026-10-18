import sequelize from '../config/database.js';

try {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS BlockedUsers (
            id INT NOT NULL AUTO_INCREMENT,
            blockerId INT NOT NULL,
            blockedUserId INT NOT NULL,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_user_block (blockerId, blockedUserId),
            KEY blocked_user_lookup (blockedUserId),
            CONSTRAINT fk_blocked_users_blocker
                FOREIGN KEY (blockerId) REFERENCES Users(id) ON DELETE CASCADE,
            CONSTRAINT fk_blocked_users_target
                FOREIGN KEY (blockedUserId) REFERENCES Users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    `);
    console.log('BlockedUsers table is ready.');
} catch (error) {
    console.error('Failed to create BlockedUsers table:', error);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
