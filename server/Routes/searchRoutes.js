import express from 'express';
import { searchCommunities, searchUsers } from '../controllers/searchController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/communities', searchCommunities);
router.get('/users', authMiddleware, searchUsers);

export default router;