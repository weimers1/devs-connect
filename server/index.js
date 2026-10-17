import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { rateLimit } from 'express-rate-limit';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Database & Sequelize Models
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
import './Models/Communites.js';
import './Models/UserCommunity.js';
import './Models/Post.js';
import './Models/PostLike.js';
import './Models/PostComment.js';
import './Models/Connections.js';

// Route Handlers & Utilities
import messageRoutes from './Routes/MessageRoutes.js';
import errorHandler from './utils/errorHandler.js';
import authRouter from './routes/authRoutes.js';
import utilsRouter from './routes/utilRoutes.js';
import userRouter from './routes/userRoutes.js';
import sessionRouter from './routes/sessionRoutes.js';
import settingsRouter from './Routes/settingsRoutes.js';
import uploadRoutes from './Routes/uploadRoutes.js';
import githubRoutes from './Routes/github.js';
import connectionsRoutes from './Routes/connectionsRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

const PORT = process.env.PORT || '6969';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

// ============================================================================
// 3. FIREBASE ADMIN SDK INITIALIZATION & MIDDLEWARE (COMMENTED OUT)
// ============================================================================
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const keyPath = path.resolve(__dirname, 'firebase-admin-key.json');
// const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

// Modern modular initialization syntax
// initializeApp({
//     credential: cert(serviceAccount),
// });

// Express Auth Verification Token Interceptor Middleware Layer
// export const verifyAdminToken = async (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res
//             .status(401)
//             .json({ error: 'Access Denied: Missing identity token.' });
//     }

//     const token = authHeader.split(' ')[1]; // Extract token string safely

//     try {
//         const decodedToken = await getAuth().verifyIdToken(token);

//         // Strict Custom Claim Guard Validation
//         if (!decodedToken.admin) {
//             return res.status(403).json({
//                 error: 'Access Forbidden: Admin privileges required.',
//             });
//         }

//         req.adminUser = decodedToken;
//         next();
//     } catch (error) {
//         return res
//             .status(403)
//             .json({ error: 'Access Forbidden: Invalid console credentials.' });
//     }
// };

// ============================================================================
// 4. GLOBAL MIDDLEWARES & RATE LIMITERS
// ============================================================================
// Rate Limiter for general API routes
export const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: process.env.NODE_ENV === 'production' ? 100 : 10000,
    message: 'Too many requests from this IP, please try again after 5 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Moderate Limiter for posting/creating content
export const createLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10000,
    message:
        'SLOW DOWN! You are creating content too quickly. Please wait a moment before trying again.',
});

// Apply rate limiting to all /api/ endpoints
app.use('/api/', apiLimiter);

// Configure CORS
const corsOptions = {
    origin: [
        URL_CLIENT,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost',
        'http://localhost:80',
        'http://localhost:6969',
        'http://localhost:6969/api/admin/system-stats',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for CSRF tracking
app.use(cookieParser());

// Session middleware for passport
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
    }),
);

// Initialize Passport authentication layers
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization setup
passport.serializeUser((user, done) => {
    if (user.id) {
        done(null, { type: 'user', id: user.id });
    } else {
        done(null, { type: 'github', data: user });
    }
});

passport.deserializeUser(async (obj, done) => {
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

// ============================================================================
// 5. SOCKET.IO REAL-TIME ROUTING & ENGINE CONFIGURATION
// ============================================================================
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

io.on('connection', (socket) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Client connected');
    }

    socket.on('test-connection', (data) => {
        socket.emit('test-response', 'Hello from server!');
    });

    socket.on('user-login', (userData) => {
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

    socket.on('send-message', (messageData) => {
        if (
            !messageData.sender_id ||
            !messageData.content ||
            !messageData.receiver_id
        ) {
            socket.emit('message-error', { error: 'Missing Required Data' });
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
            socket.emit('message-error', { error: 'Failed to send message' });
        }
    });

    socket.on('disconnect', () => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Client disconnected');
        }
    });
});

// ============================================================================
// 6. APPLICATIONS CORE API ROUTING MAP
// ============================================================================
// OAuth and CSRF Protection Layout Utilities
app.use('/oauth', githubRoutes);
app.use('/session', csurf({ cookie: true }), sessionRouter);
app.get('/csrf-token', csurf({ cookie: true }), (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Core Functional Application API Endpoint Links
app.use('/api/messages', messageRoutes);
app.use('/auth', authRouter);
// app.use('/user', userRouter);
app.use('/utils', utilsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRoutes);
app.use('/api/communities', communityRoutes, createLimiter);
app.use('/api/users', userRouter);
app.use('/api/connections', connectionsRoutes);
app.use('/api/search', searchRoutes);

// --- PROTECTED ADMIN ROUTE (COMMENTED OUT - RELIES ON FIREBASE) ---
// app.get('/api/admin/system-stats', verifyAdminToken, (req, res) => {
//     res.json({
//         status: 'online',
//         systemLoad: 'Stable (1.02%)',
//         activeDatabaseContext: 'devs-connect-944ba', // Maps to project id from console
//         authorizedOperator: req.adminUser.email,
//     });
// });

// Global Application Error Interceptor Middleware Fallback
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
            },
        );

        if (indexes.length > 0) {
            const validIndexes = indexes
                .map((index) => index.INDEX_NAME.replace(/[^a-zA-Z0-9_]/g, ''))
                .filter((indexName) => indexName && indexName.length > 0);

            if (validIndexes.length > 0) {
                const dropQueries = validIndexes
                    .map((indexName) => `DROP INDEX \`${indexName}\` ON Users`)
                    .join('; ');

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
        .then(() => sequelize.sync({ alter: true, force: false }))
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
