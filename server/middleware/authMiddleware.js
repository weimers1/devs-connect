import csurf from 'csurf';
import stytchClient from '../config/stytch.js';
import Session from '../models/sessions.js';

// set up csrf middleware (call once, reuse)
export const csrfProtection = csurf({
    cookie: { httpOnly: true, secure: process.env.STAGE_ENV === 'production' },
});

// use this to check if a user has an active session
const authMiddleware = async (req, res, next) => {
    try {
        // grab the session token from the header
        const token = req.headers.authorization?.split(' ')[1];

        // if no token, that's a problem
        if (!token) return res.status(401).json({ error: 'No token provided' });

        // verify stytch session
        const session = await stytchClient.sessions.authenticate({
            session_token: token,
        });

        // if no session, also a problem
        if (!session) return res.status(401).json({ error: 'Invalid session' });

        // verify that token is active in database
        const dbSession = await Session.findOne({
            where: { token, isActive: true },
        });

        // if the session is not active in the database, guess what, that's a problem
        if (!dbSession)
            return res.status(401).json({ error: 'Session expired' });

        // grab the user with the active session
        req.user = { userId: dbSession.userId, stytchUserId: session.user_id };

        // proceed
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export default authMiddleware;
