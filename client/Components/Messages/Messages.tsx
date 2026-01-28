import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MessagesContent from './MessagesContent';
import MessageSidebar from './MessageSidebar';
import { useMessages, useChat } from './hooks';
import API from '../../Service/service';
import type { Message } from './types';
import React from 'react';
import Layout from '../Layout';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get('user');
    const [currentUserId, setCurrentUserId] = useState<string>();

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(
        null
    );
    // Get current user ID
    useEffect(() => {
        const getCurrentUserId = async () => {
            try {
                const user = await API.getCurrentUser();
         
                setCurrentUserId(user.userId);
            } catch (error) {
                console.error('Failed to get current user:', error);
            }
        };
        getCurrentUserId();
    }, []);

    // Use custom hooks for state management
    const { messages, error, searchMessages } = useMessages();

    // Auto-select conversation if coming from profile
    useEffect(() => {
        if (targetUserId) {
            const existingConversation = messages.find((msg) =>
                msg.id.includes(targetUserId)
            );
            if (existingConversation) {
                setSelectedMessage(existingConversation);
            } else {
                // Create new conversation immediately
                const createNewConversation = async () => {
                    try {
                        const userProfile = await API.getUserProfile(
                            targetUserId
                        );
                        const newConversation: Message = {
                            id: `${currentUserId}-${targetUserId}`,
                            name: `${userProfile.firstName} ${userProfile.lastName}`,
                            lastMessage: 'Start a conversation...',
                            timestamp: new Date().toISOString(),
                            avatar:
                                userProfile.pfp ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    userProfile.firstName +
                                        ' ' +
                                        userProfile.lastName
                                )}&background=random`,
                        };
                        setSelectedMessage(newConversation);
                    } catch (error) {
                        console.error('Failed to create conversation:', error);
                        const fallbackConversation: Message = {
                            id: `${currentUserId}-${targetUserId}`,
                            name: 'New Conversation',
                            lastMessage: 'Start a conversation...',
                            timestamp: new Date().toISOString(),
                            avatar: `https://ui-avatars.com/api/?name=User&background=random`,
                        };
                        setSelectedMessage(fallbackConversation);
                    }
                };
                createNewConversation();
            }
        }
    }, [targetUserId, messages, currentUserId]);
    // Extract other user ID from conversation ID (e.g., "1-2" -> "2")
  const selectedUserId = selectedMessage?.id
  ? selectedMessage.id
      .split('-')
      .map(String)
      .find((id) => id !== String(currentUserId)) ?? null
  : null;
    // BUG FIX: Added fetchChatMessages to load actual chat messages when conversation selected
    const { chatMessages, sendMessage, fetchChatMessages, socket } =
        useChat(selectedUserId);

    // Remove debug logging for production

    //Base Effect Method added (relying on the hook in the hooks which establishes a connection from client to server)
    useEffect(() => {
        if (socket) {
            try {
                socket.emit('test-connection', 'Hello friends');
                socket.on('test-response', () => {
                    // Connection confirmed
                });
                return () => {
                    socket.off('test-response');
                };
            } catch (error) {
                console.error('Socket connection error');
            }
        }
    }, [socket]);

    // Handle responsive behavior

    const handleMessageSelect = useCallback(
        (message: Message) => {
            setSelectedMessage(message);

            // BUG FIX: Actually fetch chat messages when conversation is selected
            // This was missing, causing empty chat windows
            const otherUserId = message.id
                .split('-')
                .find((id) => id !== currentUserId);
            if (otherUserId && fetchChatMessages) {
                fetchChatMessages(otherUserId);
            }

            if (socket) {
                try {
                    socket.emit('user-login', { userId: currentUserId });
                } catch (error) {
                    console.error('Failed to join chat');
                }
            }
            // Mobile view is now handled by CSS classes
        },
        [socket, currentUserId, fetchChatMessages]
    );

    const handleBackToList = useCallback(() => {
        setSelectedMessage(null);
    }, []);

    const handleSendMessage = useCallback(
        async (content: string) => {
            try {
                await sendMessage(content);
            } catch (err) {
                console.error('Failed to send message:', err);
            }
        },
        [sendMessage]
    );

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen mt-3  md:rounded-xl  bg-gray-50">
                    <div className="text-center">
                        <div className="text-red-500 text-lg font-medium mb-2">
                            Error loading messages
                        </div>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto p-4">
                {/* UI FIX: Improved mobile responsiveness with proper sidebar/chat switching */}
                <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-5rem)] flex overflow-hidden">
                    <MessageSidebar
                        onMessageSelect={handleMessageSelect}
                        selectedMessage={selectedMessage}
                        onSearch={searchMessages}
                        className={`${
                            selectedMessage ? 'hidden md:flex' : 'flex'
                        } border-r border-gray-200`}
                    />
                    <MessagesContent
                        selectedMessage={selectedMessage}
                        onBackToList={handleBackToList}
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        className={`${
                            selectedMessage ? 'flex' : 'hidden md:flex'
                        } flex-1`}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Messages;
