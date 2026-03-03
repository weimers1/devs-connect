import stytchClient from '../config/stytch.js';
import Session from '../models/Session.js';

export const extendSession = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        // Find session in DB
        const dbSession = await Session.findOne({
            where: { token, isActive: true },
        });
        if (!dbSession) return res.status(404).json({ error: 'Session not found' });

        // Authenticate and extend using JWT
        const stytchResp = await stytchClient.sessions.authenticate({
            session_jwt: dbSession.sessionJwt,
            session_duration_minutes: 60,
        });

        // Update session in DB with new JWT and expiry
        await dbSession.update({
            sessionJwt: stytchResp.session_jwt,
            expiresAt: new Date(stytchResp.session.expires_at),
            lastRenewedAt: new Date(),
        });

        res.status(200).json({ message: 'Session extended' });
    } catch (error) {
        console.error('Extend session error:', error);
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

        // revoke session in stytch using JWT
        await stytchClient.sessions.revoke({ session_jwt: session.sessionJwt });

        // mark session as inactive in database
        await session.update({ isActive: false, updatedAt: new Date() });

        res.status(200).json({ message: 'Session destroyed' });
    } catch (error) {
        console.error('Destroy session error:', error);
        res.status(500).json({ error: 'Failed to destroy session' });
    }
};

export const getStytchSessionStatus = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'No token provided' });
        }

        // Find session in DB
        const dbSession = await Session.findOne({
            where: { token, isActive: true },
        });
        if (!dbSession) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Verify session with Stytch using JWT
        const stytchResp = await stytchClient.sessions.authenticate({
            session_jwt: dbSession.sessionJwt,
        });
        
        res.status(200).json({
            success: true,
            message: 'Session active',
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired session',
        });
    }
};
