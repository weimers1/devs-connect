import express from 'express';
import { searchCommunities, searchUsers } from '../controllers/searchController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/communities', searchCommunities);
router.get('/users', optionalAuth, searchUsers);

export default router;