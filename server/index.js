import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import sequelize from './config/database.js';

const PORT = process.env.PORT || '8080';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost:5173';
console.log(PORT);
console.log(URL_CLIENT);

const app = express();
app.listen(PORT, () => {
    console.log('App is listening on port ' + PORT);
});

    // TESTING DB FUNCTIONALITY
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate(); // Attempt to authenticate the connection
    console.log('Database connection has been established successfully.'); // Log success if connected
  } catch (error) {
    console.error('Unable to connect to the database:', error); // Log error if connection fails
  }
}

testDatabaseConnection(); 


// configure cors
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};
app.use(cors(corsOptions));

    //Middle Ware
// Add to index.js after cors
app.use(express.json()); //Parses incoming request with JSON payloads and available in req.body
app.use(express.urlencoded({ extended: true })); // parses the data from URL forms and makes it available in "req.body"


// @TODO: move this to a reasonable routes file; just for test now
app.get('/', async (request, response) => {
    try {
        return response.status(200).json({ response: 'what the sigma' });
    } catch (error) {
        console.log(error);
        response.status(500).send('System Error');
    }
});


