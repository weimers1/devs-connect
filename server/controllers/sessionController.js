import stytchClient from '../config/stytch.js';

export const destroySession = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        await stytchClient.sessions.revoke({ session_token: token });

        res.status(200).json({ message: 'Session destroyed' });
    } catch (error) {
        console.error('Destroy session error:', error);
        res.status(500).json({ error: 'Failed to destroy session' });
    }
};

export const getStytchSessionStatus = async (req, res) => {
    // if the session is still valid in stytch, I guess we'll call it valid here too
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'No token provided' });
        }

        // Verify session with Stytch (example, adjust as needed)
        const session = await stytchClient.sessions.authenticate({
            session_token: token,
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
