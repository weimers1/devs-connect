// Backend API service
const API_BASE = 'http://localhost:8080/api/messages';

const messageApi = {
  // Get conversations for sidebar
  getConversations: async () => {
    const response = await fetch(`${API_BASE}/conversations`);
    if (!response.ok) throw new Error('Failed to get conversations');
    return response.json();
  },
  
  // Get chat messages between users
  getChatMessages: async (userId: string) => {
    const response = await fetch(`${API_BASE}/conversation/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch chat messages');
    return response.json();
  }
};

export default messageApi;