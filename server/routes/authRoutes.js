import express from 'express';
import {
    loginOrSignup,
    verifyMagicLink,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginOrSignup);
router.get('/verify', verifyMagicLink);

export default router;
