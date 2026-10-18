import stytchClient from '../config/stytch.js';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.session_token;
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
        const token = req.cookies?.session_token;
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
