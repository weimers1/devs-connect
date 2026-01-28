import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Message, ChatMessage, UseMessagesReturn, UseChatReturn } from './types';
import {io, Socket} from "socket.io-client";
import messageApi from '../../Service/service';
import API from '../../Service/service';

// Security utilities || Without sanitization  for Example 
// an attack can send a script fetch /api/user/delete, {method: 'POST}
//Result: Script executes, deletes user account
export const sanitizeContent = (content: string): string => {
  if (typeof content !== 'string') return '';
  return content
    .replace(/[<>"'&\/\\]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': 
        '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;',
        '&': '&amp;', 
        '/': '&#x2F;', //Prevents path traversal
        '\\': '&#x5C;' //Prevents escape sequences 
      };
      return entities[match];
    })
    .replace(/javascript:/gi, '') // Blocks JS execution
    .replace(/data:/gi, '') //Blocks data URLS
    .replace(/vbscript:/gi, '') //Blocks VBScript
    .slice(0, 1000); // Max message length
};

//Validates the URL to make sure the URL is legit
export const validateUrl = (url: string): boolean => {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url);
};

export const validateTimestamp = (timestamp: any): Date => {
  const date = new Date(timestamp);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  if (isNaN(date.getTime()) || date > now || date < oneYearAgo) {
    return new Date(); // Return current date for invalid timestamps
  }
  return date;
};


// Rate limiting to combat against DDOS attacks
export const messageRateLimit = new Map<number, { count: number; lastReset: number }>();
const MAX_MESSAGES_PER_MINUTE = 30;

export const checkRateLimit = (userId: number): boolean => {
  const now = Date.now();
  const userLimit = messageRateLimit.get(userId) || { count: 0, lastReset: now };
  
  if (now - userLimit.lastReset > 60000) {
    userLimit.count = 0;
    userLimit.lastReset = now;
  }
  
  if (userLimit.count >= MAX_MESSAGES_PER_MINUTE) {
    return false;
  }
  
  userLimit.count++;
  messageRateLimit.set(userId, userLimit);
  return true;
};

// Get current user ID from API
export const getCurrentUserId = async (): Promise<number> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 
    'http://localhost:6969'}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('session_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    const user = await response.json();
    return Number(user.id);
  } catch (error) {
    console.error('Failed to get current user ID:', error);
    throw new Error('Authentication failed');
  }
};

//Validate Messaging for message content 
export const validateMessageContent = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  if (content.length > 1000 || content.trim().length === 0) return false;
  return true;
};

// Custom hook for managing messages list (SIDEBAR)
// User opens the app and this "useMessages" fetches their recent chats | This Hook is the bridge between our backend API and frontend UI
export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]); //Array of Conversation objects for sidebar
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState(''); //User's search input
    //The purpose of the is to prevent any unnecessary re-renders
  const fetchMessages = useCallback(async () => { 
    setIsLoading(true); 
    setError(null);
    //API CALL
    try {
      const response = await messageApi.getConversations(); //This will call to the backend  (returns data aka conversation objects)
      
      // Validate API response structure
      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid API response structure');
      }
      
      // Transform backend data to Message type | Since the backend and frontend format are different
      const transformedMessages: Message[] = response.data.map((conversation: any) => {
        if (!conversation?.conversation_id || !conversation?.otherUser || !conversation?.lastMessage) {
          throw new Error('Invalid conversation data structure');
        }
        return {
          id: conversation.conversation_id,
          name: `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`,
          timestamp: new Date(conversation.lastMessage.createdAt).toLocaleDateString(),
          avatar: `https://ui-avatars.com/api/?name=${conversation.otherUser.firstName}+${conversation.otherUser.lastName}&background=3b82f6&color=fff`,
          lastMessage: conversation.lastMessage.content,
          unreadCount: conversation.unreadCount || "",
          //Fixed for now @TODO: add tracking to determine isOnline status
          isOnline: Math.random() > 0.5
        };
      });
       
      setMessages(transformedMessages); //Updates state with ready conversation data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages'); //Error handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchMessages = useCallback((query: string) => { //Updates Search query when user types in search box 
    setSearchQuery(query);
  }, []);
  //This will filter conversations based on search query. Ex Search "hey" will show a conversation with hey
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(msg => 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);
  //This allow manual refresh of conversation list
  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);
//Automatically loads conversations when component mounts
 
    useEffect(() => {
    fetchMessages();
    
      //WEB SOCKET INTEGRATION For updates on the sidebar
          if(socket) {
            socket.on("receiver-message", (messageData) => {
                // Validate messageData structure to prevent runtime errors
                if (!messageData || typeof messageData !== 'object' || 
                    !messageData.conversation_id || !messageData.content || !messageData.timestamp) {
                  return;
                }
                
                // Sanitize incoming message data to prevent XSS
                const sanitizedContent = sanitizeContent(messageData.content);
                const validatedTimestamp = validateTimestamp(messageData.timestamp);
                
              setMessages(prev => 
              prev.map(conversation => {
                  if(conversation.id === messageData.conversation_id) {
                    const currentCount = Number(conversation.unreadCount) || 0;
                    return {
                      ...conversation,
                      lastMessage: sanitizedContent,
                      date: validatedTimestamp.toLocaleDateString(),
                      unreadCount: currentCount + 1
                    };
                  }
                  return conversation;
                })
                
              );

            });
            return () => {
              socket.off("receiver-message");
            };
          }

      
  }, [fetchMessages, socket]);


  //This will expose all functionality to components
  return {
    messages: filteredMessages,
    isLoading,
    error,
    searchMessages,
    refreshMessages
  };
};

