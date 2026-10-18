import express from 'express';
import './config/loadEnv.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import stytchClient from './config/stytch.js';
import User from './models/User.js';
import { isBlockedBetweenUsers } from './utils/userVisibility.js';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { RedisStore as RedisRateLimitStore } from 'rate-limit-redis';
import { RedisStore as RedisSessionStore } from 'connect-redis';
import { createClient } from 'redis';

// Database & Sequelize Models
import sequelize from './config/database.js';
import './models/User.js';
import './models/Session.js';
import './Models/MessagesTable.js';
import './Models/UserProfile.js';
import './Models/DisplaySettings.js';
import './Models/GeneralPreferences.js';
import './Models/Privacy-Security.js';
import './Models/VisibilitySettings.js';
import './Models/Certifications.js';
import './Models/Communites.js';
import './Models/UserCommunity.js';
import './Models/Post.js';
import './Models/PostLike.js';
import './Models/PostComment.js';
import './Models/SavedPost.js';
import './Models/Project.js';
import './Models/ProjectCollaborator.js';
import './Models/Connections.js';
import './Models/BlockedUser.js';

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
import blockRoutes from './Routes/blockRoutes.js';
import communityRoutes from './Routes/communityRoutes.js';
import searchRoutes from './Routes/searchRoutes.js';
import projectRoutes from './Routes/projectRoutes.js';

const PORT = process.env.PORT || '6969';
const URL_CLIENT = process.env.URL_CLIENT || 'http://localhost:5173';
const CLIENT_URL =
    process.env.CLIENT_URL ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:80');
const SERVER_URL =
    process.env.SERVER_URL ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:6969');
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;
const trustProxyHops = Number(process.env.TRUST_PROXY || 0);
const redisUrl = process.env.REDIS_URL;

if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be configured with at least 32 characters');
}
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    throw new Error('TRUST_PROXY must be a non-negative integer');
}
if (isProduction) {
    if (!redisUrl) {
        throw new Error('REDIS_URL must be configured for production');
    }
    let redisUrlParsed;
    try {
        redisUrlParsed = new URL(redisUrl);
    } catch {
        throw new Error('REDIS_URL must be a valid rediss:// URL in production');
    }
    if (redisUrlParsed.protocol !== 'rediss:') {
        throw new Error('REDIS_URL must use TLS (rediss://) in production');
    }
    if (trustProxyHops < 1) {
        throw new Error('TRUST_PROXY must be configured for production deployments');
    }
    for (const [name, value] of Object.entries({
        URL_CLIENT,
        CLIENT_URL,
        SERVER_URL,
        BASE_URL: process.env.BASE_URL,
    })) {
        let parsed;
        try {
            parsed = new URL(value);
        } catch {
            throw new Error(`${name} must be configured as an HTTPS origin in production`);
        }
        if (parsed.protocol !== 'https:' || parsed.origin !== value.replace(/\/$/, '')) {
            throw new Error(`${name} must be configured as an HTTPS origin in production`);
        }
    }
}

const app = express();
const httpServer = createServer(app);
app.set('trust proxy', trustProxyHops);
const redisClient = isProduction
    ? createClient({
          url: redisUrl,
          socket: {
              reconnectStrategy: (retries) =>
                  retries > 5
                      ? new Error('Redis connection retry limit reached')
                      : Math.min(retries * 250, 2000),
          },
      })
    : null;
redisClient?.on('error', (error) => {
    console.error('Redis connection error:', {
        name: error.name,
        code: error.code,
    });
});
const redisConnection = redisClient
    ? redisClient.connect()
    : Promise.resolve();

const createRateLimitStore = (prefix) =>
    redisClient
        ? new RedisRateLimitStore({
              prefix: `devs-connect:rate-limit:${prefix}:`,
              sendCommand: async (...args) => {
                  await redisConnection;
                  return redisClient.sendCommand(args);
              },
          })
        : undefined;
const apiRateLimitStore = createRateLimitStore('api');
const authRateLimitStore = createRateLimitStore('auth');
const writeRateLimitStore = createRateLimitStore('write');

