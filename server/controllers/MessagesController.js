import Messages from "../Models/MessagesTable.js";
import User from "../Models/users.js"
import { Op } from 'sequelize';

//Functions (For SideBar Messages List)
// 1. GET CONVERSATIONS LIST
export const getConversations = async (req, res) => {
  try {
   // In MessagesController.js - line 9 and 79
        const currentUserId = 1; // Hardcode user ID 1 for testing

    
    // Get all messages involving current user 
    const result = await Messages.findAll({
      where: {
        [Op.or]: [
          { sender_id: currentUserId },
          { receiver_id: currentUserId }
        ]
      },
      // Temporarily removed includes until associations are set up
      order: [['createdAt', 'DESC']] //Order by Newest First
    });
    
    // Group by conversation and get latest message per conversation
    const conversationsMap = new Map();
    
    result.forEach(message => {
      const conversationId = message.conversation_id;
      
      if (!conversationsMap.has(conversationId)) {
        // For now, create basic conversation data without user joins
        const otherUserId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
        
        // Count unread messages in this conversation
        const unreadCount = result.filter(msg => 
          msg.conversation_id === conversationId && 
          msg.receiver_id === currentUserId && 
          msg.status !== 'read'
        ).length;
        
        conversationsMap.set(conversationId, {
          conversation_id: conversationId,
          otherUser: {
            id: otherUserId,
            firstName: `User${otherUserId}`,
            lastName: 'Test',
            email: `user${otherUserId}@test.com`
          },
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            sender_id: message.sender_id
          },
          unreadCount: unreadCount,
          isOnline: false
        });
      }
    });
    
    const conversations = Array.from(conversationsMap.values());
    
    console.log('Found conversations:', conversations.length);
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
    const {userId} = req.params; //Get other users' ID From URL example (/Conversation/5 -> userId = 5)
    
       const currentUserId = 1; // Hardcode user ID 1 for testing

    //Create Conversation_id (Smaller Id First) | creates Array With both users ID's, converts Userid to number
    const conversationId = [currentUserId, parseInt(userId)] //Ensures Consistent Conversation_id regardless of who sends first
    .sort((a,b) => a- b)
    .join('-');
  
  const result = await Messages.findAll({ //Gets all messages between you and User using Sequelize
        where: {
            conversation_id: conversationId //Filter Messages by conversation_id
        },
        // Temporarily removed includes until associations are set up
        order: [['createdAt', 'ASC']] //Order by Newest First
    });
    res.json({ success: true, data: result}); //Sends json to frontend
} catch(error) {
    console.error('Error', error);
    res.status(500).json({error: "Internal Server Error"});
}
  
};

// 3. SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = 1; // Hardcoded for testing
    
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
      status: 'sent'
    });
    
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};


// SEND REPLY (simulate other user replying)
export const sendReply = async (req, res) => {
  try {
    const { sender_id, content } = req.body;
    const receiver_id = 1; // Always reply to User 1
    
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
      status: 'sent'
    });
    
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
};

// CREATE TEST USERS (for testing only)
export const createTestUsers = async (req, res) => {
  try {
    console.log('Creating test users...');
    
    const testUsers = [
      { firstName: 'John', lastName: 'Doe', email: 'john@test.com', isActive: true },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', isActive: true },
      { firstName: 'Bob', lastName: 'Wilson', email: 'bob@test.com', isActive: true }
    ];
    
    console.log('Test users data:', testUsers);
    
    const users = await User.bulkCreate(testUsers, { ignoreDuplicates: true });
    
    console.log('Users created successfully:', users.length);
    res.json({ success: true, message: 'Test users created', data: users });
  } catch (error) {
    console.error('Detailed error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to create test users', details: error.message });
  }
};

// 4. MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const { other_user_id } = req.body;
    const currentUserId = 1; // Hardcoded for testing
    
    // Create conversation_id
    const conversationId = [currentUserId, other_user_id]
      .sort((a, b) => a - b)
      .join('-');
    
    // Mark all messages in this conversation as read where current user is receiver
    await Messages.update(
      { 
        status: 'read',
        read_at: new Date()
      },
      {
        where: {
          conversation_id: conversationId,
          receiver_id: currentUserId,
          status: { [Op.ne]: 'read' }
        }
      }
    );
    
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
}

// 5. DELETE MESSAGE
export const deleteMessage = async (req, res) => {
  // Soft delete or hard delete message
}






