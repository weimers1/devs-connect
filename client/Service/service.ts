// Backend API service
const validateUrl = (url: string): boolean => {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url);
};

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:6969';
if (!validateUrl(rawBaseUrl)) {
  throw new Error('Invalid API URL configuration');
}

const BASE_URL = rawBaseUrl;
const API_BASE = `${BASE_URL}/api/messages`;
const API_SETTINGS = `${BASE_URL}/api/settings`;

// Helper function to get auth headers
const getAuthHeaders = (includeContentType = false) => {
  const token = localStorage.getItem('session_token');
  if (!token) throw new Error('No authentication token found');
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  };
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

const API = {
  // Get conversations for sidebar
  getConversations: async () => {
    const response = await fetch(`${API_BASE}/conversations`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get conversations');
    return response.json();
  },
  // Get chat messages between users
  getChatMessages: async (userId: string) => {
    const response = await fetch(`${API_BASE}/conversation/${userId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch chat messages');
    return response.json();
  },

  //Get Profile Information 
getProfileInformation: async () => {
  const response = await fetch(`${API_SETTINGS}/profile`, {
    headers: getAuthHeaders()
  });
  if(!response.ok) throw new Error('Failed to fetch profile settings');
  return response.json();
},
  //Update Profile Settings
updateProfileSettings: async (profile: object) => {
  const response = await fetch(`${API_SETTINGS}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(profile)
  });
  if(!response.ok) throw new Error('Failed to update profile settings') ;
},
//Update Display Settings API
updateDisplaySettings: async (settings: object) => {
  const response = await fetch(`${API_SETTINGS}/display`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(settings)
  });
  if(!response.ok) throw new Error('Failed to update settings');
  return response.json();
},
//Fetch Display Settings APi 
getDisplaySettings: async () => {
  const response = await fetch(`${API_SETTINGS}/display`, {
    headers: getAuthHeaders()
  });
  if(!response.ok) throw new Error('Failed to fetch display settings');
  return response.json();
},
//Update Certifications 
addCertifications: async (settings: object) => {
  const response = await fetch(`${API_SETTINGS}/certifications`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(settings)
  });
  if(!response.ok) throw new Error('Failed to update settings');
  return response.json();
},
  //Get Certs
getCertifications: async () => {
  const response = await fetch(`${API_SETTINGS}/get-certifications`, {
    headers: getAuthHeaders()
  });
  if(!response.ok) throw new Error('Failed to fetch display settings');
  return response.json();
},
//Update Certification
updateCertifications: async (certId: string,  certPayload: object) => {
  const response = await fetch(`${API_SETTINGS}/update-certifications/${certId}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(certPayload)
  });
  if(!response.ok) throw new Error('Failed to update certification');
  return response.json();
},

deleteCertification: async (certId: number) => {
  const response = await fetch(`${API_SETTINGS}/certifications/${certId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if(!response.ok) throw new Error('Failed to delete certification');
  return response.json();
},

}


export default API;