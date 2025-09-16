import express, { Router } from 'express';
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
router.get('/conversations', getConversations);
//Get Actual Conversation Between Users
router.get('/conversation/:userId', getConversationMessages);
//Send Message Route
router.post('/send', sendMessage);
//Send Reply Route (simulate other user replying)
router.post('/reply', sendReply);
//Mark Messages as Read Route
router.post('/mark-read', markAsRead);
//Create Test Users Route
router.post('/create-test-users', createTestUsers);

export default router;
