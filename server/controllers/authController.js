import { randomBytes } from 'node:crypto';
import stytchClient from '../config/stytch.js';
import User from '../models/User.js';
import TermsAcceptance from '../models/TermsAcceptance.js';
import sequelize from '../config/database.js';
import { CURRENT_TERMS_VERSION } from '../constants/terms.js';
import {
    storeConsent,
    verifyAndConsumeConsent,
} from '../utils/consentStore.js';
import { v4 as uuidv4 } from 'uuid';

export const registerConsent = async (req, res) => {
    try {
        const { state } = req.body || {};
        const consentState =
            typeof state === 'string' && state.trim().length > 0
                ? state.trim()
                : randomBytes(32).toString('base64url');

        await storeConsent(consentState);

        res.cookie('dc_consent_state', consentState, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000,
            path: '/',
        });

        res.status(200).json({
            success: true,
            state: consentState,
            terms_version: CURRENT_TERMS_VERSION,
        });
    } catch (error) {
        console.error('Consent registration failed:', error.message);
        res.status(500).json({ error: 'Failed to record terms consent' });
    }
};

export const acceptTerms = async (req, res) => {
    try {
        const { age_confirmed } = req.body || {};
        if (age_confirmed !== true) {
            return res.status(400).json({
                error: 'You must confirm that you are at least 18 years of age and agree to the Terms of Service and Privacy Policy.',
            });
        }

        const token = req.cookies?.session_token;
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { session } = await stytchClient.sessions.authenticate({
            session_token: token,
        });

        const user = await User.findOne({
            where: { stytchUserId: session.user_id },
        });

        if (!user || user.isDeleted || user.banned) {
            return res.status(401).json({ error: 'User not found or account inaccessible' });
        }

        const [acceptance, created] = await TermsAcceptance.findOrCreate({
            where: {
                userId: user.id,
                terms_version: CURRENT_TERMS_VERSION,
            },
            defaults: {
                userId: user.id,
                terms_version: CURRENT_TERMS_VERSION,
                age_confirmed: true,
                accepted_at: new Date(),
                ip_address: req.ip,
                user_agent: req.get('user-agent'),
            },
        });

        if (!created && !acceptance.age_confirmed) {
            await acceptance.update({
                age_confirmed: true,
                accepted_at: new Date(),
                ip_address: req.ip,
                user_agent: req.get('user-agent'),
            });
        }

        res.status(200).json({
            success: true,
            terms_version: CURRENT_TERMS_VERSION,
        });
    } catch (error) {
        console.error('Terms acceptance failed:', error.message);
        res.status(500).json({ error: 'Failed to accept terms' });
    }
};

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
        const user = await User.findOne({ where: { email: normalizedEmail } });
        if (user) {
            if (user.isDeleted) {
                return res.status(403).json({
                    error: {
                        status_code: 403,
                        error_message: 'This account has been deleted.',
                    },
                });
            }
            if (user.banned) {
                return res.status(403).json({
                    error: {
                        status_code: 403,
                        error_message: 'This account has been suspended.',
                    },
                });
            }
        }

        // Send the magic link email via Stytch. User is not created until consent is verified.
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
        let user = await User.findOne({ where: { email } });

        if (user) {
            if (user.isDeleted) {
                return res.status(403).json({
                    error: {
                        status_code: 403,
                        error_message: 'This account has been deleted.',
                    },
                });
            }
            if (user.banned) {
                return res.status(403).json({
                    error: {
                        status_code: 403,
                        error_message: 'This account has been suspended.',
                    },
                });
            }
        }

        if (!user) {
            verificationStage = 'verifying terms acceptance before user creation';
            const consentState =
                req.query.state ||
                req.headers['x-consent-state'] ||
                req.cookies?.dc_consent_state;
            const consent = await verifyAndConsumeConsent(consentState);

            if (!consent) {
                return res.status(403).json({
                    error: {
                        status_code: 403,
                        error_message:
                            'Terms of Service and Privacy Policy acceptance required. Please accept the terms to create your account.',
                    },
                });
            }

            verificationStage = 'creating user and terms acceptance in transaction';
            const t = await sequelize.transaction();
            try {
                user = await User.create(
                    {
                        email,
                        firstName: 'User',
                        lastName: uuidv4(),
                        stytchUserId: session.user_id,
                        verifiedAt: new Date(),
                    },
                    { transaction: t }
                );

                await TermsAcceptance.create(
                    {
                        userId: user.id,
                        terms_version: CURRENT_TERMS_VERSION,
                        age_confirmed: true,
                        accepted_at: new Date(),
                        ip_address: req.ip,
                        user_agent: req.get('user-agent'),
                    },
                    { transaction: t }
                );

                await t.commit();
            } catch (createError) {
                await t.rollback();
                throw createError;
            }
        }

        if (user.stytchUserId !== session.user_id) {
            verificationStage = 'updating Stytch user ID in database';
            await user.update({ stytchUserId: session.user_id });
        }

        // Check if user has accepted the current terms version
        const acceptance = await TermsAcceptance.findOne({
            where: {
                userId: user.id,
                terms_version: CURRENT_TERMS_VERSION,
                age_confirmed: true,
            },
        });

        res.cookie('session_token', session.session_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
            path: '/',
        });

        if (!acceptance) {
            return res.status(200).json({
                isNewUser: false,
                terms_required: true,
                terms_version: CURRENT_TERMS_VERSION,
            });
        }

        let isNewUser = false;
        if (!user.verifiedAt) {
            isNewUser = true;
            user.verifiedAt = new Date();
            await user.save();
        }

        res.status(200).json({ isNewUser, terms_required: false });
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
