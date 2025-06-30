import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Message, ChatMessage, UseMessagesReturn, UseChatReturn } from './types';

// Custom hook for managing messages list
export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - replace with actual API response
      const mockMessages: Message[] = [
        {
          id: '1',
          name: 'Phil Johnson',
          date: 'June 12',
          avatar: '/assets/images/Ryan.jpg',
          lastMessage: 'Hey! I saw your latest post about React optimization. Great insights!',
          unreadCount: 2,
          isOnline: true
        },
        {
            id: '2',
          name: 'Phil Johnson',
          date: 'June 12',
          avatar: '/assets/images/Ryan.jpg',
          lastMessage: 'Hey! I saw your latest post',
          unreadCount: 2,
          isOnline: true
        }
        // Add more mock messages as needed
      ];   
      setMessages(mockMessages);
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

// Custom hook for managing chat messages
export const useChat = (conversationId: string | null): UseChatReturn => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatMessages = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock chat messages
      const mockChatMessages: ChatMessage[] = [
        {
          id: '1',
          content: 'Hey! I saw your latest post about React optimization.',
          timestamp: new Date(Date.now() - 3600000),
          isOwn: false,
          status: 'read'
        },
        {
          id: '2',
          content: 'Thanks for reaching out! I\'d be happy to discuss this further.',
          timestamp: new Date(Date.now() - 1800000),
          isOwn: true,
          status: 'read'
        }
      ];
      
      setChatMessages(mockChatMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chat messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      timestamp: new Date(),
      isOwn: true,
      status: 'sending'
    };

    setChatMessages(prev => [...prev, tempMessage]);

    try {
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update message status
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, id: `msg-${Date.now()}`, status: 'sent' as const }
            : msg
        )
      );
    } catch (err) {
      // Handle send error
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' as any }
            : msg
        )
      );
      setError('Failed to send message');
    }
  }, [conversationId]);

  const loadMoreMessages = useCallback(async () => {
    if (!conversationId) return;
    // Implement pagination logic here
  }, [conversationId]);

  const markAsRead = useCallback(async (messageId: string) => {
    // In production, make API call to mark message as read
    setChatMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' as const } : msg
      )
    );
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchChatMessages(conversationId);
    } else {
      setChatMessages([]);
    }
  }, [conversationId, fetchChatMessages]);

  return {
    chatMessages,
    isLoading,
    error,
    sendMessage,
    loadMoreMessages,
    markAsRead
  };
};

// Hook for real-time message updates (WebSocket integration)
export const useRealTimeMessages = (userId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // In production, implement WebSocket connection
    // const ws = new WebSocket(`ws://your-websocket-url/${userId}`);
    
    // ws.onopen = () => setIsConnected(true);
    // ws.onclose = () => setIsConnected(false);
    // ws.onmessage = (event) => {
    //   const message = JSON.parse(event.data);
    //   // Handle incoming messages
    // };
    
    // return () => ws.close();
  }, [userId]);
  
  return { isConnected };
};