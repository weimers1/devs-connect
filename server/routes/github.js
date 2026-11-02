import { randomBytes, timingSafeEqual } from 'node:crypto';
import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:80';
const serverUrl = process.env.SERVER_URL || 'http://localhost:6969';
const linkStateLifetimeMs = 10 * 60 * 1000;

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error(
        'GitHub OAuth environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are required'
    );
}

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: new URL('/oauth/github/callback', serverUrl).toString(),
        },
        async (accessToken, refreshToken, profile, done) => {
            done(null, {
                githubId: profile.id,
                githubUsername: profile.username,
                githubEmail: profile.emails?.[0]?.value || null,
            });
        }
    )
);

router.post('/github/start', authMiddleware, (req, res, next) => {
    const state = randomBytes(32).toString('base64url');
    req.session.regenerate((error) => {
        if (error) {
            return next(error);
        }

        req.session.githubLink = {
            state,
            userId: req.user.userId,
            expiresAt: Date.now() + linkStateLifetimeMs,
        };
        req.session.save((saveError) => {
            if (saveError) {
                return next(saveError);
            }

        const authorizationUrl = new URL(
            'https://github.com/login/oauth/authorize'
        );
        authorizationUrl.searchParams.set(
            'client_id',
            process.env.GITHUB_CLIENT_ID
        );
        authorizationUrl.searchParams.set(
            'redirect_uri',
            new URL('/oauth/github/callback', serverUrl).toString()
        );
        authorizationUrl.searchParams.set('scope', 'user:email');
        authorizationUrl.searchParams.set('state', state);

        return res.json({ authorizationUrl: authorizationUrl.toString() });
        });
    });
});

const verifyGitHubLinkState = (req, res, next) => {
    const pendingLink = req.session?.githubLink;
    const providedState = req.query.state;
    const expectedState = pendingLink?.state;

    if (
        typeof providedState !== 'string' ||
        typeof expectedState !== 'string' ||
        typeof pendingLink.expiresAt !== 'number' ||
        !Number.isInteger(pendingLink.userId) ||
        pendingLink.expiresAt < Date.now() ||
        providedState.length !== expectedState.length ||
        !timingSafeEqual(Buffer.from(providedState), Buffer.from(expectedState))
    ) {
        return res.redirect(`${clientUrl}/settings?github=error&reason=state`);
    }

    res.locals.githubLinkUserId = pendingLink.userId;
    delete req.session.githubLink;
    req.session.save((error) => {
        if (error) {
            return next(error);
        }
        return next();
    });
};

router.get(
    '/github/callback',
    verifyGitHubLinkState,
    passport.authenticate('github', {
        session: false,
        failureRedirect: `${clientUrl}/settings?github=error&reason=oauth`,
    }),
    async (req, res) => {
        try {
            const { githubId, githubUsername, githubEmail } = req.user || {};
            const userId = res.locals.githubLinkUserId;

            if (
                !userId ||
                typeof githubId !== 'string' ||
                !/^\d{1,20}$/.test(githubId) ||
                typeof githubUsername !== 'string' ||
                !/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(
                    githubUsername
                ) ||
                (githubEmail !== null &&
                    (typeof githubEmail !== 'string' ||
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(githubEmail)))
            ) {
                return res.redirect(
                    `${clientUrl}/settings?github=error&reason=invalid_profile`
                );
            }

            const alreadyLinked = await User.findOne({
                where: { githubId },
            });
            if (alreadyLinked && alreadyLinked.id !== userId) {
                return res.redirect(
                    `${clientUrl}/settings?github=error&reason=already_linked`
                );
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.redirect(
                    `${clientUrl}/settings?github=error&reason=user_not_found`
                );
            }

            await user.update({ githubId, githubUsername, githubEmail });
            return res.redirect(`${clientUrl}/settings?github=success`);
        } catch (error) {
            return res.redirect(
                `${clientUrl}/settings?github=error&reason=server_error`
            );
        }
    }
);

export default router;
