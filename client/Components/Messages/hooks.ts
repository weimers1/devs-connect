import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Message, ChatMessage, UseMessagesReturn, UseChatReturn } from './types';
import {io, Socket} from "socket.io-client";
import messageApi from '../../Service/service';

// Custom hook for managing messages list (SIDEBAR)
// User opens the app and this "useMessages" fetches their recent chats | This Hook is the bridge between our backend API and frontend UI
export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]); //Array of Conversation objects for sidebar
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); //User's search input
    //The purpose of the is to prevent any unnecessary re-renders
  const fetchMessages = useCallback(async () => { 
    setIsLoading(true);
    setError(null);
    //API CALL
    try {
      const response = await messageApi.getConversations(); //This will call to the backend  (returns data aka conversation objects)
      
      // Transform backend data to Message type | Since the backend and frontend format are different
      const transformedMessages: Message[] = response.data.map((conv: any) => ({
        id: conv.conversation_id,
        name: `${conv.otherUser.firstName} ${conv.otherUser.lastName}`,
        date: new Date(conv.lastMessage.createdAt).toLocaleDateString(),
        avatar: `https://ui-avatars.com/api/?name=${conv.otherUser.firstName}+${conv.otherUser.lastName}&background=3b82f6&color=fff`,
        lastMessage: conv.lastMessage.content,
        unreadCount: conv.unreadCount || "",
        //Fixed for now @TODO: add tracking to determine isOnline status
        isOnline: Math.random() > 0.5
      }));
      
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
  }, [fetchMessages]);
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
  const [socket, setSocket] = useState<Socket | null>(null);
  


  //calls the backend API and gets all messages between current user and selected user
  const fetchChatMessages = useCallback(async (id: string) => {
    console.log('Fetching chat messages for user ID:', id);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await messageApi.getChatMessages(id);
      console.log('Chat API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data length:', response.data?.length);
        //This will Transform database format to the UI format
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

  
  //Handles sending new messages 
  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) return;
    //Shows message immediately with "sending" status
    const tempMessage: ChatMessage = { //The users sees message right away with no waiting
      id: `temp-${Date.now()}`,
      content: content.trim(),
      timestamp: new Date(),
      isOwn: true,
      status: 'sending'
    };

    setChatMessages(prev => [...prev, tempMessage]);

    try {
      // Saves the messages to database
      const response = await fetch('http://localhost:8080/api/messages/send', { //frontend api call which will send an HTTP post request to the backend, thus the backend will save to the database
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: parseInt(userId),
          content: content.trim()
        })
      });
      if(socket) { //Sending messages looking for the sending-message event in the backend
        socket.emit("sending-messages", {
          sender_id: 1,
          receiver_id: parseInt(userId),
          content: content.trim(),
         conversation_id: [1, parseInt(userId)].sort((a, b) => a - b).join('-')
     })
      }
      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);
      
      // Update the temp message with real database data from server (removed the hard coded U.I we had early)
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
  }, [userId, socket]);
    //Load Older messages when user scrolls to the top @TODO: implement fully functional function in the future would call API 
  const loadMoreMessages = useCallback(async () => {
    if (!userId) return;
  }, [userId]);
    //Updates message status to read  when a user clicks on individual message  Note:(Only updates UI status, doesn't call to the backend)
  const markAsRead = useCallback(async (messageId: string) => {
    setChatMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' as const } : msg
      )
    );
  }, []);
  
  // Mark entire conversation as read | marks all messages in conversation as read clears unread in top right 
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
  //Automatically loads message when userid changes | triggers when user clicks different conversatio in sidebar
  useEffect(() => {
    if (userId) {
      fetchChatMessages(userId);
    } else {
      setChatMessages([]);
    }
  }, [userId, fetchChatMessages]);
// In useChat hook, after the userId useEffect:
useEffect(() => {
  const newSocket = io('http://localhost:8080');
  
  newSocket.on('connect', () => {
    console.log('Chat socket connected');
  });
  
  newSocket.on("receiver-message", (messageData) => {
    console.log("Received new message:", messageData);

      // ONLY add messages from OTHER users (not your own)
  if (messageData.sender_id === 1) {
    console.log("Ignoring own message from socket");
    return; // Don't add your own messages via socket
  }

    // Transform the data
    const newMessage: ChatMessage = {
     id: messageData.id ? messageData.id.toString() : `socket-${Date.now()}`,// or messageData.id if available
      content: messageData.content,
  timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
     isOwn: messageData.sender_id === 1,
      status: 'delivered'
    };
    
    // Add to chat messages
    setChatMessages(prev => [...prev, newMessage]);
  });
  
  setSocket(newSocket);
  return () => { newSocket.close() };
}, []);
  //Exposes all chat functionality to components
  return {
    chatMessages,
    isLoading,
    error,
    sendMessage,
    loadMoreMessages,
    markAsRead,
    socket
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