// ============================================================================
// 4. GLOBAL MIDDLEWARES & RATE LIMITERS
// ============================================================================
export const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: isProduction ? 100 : 1000,
    passOnStoreError: false,
    standardHeaders: true,
    legacyHeaders: false,
    ...(apiRateLimitStore ? { store: apiRateLimitStore } : {}),
    handler: (_req, res) => {
        res.status(429).json({
            error: 'Too many requests. Please try again in a few minutes.',
        });
    },
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isProduction ? 10 : 100,
    passOnStoreError: false,
    standardHeaders: true,
    legacyHeaders: false,
    ...(authRateLimitStore ? { store: authRateLimitStore } : {}),
    handler: (_req, res) => {
        res.status(429).json({
            error: 'Too many authentication requests. Please try again later.',
        });
    },
});

export const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: isProduction ? 30 : 300,
    passOnStoreError: false,
    skip: (req) => !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method),
    standardHeaders: true,
    legacyHeaders: false,
    ...(writeRateLimitStore ? { store: writeRateLimitStore } : {}),
    handler: (_req, res) => {
        res.status(429).json({
            error: 'Too many write requests. Please wait before trying again.',
        });
    },
});

// Configure CORS
const corsOrigins = isProduction
    ? [...new Set([URL_CLIENT, CLIENT_URL])]
    : [
        URL_CLIENT,
        CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost',
        'http://localhost:80',
        'http://localhost:6969',
    ];
const corsOptions = {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());

const trustedOrigins = new Set(corsOrigins.map((origin) => new URL(origin).origin));
app.use((req, res, next) => {
    if (isProduction) {
        res.setHeader(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
        if (!req.secure) {
            return res.redirect(
                308,
                `${new URL(SERVER_URL).origin}${req.originalUrl}`
            );
        }
    }

    const csp = [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self' https://github.com",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data: https:",
        `connect-src 'self' ${[...trustedOrigins].join(' ')} https://*.stytch.com wss://*.stytch.com`,
        "frame-src https://*.stytch.com",
        ...(isProduction ? ['upgrade-insecure-requests'] : []),
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    const hasSessionCookie = Boolean(req.cookies?.session_token);
    const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    if (hasSessionCookie && isMutation) {
        const requestOrigin = req.get('Origin');
        if (!requestOrigin || !trustedOrigins.has(requestOrigin)) {
            return res.status(403).json({ error: 'Request origin is not allowed' });
        }
    }
    return next();
});

// Apply the request cap to every server endpoint, then add stricter write/auth caps.
app.use(apiLimiter);
app.use('/api', writeLimiter);
app.use('/auth', authLimiter);

// Body parsers follow safely underneath
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        name: 'oauth_session',
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        ...(redisClient
            ? {
                  store: new RedisSessionStore({
                      client: redisClient,
                      prefix: 'devs-connect:oauth:sess:',
                      ttl: 10 * 60,
                  }),
              }
            : {}),
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000,
        },
    }),
);

// Initialize Passport authentication layers
app.use(passport.initialize());

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
    allowRequest: (req, callback) => {
        const origin = req.headers.origin;
        callback(null, typeof origin === 'string' && trustedOrigins.has(origin));
    },
});
app.set('io', io);

io.use(async (socket, next) => {
    const sessionCookie = socket.handshake.headers.cookie
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('session_token='))
        ?.slice('session_token='.length);
    let sessionToken;
    try {
        sessionToken = sessionCookie
            ? decodeURIComponent(sessionCookie)
            : null;
    } catch {
        return next(new Error('Authentication required'));
    }
    if (typeof sessionToken !== 'string' || !sessionToken) {
        return next(new Error('Authentication required'));
    }

    try {
        const { session } = await stytchClient.sessions.authenticate({
            session_token: sessionToken,
        });
        const user = await User.findOne({
            where: { stytchUserId: session.user_id },
        });
        if (!user) {
            return next(new Error('Authentication failed'));
        }
        socket.data.userId = user.id;
        return next();
    } catch {
        return next(new Error('Authentication failed'));
    }
});

