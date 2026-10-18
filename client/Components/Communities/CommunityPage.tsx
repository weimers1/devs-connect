import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import CommunityHeader from './CommunityHeader';
import CommunityActionBar from './CommunityActionBar';
import CommunityTabs from './CommunityTabs';
import CommunitySidebar from './CommunitySidebar';
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { Icon } from '@iconify/react/dist/iconify.js';

interface CommunityRecord {
    id: string | number;
    name: string;
    description?: string | null;
    createdAt?: string;
    image?: string | null;
    icon?: string | null;
    color?: string | null;
    isPrivate?: boolean;
    isOwner?: boolean;
    isMember?: boolean;
    rules?: string | null;
}

interface CommunityMemberRecord {
    id: string;
    publicId: string;
    role: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    isOnline?: boolean;
}

const CommunityPage: React.FC = () => {
    const { communityId } = useParams<{ communityId: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('posts');
    const [isJoined, setIsJoined] = useState(false);
    const [community, setCommunity] = useState<CommunityRecord | null>(null);
    const [members, setMembers] = useState<CommunityMemberRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [banStatus, setBanStatus] = useState(false);
    const [seconds, setSeconds] = useState(3);
    const [showMembersCenter, setShowMembersCenter] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        let isActive = true;
        setLoading(true);

        if (!communityId) {
            const timeoutId = setTimeout(() => navigate('/communities'), 0);
            return () => {
                isActive = false;
                clearTimeout(timeoutId);
            };
        }

        const fetchCommunity = async () => {
            try {
                const [communityData, membersData] = await Promise.all([
                    API.getCommunityById(communityId),
                    API.getCommunityMembers(communityId),
                ]);
                if (!isActive) return;
                setCommunity(communityData);
                setIsJoined(
                    communityData.isOwner || communityData.isMember || false,
                );
                setMembers(membersData);
            } catch (error) {
                if (!isActive) return;
                console.error('Failed to fetch community:', error);
                setCommunity(null);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        const checkBanStatus = async () => {
            try {
                // Call the backend for both guests and logged-in users
                const banStatusRes = await API.checkBanStatus(communityId);
                if (!isActive) return;

                setBanStatus(banStatusRes.banned);

                if (banStatusRes.banned) {
                    // Initialize countdown for banned users
                    setSeconds(10);

                    if (intervalRef.current) clearInterval(intervalRef.current);

                    intervalRef.current = setInterval(() => {
                        setSeconds((prev) => {
                            if (prev <= 1) {
                                clearInterval(intervalRef.current!);
                                navigate('/communities');
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }
            } catch (error) {
                if (isActive) console.error('Error checking ban status', error);
            }
        };
        fetchCommunity();
        checkBanStatus();

        return () => {
            isActive = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [communityId, navigate]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">{t('communities.page.loading')}</p>
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
                        <p className="text-red-600">{t('communities.page.notFound')}</p>
                        <button
                            onClick={() => navigate('/communities')}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            {t('communities.page.backToCommunities')}
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    const handleJoinCommunity = async () => {
        if (!communityId) throw new Error(t('communities.page.errorNoCommunity'));
        const currentUser = await API.getCurrentUser();
        if (!currentUser?.userId) throw new Error(t('communities.page.errorSignIn'));

        const nextMembershipStatus = !isJoined;
        if (nextMembershipStatus) {
            await API.joinCommunity(communityId);
        } else {
            await API.LeaveCommunity(String(currentUser.userId), communityId);
        }

        const [updatedCommunity, updatedMembers] = await Promise.all([
            API.getCommunityById(communityId),
            API.getCommunityMembers(communityId),
        ]);
        setCommunity(updatedCommunity);
        setMembers(updatedMembers);
        setIsJoined(nextMembershipStatus);
    };

    // Transform community for sidebar
    const transformedCommunity = {
        ...community,
        id: String(community.id),
        membersTotal: members.length.toString(),
        membersOnline: members.filter((m) => m.isOnline).length.toString(),
        category: t('communities.page.categoryDevelopment'),
        image:
            community.image ||
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=400&fit=crop',
        color: community.color || 'bg-gradient-to-r from-blue-500 to-indigo-600',
        icon: community.icon || 'mdi:account-group',
        tags: [],
        createdDate: community.createdAt,
        members: members,
        description: community.description || '',
        rules: community.rules || t('communities.page.noRules'),
    };

    return (
        <Layout>
            {banStatus ? (
                <div className="fixed bg-gray/20 backdrop-invert backdrop-opacity-20 inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-xl mb-12 p-6 md:w-90 mx-4 text-center">
                        <Icon
                            icon="streamline-plump-color:sad-face-flat"
                            className="mb-2 mx-auto"
                            width="72"
                            height="72"
                        />
                        <h2 className="text-2xl font-bold mb-6">
                            {t('communities.page.actionUnavailable')}
                        </h2>
                        <p className="text-2xl font-bold">
                            {seconds > 0
                                ? t('communities.page.redirecting', { seconds })
                                : t('communities.page.redirected')}
                        </p>
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
