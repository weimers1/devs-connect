import express from 'express';
import { rateLimit } from 'express-rate-limit';
import {
    getUserProfile,
    getUserProfileByInternalId,
    getCurrentUser,
    getAllUsers,
    getFeaturebaseToken,
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// A token is required to open the feedback widget, so this caps feedback sessions per user.
const featurebaseTokenLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `feedback-user-${req.user.userId}`,
    validate: { keyGeneratorIpFallback: false },
    message: {
        error: 'You have reached the daily feedback limit. Please try again tomorrow.',
    },
});

router.use(authMiddleware);
router.get('/me', getCurrentUser, authMiddleware);
router.get('/featurebase-token', featurebaseTokenLimiter, getFeaturebaseToken);
router.get('/internal/:userId/profile', getUserProfileByInternalId);
router.get('/:userId/profile', getUserProfile, authMiddleware);
router.get('/Obtain/:userId/Users',getAllUsers, authMiddleware);

export default router;