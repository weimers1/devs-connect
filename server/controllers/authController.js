import stytchClient from '../config/stytch.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const getCsrfToken = (req, res) => {
    try {
        res.status(200).json({ csrfToken: req.csrfToken() });
    } catch (error) {
        throw Object.assign(new Error('Failed to generate CSRF token'), {
            status: 500,
        });
    }
};

export const loginOrSignup = async (req, res) => {
    try {
        // grab the user's email
        const { email } = req.body;

        // idk how but if they didn't enter one, that's a problem
        if (!email) {
            throw Object.assign(new Error('Email required'), { status: 400 });
        }

        // assume they're just logging in
        let message = 'A login link has been sent to your email.';

        // find the user based on their email
        let user = await User.findOne({ where: { email } });
        if (!user) {
            // if they didn't exist, create a record for them in the database with temp name data
            user = await User.create({
                email,
                firstName: 'User',
                lastName: uuidv4(),
            });

            // they're actually signing up
            message = 'A sign up link has been sent to your email.';
        }

        res.status(200).json({ response: message });
    } catch (error) {
        // general error catch
        res.status(error.status || 500).json({
            error: {
                status_code: error.status || 500,
                error_message: error.message || 'Login failed',
            },
        });
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
        const session = await stytchClient.magicLinks.authenticate({
            token: token,
            session_duration_minutes: 60,
        });

        // grab their email from the created stytch session
        const email = session.user.emails[0].email;

        // find the user with that email in the database, and assume they exist
        const user = await User.findOne({ where: { email } });

        // if a user does not exist with that email, deny access
        if (!user) {
            throw Object.assign(new Error('Invalid token or user'), {
                status: 403,
            });
        }

        // assume they already existed before this
        let isNewUser = false;

        // if they have not yet been verified, mark them as a new user
        if (!user.verifiedAt) {
            isNewUser = true;
        }

        // create a session for them in the database
        const dbSession = await Session.create({
            userId: user.id,
            token: session.session_token,
        });

        res.status(200).json({ isNewUser, session_token: dbSession.token });
    } catch (error) {
        // general error catch
        res.status(error.status || 500).json({
            error: {
                status_code: error.status || 500,
                error_message: error.message || 'Verification failed',
            },
        });
    }
};
