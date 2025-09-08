import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import type { MessagesContentProps, ChatMessage } from './types';
//
const MessagesContent: React.FC<MessagesContentProps> = ({ 
  selectedMessage, //current conversation data 
  onBackToList, // Function to return to sidebar (mobile)
  messages = [], // Array of chat messages
  onSendMessage, // Function to send new messages (calls parent's sendmessage)
  isTyping = false, //Indicator when other person is typing | unsure if this works since we only have 1 test acc
  className = '' 
}) => {
  const [newMessage, setNewMessage] = useState(''); //Stores the text user is currently typing 
  const messagesEndRef = useRef<HTMLDivElement>(null); //Reference to invisible div at bottom of messages | Autoscroll to show newest messages
  const inputRef = useRef<HTMLTextAreaElement>(null); //Reference to the message input textarea | Purpose: to focus management and potential future features
  //Automatically scrolls to newest message when new messages arrive | user will always see latest message without having to scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: `auto` });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
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

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  //Converts timestamp to regular time format
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  if (!selectedMessage) {
    return (
      <div className={`flex-1 flex items-center justify-center rounded-r-xl overflow-hidden  bg-gray-100 ${className}`}>
        <div className="text-center">
          <Icon icon="mdi:message-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a message from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1   flex flex-col rounded-r-xl overflow-hidden  ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToList}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to messages"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <img 
              src={selectedMessage.avatar} 
              alt={selectedMessage.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {selectedMessage.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{selectedMessage.name}</h2>
            <p className="text-sm text-gray-500">
              {selectedMessage.isOnline ? 'Active now' : 'Last seen recently'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Icon icon="mdi:phone" className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Icon icon="mdi:video" className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide  ">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
              message.isOwn 
                ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md' 
                : 'bg-gray-100 text-gray-900 rounded-r-2xl rounded-tl-2xl rounded-bl-md'
            } px-4 py-2 shadow-sm`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className={`flex items-center justify-end mt-1 space-x-1 ${
                message.isOwn ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span className="text-xs">{formatTime(message.timestamp)}</span>
                {message.isOwn && (
                  <Icon 
                    icon={message.status === 'read' ? 'mdi:check-all' : 'mdi:check'} 
                    className={`w-3 h-3 ${
                      message.status === 'read' ? 'text-blue-200' : 'text-blue-300'
                    }`} 
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
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon icon="mdi:attachment" className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm leading-relaxed"
              style={{ minHeight: '44px', maxHeight: '120spx' }}
            />
          </div>
          
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-all ${
              newMessage.trim() 
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Icon icon="mdi:send" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesContent;
