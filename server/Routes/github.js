import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

const router = express.Router();

// Validate required environment variables
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error(
        'GitHub OAuth environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are required'
    );
}

// Configure GitHub OAuth Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${
                process.env.SERVER_URL || 'http://localhost:6969'
            }/oauth/github/callback`, //Call back URL for Github OAuth
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Store GitHub data to be processed in callback
                const githubData = {
                    githubId: profile.id,
                    githubUsername: profile.username,
                    githubAccessToken: accessToken,
                    githubEmail: profile.emails?.[0]?.value,
                };

                return done(null, githubData);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// GitHub OAuth routes
router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
    '/github/callback',
    passport.authenticate('github', {
        failureRedirect: `${
            process.env.CLIENT_URL || 'http://localhost:80'
        }/login`,
    }),
    async (req, res) => {
        try {
            const githubData = req.user;
            const clientUrl = process.env.CLIENT_URL;

            if (!githubData) {
                return res.redirect(
                    `${clientUrl}/settings?github=error&reason=no_data`
                );
            }

            // Check if user with this GitHub ID already exists
            let user = await User.findOne({
                where: { githubId: githubData.githubId },
            });

            if (user) {
                // Update existing user's GitHub data
                await user.update({
                    githubUsername: githubData.githubUsername,
                    githubAccessToken: githubData.githubAccessToken,
                    githubEmail: githubData.githubEmail,
                });
                console.log('Updated existing user with GitHub data');
            } else {
                // Create new user with GitHub data
                user = await User.create({
                    firstName: githubData.githubUsername || 'GitHub',
                    lastName: 'User',
                    email:
                        githubData.githubEmail ||
                        `${githubData.githubUsername}@github.local`,
                    githubId: githubData.githubId,
                    githubUsername: githubData.githubUsername,
                    githubAccessToken: githubData.githubAccessToken,
                    githubEmail: githubData.githubEmail,
                    verifiedAt: new Date(),
                });
                console.log('Created new user with GitHub data');
            }

            // Redirect with success
            return res.redirect(
                `${clientUrl}/settings?github=success&userId=${user.id}`
            );
        } catch (error) {
            console.error('GitHub callback error:', error);
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:80';
            res.redirect(
                `${clientUrl}/settings?github=error&reason=server_error`
            );
        }
    }
);

export default router;
