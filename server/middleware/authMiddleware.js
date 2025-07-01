import stytchClient from '../config/stytch.js';
import Session from '../models/sessions.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        // verify stytch session
        const session = await stytchClient.sessions.authenticate({
            session_token: token,
        });
        if (!session) return res.status(401).json({ error: 'Invalid session' });

        // verify token in database
        const dbSession = await Session.findOne({
            where: { token, isActive: true },
        });
        if (!dbSession)
            return res.status(401).json({ error: 'Session expired' });

        req.user = { userId: dbSession.userId, stytchUserId: session.user_id };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export default authMiddleware;
