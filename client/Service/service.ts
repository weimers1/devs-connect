// Backend API service
const validateUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        const isLocalHost = ['localhost', '127.0.0.1'].includes(parsed.hostname);
        return (
            (parsed.protocol === 'https:' ||
                (parsed.protocol === 'http:' && isLocalHost)) &&
            !parsed.username &&
            !parsed.password &&
            parsed.pathname === '/' &&
            !parsed.search &&
            !parsed.hash
        );
    } catch {
        return false;
    }
};

const rawBaseUrl = import.meta.env.VITE_API_URL || 
 'http://localhost:6969';
if (!validateUrl(rawBaseUrl)) {
    throw new Error('Invalid API URL configuration');
}

const BASE_URL = rawBaseUrl;
const API_BASE = `${BASE_URL}/api/messages`;
const API_SETTINGS = `${BASE_URL}/api/settings`;
const fetch: typeof globalThis.fetch = (input, init = {}) =>
    globalThis.fetch(input, { ...init, credentials: 'include' });

// Helper function to get auth headers
const getAuthHeaders = (includeContentType = false) => {
    const headers: Record<string, string> = {
        Accept: 'application/json',
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
    submitFeedback: async (feedback: {
        category: string;
        contactEmail: string;
        message: string;
    }) => {
        const response = await fetch(`${BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(feedback),
        });
        if (!response.ok) {
            const result = await response.json().catch(() => null);
            throw new Error(
                typeof result?.error === 'string'
                    ? result.error
                    : 'Failed to send feedback'
            );
        }
        return response.json();
    },
    getVisibilitySettings: async () => {
        const response = await fetch(`${API_SETTINGS}/visibility`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch visibility settings');
        return response.json();
    },
    updateVisibilitySettings: async (settings: {
        profileVisibility?: string;
        connectionsVisibility?: string;
        communitiesVisibility?: string;
    }) => {
        const response = await fetch(`${API_SETTINGS}/visibility`, {
            method: 'PUT',
            headers: getAuthHeaders(true),
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update visibility settings');
        return response.json();
    },
    getBlockedUsers: async () => {
        const response = await fetch(`${BASE_URL}/api/blocks`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch blocked users');
        return response.json();
    },
    blockUser: async (userId: number) => {
        const response = await fetch(`${BASE_URL}/api/blocks/${userId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to block user');
        return response.json();
    },
    unblockUser: async (userId: number) => {
        const response = await fetch(`${BASE_URL}/api/blocks/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to unblock user');
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
    uploadProfileImage: async (file: File) => {
        const formData = new FormData();
        formData.append('profileImage', file);
        const response = await fetch(`${BASE_URL}/api/upload/profile-image`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload profile image');
        return response.json();
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
    getGeneralPreferences: async () => {
        const response = await fetch(`${API_SETTINGS}/general`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch general settings');
        return response.json();
    },
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

    //Show or hide the GitHub account on the profile
    updateGitHubVisibility: async (visible: boolean) => {
        const response = await fetch(`${API_SETTINGS}/github-visibility`, {
            method: 'PUT',
            headers: getAuthHeaders(true),
            body: JSON.stringify({ visible }),
        });
        if (!response.ok) throw new Error('Failed to update GitHub visibility');
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

    //Projects
    getProjects: async (
        params: { mine?: boolean; owner?: string; community?: string; q?: string; status?: string; page?: number } = {}
    ) => {
        const query = new URLSearchParams();
        if (params.mine) query.set('mine', 'true');
        if (params.owner) query.set('owner', params.owner);
        if (params.community) query.set('community', params.community);
        if (params.q) query.set('q', params.q);
        if (params.status) query.set('status', params.status);
        if (params.page) query.set('page', String(params.page));
        const response = await fetch(`${BASE_URL}/api/projects?${query.toString()}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to load projects');
        return response.json();
    },
    saveProject: async (
        project: {
            title: string;
            description: string;
            githubUrl: string;
            demoUrl: string;
            tags: string[];
            status: string;
            collaborators: string[];
            communityId: string | null;
        },
        projectId?: number
    ) => {
        const response = await fetch(
            `${BASE_URL}/api/projects${projectId ? `/${projectId}` : ''}`,
            {
                method: projectId ? 'PUT' : 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify(project),
            }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.error || 'Failed to save project');
        }
        return data;
    },
    getProjectCommunities: async (): Promise<{ id: string; name: string }[]> => {
        const response = await fetch(`${BASE_URL}/api/projects/communities`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to load communities');
        return response.json();
    },
    deleteProject: async (projectId: number) => {
        const response = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete project');
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
    getUserProfileByInternalId: async (userId: string) => {
        const response = await fetch(
            `${BASE_URL}/api/users/internal/${userId}/profile`,
            {
                headers: getAuthHeaders(),
            }
        );
        if (!response.ok) throw new Error('Failed to fetch message recipient profile');
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
        const response = await fetch(`${BASE_URL}/api/communities/user`);
        if (!response.ok) throw new Error('Failed to fetch communities');
        return response.json();
    },
    getCommunityPage: async (options: {
        page: number;
        limit?: number;
        search?: string;
        signal?: AbortSignal;
    }) => {
        const params = new URLSearchParams({
            page: String(options.page),
            limit: String(options.limit ?? 12),
        });
        if (options.search) params.set('search', options.search);
        const response = await fetch(
            `${BASE_URL}/api/communities/user?${params.toString()}`,
            {
                headers: getAuthHeaders(),
                signal: options.signal,
            },
        );
        if (!response.ok) throw new Error(`Failed to fetch communities (${response.status})`);
        const data = await response.json();
        if (!Array.isArray(data.communities) || typeof data.hasMore !== 'boolean') {
            throw new Error('Invalid community page response');
        }
        return data as {
            communities: Array<{
                id: string;
                name: string;
                description?: string;
                memberCount: number;
                image?: string;
                color?: string;
                icon?: string;
                isPrivate: boolean;
            }>;
            hasMore: boolean;
            total: number;
        };
    },

    //Get Community by ID
    getCommunityById: async (id: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/${id}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch community');
       
        return response.json();
      
    },

    //Promomte User In Community
    promoteUser: async(userId: string, communityId: string, currentUserId: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/${userId}/community/${communityId}/promote/from/${currentUserId}`, {
        headers: getAuthHeaders(true),
        method: "PUT"
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
            headers: getAuthHeaders(),
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload community image');
        return response.json();
    },
    uploadProfileBanner: async (file: File) => {
        const formData = new FormData();
        formData.append('profileBanner', file);
        const response = await fetch(`${BASE_URL}/api/upload/profile-banner`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload profile banner');
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
                headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch community posts');
        return response.json();
    },

    createEventPost: async(communityId: string, postData: object) => {
        const response = await fetch (
            `${BASE_URL}/api/communities/${communityId}/event/create`,
            {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify(postData)
            }
        );
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
    },
    //Handle Reivew Submit
    handleReviewSubmit: async(communityId: string, Review: number) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/submit/review/from/${communityId}/${Review}/user`,
            {
                method: 'PUT',
                headers: getAuthHeaders(true),
           }
        );
        if(!response.ok) throw new Error("Failed to handleReviewSubmit");
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

    toggleSavedPost: async (postId: string) => {
        const response = await fetch(
            `${BASE_URL}/api/communities/posts/${postId}/save`,
            {
                method: 'POST',
                headers: getAuthHeaders(true),
            }
        );
        if (!response.ok) throw new Error('Failed to save post');
        return response.json();
    },

    getSavedPosts: async () => {
        const response = await fetch(
            `${BASE_URL}/api/communities/posts/saved`,
            {
                headers: getAuthHeaders(),
            }
        );
        if (!response.ok) throw new Error('Failed to fetch saved posts');
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
    //Get Data from the communities a user is in. 
    getCommunitiesDataFromUser: async (userId : string) => {
        const response = await fetch(`${BASE_URL}/api/communities/${userId}/communities/Data`, {
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
        if(response.status === 403) return {admin : false}
        if(!response.ok) throw new Error('Failed to get community admin status');
        return response.json();
    }, 
    //Kick a member from a community. 
    kickCommunityMember: async (communityId: string, userId: string, currentUserId: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/member/${userId}/community/${communityId}/from/${currentUserId}`, 
            { 
                method: 'DELETE',
                headers: getAuthHeaders(),
            } )

        if(!response.ok) throw new Error('Failed to get kick community Member');
        return response.json();
    },
    //Leave Community
    LeaveCommunity: async(userId: string, communityId: string) => {
        const response = await fetch (`${BASE_URL}/api/communities/leave/communityMember/${userId}/community/${communityId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error("Failed to leave community");
        return response.json();
    },
    isCommunityOwner: async (createdBy: string, id: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/communityOwner/${id}/communities/${createdBy}`, 
            { 
                headers: getAuthHeaders(),
            } )

        if(!response.ok) throw new Error('Failed to get kick community Member');
        return response.json();
    },
    //Demote Community Member
    demoteCommunityMember: async(userId: string, communityId: string, currentUserId: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/demote/${communityId}/member/${userId}/with/${currentUserId}`,{
            headers: getAuthHeaders(),
            method: "PUT" 
        })
        if(!response.ok) throw new Error('Failed to demote user');
    },
    //Ban Member from Community
    banCommunityMember: async(userId: string, communityId: string, currentUserId: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/Ban/${communityId}/member/${userId}/from/${currentUserId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error('Failed to ban user');
        return response.json();
    },
    UnBanCommunityMember: async(userId: string, communityId: string, currentUser: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/Unban/communityMember/${userId}/in/community/${communityId}/from/${currentUser}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error('Failed to unban user');
        return response.json();
    },
    checkBanStatus: async(communityId: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/checkBanStatus/${communityId}/member`, {
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error('Failed to unban user');
        return response.json();
    },
    connectToUser: async(userId: string) => {
        const response = await fetch(`${BASE_URL}/api/connections/connect/${encodeURIComponent(userId)}`,{
            method: "POST",
            headers: getAuthHeaders(),
        })
        const result = await response.json().catch(() => ({}));
        if(!response.ok) {
            throw new Error(
                typeof result?.error === 'string'
                    ? result.error
                    : `Failed to connect (HTTP ${response.status}).`,
            );
        }
        return result;
    },
    getrelevantconnection: async(userId: string, currentUserId: string) => {
         const response = await fetch(`${BASE_URL}/api/connections/obtain/connection/between/${currentUserId}/to/${userId}`,{
            method: "GET",
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error('Failed To Connect to user');
        return response.json();
    },
    disconnecttoUser: async(userId: string, currentUserId: string) => {
        const response = await fetch(`${BASE_URL}/api/connections/remove/connection/between/${currentUserId}/to/${userId}`,{
            method: "DELETE",
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error('Failed To Disconnect from user');
        return response.json();
    },
    getUserConnections: async(currentUserId: string) => {
        const response = await fetch(`${BASE_URL}/api/connections/get/all/connections/from/user/${currentUserId}`,{
            method: "GET",
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error('Failed To Disconnect from user');
        return response.json();
    },
     getOtherUserConnections: async(userId: string) => {
        const response = await fetch(`${BASE_URL}/api/connections/get/all/connections/from/other/user/${userId}`,{
            method: "GET",
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error('Failed TO get Other User connections');
        return response.json();
    },
    getUserSuggestions: async() => {
          const response = await fetch(`${BASE_URL}/api/communities/obtain/sidebar/suggestions`,{
            method: "GET",
            headers: getAuthHeaders(),
        })
        if(!response.ok) throw new Error('Failed To getUser Suggestions');
        return response.json();
    },
    getSidebarCommunityRecommendations: async() => {
        const response = await fetch(`${BASE_URL}/api/communities/obtain/sidebar/community-suggestions`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get community recommendations');
        return response.json();
    },
    
    // Platform-wide search
    searchCommunities: async(query: string) => {
        const response = await fetch(`${BASE_URL}/api/search/communities?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if(!response.ok) throw new Error('Failed to search communities');
        return response.json();
    },
    
    searchUsers: async(query: string) => {
        const response = await fetch(`${BASE_URL}/api/search/users?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if(!response.ok) throw new Error('Failed to search users');
        return response.json();
    },
    getReview: async(communityId: string) => {
        const response = await fetch(`${BASE_URL}/api/communities/obtain/from/${communityId}`,{
            method:"GET",
            headers: getAuthHeaders(),
        });
         if(!response.ok) throw new Error('Failed To Get Review');
        return response.json();
    },
    //ADMIN ROUTE:
    getUserInfo: async(userId: string) => {
      const response = await fetch(`${BASE_URL}/api/users/Obtain/${userId}/Users`,{
            method:"GET",
            headers: getAuthHeaders(),
            //TODO BUILD AN ADMIN AUTH HEADERS
        });
         if(!response.ok) throw new Error('Failed To Get Review');
        return response.json();
    }
}

export default API;