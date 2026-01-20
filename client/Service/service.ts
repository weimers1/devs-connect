// Backend API service
const validateUrl = (url: string): boolean => {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url);
};

const rawBaseUrl = import.meta.env.VITE_API_URL || 
 'http://localhost:6969';
if (!validateUrl(rawBaseUrl)) {
    throw new Error('Invalid API URL configuration');
}

const BASE_URL = rawBaseUrl;
const API_BASE = `${BASE_URL}/api/messages`;
const API_SETTINGS = `${BASE_URL}/api/settings`;

// Helper function to get auth headers
const getAuthHeaders = (includeContentType = false, requireAuth = true) => {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const token = localStorage.getItem('session_token');
    if (requireAuth) {
        if (!token) throw new Error('No authentication token found');
        headers['Authorization'] = `Bearer ${token}`;
    } else if (token) {
        // Include token if available, but don't require it
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

const API = {
    // Get conversations for sidebar
    getConversations: async () => {
        const response = await fetch(`${API_BASE}/conversations`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get conversations');
        return response.json();
    },
    // Get chat messages between users
    getChatMessages: async (userId: string) => {
        const response = await fetch(`${API_BASE}/conversation/${userId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch chat messages');
        return response.json();
    },

    //Get Profile Information
    getProfileInformation: async () => {
        const response = await fetch(`${API_SETTINGS}/profile`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch profile settings');
        return response.json();
    },
    //Update Profile Settings
    updateProfileSettings: async (profile: object) => {
        const response = await fetch(`${API_SETTINGS}/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(true),
            body: JSON.stringify(profile),
        });
        if (!response.ok) throw new Error('Failed to update profile settings');
    },
    //Update Display Settings API
    // updateDisplaySettings: async (settings: object) => {
    //     const response = await fetch(`${API_SETTINGS}/display`, {
    //         method: 'PUT',
    //         headers: getAuthHeaders(true),
    //         body: JSON.stringify(settings),
    //     });
    //     if (!response.ok) throw new Error('Failed to update settings');
    //     return response.json();
    // },
    //General Preferences 
    updateGeneralPreferences: async (settings: object) =>  {
            const response = await fetch(`${API_SETTINGS}/general`, {
                method: 'PUT', 
                headers: getAuthHeaders(true),
                body: JSON.stringify(settings),
            });
            if(!response.ok) throw new Error('Failed to update general Settings'); 
               
    },
    //Fetch Display Settings API
    getDisplaySettings: async () => {
        const response = await fetch(`${API_SETTINGS}/display`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch display settings');
        return response.json();
    },
    //Update Certifications
    addCertifications: async (settings: object) => {
        const response = await fetch(`${API_SETTINGS}/certifications`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return response.json();
    },
    //Get Certs
    getCertifications: async () => {
        const response = await fetch(`${API_SETTINGS}/get-certifications`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch display settings');
        return response.json();
    },
    //Update Certification
    // updateCertifications: async (certId: string, certPayload: object) => {
    //     const response = await fetch(
    //         `${API_SETTINGS}/update-certifications/${certId}`,
    //         {
    //             method: 'PUT',
    //             headers: getAuthHeaders(true),
    //             body: JSON.stringify(certPayload),
    //         }
    //     );
    //     if (!response.ok) throw new Error('Failed to update certification');
    //     return response.json();
    // },

    // deleteCertification: async (certId: number) => {
    //     const response = await fetch(
    //         `${API_SETTINGS}/certifications/${certId}`,
    //         {
    //             method: 'DELETE',
    //             headers: getAuthHeaders(),
    //         }
    //     );
    //     if (!response.ok) throw new Error('Failed to delete certification');
    //     return response.json();
    // },

    //Get GitHub Connection Status
    getGitHubConnection: async () => {
        const response = await fetch(`${API_SETTINGS}/github`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch GitHub connection');
        return response.json();
    },

    //Get GitHub Username
    getGitHubInfo: async () => {
        const response = await fetch(`${API_SETTINGS}/github-info`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch GitHub username');
        return response.json();
    },

    //Get User Profile by ID
    getUserProfile: async (userId: string) => {
        const response = await fetch(
            `${BASE_URL}/api/users/${userId}/profile`,
            {
                headers: getAuthHeaders(),
            }
        );
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
    },

    //Create Community
    createCommunity: async (communityData: object) => {
        const response = await fetch(`${BASE_URL}/api/communities/create`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(communityData),
        });
        if (!response.ok) throw new Error('Failed to create community');
        return response.json();
    },

    //Get Communities
    getCommunities: async () => {
        const response = await fetch(`${BASE_URL}/api/communities`);
        if (!response.ok) throw new Error('Failed to fetch communities');
        return response.json();
    },

    //Get Community by ID
    getCommunityById: async (id: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/${id}`, {
            headers: getAuthHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to fetch community');
        return response.json();
    },

    //Upload Community Image
    uploadCommunityImage: async (file: File) => {
        const formData = new FormData();
        formData.append('communityImage', file);
        const response = await fetch(`${BASE_URL}/api/upload/community-image`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload community image');
        return response.json();
    },

    //Update Community
    updateCommunity: async (id: string, communityData: object) => {
        const response = await fetch(`${BASE_URL}/api/communities/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(true),
            body: JSON.stringify(communityData),
        });
        if (!response.ok) throw new Error('Failed to update community');
        return response.json();
    },

    //Get Community Members
    getCommunityMembers: async (id: string) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/${id}/members`,
            {
                headers: getAuthHeaders(false, false),
            }
        );
        if (!response.ok) throw new Error('Failed to fetch community members');
        return response.json();
    },

    //Get Community Posts
    getCommunityPosts: async (id: string, type?: string) => {
        const url = type
            ? `${BASE_URL}/api/communities/${id}/posts?type=${type}`
            : `${BASE_URL}/api/communities/${id}/posts`;
        const response = await fetch(url, {
            headers: getAuthHeaders(false, false),
        });
        if (!response.ok) throw new Error('Failed to fetch community posts');
        return response.json();
    },

    //Create Community Post
    createCommunityPost: async (communityId: string, postData: object) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/${communityId}/posts`,
            {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify(postData),
            }
        );
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
    },

    //Join Community
    joinCommunity: async (communityId: string) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/${communityId}/join`,
            {
                method: 'POST',
                headers: getAuthHeaders(true),
            }
        );
        if (!response.ok) throw new Error('Failed to join community');
        return response.json();
    },

    //Like Post
    likePost: async (postId: string) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/posts/${postId}/like`,
            {
                method: 'POST',
                headers: getAuthHeaders(true),
            }
        );
        if (!response.ok) throw new Error('Failed to like post');
        return response.json();
    },

    //Comment on Post
    commentOnPost: async (postId: string, content: string) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/posts/${postId}/comment`,
            {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ content }),
            }
        );
        if (!response.ok) throw new Error('Failed to comment on post');
        return response.json();
    },

    //Get Post Comments
    getPostComments: async (postId: string) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/posts/${postId}/comments`,
            {
                headers: getAuthHeaders(),
            }
        );
        if (!response.ok) throw new Error('Failed to get comments');
        return response.json();
    },

    //Express Interest
    expressInterest: async (postId: string) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/posts/${postId}/interest`,
            {
                method: 'POST',
                headers: getAuthHeaders(true),
            }
        );
        if (!response.ok) throw new Error('Failed to express interest');
        return response.json();
    },

    //Delete Post
    deletePost: async (postId: string) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/posts/${postId}`,
            {
                method: 'DELETE',
                headers: getAuthHeaders(),
            }
        );
        if (!response.ok) throw new Error('Failed to delete post');
        return response.json();
    },

    //Get Current User
    getCurrentUser: async () => {
        const response = await fetch(`${BASE_URL}/api/users/me`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get current user');
        return response.json();
    },
    //Get CommunityMembership
     getCommunityMembership: async (communityId: string, userId: string ) => {
        const response = await fetch(`${BASE_URL}/api/communities/${communityId}/membership/${userId}`, {
             headers: getAuthHeaders(),
         });
         if (!response.ok) throw new Error('Failed to get community membership');
         return response.json();
        },
 //Get all communities a user is in
    getCommunitiesByUser: async( userId: string) => {
            const response = await fetch(`${BASE_URL}/api/communities/${userId}/communities`, {
                    headers: getAuthHeaders(),
            });
            if (!response.ok) throw new Error('Failed to get user communities');
            return response.json();
            },
    //Get Like Status from a user
    getLikeStatus: async (postId: number, userId: string) => {
            const response = await fetch(
                `${BASE_URL}/api/communities/posts/${postId}/likes/${userId}`,
                {
                    headers: getAuthHeaders(),
                }
            );
            if (!response.ok) throw new Error('Failed to get like status');
            return response.json();
    },
       //Get Total Post like on a user Post
    getLikes: async (postId: number) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/posts/${postId}/likes`,
             { headers: getAuthHeaders(),
                }
        )
        if(!response.ok) throw new Error('Failed to get likes');
        return response.json();
    },
    //Returns if a user has the role 'Owner' Atttached to it
    getCommunityAdmins: async (communityId: string, userId: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/${communityId}/communityAdmin/${userId}`, 
            {
                headers: getAuthHeaders(),
            }
        ) 
        if(!response.ok) throw new Error('Failed to get community admin status');
        return response.json();
    }, 
    //Kick a member from a community. 
    kickCommunityMember: async (communityId: string, userId: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/member/${userId}/community/${communityId}`, 
            { 
                method: 'DELETE',
                headers: getAuthHeaders(),
            } )

        if(!response.ok) throw new Error('Failed to get kick community Member');
        return response.json();
    },
}

export default API;
