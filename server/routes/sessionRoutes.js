import express from 'express';
import {
    destroySession,
    getStytchSessionStatus,
} from '../controllers/sessionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/destroy', authMiddleware, destroySession);
router.get('/status/get', getStytchSessionStatus);

export default router;
