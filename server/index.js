import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import sequelize from './config/database.js';
import './Models/users.js';
import './Models/sessions.js';
import {createServer} from "http";
import {Server} from "socket.io";
import './Models/MessagesTable.js';

const app = express();
const httpServer = createServer(app); //Needs to attach itself to handle WebSocket Connections (express by itself doesn't expose the server Socket.Io needs)




//Creating the IO server for Websockets Communication (Socket.io needs its separate CORS for protecting WebSocket connections)
const io = new Server(httpServer, {
      cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'], //Same Ports just adding socket as the chatting feature.
      methods: ['GET', 'POST']  //Only Send and Receiving Text Messages Back And Forth
     }
})
    //Testing The Socket Connection
   io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('test-connection', (data) => {
    console.log('Received from client:', data);
    socket.emit('test-response', 'Hello from server!');
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});





const PORT = process.env.PORT || '8080';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost:5173';
console.log(PORT);
console.log(URL_CLIENT);

httpServer.listen(PORT, () => { //Handles Both HTTP and WebSocket
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

// configure cors for API Endpoints 
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

//Will Use this for basic setup of update the DB models, but once we enter production will use Sequelize Migration for better Control
if(process.env.STAGE_ENV !== 'production') {
    sequelize.sync({ alter: true })  // non-destructive update
  .then(() => {
    console.log("Database synced");
  })
  .catch(err => {
    console.error("Sync error:", err);
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

//Testing The Table Schema 
async function testTables() {
    try {
        await sequelize.sync(); //Attempt to add the tables to the DB
        console.log("Database Tables created successfully"); 
    }  catch(error) {
        console.error("unable to add tables to the database", error);
    }
}

testTables();


