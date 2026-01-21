import csurf from 'csurf';
import stytchClient from '../config/stytch.js';
import Session from '../models/Session.js';
import { checkSessionStatus } from '../controllers/authController.js';

// set up csrf middleware (call once, reuse)
export const csrfProtection = csurf({
    cookie: { httpOnly: true, secure: process.env.STAGE_ENV === 'production' },
});

// use this to check if a user has an active session
const authMiddleware = async (req, res, next) => {
    console.log('🔐 [authMiddleware] Starting authentication check');
    
    try {
        // grab the session token from the header
        const token = req.headers.authorization?.split(' ')[1];
        console.log('🔑 [authMiddleware] Token extracted:', token ? token.substring(0, 10) + '...' : 'NO TOKEN');

        // if no token, that's a problem
        if (!token) {
            console.log('❌ [authMiddleware] No token provided');
            return res.status(401).json({ error: 'No token provided' });
        }

        console.log('🔍 [authMiddleware] Calling checkSessionStatus...');
        
        // verify that token is active in database
        const sessionInfo = await checkSessionStatus(token);
        console.log('📊 [authMiddleware] Session info received:', sessionInfo);

        // if the session is not active in the database, that's a problem
        if (!sessionInfo.isActive) {
            console.log('❌ [authMiddleware] Session not active');
            return res.status(401).json({ error: 'Session expired' });
        }

        // grab the user with the active session
        req.user = { userId: sessionInfo.session.userId };
        console.log('✅ [authMiddleware] User authenticated:', req.user.userId);

        // proceed
        next();
    } catch (error) {
        console.error('🚨 [authMiddleware] Auth error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export default authMiddleware;