io.on('connection', (socket) => {
    socket.join(`user-${socket.data.userId}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log('Client connected');
    }

    socket.on('test-connection', (data) => {
        socket.emit('test-response', 'Hello from server!');
    });

    // Relays "is typing" to the other person only; nothing is stored.
    let lastTypingAt = 0;
    socket.on('typing', async (payload) => {
        try {
            const now = Date.now();
            const isTyping = payload?.isTyping === true;
            if (isTyping && now - lastTypingAt < 500) return;
            if (isTyping) lastTypingAt = now;
            const receiverId = Number(payload?.receiverId);
            const senderId = Number(socket.data.userId);
            if (
                !Number.isInteger(receiverId) ||
                receiverId <= 0 ||
                receiverId === senderId
            ) {
                return;
            }
            if (await isBlockedBetweenUsers(senderId, receiverId)) return;
            io.to(`user-${receiverId}`).emit('typing', {
                userId: senderId,
                isTyping,
            });
        } catch {
            // Typing indicators are best-effort.
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
// OAuth state protects the callback; API mutations use same-origin cookie auth.
app.use('/oauth', githubRoutes);
app.use('/session', sessionRouter);

// Core Functional Application API Endpoint Links
app.use('/api/messages', messageRoutes);
app.use('/auth', authRouter);
// app.use('/user', userRouter);
app.use('/utils', utilsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/users', userRouter);
app.use('/api/connections', connectionsRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/projects', projectRoutes);

// Global Application Error Interceptor Middleware Fallback
app.use(errorHandler);

// Create missing tables locally without altering existing production-like schemas.
async function syncDatabase() {
    await sequelize.sync();
    try {
        const queryInterface = sequelize.getQueryInterface();
        const columns = await queryInterface.describeTable('communities');
        if (columns.isMember) {
            await queryInterface.removeColumn('communities', 'isMember');
            console.log('Removed legacy isMember column from communities.');
        }
        if (columns.isOwner) {
            await queryInterface.removeColumn('communities', 'isOwner');
            console.log('Removed legacy isOwner column from communities.');
        }
    } catch (error) {
        console.warn('Could not inspect/clean legacy community columns:', error.message);
    }
    console.log('Missing database tables synchronized; existing tables were not altered.');
}

const closeRedis = async () => {
    if (!redisClient?.isOpen) return;
    try {
        await redisClient.quit();
    } catch (error) {
        console.error('Failed to close the Redis connection:', {
            name: error.name,
            code: error.code,
        });
    }
};

const startServer = async () => {
    try {
        if (redisClient) {
            await redisConnection;
            console.log('Connected to shared Redis stores.');
        }
        await sequelize.authenticate();
        console.log('Connected to database successfully.');

        if (process.env.STAGE_ENV !== 'production') {
            await syncDatabase();
            console.log(' Database sync pipeline complete!');
        }
    } catch (error) {
        console.error('Required service setup failed; server was not started:', {
            name: error.name,
            code: error.code || error.original?.code,
        });
        await closeRedis();
        try {
            await sequelize.close();
        } catch (closeError) {
            console.error('Failed to close the database connection:', {
                name: closeError.name,
                code: closeError.original?.code || closeError.code,
            });
        }
        process.exitCode = 1;
        return;
    }

    try {
        await new Promise((resolve, reject) => {
            const handleListening = () => {
                httpServer.off('error', handleError);
                resolve();
            };
            const handleError = (error) => {
                httpServer.off('listening', handleListening);
                reject(error);
            };

            httpServer.once('listening', handleListening);
            httpServer.once('error', handleError);
            httpServer.listen(PORT, () => {
                console.log(`App is listening on port ${PORT}`);
            });
        });
    } catch (error) {
        if (error?.code === 'EADDRINUSE') {
            console.error(
                `Port ${PORT} is already in use. Stop the existing server process before starting another instance.`,
            );
        } else {
            console.error('Server failed to listen:', error);
        }
        try {
            await sequelize.close();
        } catch (closeError) {
            console.error('Failed to close the database connection:', closeError);
        }
        await closeRedis();
        process.exitCode = 1;
    }
};

void startServer();
