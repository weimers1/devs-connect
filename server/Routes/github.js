import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

const router = express.Router();

// Configure GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:6969/oauth/github/callback" //Call back URL for Github OAuth 
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Store GitHub data to be processed in callback
    const githubData = {
      githubId: profile.id,
      githubUsername: profile.username,
      githubAccessToken: accessToken,
      githubEmail: profile.emails?.[0]?.value
    };
    
    return done(null, githubData);
  } catch (error) {
    return done(error, null);
  }
}));

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: 'http://localhost:80/login' }),
  async (req, res) => {
    try {
      console.log('GitHub callback triggered');
      console.log('User data:', req.user);
      console.log('Cookies:', req.cookies);
      
      // Get GitHub data from passport
      const githubData = req.user;
      
      if (!githubData) {
        console.log('No GitHub data received');
        return res.redirect('http://localhost:80/settings?github=error&reason=no_data');
      }
      
      // Get current user from session
      const sessionToken = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
      console.log('Session token found:', !!sessionToken);
      
      // For now, since we can't easily link to existing user without proper session handling,
      // let's just redirect with the GitHub data and handle it on frontend
      console.log('GitHub OAuth successful, redirecting to settings with data');
      const githubParams = new URLSearchParams({
        github: 'success',
        githubId: githubData.githubId,
        githubUsername: githubData.githubUsername,
        githubEmail: githubData.githubEmail || 'no-email'
      });
      
      return res.redirect(`http://localhost:80/settings?${githubParams.toString()}`);
      
      // Commented out session check for now
      // if (sessionToken) {
      //   res.redirect('http://localhost:80/settings?github=success');
      // } else {
      //   res.redirect('http://localhost:80/login?error=not_logged_in');
      // }
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.redirect('http://localhost:80/settings?github=error&reason=server_error');
    }
  }
);

export default router;