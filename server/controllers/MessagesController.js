import Messages from '../Models/MessagesTable.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

//Functions (For SideBar Messages List)
//  GET CONVERSATIONS LIST
export const getConversations = async (req, res) => {
    try {
        // SECURITY FIX: Use authenticated user ID instead of hardcoded value
        // This prevents messages from being shown to wrong users
        const currentUserId = req.user.userId; // Get authenticated user ID from auth middleware

        // Get all messages involving current user  from the DB
        const result = await Messages.findAll({
            where: {
                [Op.or]: [
                    { sender_id: currentUserId },
                    { receiver_id: currentUserId },
                ],
            },
            // Temporarily removed includes until associations are set up
            order: [['createdAt', 'DESC']], //Order by Newest First
        });

        // Group by conversation and get latest message per conversation
        const conversationsMap = new Map();

        // FEATURE: Fetch real user data instead of generating fake names
        // This shows actual user names like "John Doe" instead of "User3 Test"
        const otherUserIds = [...new Set(result.map(message => 
            message.sender_id === currentUserId ? message.receiver_id : message.sender_id
        ))];

        // Fetch user data for all other users
        const otherUsers = await User.findAll({
            where: { id: otherUserIds },
            attributes: ['id', 'firstName', 'lastName', 'email']
        });

        const userMap = new Map(otherUsers.map(user => [user.id, user]));

        result.forEach((message) => {
            const conversationId = message.conversation_id;

            if (!conversationsMap.has(conversationId)) {
                const otherUserId =
                    message.sender_id === currentUserId
                        ? message.receiver_id
                        : message.sender_id;

                const otherUser = userMap.get(otherUserId);

                // Count unread messages in this conversation
                const unreadCount = result.filter(
                    (msg) =>
                        msg.conversation_id === conversationId &&
                        msg.receiver_id === currentUserId &&
                        msg.status !== 'read'
                ).length;

                conversationsMap.set(conversationId, {
                    conversation_id: conversationId,
                    otherUser: {
                        id: otherUserId,
                        firstName: otherUser?.firstName || `User${otherUserId}`,
                        lastName: otherUser?.lastName || 'Test',
                        email: otherUser?.email || `user${otherUserId}@test.com`,
                    },
                    lastMessage: {
                        content: message.content,
                        createdAt: message.createdAt,
                        sender_id: message.sender_id,
                    },
                    unreadCount: unreadCount,
                    isOnline: false,
                });
            }
        });

        const conversations = Array.from(conversationsMap.values()); //This will convert the Map Data Structure into an array thats why we're extracting the values so we can use res.json


        res.json({ success: true, data: conversations }); //Makes this serializable so the frontend can consume it
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET CONVERSATION MESSAGES  (For Chat Window)
export const getConversationMessages = async (req, res) => {
    // Get all messages between two users
    // Return: array of messages in chronological order
    try {
        const { userId } = req.params; //Get other users' ID From URL example (/Conversation/5 -> userId = 5)

        // Validate userId parameter using literal regex
        if (!userId || typeof userId !== 'string' || !/^\d+$/.test(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId) || parsedUserId <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const currentUserId = req.user.userId; // Get authenticated user ID from auth middleware

        //Create Conversation_id (Smaller Id First) | creates Array With both users ID's, converts Userid to number
        const conversationId = [currentUserId, parsedUserId] //Ensures Consistent Conversation_id regardless of who sends first
            .sort((a, b) => a - b)
            .join('-');

        const result = await Messages.findAll({
            //Gets all messages between you and User using Sequelize
            where: {
                conversation_id: conversationId, //Filter Messages by conversation_id
            },
            // Temporarily removed includes until associations are set up
            order: [['createdAt', 'ASC']], //Order by Newest First
        });
        res.json({ success: true, data: result }); //Sends json to frontend
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//  SEND MESSAGE | Front end sends a Post Requests to receiver_id: 2, content: "hey" then sender_id (from auth). Then the conversation is created example 1-2, we then save to the database and return the message to frontend
export const sendMessage = async (req, res) => {
    try {
        const { receiver_id, content } = req.body; //Gets who to send to and the message content from the frontend
        const sender_id = req.user.userId; // Get authenticated user ID from auth middleware

        // Create conversation_id | Purpose is to group messages between same two users
        const conversationId = [sender_id, receiver_id] //Example User 1 -> User -> 2 = 1-2 This is how we can create a consistent Conversation
            .sort((a, b) => a - b)
            .join('-');
        //Saves TO Database | Creates new row in Messages table : Result: Message gets unique ID and timestamps
        const message = await Messages.create({
            sender_id, // Who sent it (1)
            receiver_id, // Who receives it (2)
            content, // Message text ("Hello there!")
            conversation_id: conversationId, // Which conversation ("1-2")
            message_type: 'text', // Type of message
            status: 'sent', // Initial status
        });
        //  Emit Socket.io event after saving to DB
        //  Emit Socket.io event after saving
        const messageData = {
            id: message.id,
            sender_id: message.sender_id,
            conversation_id: message.conversation_id,
            receiver_id: message.receiver_id,
            content: message.content,
            timestamp: message.createdAt,
        };

        // Sanitize content before emitting to prevent XSS
        const sanitizedContent = message.content.replace(
            /[<>"'&]/g,
            (match) => {
                const entities = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;',
                };
                return entities[match];
            }
        );

        // Get the io instance and emit to conversation room
        const io = req.app.get('io');
        io.to(`user-${receiver_id}`).emit('receiver-message', {
            id: message.id,
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            content: sanitizedContent,
            timestamp: message.createdAt,
            conversation_id: message.conversation_id,
        });

        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// SEND REPLY (simulate other user replying) | This is just for testing at the moment with postman
export const sendReply = async (req, res) => {
    try {
        const { content } = req.body;
        const sender_id = req.user.userId; // Get authenticated user ID from auth middleware
        const receiver_id = 1; // Always reply to User 1 for now

        // Create conversation_id
        const conversationId = [sender_id, receiver_id]
            .sort((a, b) => a - b)
            .join('-');

        const message = await Messages.create({
            sender_id,
            receiver_id,
            content,
            conversation_id: conversationId,
            message_type: 'text',
            status: 'sent',
        });

        // Sanitize content before emitting to prevent XSS
        const sanitizedContent = message.content.replace(
            /[<>"'&]/g,
            (match) => {
                const entities = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;',
                };
                return entities[match];
            }
        );

        //  Emit Socket.io event (same as sendMessage)
        const messageData = {
            id: message.id,
            sender_id: message.sender_id,
            conversation_id: message.conversation_id,
            receiver_id: message.receiver_id,
            content: sanitizedContent,
            timestamp: message.createdAt,
        };

        // Get the io instance and emit to conversation room
        const io = req.app.get('io'); //This will help with the simulation of a PostMan Request so that we can have the socket pickup on the Postman Request
        io.to(`user-${receiver_id}`).emit('receiver-message', messageData);


        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
};

// CREATE TEST USERS (for testing only)
export const createTestUsers = async (req, res) => {
    try {
        const testUsers = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@test.com',
                isActive: true,
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@test.com',
                isActive: true,
            },
            {
                firstName: 'Bob',
                lastName: 'Wilson',
                email: 'bob@test.com',
                isActive: true,
            },
        ];

        const users = await User.bulkCreate(testUsers, {
            ignoreDuplicates: true,
        });
        res.json({ success: true, message: 'Test users created', data: users });
    } catch (error) {
        console.error('Detailed error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to create test users',
            details: error.message,
        });
    }
};

//  MARK AS READ
export const markAsRead = async (req, res) => {
    try {
        const { other_user_id } = req.body; //This will get the other persons ID from the frontend Request Ex(User 2 sent messages to User 1)
        const currentUserId = req.user.userId; // Get authenticated user ID from auth middleware

        // Create conversation_id | Target specific conversations for updates
        const conversationId = [currentUserId, other_user_id]
            .sort((a, b) => a - b)
            .join('-');

        // Mark all messages in this conversation as read where current user is receiver
        await Messages.update(
            {
                status: 'read', //Status changes to read
                read_at: new Date(),
            },
            {
                where: {
                    //where the coversation_id  = 1-2
                    conversation_id: conversationId,
                    receiver_id: currentUserId, //Received by current user 1
                    status: { [Op.ne]: 'read' }, //When the status is currently unread
                },
            }
        );

        res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

// DELETE MESSAGE  (we can implement this in the future)
export const deleteMessage = async (req, res) => {
    // Soft delete or hard delete message
};
