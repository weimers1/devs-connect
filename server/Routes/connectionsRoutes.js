import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

import {
    connectToUser,
    getrelevantconnection
} from "../controllers/connectionsController.js";
const router = express.Router();


//Connect to User 
router.post('/connect/:userId/to/:currentUserId', authMiddleware, connectToUser);
//Get connection between users
router.get('/obtain/connection/between/:currentUserId/to/:userId', authMiddleware, getrelevantconnection);







export default router;