// Custom hook for managing chat messages (CHAT WINDOW)
export const useChat = (userId: string | null): UseChatReturn => { //Takes Userid paramter (who you're chatting with)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); //Chat messages array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket(); //Destructured so we can share throughout the other hooks
  


  //calls the backend API and gets all messages between current user and selected user
  const fetchChatMessages = useCallback(async (id: string) => {
    // SECURITY: Removed console.log statements that exposed user IDs and API responses
    // Validate and sanitize user ID
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }
    
    // Validate user ID format (should be numeric)
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
      throw new Error('User ID must be a positive integer');
    }
    
    const sanitizedId = String(numericId);
    // Sanitize user ID for logging to prevent log injection
    const logSafeId = sanitizedId.replace(/[\r\n\t\x00-\x1F\x7F-\x9F\u0080-\u009F\u2000-\u200F\u2028-\u202F]/g, '_');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await messageApi.getChatMessages(id);
      // Sanitize response data for logging
      const sanitizedResponse = {
        status: response.status || 'unknown',
        dataLength: response.data?.length || 0
      };
      // Sanitize response data for logging to prevent log injection
      const logSafeStatus = String(sanitizedResponse.status).replace(/[\r\n\t\x00-\x1F\x7F-\x9F\u0080-\u009F\u2000-\u200F\u2028-\u202F]/g, '_');
      const logSafeLength = String(sanitizedResponse.dataLength).replace(/[\r\n\t\x00-\x1F\x7F-\x9F\u0080-\u009F\u2000-\u200F\u2028-\u202F]/g, '_');
        //This will Transform database format to the UI format
      const currentUserId = await getCurrentUserId();
      const transformedMessages: ChatMessage[] = response.data.map((msg: any) => ({
        id: msg.id.toString(),
        content: sanitizeContent(msg.content || ''),
        timestamp: validateTimestamp(msg.createdAt),
        isOwn: msg.sender_id === currentUserId,
        status: msg.status || 'read'
      }));
   
      setChatMessages(transformedMessages); // Update the state so we can update the message state.
      // Mark all unread messages as read when opening conversation
      await markConversationAsRead(id);
      
    } catch (err) {
      console.error('Chat fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chat messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  //Handles sending new messages 
  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !validateMessageContent(content)) return;
    
    // Get current user ID with error handling
    let currentUserId: number;
    try {
      const currentid = await API.getCurrentUser();
      currentUserId = currentid.userId;
      console.log(currentUserId);   
    } catch (error) {
      setError('Authentication failed');
      return;
    }
    
    // Rate limiting check
    if (!checkRateLimit(currentUserId)) {
      setError('Too many messages. Please wait before sending another.');
      return;
    }
    
    const sanitizedContent = sanitizeContent(content);
    //Shows message immediately with "sending" status - user sees message right away with no waiting
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: sanitizedContent,
      timestamp: new Date(),
      isOwn: true,
      status: 'sending'
    };

    setChatMessages(prev => [...prev, tempMessage]);

    try {
      // Saves the messages to database
      const messageApiUrl = //import.meta.env.VITE_API_URL ||
        'http://localhost:6969';
      
      // Validate API URL to prevent SSRF
      if (!validateUrl(messageApiUrl)) {
        throw new Error('Invalid API URL');
      }
      // Validate userId before parsing
      const receiverIdNum = Number(userId);
      if (isNaN(receiverIdNum) || receiverIdNum <= 0) {
        throw new Error('Invalid user ID');
      }
      
      // Send HTTP POST request to backend to save message to database
      const token = localStorage.getItem('session_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${messageApiUrl}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: receiverIdNum,
          content: sanitizedContent
        })
      });
      if(socket) { //Sending messages looking for the sending-message event in the backend
        // Validate authentication before emitting
        try {
          socket.emit("send-message", {
            sender_id: currentUserId,
            receiver_id: receiverIdNum,
            content: sanitizedContent
          });
        } catch (error) {
          console.error('Socket emission failed');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update message status to sent
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: result.id?.toString() || msg.id, status: 'sent' }
            : msg
        )
      );

    } catch (err) {
      // SECURITY: Kept error logging for debugging, removed data exposure
      console.error('Send message error:', err);
      // Update message status to failed
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [userId, socket]);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      // Validate conversation ID
      const numericId = Number(conversationId);
      if (isNaN(numericId) || numericId <= 0) {
        throw new Error('Invalid conversation ID');
      }
      
      const token = localStorage.getItem('session_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const messageApiUrl = //import.meta.env.VITE_API_URL || 
      'http://localhost:6969';
      
      // Validate API URL
      if (!validateUrl(messageApiUrl)) {
        throw new Error('Invalid API URL');
      }
      
      await fetch(`${messageApiUrl}/api/messages/mark-read/${numericId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Mark as read failed');
    }
  }, []);

  return {
    chatMessages,
    isLoading,
    error,
    fetchChatMessages,
    sendMessage,
    socket
  };
};

// Socket hook with error handling
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const socketUrl = //import.meta.env.VITE_API_URL || 
      'http://localhost:6969';
      
      // Validate socket URL
      if (!validateUrl(socketUrl)) {
        setError('Invalid socket configuration');
        return;
      }
      
      const newSocket = io(socketUrl);

      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', () => {
        setError('Connection failed');
        setIsConnected(false);
      });

      newSocket.on('error', () => {
        setError('Socket error occurred');
      });

      setSocket(newSocket);

      return () => {
        try {
          newSocket.close();
        } catch (closeErr) {
          console.error('Error closing socket:', closeErr);
        }
      };
    } catch (err) {
      setError('Socket initialization failed');
      setIsConnected(false);
    }
  }, []);

  return { socket, isConnected, error };
};

// Define the conversation type | defining the structure of conversation data from the backend API
interface Conversation {
  conversation_id: string;
  otherUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    sender_id: number;
  };
}

