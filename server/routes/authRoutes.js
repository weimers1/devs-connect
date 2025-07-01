import express from 'express';
import {
    sendMagicLink,
    verifyMagicLink,
    extendSession,
    destroySession,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', sendMagicLink);
router.get('/verify', verifyMagicLink);
router.post('/session/extend', extendSession);
router.post('/session/destroy', destroySession);

export default router;
