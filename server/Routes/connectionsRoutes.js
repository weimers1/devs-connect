import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

import {
    connectToUser,
    getrelevantconnection,
    disconnecttotUser,
    getUserConnections,
    getOtherUserConnections,
    sendConnectionRequest,
    getIncomingConnectionRequests,
    respondToConnectionRequest
} from "../controllers/connectionsController.js";
const router = express.Router();


//Connection requests
router.post('/requests/user/:publicId', authMiddleware, sendConnectionRequest);
router.get('/requests/incoming', authMiddleware, getIncomingConnectionRequests);
router.post('/requests/:requestId/:action', authMiddleware, respondToConnectionRequest);

//Connect to User 
router.post('/connect/:userId', authMiddleware, connectToUser);
router.post('/connect/:userId/to/:currentUserId', authMiddleware, connectToUser);
//Get connection between users
router.get('/obtain/connection/between/:currentUserId/to/:userId', authMiddleware, getrelevantconnection);
//disconnect tou ser
router.delete('/remove/connection/between/:currentUserId/to/:userId', authMiddleware, disconnecttotUser);
//get all connections from a user
router.get('/get/all/connections/from/user/:currentUserId',authMiddleware, getUserConnections);
//Get all other connections from a user
router.get('/get/all/connections/from/other/user/:userId',authMiddleware, getOtherUserConnections);





export default router;