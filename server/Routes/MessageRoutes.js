import express, { Router } from 'express';
// SECURITY FIX: Added authentication middleware to secure all message routes
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getConversations,
    getConversationMessages,
    sendMessage,
    sendReply,
    createTestUsers,
    markAsRead,
} from '../controllers/MessagesController.js';

const router = express.Router();
//Get Messages (SideBar)
// SECURITY: Added auth middleware to prevent unauthorized access to conversations
router.get('/conversations', authMiddleware, getConversations);
//Get Actual Conversation Between Users
// SECURITY: Added auth middleware to all message operations
router.get('/conversation/:userId', authMiddleware, getConversationMessages);
//Send Message Route
router.post('/send', authMiddleware, sendMessage);
//Send Reply Route (simulate other user replying)
router.post('/reply', authMiddleware, sendReply);
//Mark Messages as Read Route
router.post('/mark-read', authMiddleware, markAsRead);
//Create Test Users Route
router.post('/create-test-users', createTestUsers);

export default router;
