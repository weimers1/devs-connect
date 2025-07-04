import { useState, useCallback, useEffect } from 'react';
import Sidebar from '../Connections/Sidebar';
import Layout from '../Layout';
import MessagesContent from './MessagesContent';
import MessageSidebar from './MessageSidebar';
import { useMessages, useChat } from './hooks';
import type { Message } from './types';
import {useSocket} from "./hooks";

const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const  { socket, isConnected } = useSocket(); //Importing This socket hook from hooks 
  
//Base Effect Method added (relying on the hook in the hooks which establishes a connection from client to server)
  useEffect(() => {
    if(socket) {
      console.log(" Socket Connected"); 
      socket.emit("test-connection", "Hello friends");
    
      socket.on("test-response", (data) => {
        console.log("Server Responded:", data);
      });
    }
  }, [socket]);
 //This is building off of the previously established connection in the hooks and allowing us to put it to use with sending messages


  // Use custom hooks for state management
  const { messages, isLoading, error, searchMessages } = useMessages();
  const { chatMessages, sendMessage } = useChat(selectedMessage?.id || null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileView(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMessageSelect = useCallback((message: Message) => {
    setSelectedMessage(message);
    if (window.innerWidth < 768) {
      setIsMobileView(true);
    }
  }, []);

  const handleBackToList = useCallback(() => {
    setIsMobileView(false);
    if (window.innerWidth < 768) {
      setSelectedMessage(null);
    }
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    await sendMessage(content);
  }, [sendMessage]);

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-2">Error loading messages</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-screen bg-gray-50 messages-container">
        <MessageSidebar 
          onMessageSelect={handleMessageSelect}
          selectedMessage={selectedMessage}
          messages={messages}
          isLoading={isLoading}
          onSearch={searchMessages}
          className={`${isMobileView ? 'hidden md:flex' : 'flex'}`}
        />
        <MessagesContent 
          selectedMessage={selectedMessage}
          onBackToList={handleBackToList}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          className={`${!isMobileView ? 'hidden md:flex' : 'flex'} md:flex`}
        />
        <div className="hidden lg:flex">
        <Sidebar  />
      </div>
      </div>
    </Layout>
  );
};

export default Messages;
