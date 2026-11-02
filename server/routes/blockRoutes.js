import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    blockUser,
    getBlockedUsers,
    unblockUser,
} from '../controllers/blockController.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getBlockedUsers);
router.post('/:userId', blockUser);
router.delete('/:userId', unblockUser);

export default router;
