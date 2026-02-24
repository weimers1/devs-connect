import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

import {
    connectToUser,
    getrelevantconnection,
    disconnecttotUser,
} from "../controllers/connectionsController.js";
const router = express.Router();


//Connect to User 
router.post('/connect/:userId/to/:currentUserId', authMiddleware, connectToUser);
//Get connection between users
router.get('/obtain/connection/between/:currentUserId/to/:userId', authMiddleware, getrelevantconnection);
//disconnect tou ser
router.delete('/remove/connection/between/:currentUserId/to/:userId', authMiddleware, disconnecttotUser);






export default router;