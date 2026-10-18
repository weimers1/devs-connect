import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'AWS_DB_NAME',
    'AWS_DB_USER',
    'AWS_DB_MP',
    'AWS_DB_HOST',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

if (process.env.NODE_ENV === 'production' && !process.env.DB_SSL_CA) {
    throw new Error('DB_SSL_CA is required to verify production database TLS');
}

const databaseSsl =
    process.env.NODE_ENV === 'production'
        ? {
              ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'),
              rejectUnauthorized: true,
          }
        : undefined;

const sequelize = new Sequelize(
    process.env.AWS_DB_NAME,
    process.env.AWS_DB_USER,
    process.env.AWS_DB_MP,
    {
        host: process.env.AWS_DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            connectTimeout: 60000,
            ...(databaseSsl ? { ssl: databaseSsl } : {}),
        },
        pool:{
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test database connection on initialization
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', {
            name: error.name,
            code: error.original?.code || error.code,
        });
        process.exit(1);
    }
})();

export default sequelize;
