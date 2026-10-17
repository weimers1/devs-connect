import stytchClient from '../config/stytch.js';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { session } = await stytchClient.sessions.authenticate({
            session_token: token,
        });

        const user = await User.findOne({
            where: { stytchUserId: session.user_id },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = { userId: user.id };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return next();
        }

        const { session } = await stytchClient.sessions.authenticate({
            session_token: token,
        });

        const user = await User.findOne({
            where: { stytchUserId: session.user_id },
        });

        if (user) {
            req.user = { userId: user.id };
        }
        next();
    } catch (error) {
        next();
    }
};

export default authMiddleware;
