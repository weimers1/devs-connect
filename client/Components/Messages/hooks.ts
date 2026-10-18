import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Message, ChatMessage, UseMessagesReturn, UseChatReturn } from './types';
import {io, Socket} from "socket.io-client";
import messageApi from '../../Service/service';
import API from '../../Service/service';

// Security utilities || Without sanitization  for Example 
// an attack can send a script fetch /api/user/delete, {method: 'POST}
//Result: Script executes, deletes user account
export const sanitizeContent = (content: string): string => {
  if (typeof content !== 'string') return '';
  return content.slice(0, 1000);
};

export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const isLocalHost = ['localhost', '127.0.0.1'].includes(parsed.hostname);
    return (
      (parsed.protocol === 'https:' ||
        (parsed.protocol === 'http:' && isLocalHost)) &&
      !parsed.username &&
      !parsed.password &&
      parsed.pathname === '/' &&
      !parsed.search &&
      !parsed.hash
    );
  } catch {
    return false;
  }
};

export const validateTimestamp = (timestamp: unknown): Date => {
  if (
    typeof timestamp !== 'string' &&
    typeof timestamp !== 'number' &&
    !(timestamp instanceof Date)
  ) {
    return new Date();
  }
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
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
export const getCurrentUserId = async (): Promise<{ userId: number }> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 
    'http://localhost:6969'}/api/users/me`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    const user: unknown = await response.json();
    if (
      !user ||
      typeof user !== 'object' ||
      !('userId' in user) ||
      typeof user.userId !== 'number'
    ) {
      throw new Error('Invalid current user response');
    }
    return { userId: user.userId };
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
  const conversationIds = useRef(new Set<string>());
  const pendingConversationRefreshes = useRef(new Set<string>());
  const activeChatUserId = useRef<string | null>(null);
  const setActiveChatUserId = useCallback((id: string | null) => {
    activeChatUserId.current = id;
  }, []);
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
      const transformedMessages: Message[] = response.data.map((conversation: Conversation) => {
        if (!conversation?.conversation_id || !conversation?.otherUser || !conversation?.lastMessage) {
          throw new Error('Invalid conversation data structure');
        }
        return {
          id: conversation.conversation_id,
          userId: String(conversation.otherUser.id),
          publicId: conversation.otherUser.publicId || undefined,
          name: `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`.trim(),
          timestamp: new Date(conversation.lastMessage.createdAt),
          avatar: conversation.otherUser.profileImageUrl || '',
          lastMessage: conversation.lastMessage.content,
          unreadCount: Number(conversation.unreadCount) || 0,
          //Fixed for now @TODO: add tracking to determine isOnline status
          isOnline: false
        };
      });
       
      conversationIds.current = new Set(transformedMessages.map(message => message.id));
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
            const handleUserBlocked = (payload: { userId?: number | string }) => {
              if (!payload?.userId) return;
              const blockedUserId = String(payload.userId);
              setMessages(prev => prev.filter(
                conversation => !conversation.id.split('-').includes(blockedUserId)
              ));
              conversationIds.current = new Set(
                Array.from(conversationIds.current).filter(
                  conversationId => !conversationId.split('-').includes(blockedUserId)
                )
              );
            };

            socket.on('user-blocked', handleUserBlocked);
            const handleReceiverMessage = (messageData: {
                conversation_id?: string;
                sender_id?: number | string;
                content?: string;
                timestamp?: unknown;
            }) => {
                // Validate messageData structure to prevent runtime errors
                if (!messageData || typeof messageData !== 'object' || 
                    !messageData.conversation_id || !messageData.content || !messageData.timestamp) {
                  return;
                }
                
                // Sanitize incoming message data to prevent XSS
                const sanitizedContent = sanitizeContent(messageData.content);
                const validatedTimestamp = validateTimestamp(messageData.timestamp);
                const isActiveChat =
                  activeChatUserId.current !== null &&
                  String(messageData.sender_id) === activeChatUserId.current;
                
              const conversationId = String(messageData.conversation_id);
              setMessages(prev => prev.map(conversation => {
                if (conversation.id !== conversationId) return conversation;
                return {
                  ...conversation,
                  lastMessage: sanitizedContent,
                  timestamp: validatedTimestamp,
                  unreadCount: isActiveChat
                    ? 0
                    : (Number(conversation.unreadCount) || 0) + 1,
                };
              }));

              if (
                !conversationIds.current.has(conversationId) &&
                !pendingConversationRefreshes.current.has(conversationId)
              ) {
                pendingConversationRefreshes.current.add(conversationId);
                void fetchMessages().finally(() => {
                  pendingConversationRefreshes.current.delete(conversationId);
                });
              }

            };
            socket.on("receiver-message", handleReceiverMessage);
            // After a dropped connection, reload anything that arrived while offline.
            let hasConnected = socket.connected;
            const handleConnect = () => {
              if (hasConnected) void fetchMessages();
              hasConnected = true;
            };
            socket.on('connect', handleConnect);
            return () => {
              socket.off("receiver-message", handleReceiverMessage);
              socket.off('connect', handleConnect);
              socket.off('user-blocked', handleUserBlocked);
            };
          }

      
  }, [fetchMessages, socket]);


  //This will expose all functionality to components
  return {
    messages: filteredMessages,
    isLoading,
    error,
    socket,
    searchMessages,
    refreshMessages,
    setActiveChatUserId
  };
};

// Custom hook for managing chat messages (CHAT WINDOW)
export const useChat = (
  userId: string | null,
  socket: Socket | null = null,
): UseChatReturn => { //Takes Userid paramter (who you're chatting with)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); //Chat messages array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchSequence = useRef(0);
  const markReadRef = useRef<(id: string) => Promise<void>>(async () => {});

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
    
    const requestSequence = ++fetchSequence.current;
    setChatMessages([]);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await messageApi.getChatMessages(id);
      if (!response || !Array.isArray(response.data)) {
        throw new Error('Invalid chat messages response');
      }
        //This will Transform database format to the UI format
      const currentUserId = await getCurrentUserId();
      const transformedMessages: ChatMessage[] = response.data.map((msg: ChatMessageRecord) => ({
        id: msg.id.toString(),
        content: sanitizeContent(msg.content || ''),
        timestamp: validateTimestamp(msg.timestamp),
        isOwn: currentUserId.userId === msg.sender_id,
        status: msg.status || 'read'
      }
      ));
   
      if (requestSequence !== fetchSequence.current) return;
      setChatMessages(transformedMessages);
      // Mark all unread messages as read when opening conversation
      await markReadRef.current(id);
      
    } catch (err) {
      if (requestSequence !== fetchSequence.current) return;
      console.error('Chat fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chat messages');
    } finally {
      if (requestSequence === fetchSequence.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      fetchSequence.current += 1;
      setChatMessages([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    void fetchChatMessages(userId);
  }, [fetchChatMessages, userId]);

  //Handles sending new messages 
  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !validateMessageContent(content)) {
      throw new Error('Choose a conversation and enter a message of 1 to 1000 characters.');
    }
    
    // Get current user ID with error handling
    let currentUserId: number;
    try {
      const currentid = await API.getCurrentUser();
      currentUserId = currentid.userId; 
    } catch (error) {
      setError('Authentication failed');
      throw error;
    }
    
    // Rate limiting check
    if (!checkRateLimit(currentUserId)) {
      const rateLimitError = new Error('Too many messages. Please wait before sending another.');
      setError(rateLimitError.message);
      throw rateLimitError;
    }

    const sanitizedContent = sanitizeContent(content);
    setError(null);
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
      const messageApiUrl = import.meta.env.VITE_API_URL ||
        'http://localhost:6969';
      
      // Validate API URL to prevent SSRF
      if (!validateUrl(messageApiUrl)) {
        throw new Error('Invalid API URL');
      }
      // Validate userId before parsing
      const receiverIdNum = Number(userId); // NEED TO FIX
      if (isNaN(receiverIdNum) || receiverIdNum <= 0) {
        throw new Error('Invalid user ID');
      }

      // Send HTTP POST request to backend to save message to database
      const response = await fetch(`${messageApiUrl}/api/messages/send`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: receiverIdNum,
          content: sanitizedContent
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof result?.error === 'string'
            ? result.error
            : `Message could not be sent (HTTP ${response.status}).`,
        );
      }
      
      // Update message status to sent
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: result.data?.id?.toString() || msg.id, status: 'sent' }
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
      throw err;
    }
  }, [userId]);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      // Validate conversation ID
      const numericId = Number(conversationId);
      if (isNaN(numericId) || numericId <= 0) {
        throw new Error('Invalid conversation ID');
      }
      
      const messageApiUrl = import.meta.env.VITE_API_URL || 
      'http://localhost:6969';
      
      // Validate API URL
      if (!validateUrl(messageApiUrl)) {
        throw new Error('Invalid API URL');
      }
      
      await fetch(`${messageApiUrl}/api/messages/mark-read`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ other_user_id: numericId }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch {
      console.error('Mark as read failed');
    }
  }, []);

  markReadRef.current = markConversationAsRead;

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const remoteTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);

  const clearRemoteTyping = useCallback(() => {
    if (remoteTypingTimer.current) clearTimeout(remoteTypingTimer.current);
    remoteTypingTimer.current = null;
    setIsOtherTyping(false);
  }, []);

  useEffect(() => {
    clearRemoteTyping();
    if (!socket || !userId) return;
    const handleTyping = (payload: { userId?: number | string; isTyping?: boolean }) => {
      if (String(payload?.userId) !== userId) return;
      if (!payload.isTyping) {
        clearRemoteTyping();
        return;
      }
      setIsOtherTyping(true);
      if (remoteTypingTimer.current) clearTimeout(remoteTypingTimer.current);
      // Hide the bubble if the "stopped" event never arrives.
      remoteTypingTimer.current = setTimeout(clearRemoteTyping, 4000);
    };
    const handleMessage = (messageData: { sender_id?: number | string }) => {
      if (String(messageData?.sender_id) === userId) clearRemoteTyping();
    };
    socket.on('typing', handleTyping);
    socket.on('receiver-message', handleMessage);
    return () => {
      socket.off('typing', handleTyping);
      socket.off('receiver-message', handleMessage);
      if (remoteTypingTimer.current) clearTimeout(remoteTypingTimer.current);
    };
  }, [socket, userId, clearRemoteTyping]);

  const notifyTyping = useCallback((typing: boolean) => {
    if (!socket || !userId || !socket.connected) return;
    if (localTypingTimer.current) clearTimeout(localTypingTimer.current);
    localTypingTimer.current = null;
    if (!typing) {
      lastTypingSent.current = 0;
      socket.emit('typing', { receiverId: Number(userId), isTyping: false });
      return;
    }
    const now = Date.now();
    if (now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now;
      socket.emit('typing', { receiverId: Number(userId), isTyping: true });
    }
    localTypingTimer.current = setTimeout(() => {
      lastTypingSent.current = 0;
      socket.emit('typing', { receiverId: Number(userId), isTyping: false });
    }, 3000);
  }, [socket, userId]);

  useEffect(() => () => {
    if (localTypingTimer.current) clearTimeout(localTypingTimer.current);
  }, [userId]);

  // Show messages from the open conversation as soon as they arrive.
  useEffect(() => {
    if (!socket || !userId) return;
    const handleIncoming = (messageData: ChatMessageRecord) => {
      if (
        !messageData ||
        typeof messageData !== 'object' ||
        String(messageData.sender_id) !== userId ||
        messageData.id === undefined ||
        !messageData.content
      ) {
        return;
      }
      const incoming: ChatMessage = {
        id: String(messageData.id),
        content: sanitizeContent(messageData.content),
        timestamp: validateTimestamp(messageData.timestamp),
        isOwn: false,
        status: 'read',
      };
      setChatMessages(prev =>
        prev.some(msg => msg.id === incoming.id) ? prev : [...prev, incoming]
      );
      void markReadRef.current(userId);
    };
    const handleReconnect = () => {
      void fetchChatMessages(userId).catch(() => undefined);
    };
    let hasConnected = socket.connected;
    const handleConnect = () => {
      if (hasConnected) handleReconnect();
      hasConnected = true;
    };
    socket.on('receiver-message', handleIncoming);
    socket.on('connect', handleConnect);
    return () => {
      socket.off('receiver-message', handleIncoming);
      socket.off('connect', handleConnect);
    };
  }, [socket, userId, fetchChatMessages]);

  return {
    chatMessages,
    isLoading,
    error,
    fetchChatMessages,
    sendMessage,
    isOtherTyping,
    notifyTyping,
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
      const socketUrl = import.meta.env.VITE_API_URL || 
      'http://localhost:6969';
      
      // Validate socket URL
      if (!validateUrl(socketUrl)) {
        setError('Invalid socket configuration');
        return;
      }
      
      const newSocket = io(socketUrl, {
        withCredentials: true,
      });

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
    } catch {
      setError('Socket initialization failed');
      setIsConnected(false);
    }
  }, []);

  return { socket, isConnected, error };
};

// Define the conversation type | defining the structure of conversation data from the backend API
interface ChatMessageRecord {
  id: number;
  content: string;
  timestamp: string | Date;
  sender_id: number;
  status?: ChatMessage['status'];
}

interface Conversation {
  conversation_id: string;
  unreadCount: number;
  otherUser: {
    id: number;
    publicId?: string | null;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    sender_id: number;
  };
}
