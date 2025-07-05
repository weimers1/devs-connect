import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Message, ChatMessage, UseMessagesReturn, UseChatReturn } from './types';
import {io, Socket} from "socket.io-client";
import messageApi from '../../Service/service';

// Custom hook for managing messages list (SIDEBAR)
// User opens the app and this "useMessages" fetches their recent chats
export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await messageApi.getConversations();
      
      // Transform backend data to Message type
      const transformedMessages: Message[] = response.data.map((conv: any) => ({
        id: conv.conversation_id,
        name: `${conv.otherUser.firstName} ${conv.otherUser.lastName}`,
        date: new Date(conv.lastMessage.createdAt).toLocaleDateString(),
        avatar: `https://ui-avatars.com/api/?name=${conv.otherUser.firstName}+${conv.otherUser.lastName}&background=3b82f6&color=fff`,
        lastMessage: conv.lastMessage.content,
        unreadCount: conv.unreadCount || "",
        isOnline: Math.random() > 0.5
      }));
      
      setMessages(transformedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchMessages = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(msg => 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages: filteredMessages,
    isLoading,
    error,
    searchMessages,
    refreshMessages
  };
};




// Custom hook for managing chat messages (CHAT WINDOW)
export const useChat = (userId: string | null): UseChatReturn => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatMessages = useCallback(async (id: string) => {
    console.log('Fetching chat messages for user ID:', id);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await messageApi.getChatMessages(id);
      console.log('Chat API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data length:', response.data?.length);
      
      const transformedMessages: ChatMessage[] = response.data.map((msg: any) => ({
        id: msg.id.toString(),
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        isOwn: msg.sender_id === 1,
        status: msg.status || 'read'
      }));
      
      console.log('Transformed chat messages:', transformedMessages);
      setChatMessages(transformedMessages);
      
      // Mark all unread messages as read when opening conversation
      await markConversationAsRead(id);
      
    } catch (err) {
      console.error('Chat fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chat messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      timestamp: new Date(),
      isOwn: true,
      status: 'sending'
    };

    setChatMessages(prev => [...prev, tempMessage]);

    try {
      // Call the actual API to save message to database
      const response = await fetch('http://localhost:8080/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: parseInt(userId),
          content: content.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);
      
      // Update the temp message with real data from server
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { 
                ...msg, 
                id: result.data.id.toString(), 
                status: 'sent' as const,
                timestamp: new Date(result.data.createdAt)
              }
            : msg
        )
      );
    } catch (err) {
      console.error('Send message error:', err);
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' as any }
            : msg
        )
      );
      setError('Failed to send message');
    }
  }, [userId]);

  const loadMoreMessages = useCallback(async () => {
    if (!userId) return;
  }, [userId]);

  const markAsRead = useCallback(async (messageId: string) => {
    setChatMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' as const } : msg
      )
    );
  }, []);
  
  // Mark entire conversation as read
  const markConversationAsRead = useCallback(async (otherUserId: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          other_user_id: parseInt(otherUserId)
        })
      });
      
      if (response.ok) {
        console.log('Conversation marked as read');
      }
    } catch (err) {
      console.error('Failed to mark conversation as read:', err);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchChatMessages(userId);
    } else {
      setChatMessages([]);
    }
  }, [userId, fetchChatMessages]);

  return {
    chatMessages,
    isLoading,
    error,
    sendMessage,
    loadMoreMessages,
    markAsRead
  };
};

// Hook for real-time message updates (WebSocket integration) | Testing to See if we can connect the server and client 
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:8080');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log(`Connected to server ${newSocket.id}`); //Logging the User ID to the server
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => { newSocket.close()
    };
  }, []);


  return { socket, isConnected };
};


//Messages Hook For Conversations API calls

// Define the conversation type
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

