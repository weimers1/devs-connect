import stytchClient from '../config/stytch.js';

export const destroySession = async (req, res) => {
    try {
        const token = req.cookies?.session_token;
        if (!token) {
            res.clearCookie('session_token', sessionCookieOptions());
            return res.status(200).json({ message: 'Session destroyed' });
        }

        await stytchClient.sessions.revoke({ session_token: token });

        res.clearCookie('session_token', sessionCookieOptions());
        res.status(200).json({ message: 'Session destroyed' });
    } catch (error) {
        res.clearCookie('session_token', sessionCookieOptions());
        console.error('Session revocation failed:', {
            name: error.name,
            status: error.status || error.status_code,
        });
        res.status(500).json({ error: 'Failed to destroy session' });
    }
};

const sessionCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
});

export const getStytchSessionStatus = async (req, res) => {
    try {
        const token = req.cookies?.session_token;
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'No token provided' });
        }

        // Verify session with Stytch (example, adjust as needed)
        await stytchClient.sessions.authenticate({
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
