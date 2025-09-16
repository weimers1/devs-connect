import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { linkGitHub } from '../controllers/profileController.js';
import authMiddleware, {
    csrfProtection,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ensure auth protection when getting and updating profile; ensure csrf protection when updating profile
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, csrfProtection, updateProfile);
router.post('/link-github', authMiddleware, linkGitHub);

export default router;
