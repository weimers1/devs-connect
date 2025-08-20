import express from 'express';
import {
    extendSession,
    destroySession,
    getStytchSessionStatus,
} from '../controllers/sessionController.js';
import authMiddleware, {
    csrfProtection,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ensure authentication and csrf protection when extending sessions and logging out
router.post('/extend', authMiddleware, csrfProtection, extendSession);
router.post('/destroy', authMiddleware, csrfProtection, destroySession);
router.post('/status/get', getStytchSessionStatus);

export default router;
