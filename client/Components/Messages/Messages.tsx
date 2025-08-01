import { useState, useCallback, useEffect } from 'react';
import Sidebar from '../Connections/Sidebar';
import Layout from '../Layout';
import MessagesContent from './MessagesContent';
import MessageSidebar from './MessageSidebar';
import { useMessages, useChat, useSocket } from './hooks';
import type { Message } from './types';


const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
      // Use custom hooks for state management
   const { messages, isLoading, error, searchMessages } = useMessages();
      // Extract other user ID from conversation ID (e.g., "1-2" -> "2")
    const selectedUserId = selectedMessage?.id ? 
    selectedMessage.id.split('-').find(id => id !== '1') || null : null;
     const { chatMessages, isLoading: chatLoading, sendMessage, socket } = useChat(selectedUserId);
   //This is building off of the previously established connection in the hooks and allowing us to put it to use with sending messages

  // Debug logging
  console.log('Selected message:', selectedMessage);
  console.log('Selected user ID:', selectedUserId);
  
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

  
  console.log('Chat messages:', chatMessages);

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
    
    if(socket) {
      console.log("EMITTING JOIN-CHAT:", message.id); 
      socket.emit("user-login", {id: message.id}) //Event to Join A chat with the message ID (Case Sensitive must match the backend)
    } else {
    console.log("NO SOCKET AVAILABLE"); //Console Log of not joining 
  }
    if (window.innerWidth < 768) {
      setIsMobileView(true);
    

    }
  }, [socket]);

   
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
        <div className="flex items-center justify-center h-screen mt-4  md:rounded-xl  bg-gray-50">
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
     <div className="flex h-screen   bg-gray-50 messages-container 
                  md:mt-4 md:rounded-xl 
                  -mx-3 md:my-0
                  absolute md:relative inset-3 top-17 md:top-auto w-full md:w-3/4 lg:w-2/3 xl:w-3/5">
        <MessageSidebar 
          onMessageSelect={handleMessageSelect}
          selectedMessage={selectedMessage}
          onSearch={searchMessages}
          className={`${isMobileView ? 'hidden md:flex' : `flex`}`}

        />
        <MessagesContent 
          selectedMessage={selectedMessage}
          onBackToList={handleBackToList}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          
          className={`${!isMobileView ? 'hidden md:flex' : 'flex'} md:flex`
        }
        />
        <div className="hidden lg:flex">
        <Sidebar  />
      </div>
      </div>
    </Layout>
  );
};

export default Messages;
