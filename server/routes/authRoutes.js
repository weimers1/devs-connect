import express from 'express';
import {
    loginOrSignup,
    verifyMagicLink,
    registerConsent,
    acceptTerms,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginOrSignup);
router.get('/verify', verifyMagicLink);
router.post('/consent', registerConsent);
router.post('/terms/accept', acceptTerms);

export default router;
