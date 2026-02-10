import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import CommunityHeader from './CommunityHeader';
import CommunityActionBar from './CommunityActionBar';
import CommunityTabs from './CommunityTabs';
import CommunitySidebar from './CommunitySidebar';
import API from '../../Service/service';
import { useAuthRedirect } from '../Auth/useAuthRedirect';



const CommunityPage: React.FC = () => {
    const { communityId } = useParams<{ communityId: string }>();
    const navigate = useNavigate();
    const { requireAuth } = useAuthRedirect();
    const [activeTab, setActiveTab] = useState('posts');
    const [isJoined, setIsJoined] = useState(false);
    const [community, setCommunity] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    


    useEffect(() => {
        const fetchCommunity = async () => {
            // SECURITY: Removed console.log statements that exposed community and member data
            if (!communityId) {
                navigate('/communities');
                return;
            }
            try {
                const communityData = await API.getCommunityById(communityId);
                setCommunity(communityData);
              
                setIsJoined(communityData.isOwner || communityData.isMember || false);
                
                // Fetch members after community loads
                try {
                    const membersData = await API.getCommunityMembers(communityId);

                    setMembers(membersData);
                } catch (memberError) {
                    console.warn('Failed to fetch members:', memberError);
                    setMembers([]);
                }
            } catch (error) {
                console.error('Failed to fetch community:', error);
                setCommunity(null);
            } finally {

                setLoading(false);
            }
        };
        
        fetchCommunity();
    }, [communityId, navigate]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading community...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!community) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600">Community not found</p>
                        <button onClick={() => navigate('/communities')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                            Back to Communities
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    const handleJoinCommunity = async () => {
        requireAuth(async () => {
            if (!communityId) return;
            try {
                const currentUser = await API.getCurrentUser();
                if (!currentUser) {
                    console.error('User not authenticated');
                    return;
                }
                const membershipStatus = 
                await API.getCommunityMembership(communityId, currentUser.id);
                if (membershipStatus) {
                    console.log('Already a member');
                        return;
                }
                await API.joinCommunity(communityId);
                setIsJoined(!isJoined);
                const [updatedCommunity, updatedMembers] = await Promise.all([
                    API.getCommunityById(communityId),
                    API.getCommunityMembers(communityId)
                ]);
                setCommunity(updatedCommunity);
                setMembers(updatedMembers);
            } catch (error) {
                console.error('Failed to join community:', error);
            }
        });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    // Transform community data to match expected format
    const transformedCommunity = {
        ...community,
        membersTotal: members.length > 0 ? members.length.toString() : (community.memberCount?.toString() || '1'),
        membersOnline: members.length > 0 ? members.filter(m => m.isOnline).length.toString() : '0',
        category: 'Development',
        image: community.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=400&fit=crop',
        tags: [],
        createdDate: community.createdAt,
        members: members,
        rules: community.rules
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <CommunityHeader community={transformedCommunity} />
                
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <CommunityActionBar 
                                community={transformedCommunity} 
                                isJoined={isJoined} 
                                onJoinToggle={handleJoinCommunity} 
                            />
                            <CommunityTabs 
                                activeTab={activeTab} 
                                onTabChange={setActiveTab}
                                communityId={communityId!}
                            />
                        </div>
                        
                        <CommunitySidebar community={transformedCommunity} />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CommunityPage;