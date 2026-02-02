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

        // Send the magic link email via Stytch
        await stytchClient.magicLinks.email.send({
            email: email,
            login_magic_link_url: `http://localhost:80/authenticate`,
            signup_magic_link_url: `http://localhost:80/authenticate`,
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
        console.log(
            '[verifyMagicLink] authenticated token returned following session info:',
            JSON.stringify(session),
        );

        if (!session.user || !session.user.emails) {
            throw Error('No session.user or session.user.emails found');
        }

        // grab their email from the created stytch session
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
            { where: { userId: user.id, isActive: true } },
        );

        // create a session for them in the database
        const dbSession = await Session.create({
            userId: user.id,
            token: session.session_token,
            sessionJwt: session.session_jwt,
            isActive: true,
            expiresAt: new Date(session.session.expires_at),
        });
        console.error(
            '[verifyMagicLink] Created dbSession:',
            JSON.stringify(dbSession),
        );

        // if they're a new user, mark them as verified
        if (isNewUser) {
            user.verifiedAt = new Date();
            await user.save();
        }

        res.status(200).json({ isNewUser, session_token: dbSession.token });
    } catch (error) {
        console.error(
            '🚨 [verifyMagicLink] Full error:',
            JSON.stringify(error),
        );

        // general error catch
        res.status(error.status || error.status_code || 500).json({
            error: {
                status_code: error.status || error.status_code || 500,
                error_message: error.message || 'Verification failed',
            },
        });
    }
};

export const checkSessionStatus = async (sessionToken) => {
    try {
        console.log('[checkSessionStatus] Checking session:', sessionToken);

        // Check if session exists in our database
        const dbSession = await Session.findOne({
            where: { token: sessionToken },
        });

        if (!dbSession) {
            return { success: false, reason: 'session_not_found_in_db' };
        }

        // Authenticate JWT with Stytch
        const stytchResp = await stytchClient.sessions.authenticate({
            session_jwt: dbSession.sessionJwt,
        });

        if (stytchResp.status_code === 200) {
            // Check if JWT needs refresh (within 5 minutes of expiry)
            const now = new Date();
            const expiryTime = new Date(stytchResp.session.expires_at);
            const timeUntilExpiry = expiryTime.getTime() - now.getTime();
            const fiveMinutes = 5 * 60 * 1000;

            let updatedJwt = dbSession.sessionJwt;

            if (timeUntilExpiry < fiveMinutes) {
                console.log(
                    '[checkSessionStatus] JWT expiring soon, refreshing...',
                );

                // Refresh the session to get new JWT
                const refreshResp = await stytchClient.sessions.authenticate({
                    session_jwt: dbSession.sessionJwt,
                    session_duration_minutes: 60, // Extend for 1 hour
                });

                if (refreshResp.status_code === 200) {
                    updatedJwt = refreshResp.session_jwt;
                    console.log(
                        '[checkSessionStatus] JWT refreshed successfully',
                    );
                }
            }

            // Update session in database
            dbSession.isActive = true;
            dbSession.sessionJwt = updatedJwt;
            dbSession.expiresAt = new Date(stytchResp.session.expires_at);
            dbSession.lastRenewedAt = new Date();
            await dbSession.save();

            return {
                isActive: true,
                session: dbSession,
            };
        } else {
            // Session is inactive - mark as inactive
            dbSession.isActive = false;
            await dbSession.save();
            return { isActive: false };
        }
    } catch (error) {
        console.error('[checkSessionStatus] Error:', error.message);

        // Mark session as inactive on error
        try {
            const dbSession = await Session.findOne({
                where: { token: sessionToken },
            });
            if (dbSession) {
                dbSession.isActive = false;
                await dbSession.save();
            }
        } catch (dbError) {
            console.error(
                '[checkSessionStatus] DB update failed:',
                dbError.message,
            );
        }

        return {
            isActive: false,
            error: error.message ?? 'Session validation failed',
        };
    }
};
