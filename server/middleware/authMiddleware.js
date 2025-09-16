import csurf from 'csurf';
import stytchClient from '../config/stytch.js';
import Session from '../models/Session.js';

// set up csrf middleware (call once, reuse)
export const csrfProtection = csurf({
    cookie: { httpOnly: true, secure: process.env.STAGE_ENV === 'production' },
});

// use this to check if a user has an active session
const authMiddleware = async (req, res, next) => {
    try {
        // grab the session token from the header with validation
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res
                .status(401)
                .json({ error: 'Invalid authorization header format' });
        }
        const token = authHeader.split(' ')[1];

        // if no token, that's a problem
        if (!token) return res.status(401).json({ error: 'No token provided' });

        // verify that token is active in database
        const dbSession = await Session.findOne({
            where: { token, isActive: true },
        });

        // if the session is not active in the database, that's a problem
        if (!dbSession)
            return res.status(401).json({ error: 'Session expired' });

        // grab the user with the active session
        req.user = { userId: dbSession.userId };

        // proceed
        next();
    } catch (error) {
        console.error('Authentication middleware error:', {
            message: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export default authMiddleware;
