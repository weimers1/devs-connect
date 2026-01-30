import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import type { MessagesContentProps } from './types';
//
const MessagesContent: React.FC<MessagesContentProps> = ({
    selectedMessage, //current conversation data
    onBackToList, // Function to return to sidebar (mobile)
    messages = [], // Array of chat messages
    onSendMessage, // Function to send new messages (calls parent's sendmessage)
    isTyping = false, //Indicator when other person is typing | unsure if this works since we only have 1 test acc
    className = '',
}) => {
    const [newMessage, setNewMessage] = useState(''); //Stores the text user is currently typing
    const messagesEndRef = useRef<HTMLDivElement>(null); //Reference to invisible div at bottom of messages | Autoscroll to show newest messages
    const inputRef = useRef<HTMLTextAreaElement>(null); //Reference to the message input textarea | Purpose: to focus management and potential future features
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView  ({ behavior: 'smooth' });
    }, []);


    // UX FIX: Prevent auto-scroll when clicking on conversations
    // Only scroll when new messages are added, not when loading existing messages
    const prevMessagesLength = useRef(0);
    const isInitialLoad = useRef(true);
    console.log(messages);
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            prevMessagesLength.current = messages.length;
            return;
        }

        if (messages.length > prevMessagesLength.current) {
            scrollToBottom();
        }
        prevMessagesLength.current = messages.length;
    }, [messages, scrollToBottom]);

    // Reset initial load flag when conversation changes
    useEffect(() => {
        isInitialLoad.current = true;
    }, [selectedMessage?.id]);
    //Handles sending new messages  | User types -> presses send -> clears input -> calls API
    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim() || !selectedMessage || !onSendMessage) return;

        const content = newMessage.trim();
        setNewMessage('');

        try {
            await onSendMessage(content);
        } catch (error) {
            console.error('Failed to send message:', error);
            // In production, show user-friendly error message
        }
    }, [newMessage, selectedMessage, onSendMessage]);

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        },
        [handleSendMessage]
    );
    //Converts timestamp to regular time format
    const formatTime = useCallback((date: Date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);
    
    if (!selectedMessage) {
        return (
            <div
                className={`flex-1 flex items-center justify-center bg-gray-50 ${className}`}
            >
                <div className="text-center">
                    <Icon
                        icon="mdi:message-outline"
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a conversation
                    </h3>
                    <p className="text-gray-500">
                        Choose a message from the sidebar to start chatting
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col bg-white ${className}`}>
            {/* UI CLEANUP: Simplified header, removed unnecessary call/video buttons */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onBackToList}
                        className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Back to messages"
                    >
                        <Icon
                            icon="mdi:arrow-left"
                            className="w-5 h-5"
                        />
                    </button>

                    <div className="relative">
                        <img
                            src={selectedMessage.avatar}
                            alt={selectedMessage.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        {selectedMessage.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-base font-semibold text-gray-900">
                            {selectedMessage.name}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {selectedMessage.isOnline
                                ? 'Active now'
                                : 'Last seen recently'}
                        </p>
                    </div>
                </div>
            </div>

            {/* UI CLEANUP: Improved message bubble styling and spacing */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${
                            message.isOwn ? 'justify-end' : 'justify-start'
                        }`}
                    >
            
                        <div
                            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                                message.isOwn
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <div
                                className={`flex items-center justify-end mt-1 space-x-1 ${
                                    message.isOwn
                                        ? 'text-blue-100'
                                        : 'text-gray-500'
                                }`}
                            >
                                <span className="text-xs">
                                    {formatTime(message.timestamp)}
                                </span>
                                {message.isOwn && (
                                    <Icon
                                        icon={
                                            message.status === 'read'
                                                ? 'mdi:check-all'
                                                : 'mdi:check'
                                        }
                                        className="w-3 h-3"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                   
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-r-2xl rounded-tl-2xl rounded-bl-md px-4 py-2">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.1s' }}
                                ></div>
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.2s' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* UI CLEANUP: Simplified input area, removed attachment button  Made it simpler for user interaction*/}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="flex-1">
                        <textarea
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        data-testid="send-button"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className={`p-2 rounded-full transition-all ${
                            newMessage.trim()
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Icon
                            icon="mdi:send"
                            className="w-4 h-4"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessagesContent;
