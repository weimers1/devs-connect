import express from 'express';
import {
    loginOrSignup,
    verifyMagicLink,
} from '../controllers/authController.js';

const router = express.Router();

// ensure csrf protection when logging in
router.post('/login', loginOrSignup);
router.get('/verify', verifyMagicLink);
// router.get('/get-session', );

export default router;
