
// Backend API service
const API_BASE = 'http://localhost:6969/api/messages';
const API_SETTINGS = `http://localhost:6969/api/settings`;

const API = {
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
  },

  //Get Profile Information 
getProfileInformation: async () => {
  const response = await fetch(`${API_SETTINGS}/profile`, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('session_token')
    }
  });
  if(!response.ok) throw new Error('Failed to fetch profile settings');
  return response.json();
},
  //Update Profile Settings
updateProfileSettings: async (profile: object) => {
  const response = await fetch(`${API_SETTINGS}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('session_token')
    },
    body: JSON.stringify(profile)
  });
  if(!response.ok) throw new Error('Failed to update profile settings') ;
},
//Update Display Settings API
updateDisplaySettings: async (settings: object) => {
  // Add this temporarily to debug
console.log('Token:', localStorage.getItem('session_token'));

  const response = await fetch(`${API_SETTINGS}/display`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('session_token')
    },
    
    body: JSON.stringify(settings)
  });
  if(!response.ok) throw new Error('Failed to update settings');
  return response.json();
},
//Fetch Display Settings APi 
getDisplaySettings: async () => {
  const response = await fetch(`${API_SETTINGS}/display`, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('session_token')
    }
  });
  if(!response.ok) throw new Error('Failed to fetch display settings');
  return response.json();
},
//Update Certifications 
addCertifications: async (settings: object) => {
console.log('Token:', localStorage.getItem('session_token'));

  const response = await fetch(`${API_SETTINGS}/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('session_token')
    },
    
    body: JSON.stringify(settings)
  });
  if(!response.ok) throw new Error('Failed to update settings');
  return response.json();
},
  //Get Certs
getCertifications: async () => {
  const response = await fetch(`${API_SETTINGS}/get-certifications`, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('session_token')
    }
  });
  if(!response.ok) throw new Error('Failed to fetch display settings');
  return response.json();
},
//Update Certification
updateCertifications: async (certId: string,  certPayload: object) => {
  const response = await fetch(`${API_SETTINGS}/update-certifications/${certId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('session_token')
    },
    body: JSON.stringify(certPayload)
  });
  if(!response.ok) throw new Error('Failed to update certification');
  return response.json();
},

deleteCertification: async (certId: number) => {
  const response = await fetch(`${API_SETTINGS}/certifications/${certId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('session_token')
    }
  });
  if(!response.ok) throw new Error('Failed to delete certification');
  return response.json();
},

}


export default API;