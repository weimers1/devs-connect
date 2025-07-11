import express from 'express';
import {
    sendMagicLink,
    verifyMagicLink,
    extendSession,
    destroySession,
} from '../controllers/authController.js';
import authMiddleware, {
    csrfProtection,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ensure csrf protection when logging in
router.post('/login', sendMagicLink);
router.get('/verify', verifyMagicLink);
// ensure authentication and csrf protection when extending sessions and logging out
router.post('/session/extend', authMiddleware, csrfProtection, extendSession);
router.post('/session/destroy', authMiddleware, csrfProtection, destroySession);

export default router;
