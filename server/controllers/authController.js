import stytchClient from '../config/stytch.js';
import Session from '../models/sessions.js';
import User from '../models/users.js';

export const sendMagicLink = async (req, res) => {
    try {
        // grab the user's email
        const { email } = req.body;

        // if they didn't enter one, that's a problem
        if (!email) {
            throw Object.assign(new Error('Email required'), { status: 400 });
        }

        // send magic link via stytch
        const response = await stytchClient.magicLinks.email.loginOrCreate({
            email,
            login_magic_link_url: `${process.env.URL_CLIENT}/verify`,
        });

        // find the user based on their email
        let user = await User.findOne({ where: { email } });
        if (!user) {
            // if they didn't exist, create a record for them in the database and keep track of their signupToken for verification
            user = await User.create({
                email,
                firstName: 'New',
                lastName: 'User',
                signupToken: response.token,
            });
        } else if (!user.verifiedAt) {
            // if they do exist, but haven't been verified, update that signupToken for verification
            await user.update({ signupToken: response.token });
        }

        res.status(200).json({ message: 'Magic link sent' });
    } catch (error) {
        // general error catch
        throw Object.assign(
            new Error(error.message || 'Failed to send magic link'),
            {
                status: error.status || 500,
            }
        );
    }
};

export const verifyMagicLink = async (req, res) => {
    try {
        // grab the token
        const { token } = req.query;

        // if they don't have one, that's a problem
        if (!token) {
            throw Object.assign(new Error('Token required'), { status: 400 });
        }

        // authenticate the magic link with stytch and create a session within stytch
        const session = await stytchClient.magicLinks.authenticate(token, {
            session_duration_minutes: 60,
        });

        // grab their email from the created stytch session
        const email = session.user.emails[0].email;

        // find the user with that email in the database
        const user = await User.findOne({ where: { email } });

        // if a user does not exist with that email or they aren't verified and don't have a correct token, deny access
        if (!user || (user.signupToken !== token && !user.verifiedAt)) {
            throw Object.assign(new Error('Invalid token or user'), {
                status: 403,
            });
        }

        // if they have not yet been verified, mark them as verified and clear signupToken as it's no longer needed
        if (!user.verifiedAt) {
            await user.update({ verifiedAt: new Date(), signupToken: null });
        }

        // create a session for them in the database
        const dbSession = await Session.create({
            userId: user.id,
            token: session.session_token,
        });

        res.status(200).json({ session_token: dbSession.token });
    } catch (error) {
        // general error catch
        throw Object.assign(new Error(error.message || 'Verification failed'), {
            status: error.status || 500,
        });
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
