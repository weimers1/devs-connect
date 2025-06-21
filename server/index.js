import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';

const PORT = process.env.PORT || '8080';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost:' + PORT;
console.log(PORT);
console.log(URL_CLIENT);

const app = express();
app.listen(PORT, () => {
    console.log('App is listening on port ' + PORT);
});

// configure cors
const corsOptions = {
    origin: URL_CLIENT,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// @TODO: move this to a reasonable routes file; just for test now
app.get('/', async (request, response) => {
    try {
        return response.status(200).json({ response: 'what the sigma' });
    } catch (error) {
        console.log(error);
        response.status(500).send('System Error');
    }
});
