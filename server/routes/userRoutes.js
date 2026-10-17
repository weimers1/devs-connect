import express from 'express';
import { getUserProfile, getCurrentUser, getAllUsers } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/me', getCurrentUser, authMiddleware);
router.get('/:userId/profile', getUserProfile, authMiddleware);
router.get('/Obtain/:userId/Users',getAllUsers, authMiddleware);

export default router;