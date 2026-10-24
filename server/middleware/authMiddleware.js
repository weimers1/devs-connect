import stytchClient from '../config/stytch.js';
import User from '../models/User.js';
import TermsAcceptance from '../models/TermsAcceptance.js';
import { CURRENT_TERMS_VERSION } from '../constants/terms.js';

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

        if (!user || user.isDeleted || user.banned) {
            return res.status(401).json({ error: 'User not found or account inaccessible' });
        }

        req.user = { userId: user.id };

        // Allow access to the terms acceptance endpoint itself
        if (
            req.path === '/terms/accept' ||
            req.originalUrl?.includes('/auth/terms/accept')
        ) {
            return next();
        }

        // Lightweight check: user must have accepted the current terms version
        const acceptance = await TermsAcceptance.findOne({
            where: {
                userId: user.id,
                terms_version: CURRENT_TERMS_VERSION,
                age_confirmed: true,
            },
        });

        if (!acceptance) {
            return res.status(403).json({
                error: 'terms_required',
                message: 'Acceptance of current Terms of Service and Privacy Policy required',
                terms_version: CURRENT_TERMS_VERSION,
            });
        }

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

        if (user && !user.isDeleted && !user.banned) {
            const acceptance = await TermsAcceptance.findOne({
                where: {
                    userId: user.id,
                    terms_version: CURRENT_TERMS_VERSION,
                    age_confirmed: true,
                },
            });
            if (acceptance) {
                req.user = { userId: user.id };
            }
        }
        next();
    } catch (error) {
        next();
    }
};

export default authMiddleware;
