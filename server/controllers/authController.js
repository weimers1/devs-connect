import stytchClient from '../config/stytch.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const loginOrSignup = async (req, res) => {
    try {
        // grab the user's email
        const { email } = req.body;

        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({
                error: { status_code: 400, error_message: 'Email required' },
            });
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                error: { status_code: 400, error_message: 'Invalid email address' },
            });
        }

        const message = 'If the email can receive a sign-in link, one will be sent.';
        let user = await User.findOne({ where: { email: normalizedEmail } });
        if (!user) {
            user = await User.create({
                email: normalizedEmail,
                firstName: 'User',
                lastName: uuidv4(),
            });
        }

        // Send the magic link email via Stytch
        const baseUrl =
            process.env.CLIENT_URL ||
            (process.env.NODE_ENV === 'production'
                ? null
                : 'http://localhost:80');
        if (!baseUrl) {
            return res.status(500).json({ error: 'Authentication is unavailable' });
        }
        await stytchClient.magicLinks.email.send({
            email: normalizedEmail,
            login_magic_link_url: `${baseUrl}/authenticate`,
            signup_magic_link_url: `${baseUrl}/authenticate`,
        });

        res.status(200).json({ response: message });
    } catch (error) {
        console.error('Sign-in link could not be sent:', {
            name: error.name,
            status: error.status || error.status_code,
        });
        res.status(error.status || 500).json({
            error: {
                status_code: error.status || 500,
                error_message: 'Unable to send a sign-in link. Please try again.',
            },
        });
    }
};

export const verifyMagicLink = async (req, res) => {
    let verificationStage = 'Stytch magic-link authentication';
    try {
        // grab the token
        const { token } = req.query;

        // if they don't have one, that's a problem
        if (!token) {
            throw Object.assign(new Error('Token required'), { status: 400 });
        }

        // authenticate the magic link with stytch and create a session within stytch
        const session = await stytchClient.magicLinks.authenticate({
            token: token,
            session_duration_minutes: 60,
        });

        verificationStage = 'validating Stytch session';
        // grab their email from the created stytch session
        if (
            !session.user ||
            !session.user.emails ||
            !session.user.emails[0] ||
            !session.user.emails[0].email
        ) {
            throw Object.assign(new Error('Invalid session data from Stytch'), {
                status: 400,
            });
        }
        const email = session.user.emails[0].email;

        verificationStage = 'looking up user in database';
        // find or create the user with that email in the database
        let user = await User.findOne({ where: { email } });

        if (!user) {
            verificationStage = 'creating user in database';
            // Create user if they don't exist (Stytch created them)
            user = await User.create({
                email,
                firstName: 'User',
                lastName: uuidv4(),
            });
        }

        if (user.stytchUserId !== session.user_id) {
            verificationStage = 'updating Stytch user ID in database';
            await user.update({ stytchUserId: session.user_id });
        }

        // assume they already existed before this
        let isNewUser = false;

        // if they have not yet been verified, mark them as a new user
        if (!user.verifiedAt) {
            isNewUser = true;
        }

        // if they're a new user, mark them as verified
        if (isNewUser) {
            user.verifiedAt = new Date();
            await user.save();
        }

        res.cookie('session_token', session.session_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
            path: '/',
        });
        res.status(200).json({ isNewUser });
    } catch (error) {
        console.error('Magic-link verification failed:', {
            stage: verificationStage,
            name: error.name,
            code: error.code,
            status: error.status || error.status_code,
        });
        res.status(error.status || error.status_code || 500).json({
            error: {
                status_code: error.status || error.status_code || 500,
                error_message: 'Verification failed',
            },
        });
    }
};
