import stytchClient from '../config/stytch.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const getCsrfToken = (req, res) => {
    try {
        res.status(200).json({ csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('CSRF token generation failed:', error);
        res.status(500).json({
            error: {
                status_code: 500,
                error_message: 'Failed to generate CSRF token',
            },
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

        // Send the magic link email via Stytch
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:80';
        await stytchClient.magicLinks.email.send({
            email: email,
            login_magic_link_url: `${baseUrl}/authenticate`,
            signup_magic_link_url: `${baseUrl}/authenticate`,
        });

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
            session_duration_minutes: 5, // temporarily using 1 minute for testing
        });

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

        // find or create the user with that email in the database
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create user if they don't exist (Stytch created them)
            user = await User.create({
                email,
                firstName: 'User',
                lastName: uuidv4(),
            });
        }

        // assume they already existed before this
        let isNewUser = false;

        // if they have not yet been verified, mark them as a new user
        if (!user.verifiedAt) {
            isNewUser = true;
        }

        // mark all previous sessions as inactive for a user to ensure there are no duplicate active sessions
        await Session.update(
            { isActive: false },
            { where: { userId: user.id, isActive: true } }
        );

        // create a session for them in the database
        const dbSession = await Session.create({
            userId: user.id,
            token: session.session_token,
            isActive: true,
            isExtended: false, // setting to false: manageSessionLifecycle happens in 60 min; by then, session should be extended
        });

        // if they're a new user, mark them as verified
        if (isNewUser) {
            user.verifiedAt = new Date();
            user.save();
        }

        // call the manageSessionLifecycle function in 60 minutes
        setTimeout(() => {
            manageSessionLifecycle(dbSession.token);
        }, 1000 * 60 * 5); // temporarily using 1 minute for testing

        res.status(200).json({ isNewUser, session_token: dbSession.token });
    } catch (error) {
        // general error catch
        res.status(error.status || error.status_code || 500).json({
            error: {
                status_code: error.status || error.status_code || 500,
                error_message: error.message || 'Verification failed',
            },
        });
    }
};

export const manageSessionLifecycle = (token) => {
    // check if the session has been extended (via the isExtended column in the session record);
    // if it has, start a countdown to manageSessionLifecycle again; but if it hasn't been extended, mark it inactive
    // and log them out
    Session.findOne({ where: { token } })
        .then((session) => {
            if (!session) return;

            // if the session is not extended, mark it inactive and drop it
            if (!session.isExtended) {
                session.isActive = false;
                return session.save();
            }

            // if the session is extended, call to manageSessionLifecycle again in 60 min;
            // also mark isExtended false now (since this will be set via the endpoint)
            setTimeout(() => {
                manageSessionLifecycle(token);
            }, 1000 * 60 * 5); // temporarily using 1 minute for testing
            session.isExtended = false;
            return session.save();
        })
        .catch((error) => {
            console.error('Failed to check session:', error.message);
        });
};
