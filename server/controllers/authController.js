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
            stytchSessionId: session.session_id,
            isActive: true,
            expiresAt: new Date(session.expires_at),
        });

        // if they're a new user, mark them as verified
        if (isNewUser) {
            user.verifiedAt = new Date();
            user.save();
        }

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

export const checkSessionStatus = async (sessionToken) => {
    console.log('🔍 [checkSessionStatus] Starting session check for token:', sessionToken?.substring(0, 10) + '...');
    
    try {
        // Check if session exists in our database
        const dbSession = await Session.findOne({
            where: { token: sessionToken },
        });
        console.log('📊 [checkSessionStatus] DB session found:', !!dbSession);
        
        if (!dbSession) {
            console.log('❌ [checkSessionStatus] No session found in database for token');
            return { success: false, reason: 'session_not_found_in_db' };
        }

        console.log('🔗 [checkSessionStatus] Checking session with Stytch API...');
        
        // Check session status with Stytch
        const stytchSession = await stytchClient.sessions.get({
            session_token: sessionToken,
        });
        
        console.log('📡 [checkSessionStatus] Stytch response status:', stytchSession.status_code);
        console.log('📡 [checkSessionStatus] Stytch session active:', stytchSession.status_code === 200);

        if (stytchSession.status_code === 200) {
            // Session is active in Stytch - update our DB
            console.log('✅ [checkSessionStatus] Session active - updating DB');
            dbSession.isActive = true;
            dbSession.expiresAt = new Date(stytchSession.session.expires_at);
            dbSession.lastRenewedAt = new Date();
            await dbSession.save();
            console.log('💾 [checkSessionStatus] DB session updated successfully');
            return {
                isActive: true,
                session: dbSession,
            };
        } else {
            // Session is inactive in Stytch - mark as inactive
            console.log('❌ [checkSessionStatus] Session inactive in Stytch - marking DB as inactive');
            dbSession.isActive = false;
            await dbSession.save();
            console.log('💾 [checkSessionStatus] DB session marked inactive');
            return { isActive: false };
        }
    } catch (error) {
        console.error('🚨 [checkSessionStatus] Error occurred:', error.message);
        console.error('🚨 [checkSessionStatus] Error details:', error);
        
        // If Stytch returns error, mark session as inactive
        try {
            const dbSession = await Session.findOne({
                where: { token: sessionToken },
            });
            if (dbSession) {
                console.log('🔧 [checkSessionStatus] Marking session inactive due to error');
                dbSession.isActive = false;
                await dbSession.save();
                console.log('💾 [checkSessionStatus] DB session marked inactive after error');
            }
        } catch (dbError) {
            console.error('🚨 [checkSessionStatus] Failed to update DB after error:', dbError.message);
        }
        
        return {
            isActive: false,
            error:
                error.message ??
                'Something went wrong when checking the session status.',
        };
    }
};
