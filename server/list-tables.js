import 'dotenv/config.js';
import sequelize from './config/database.js';

async function verifyTables() {
  try {
    // This queries AWS directly for a list of actual tables
    const [results] = await sequelize.query("SHOW TABLES;");
    console.log("=========================================");
    console.log(" ACTUAL TABLES CURRENTLY ON AWS RDS:");
    console.log("=========================================");
    if (results.length === 0) {
      console.log("(The database is completely empty)");
    } else {
      console.table(results);
    }
    console.log("=========================================");
  } catch (err) {
    console.error(" Could not connect to AWS:", err.message);
  } finally {
    await sequelize.close();
  }
}

verifyTables();