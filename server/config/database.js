import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Choose database credentials based on environment:
// In production, strictly use AWS RDS configuration.
// In development, prefer local MYSQL_* credentials, falling back to AWS_DB_* if not set.
const dbName = isProduction
    ? process.env.AWS_DB_NAME
    : (process.env.MYSQL_DATABASE || process.env.AWS_DB_NAME);

const dbUser = isProduction
    ? process.env.AWS_DB_USER
    : (process.env.MYSQL_USER || process.env.AWS_DB_USER);

const dbPassword = isProduction
    ? process.env.AWS_DB_MP
    : (process.env.MYSQL_PASSWORD || process.env.AWS_DB_MP);

const dbHost = isProduction
    ? process.env.AWS_DB_HOST
    : (process.env.MYSQL_HOST || process.env.AWS_DB_HOST);

const dbPort = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);

// Validate required environment variables
if (isProduction) {
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

    if (!process.env.DB_SSL_CA) {
        throw new Error('DB_SSL_CA is required to verify production database TLS');
    }
} else {
    if (!dbName || !dbUser || !dbHost) {
        throw new Error(
            'Missing database configuration: define MYSQL_DATABASE, MYSQL_USER, and MYSQL_HOST (or AWS_DB_*) in .env',
        );
    }
}

const databaseSsl = isProduction
    ? {
          ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'),
          rejectUnauthorized: true,
      }
    : undefined;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        connectTimeout: 60000,
        ...(databaseSsl ? { ssl: databaseSsl } : {}),
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

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
