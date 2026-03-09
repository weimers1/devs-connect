import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import CommunityHeader from './CommunityHeader';
import CommunityActionBar from './CommunityActionBar';
import CommunityTabs from './CommunityTabs';
import CommunitySidebar from './CommunitySidebar';
import API from '../../Service/service';
import { useAuthRedirect } from '../Auth/useAuthRedirect';
import { Icon } from '@iconify/react/dist/iconify.js';

const CommunityPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { requireAuth } = useAuthRedirect();

  const [activeTab, setActiveTab] = useState('posts');
  const [isJoined, setIsJoined] = useState(false);
  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [banStatus, setBanStatus] = useState(false);
  const [seconds, setSeconds] = useState(3);
  const [showMembersCenter, setShowMembersCenter] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    // let intervalId: NodeJS.Timeout;

    if (!communityId) {
      const timeoutId = setTimeout(() => navigate('/communities'), 0);
      return () => clearTimeout(timeoutId);
    }

    const fetchCommunity = async () => {
      try {
        const communityData = await API.getCommunityById(communityId);
        setCommunity(communityData);
        setIsJoined(communityData.isOwner || communityData.isMember || false);

        const membersData = await API.getCommunityMembers(communityId);
        setMembers(membersData);
      } catch (error) {
        console.error('Failed to fetch community:', error);
        setCommunity(null);
      } finally {
        setLoading(false);
      }
    };

const checkBanStatus = async () => {
  try {
    // Call the backend for both guests and logged-in users
    const banStatusRes = await API.checkBanStatus(communityId);

    setBanStatus(banStatusRes.banned);

    if (banStatusRes.banned) {
      // Initialize countdown for banned users
      setSeconds(10);

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            navigate("/communities");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  } catch (error) {
    console.log("Error checking ban status", error);
  }
};
    fetchCommunity();
    checkBanStatus();

  }, []);

   
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
        if (!currentUser) return;

        const membershipStatus = await API.getCommunityMembership(communityId, currentUser.id);
        if (membershipStatus) return;

        await API.joinCommunity(communityId);
        setIsJoined(true);

        const [updatedCommunity, updatedMembers] = await Promise.all([
          API.getCommunityById(communityId),
          API.getCommunityMembers(communityId),
        ]);
        setCommunity(updatedCommunity);
        setMembers(updatedMembers);
      } catch (error) {
        console.error('Failed to join community:', error);
      }
    });
  };

  // Transform community for sidebar
  const transformedCommunity = {
    ...community,
    membersTotal: members.length.toString(),
    membersOnline: members.filter(m => m.isOnline).length.toString(),
    category: 'Development',
    image: community.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=400&fit=crop',
    tags: [],
    createdDate: community.createdAt,
    members: members,
    rules: community.rules,
  };

  return (
    <Layout>
      {banStatus ? (
        <div className="fixed bg-gray/20 backdrop-invert backdrop-opacity-20 inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl mb-12 p-6 md:w-90 mx-4 text-center">
            <Icon icon="streamline-plump-color:sad-face-flat" className="mb-2 mx-auto" width="72" height="72" />
            <h2 className="text-2xl font-bold mb-6">You Are Unable To Perform That Action At This Time</h2>
            <p className="text-2xl font-bold">{seconds > 0 ? `Being Redirected in: ${seconds}s` : "Redirected!"}</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <CommunityHeader community={transformedCommunity} />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CENTER */}
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

             <CommunitySidebar 
            community={transformedCommunity} 
            showMembersCenter={showMembersCenter} 
            setShowMembersCenter={setShowMembersCenter} 
/>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CommunityPage;