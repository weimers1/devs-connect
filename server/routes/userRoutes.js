import express from 'express';
import { getUserProfile, getCurrentUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/me', getCurrentUser);
router.get('/:userId/profile', getUserProfile);

export default router;