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
  socket.on("Join-chat", (data) => {
    console.log(`USER JOINED ROOM: ${data.id}`);
    socket.join(data.id);
  });
  
  // Handle message sending via Socket.io
  socket.on("sending-messages", (data) => {
    console.log(data);
    const messageData = {
      sender_id: data.sender_id,
      conversation_id: data.conversation_id,
      receiver_id: data.receiver_id,
      content: data.content,
      timestamp: new Date()
    };
    socket.to(data.conversation_id).emit("receiver-message", messageData);
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
// app.use(cookieParser());

// CSRF protection
// app.use(csurf({ cookie: true }));

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