import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import Messages from '../Models/MessagesTable.js';
import User from '../models/User.js';
import { isBlockedBetweenUsers } from '../utils/userVisibility.js';

//Functions (For SideBar Messages List)
//  GET CONVERSATIONS LIST
export const getConversations = async (req, res) => {
    try {
        // SECURITY FIX: Use authenticated user ID instead of hardcoded value
        // This prevents messages from being shown to wrong users
        const currentUserId = req.user.userId; // Get authenticated user ID from auth middleware

        const rows = await sequelize.query(
            `
            SELECT
                latest.conversation_id,
                CASE
                    WHEN message.sender_id = :currentUserId THEN message.receiver_id
                    ELSE message.sender_id
                END AS otherUserId,
                otherUser.firstName,
                otherUser.lastName,
                otherUser.publicId AS otherPublicId,
                otherProfile.profileImageUrl,
                message.content AS lastMessageContent,
                message.timestamp AS lastMessageTimestamp,
                message.sender_id AS lastMessageSenderId,
                COALESCE(unread.unreadCount, 0) AS unreadCount
            FROM (
                SELECT conversation_id, MAX(id) AS latestMessageId
                FROM messages
                WHERE sender_id = :currentUserId OR receiver_id = :currentUserId
                GROUP BY conversation_id
            ) latest
            INNER JOIN messages message ON message.id = latest.latestMessageId
            LEFT JOIN Users otherUser ON otherUser.id = CASE
                WHEN message.sender_id = :currentUserId THEN message.receiver_id
                ELSE message.sender_id
            END
            LEFT JOIN UserProfiles otherProfile ON otherProfile.userId = otherUser.id
            LEFT JOIN (
                SELECT conversation_id, COUNT(*) AS unreadCount
                FROM messages
                WHERE receiver_id = :currentUserId AND status != 'read'
                GROUP BY conversation_id
            ) unread ON unread.conversation_id = latest.conversation_id
            WHERE NOT EXISTS (
                SELECT 1 FROM BlockedUsers blocked
                WHERE (
                    blocked.blockerId = :currentUserId
                    AND blocked.blockedUserId = CASE
                        WHEN message.sender_id = :currentUserId
                        THEN message.receiver_id ELSE message.sender_id
                    END
                ) OR (
                    blocked.blockedUserId = :currentUserId
                    AND blocked.blockerId = CASE
                        WHEN message.sender_id = :currentUserId
                        THEN message.receiver_id ELSE message.sender_id
                    END
                )
            )
            ORDER BY message.timestamp DESC, message.id DESC
            `,
            {
                replacements: { currentUserId },
                type: sequelize.QueryTypes.SELECT,
            },
        );

        const conversations = rows.map((row) => ({
            conversation_id: row.conversation_id,
            otherUser: {
                id: row.otherUserId,
                publicId: row.otherPublicId || null,
                firstName: row.firstName || `User${row.otherUserId}`,
                lastName: row.lastName || 'Test',
                profileImageUrl: row.profileImageUrl || null,
            },
            lastMessage: {
                content: row.lastMessageContent,
                createdAt: row.lastMessageTimestamp,
                sender_id: row.lastMessageSenderId,
            },
            unreadCount: Number(row.unreadCount) || 0,
            isOnline: false,
        }));

        res.json({ success: true, data: conversations });
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
        if (await isBlockedBetweenUsers(currentUserId, parsedUserId)) {
            return res.status(403).json({ error: 'Conversation unavailable' });
        }

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
            order: [['timestamp', 'ASC']], //Order by Newest First
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
        const receiverId = Number(req.body.receiver_id);
        const content = req.body.content;
        const senderId = Number(req.user.userId);

        if (!Number.isInteger(receiverId) || receiverId <= 0) {
            return res.status(400).json({ error: 'Invalid receiver ID' });
        }
        if (!Number.isInteger(senderId) || senderId <= 0) {
            return res.status(401).json({ error: 'Invalid authenticated user' });
        }
        if (receiverId === senderId) {
            return res.status(400).json({ error: 'Cannot send a message to yourself' });
        }
        if (typeof content !== 'string' || !content.trim() || content.trim().length > 1000) {
            return res.status(400).json({ error: 'Message must contain 1 to 1000 characters' });
        }
        if (!(await User.findByPk(receiverId))) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        if (await isBlockedBetweenUsers(senderId, receiverId)) {
            return res.status(403).json({ error: 'Recipient is unavailable' });
        }

        const conversationId = [senderId, receiverId]
            .sort((a, b) => a - b)
            .join('-');
        const message = await Messages.create({
            sender_id: senderId,
            receiver_id: receiverId,
            content: content.trim(),
            conversation_id: conversationId,
            message_type: 'text',
            status: 'sent',
        });
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${receiverId}`).emit('receiver-message', message);
        }

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// // SEND REPLY (simulate other user replying) | This is just for testing at the moment with postman
// export const sendReply = async (req, res) => {
//     try {
//         const { content, receiver_id } = req.body;
//         const sender_id = req.user.userId; // Get authenticated user ID from auth middleware
//          // Always reply to User 1 for now

//         // Create conversation_id
//         const conversationId = [sender_id, receiver_id]
//             .sort((a, b) => a - b)
//             .join('-');

//         const message = await Messages.create({
//             sender_id,
//             receiver_id,
//             content,
//             conversation_id: conversationId,
//             message_type: 'text',
//             status: 'sent',
//         });

//         // Sanitize content before emitting to prevent XSS
//         const sanitizedContent = message.content.replace(
//             /[<>"'&]/g,
//             (match) => {
//                 const entities = {
//                     '<': '&lt;',
//                     '>': '&gt;',
//                     '"': '&quot;',
//                     "'": '&#x27;',
//                     '&': '&amp;',
//                 };
//                 return entities[match];
//             }
//         );

//         //  Emit Socket.io event (same as sendMessage)
//         const messageData = {
//             id: message.id,
//             sender_id: message.sender_id,
//             conversation_id: message.conversation_id,
//             receiver_id: message.receiver_id,
//             content: sanitizedContent,
//             timestamp: message.timestamp,
//         };

//         // Get the io instance and emit to conversation room
//         const io = req.app.get('io'); //This will help with the simulation of a PostMan Request so that we can have the socket pickup on the Postman Request
//         io.to(`user-${receiver_id}`).emit('receiver-message', messageData);


//         res.json({ success: true, data: message });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Failed to send reply' });
//     }
// };

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
        const otherUserId = Number(req.body.other_user_id);
        const currentUserId = Number(req.user.userId);

        if (!Number.isInteger(otherUserId) || otherUserId <= 0 || otherUserId === currentUserId) {
            return res.status(400).json({ error: 'Invalid other user ID' });
        }
        if (await isBlockedBetweenUsers(currentUserId, otherUserId)) {
            return res.status(403).json({ error: 'Conversation unavailable' });
        }

        const conversationId = [currentUserId, otherUserId]
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
