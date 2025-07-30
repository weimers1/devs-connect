import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import sequelize from './config/database.js';
import './models/User.js';
import './models/Session.js';
import './models/MessagesTable.js';
import {createServer} from "http";
import {Server} from "socket.io";
import messageRoutes from "./Routes/MessageRoutes.js";
import errorHandler from './utils/errorHandler.js';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import { timeStamp } from 'console';

const app = express();
const httpServer = createServer(app);

// Socket.io setup for real-time messaging
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost', 'http://localhost:80'],
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// Socket.io connection handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('test-connection', (data) => {
    console.log('Received from client:', data);
    socket.emit('test-response', 'Hello from server!');
  });
  
  // Join conversation room
 socket.on(`user-login`, (userData) => { 
      socket.userId = userData.userId;
      socket.join(`user-${userData.userId}`); //Joining Their own Rooms for example user 1 is joining user 1 with his by his userID 
      console.log(`user-${userData.userId}`)
 })
     
  // Handle message sending via Socket.io
  socket.on("send-message", (messageData) => {
      if(!messageData.sender_id || !messageData.content || !messageData.receiver_id) {
        socket.emit(`message-error`, {error: `Missing Required Data`})
        return;
      }    
    try {
          //Import for message to be set we determine A) who is sending the message B) who is receiving the message and C) The message, the date, and the conversation_id (who the conversation is between)
        const message = {
        sender_id: messageData.sender_id, //Sending the message to who is receiving the message
        content: messageData.content, //The content we are sending over
        timestamp: new Date(), //The time the content is sent
        conversation_id: messageData.conversation_id, //The conversation_id shared between the two people communicating
        receiver_id: messageData.receiver_id //Who is receiving the message
        }
      socket.to(`user-${messageData.receiver_id}`).emit("receiver-message", message); //Who were sending the message to
        console.log(`user-${messageData.sender_id} Has SUCCESSFULLY SENT A MESSAGE AND ${messageData.receiver_id} HAS SUCCESSFULLY RECEIVED THE MESSAGE`) //Console log for success
      } catch (error) { //Catch an error for example if someone tries to message a User with 999 (User Doesn't Exist)
          console.error("Message send error:", error);
          socket.emit(`message-error`, {error: `Failed to send message`})
      }
    
   
  });
       socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});



const PORT = process.env.PORT || '8080';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost:5173';

// Configure CORS
const corsOptions = {
  origin: [URL_CLIENT, 'http://localhost:5173', 'http://localhost:3000', 'http://localhost', 'http://localhost:80'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};
app.use(cors(corsOptions));

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for CSRF
 //app.use(cookieParser());

// CSRF protection
 //app.use(csurf({ cookie: true }));

// Clean up duplicate email indexes
async function cleanUpEmailIndexes() {
  try {
    const [indexes] = await sequelize.query(`
      SELECT INDEX_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = 'devs_connect' 
      AND TABLE_NAME = 'users' 
      AND INDEX_NAME LIKE 'email%'
      AND INDEX_NAME != 'email';
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

// Database sync for development
if (process.env.STAGE_ENV !== 'production') {
  cleanUpEmailIndexes()
    .then(() => sequelize.sync({ alter: true }))
    .then(() => console.log('Database synced'))
    .catch((err) => console.error('Sync error:', err));
}

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log('Connected to database successfully.'))
  .catch((error) => console.error('Database connection failed:', error));

// API Routes
app.use('/api/messages', messageRoutes);

// Error handling middleware (should be last)
// app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});