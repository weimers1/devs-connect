import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import type { MessageSidebarProps, Message } from './types';

import { useMessages } from './hooks';
import { useNavigate } from 'react-router-dom';


const MessageSidebar: React.FC<MessageSidebarProps> = ({
    onMessageSelect,
    selectedMessage,
    onSearch,
    className = '',
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    // Use the proper hook that returns Message types
    const { messages, isLoading, error, searchMessages } = useMessages();
    //When a user types this function runs, showed typed text in input, calls hooks search function
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const query = e.target.value;
            setSearchQuery(query);
            searchMessages(query);
            onSearch?.(query);
        },
        [searchMessages, onSearch]
    );
    //When a user clicks a conversation this function runs
    const handleMessageClick = useCallback(
        (message: Message) => {
            onMessageSelect(message);
            navigate(`/messages?user=${message.id[2]}`);
        },
        [onMessageSelect]
    );
    //Converts ISO data string to readable content || Implement Later
    // const formatDate = useCallback((dateStr: string) => {
    //     //CallBack has better performance, prevents unnecesary re-renders
    //     return new Date(dateStr).toLocaleDateString();
    // }, []);

    return (
        <aside className={`w-full md:w-80 flex flex-col bg-gray-50 ${className}`}>
            {/* UI CLEANUP: Simplified header, removed unnecessary compose button */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-semibold text-gray-900">
                        Messages
                    </h1>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon
                            icon="mdi:magnify"
                            className="w-4 h-4 text-gray-400"
                        />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search messages..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Icon
                            icon="mdi:message-outline"
                            className="w-12 h-12 text-gray-300 mb-3"
                        />
                        <p className="text-gray-500 text-sm">
                            No conversations yet
                        </p>
                    </div>
                ) : (
                    <div>
                        {messages.map((message) => (
                            <button
                                key={message.id}
                                onClick={() => handleMessageClick(message)}
                                className={`w-full p-3 text-left hover:bg-white transition-colors focus:outline-none ${
                                    selectedMessage?.id === message.id
                                        ? 'bg-blue-50 border-r-3 border-blue-500'
                                        : 'hover:bg-white'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={message.avatar}
                                            alt={message.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        {message.isOnline && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {message.name}
                                            </h3>
                                            {message.unreadCount && message.unreadCount > 0 && (
                                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                                                    {message.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-1">
                                            {message.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default MessageSidebar;
