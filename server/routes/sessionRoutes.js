import express from 'express';
import {
    destroySession,
    getStytchSessionStatus,
} from '../controllers/sessionController.js';

const router = express.Router();

router.post('/destroy', destroySession);
router.get('/status/get', getStytchSessionStatus);

export default router;
