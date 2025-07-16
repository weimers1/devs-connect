import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import sequelize from './config/database.js';
import './models/User.js';
import './models/Session.js';
import errorHandler from './utils/errorHandler.js';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import sessionRouter from './routes/sessionRoutes.js';

const PORT = process.env.PORT || '8080';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost';
console.log(URL_CLIENT);

const app = express();
app.listen(PORT, () => {
    console.log('App is listening on port ' + PORT);
});

// configure cors
const corsOptions = {
    origin: [URL_CLIENT],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
};
app.use(cors(corsOptions));

// config incoming data
app.use(express.json()); //Parses incoming request with JSON payloads and available in req.body
app.use(express.urlencoded({ extended: true })); // parses the data from URL forms and makes it available in "req.body"

// config csrf
app.use(cookieParser());
app.use('/session', csurf({ cookie: true }), sessionRouter);

// handle errors:
app.use(errorHandler);

// additional routes
app.use('/auth', authRouter);

// clean up duplicate email indexes because otherwise the old ones linger every time a sync is performed and then the max keys limit is reached (sequelize then stops working)
async function cleanUpEmailIndexes() {
    try {
        const [indexes] = await sequelize.query(`
            SELECT INDEX_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = 'devs_connect' 
            AND TABLE_NAME = 'users' 
            AND INDEX_NAME LIKE 'email%'
            AND INDEX_NAME != 'email'; -- Keep one unique index
        `);

        for (const index of indexes) {
            await sequelize.query(
                `DROP INDEX \`${index.INDEX_NAME}\` ON Users`
            );
            console.log(`Dropped index: ${index.INDEX_NAME}`);
        }
    } catch (error) {
        console.error('Error cleaning up indexes:', error);
    }
}

//Will Use this for basic setup of update the DB models, but once we enter production will use Sequelize Migration for better Control
if (process.env.STAGE_ENV !== 'production') {
    cleanUpEmailIndexes()
        .then(() => sequelize.sync({ alter: true }))
        .then(() => console.log('Database synced'))
        .catch((err) => console.error('Sync error:', err));
}

sequelize
    .authenticate()
    .then(() => console.log('Connected to database successfully.'))
    .catch((error) => console.error('Database connection failed:', error));
