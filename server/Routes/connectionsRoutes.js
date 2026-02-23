import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

import {
    connectToUser
} from "../controllers/connectionsController.js";
const router = express.Router();


//Connect to User 
router.post('/connect/:userId/to/:currentUserId', authMiddleware, connectToUser);







export default router;