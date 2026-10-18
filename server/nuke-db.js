import 'dotenv/config.js';
import sequelize from './config/database.js';

async function nukeDatabase() {
  try {
    console.log(" Disabling constraints and cleaning database...");
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Fetch all tables currently on AWS
    const [tables] = await sequelize.query("SHOW TABLES;");
    const dbKey = Object.keys(tables[0] || {})[0];
    
    if (dbKey) {
      for (let row of tables) {
        const tableName = row[dbKey];
        console.log(` Dropping table: ${tableName}`);
        await sequelize.query(`DROP TABLE IF EXISTS \`\${tableName}\`;`);
      }
      console.log(" Database is completely cleared and blank!");
    } else {
      console.log("Database was already completely empty.");
    }
  } catch (err) {
    console.error(" Error nuking database:", err.message);
  } finally {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    await sequelize.close();
  }
}

nukeDatabase();
