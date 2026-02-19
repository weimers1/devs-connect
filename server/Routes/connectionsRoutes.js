import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();
import {
    connectToUser
} from "../controllers/connectionsController.js";



//Connect to User 
router.post('/connect/:user1Id/to/:user2Id', authMiddleware, connectToUser);







export default router;