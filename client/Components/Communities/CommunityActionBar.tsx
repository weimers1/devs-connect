import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';

interface CommunityActionBarProps {
    isJoined?: boolean;
    onJoinToggle?: () => Promise<void>;
    community: {
        id: string;
        description: string;
        isPrivate?: boolean;
        createdDate?: string;
        createdAt?: string;
        isOwner?: boolean;
        isMember?: boolean;
    };
}
const CommunityActionBar: React.FC<CommunityActionBarProps> = ({
    community,
    isJoined,
    onJoinToggle,
}) => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [membershipStatus, setMembershipStatus] = useState(
        isJoined ?? (community.isOwner === true || community.isMember === true),
    );
    const [isAdmin, setIsAdmin] = useState(false);
    const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);
    const [membershipError, setMembershipError] = useState('');

    useEffect(() => {
        setMembershipStatus(
            isJoined ?? (community.isOwner === true || community.isMember === true),
        );
    }, [community.isMember, community.isOwner, isJoined]);

    useEffect(() => {
        let active = true;
        const fetchAdminStatus = async () => {
            try {
                const user = await API.getCurrentUser();
                if (!user?.userId) return;
                const admin = await API.getCommunityAdmins(
                    community.id,
                    String(user.userId),
                );
                if (active) setIsAdmin(admin?.admin === true);
            } catch {
                if (active) setIsAdmin(false);
            }
        };

        void fetchAdminStatus();
        return () => {
            active = false;
        };
    }, [community.id]);

    const onJoin = async () => {
        if (!community.id || isUpdatingMembership) return;
        setIsUpdatingMembership(true);
        setMembershipError('');
        try {
            const user = await API.getCurrentUser();
            if (!user?.userId) {
                navigate('/login');
                return;
            }
            if (onJoinToggle) {
                await onJoinToggle();
                setMembershipStatus((joined) => !joined);
                return;
            }
            const response = await API.joinCommunity(community.id);
            if (response?.success !== true) {
                throw new Error(t('communities.actionBar.joinNotConfirmed'));
            }
            setMembershipStatus(true);
        } catch (error) {
            console.error('Failed to join community:', error);
            setMembershipError(
                error instanceof Error
                    ? error.message
                    : t('communities.actionBar.joinFailed'),
            );
        } finally {
            setIsUpdatingMembership(false);
        }
    };

    const leaveCommunity = async () => {
        if (!community.id || isUpdatingMembership) return;
        setIsUpdatingMembership(true);
        setMembershipError('');
        try {
            const user = await API.getCurrentUser();
            if (!user?.userId) {
                navigate('/login');
                return;
            }
            const response = await API.LeaveCommunity(
                String(user.userId),
                community.id,
            );
            if (response?.success !== true) {
                throw new Error(t('communities.actionBar.leaveNotConfirmed'));
            }
            setMembershipStatus(false);
        } catch (error) {
            console.error('Failed to leave community:', error);
            setMembershipError(
                error instanceof Error
                    ? error.message
                    : t('communities.actionBar.leaveFailed'),
            );
        } finally {
            setIsUpdatingMembership(false);
        }
    };

    const handleEditCommunity = () => {
        if (community.isOwner === true || isAdmin) {
            navigate(`/edit-community/${community.id}`);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-gray-600 mb-2">{community.description}</p>
                    <p className="text-sm text-gray-500">
                        {t('communities.actionBar.created', { date: new Date(community.createdDate || community.createdAt || Date.now()).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        }) })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {(community.isOwner || isAdmin) && (
                        <button
                                onClick={handleEditCommunity}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Icon icon="mdi:cog" className="w-4 h-4 mr-2 inline" />
                            {t('communities.actionBar.editCommunity')}
                        </button>
                    )}
                    {community.isOwner ? (
                        <div className="px-6 py-3 rounded-xl bg-green-100 text-green-700 font-semibold">
                            <Icon icon="mdi:crown" className="w-4 h-4 mr-2 inline" />
                            {t('communities.actionBar.owner')}
                        </div>
                    ) : community.isPrivate && !membershipStatus ? (
                        <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-600">
                            <Icon icon="mdi:lock-outline" className="h-4 w-4" />
                            {t('communities.actionBar.inviteOnly')}
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={membershipStatus && !onJoinToggle ? leaveCommunity : onJoin}
                            disabled={isUpdatingMembership}
                            aria-label={membershipStatus ? t('communities.actionBar.leaveCommunity') : t('communities.actionBar.joinCommunity')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                                membershipStatus
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            <Icon
                                icon={isUpdatingMembership ? 'mdi:loading' : membershipStatus ? 'mdi:check' : 'mdi:plus'}
                                className={`w-4 h-4 mr-2 inline ${isUpdatingMembership ? 'animate-spin' : ''}`}
                            />
                            {isUpdatingMembership
                                ? t('communities.actionBar.pleaseWait')
                                : membershipStatus
                                  ? t('communities.actionBar.joined')
                                  : t('communities.actionBar.joinCommunity')}
                        </button>
                    )}
                </div>
            </div>
            {membershipError && (
                <p className="mt-4 text-sm text-red-600" role="alert">
                    {membershipError}
                </p>
            )}
        </div>
    );
};

export default CommunityActionBar;