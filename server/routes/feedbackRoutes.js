import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { sendFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many feedback requests. Please try again later.' },
});

router.post('/', feedbackLimiter, sendFeedback);

export default router;
