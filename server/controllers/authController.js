import stytchClient from '../config/stytch.js';
import Session from '../models/sessions.js';
import User from '../models/users.js';

export const sendMagicLink = async (req, res) => {
    try {
        // grab their email
        const { email } = req.body;

        // send stytch a loginOrCreate request
        await stytchClient.magicLinks.email.loginOrCreate({
            email,
            login_magic_link_url: `${process.env.URL_CLIENT}/verify`,
        });
        res.status(200).json({ message: 'Magic link sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send magic link' });
    }
};

export const verifyMagicLink = async (req, res) => {
    try {
        // grab the token from the request
        const { token } = req.query;

        // set up a session
        const session = await stytchClient.magicLinks.authenticate(token, {
            session_duration_minutes: 60,
        });

        let user = await User.findOne({
            where: { email: session.user.emails[0].email },
        });
        if (!user) {
            user = await User.create({
                email: session.user.emails[0].email,
                firstName: 'New',
                lastName: 'User',
            });
        }

        const dbSession = await Session.create({
            userId: user.id,
            token: session.session_token,
        });

        res.status(200).json({ session_token: dbSession.token });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
};

export const extendSession = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        const session = await stytchClient.sessions.authenticate({
            session_token: token,
            session_duration_minutes: 60, // extend for another 60 min
        });

        await Session.update(
            { token: session.session_token, updatedAt: new Date() },
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
