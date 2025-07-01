import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import sequelize from './config/database.js';
import './models/users.js';
import './models/sessions.js';

const PORT = process.env.PORT || '8080';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost:80';

const app = express();
app.listen(PORT, () => {
    console.log('App is listening on port ' + PORT);
});

// Connect to database
await sequelize
    .authenticate()
    .then(() => {
        console.log('Connected to database successfully.');
    })
    .catch((error) => {
        console.log('Database connection failed: ' + error);
    });

// configure cors
const corsOptions = {
    origin: [URL_CLIENT],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
};
app.use(cors(corsOptions));

// Add to index.js after cors
app.use(express.json()); //Parses incoming request with JSON payloads and available in req.body
app.use(express.urlencoded({ extended: true })); // parses the data from URL forms and makes it available in "req.body"

//Will Use this for basic setup of update the DB models, but once we enter production will use Sequelize Migration for better Control
if (process.env.STAGE_ENV !== 'production') {
    sequelize
        .sync({ alter: true }) // non-destructive update
        .then(() => {
            console.log('Database synced');
        })
        .catch((err) => {
            console.error('Sync error:', err);
        });
}

// @TODO: move this to a reasonable routes file; just for test now
app.get('/', async (request, response) => {
    try {
        return response.status(200).json({ response: 'what the sigma' });
    } catch (error) {
        console.log(error);
        response.status(500).send('System Error');
    }
});
