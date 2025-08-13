import stytchClient from '../config/stytch.js';
import Session from '../models/Session.js';

export const extendSession = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        const session = await stytchClient.sessions.authenticate({
            session_token: token,
            session_duration_minutes: 60, // extend for another 60 min
        });

        await Session.update(
            {
                token: session.session_token,
                updatedAt: new Date(),
                isExtended: true,
            },
            { where: { token, isActive: true } }
        );

        res.status(200).json({ message: 'Session extended' });
    } catch (error) {
        res.status(401).json({ error: 'Session extension failed' });
    }
};

export const destroySession = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        // verify session exists and is active
        const session = await Session.findOne({
            where: { token, isActive: true },
        });
        if (!session)
            return res
                .status(404)
                .json({ error: 'Session not found or already inactive' });

        // remove session in stytch
        await stytchClient.sessions.revoke({ session_token: token });

        // mark session as inactive in database
        await session.update({ isActive: false, updatedAt: new Date() });

        res.status(200).json({ message: 'Session destroyed' });
    } catch (error) {
        console.error('Destroy session error:', error);
        res.status(500).json({ error: 'Failed to destroy session' });
    }
};
