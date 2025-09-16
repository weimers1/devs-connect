import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import sequelize from './config/database.js';
import './models/User.js';
import './models/Session.js';
import './Models/MessagesTable.js';
import './Models/UserProfile.js';
import './models/DisplaySettings.js';
import './models/GeneralPreferences.js';
import './models/Privacy-Security.js';
import './models/VisibilitySettings.js';
import './models/Certifications.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import messageRoutes from './Routes/MessageRoutes.js';
import errorHandler from './utils/errorHandler.js';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import utilsRouter from './routes/utilRoutes.js';
import userRouter from './routes/userRoutes.js';
import sessionRouter from './routes/sessionRoutes.js';
import settingsRouter from './Routes/settingsRoutes.js';
import uploadRoutes from './Routes/uploadRoutes.js';
import githubRoutes from './Routes/github.js';
import passport from 'passport';
import session from 'express-session';

const PORT = process.env.PORT || '6969';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

// Socket.io setup for real-time messaging
const io = new Server(httpServer, {
    cors: {
        origin: [
            URL_CLIENT,
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost',
            'http://localhost:80',
            'http://localhost:6969',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
app.set('io', io);

// Socket.io connection handlers
io.on('connection', (socket) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Client connected');
    }

    socket.on('test-connection', (data) => {
        socket.emit('test-response', 'Hello from server!');
    });

    // Join conversation room
    socket.on(`user-login`, (userData) => {
        if (!userData || !userData.userId) {
            socket.emit('error', { message: 'Invalid user data' });
            return;
        }
        socket.userId = userData.userId;
        socket.join(`user-${userData.userId}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log('User joined room');
        }
    });

    // Handle message sending via Socket.io
    socket.on('send-message', (messageData) => {
        if (
            !messageData.sender_id ||
            !messageData.content ||
            !messageData.receiver_id
        ) {
            socket.emit(`message-error`, { error: `Missing Required Data` });
            return;
        }
        try {
            const message = {
                sender_id: messageData.sender_id,
                content: messageData.content,
                timestamp: new Date(),
                conversation_id: messageData.conversation_id,
                receiver_id: messageData.receiver_id,
            };
            socket
                .to(`user-${messageData.receiver_id}`)
                .emit('receiver-message', message);
            if (process.env.NODE_ENV !== 'production') {
                console.log('Message sent successfully');
            }
        } catch (error) {
            console.error('Message send error:', error.message);
            socket.emit(`message-error`, { error: `Failed to send message` });
        }
    });

    socket.on('disconnect', () => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Client disconnected');
        }
    });
});

// Configure CORS
const corsOptions = {
    origin: [
        URL_CLIENT,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost',
        'http://localhost:80',
        'http://localhost:6969',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for passport
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
    })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    // Handle both User models and GitHub data objects
    if (user.id) {
        done(null, { type: 'user', id: user.id });
    } else {
        done(null, { type: 'github', data: user });
    }
});

passport.deserializeUser(async (obj, done) => {
    //Convert
    try {
        if (obj.type === 'user') {
            const User = (await import('./models/User.js')).default;
            const user = await User.findByPk(obj.id);
            done(null, user);
        } else if (obj.type === 'github') {
            done(null, obj.data);
        }
    } catch (error) {
        done(error, null);
    }
});

//GitHub Linkage
app.use('/oauth', githubRoutes);

// Cookie parser for CSRF
app.use(cookieParser());

// CSRF protection for specific routes
app.use('/session', csurf({ cookie: true }), sessionRouter);
app.get('/csrf-token', csurf({ cookie: true }), (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// API Routes
app.use('/api/messages', messageRoutes); //Message Routes
app.use('/auth', authRouter); //Auth Routes
app.use('/user', userRouter); //User Routes
app.use('/utils', utilsRouter); //Utility Routes
app.use('/api/settings', settingsRouter); //Settings Routes
//Upload Profile Photos
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(errorHandler);

// Clean up duplicate email indexes
async function cleanUpEmailIndexes() {
    try {
        const [indexes] = await sequelize.query(
            `SELECT INDEX_NAME
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'users' 
       AND INDEX_NAME LIKE 'email%'
       AND INDEX_NAME != 'email'`,
            {
                replacements: [process.env.MYSQL_DATABASE],
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (indexes.length > 0) {
            const validIndexes = indexes
                .map(index => index.INDEX_NAME.replace(/[^a-zA-Z0-9_]/g, ''))
                .filter(indexName => indexName && indexName.length > 0);
            
            if (validIndexes.length > 0) {
                const dropQueries = validIndexes.map(indexName => 
                    `DROP INDEX \`${indexName}\` ON Users`
                ).join('; ');
                
                try {
                    await sequelize.query(dropQueries);
                    console.log(`Dropped indexes: ${validIndexes.join(', ')}`);
                } catch (dropError) {
                    console.error('Failed to drop indexes:', dropError);
                }
            }
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

// Start server
httpServer.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
