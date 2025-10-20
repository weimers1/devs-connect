import { Socket } from "socket.io-client";

// Type definitions for Messages components
export interface Message {
  id: string;
  name: string;
  date: string;
  avatar: string;
  lastMessage: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type?: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
  };
}

export interface MessageSidebarProps {
  onMessageSelect: (message: Message) => void;
  selectedMessage: Message | null;
  className?: string;
  messages?: Message[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
 
}

export interface MessagesContentProps {
  selectedMessage: Message | null;
  onBackToList: () => void;
  className?: string;
  messages?: ChatMessage[];
  onSendMessage?: (content: string) => Promise<void>;
  isTyping?: boolean;
}

export interface MessagesState {
  selectedMessage: Message | null;
  isMobileView: boolean;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface MessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Event types
export type MessageEvent = 
  | { type: 'MESSAGE_RECEIVED'; payload: ChatMessage }
  | { type: 'MESSAGE_SENT'; payload: ChatMessage }
  | { type: 'USER_TYPING'; payload: { userId: string; isTyping: boolean } }
  | { type: 'USER_ONLINE'; payload: { userId: string; isOnline: boolean } };

// Hook return types
export interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  searchMessages: (query: string) => void;
  refreshMessages: () => Promise<void>;
}

// TYPE FIX: Added fetchChatMessages to interface for TypeScript compatibility
export interface UseChatReturn {
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  fetchChatMessages: (userId: string) => Promise<void>;
  socket: Socket | null;
}