// Communities.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import API from '../../Service/service';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../src/i18n/LanguageContext';

interface CommunitiesProps {
    userId: string;
    isOwnProfile?: boolean;
    onLoadedCount?: (count: number) => void;
}

interface ProfileCommunity {
    id: string;
    name: string;
    icon?: string | null;
    role: string;
}

function Communities({
    userId,
    isOwnProfile = false,
    onLoadedCount,
}: CommunitiesProps) {
    const [communitiesData, setCommunitiesData] = useState<ProfileCommunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [communitiesValue, setcommunitiesValue] = useState(3);
    const [communitiesExpanded, setcommunitiesExpanded] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        let active = true;
        const fetchUserCommunities = async () => {
            setLoading(true);
            setError(null);
            try {
                const communityData = await API.getCommunitiesDataFromUser(userId);
                if (Array.isArray(communityData)) {
                    if (active) {
                        setCommunitiesData(communityData);
                        onLoadedCount?.(communityData.length);
                    }
                } else {
                    throw new Error('Invalid community response');
                }
            } catch (error) {
                console.error('Failed to fetch user communities:', error);
                if (active) {
                    setCommunitiesData([]);
                    onLoadedCount?.(0);
                    setError(t('profile.communities.loadError'));
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchUserCommunities();
        return () => {
            active = false;
        };
    }, [onLoadedCount, userId, t]);

    const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const ScrollIntoView = (itemKey: string) => {
        setTimeout(() => {
            const element = itemRefs.current[itemKey];
            if (element != null) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });     
            }
        }, 200);
    };
    
    return (
        <div
            id="profile-communities"
            className="mx-auto mb-2 mt-2 w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">{t('profile.communities.title')}</h2>
                </div>

                <div className="space-y-2">
                    {loading ? (
                        <p className="py-8 text-center text-gray-500" role="status">
                            {t('profile.communities.loading')}
                        </p>
                    ) : error ? (
                        <p className="py-8 text-center text-red-600" role="alert">{error}</p>
                    ) : communitiesData.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">
                            {isOwnProfile ? t('profile.communities.emptyOwn') : t('profile.communities.emptyOther')}
                        </p>
                    ) : communitiesData.slice(0, communitiesValue).map((community) => (
                        <button
                            key={community.id}
                            type="button"
                            ref={(el) => {
                                itemRefs.current[String(community.id)] = el;
                            }}
                            onClick={() => navigate(`/community/${community.id}`)}
                            className="flex min-h-[4.5rem] w-full items-center gap-4 rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                <Icon
                                    icon={community.icon || 'mdi:account-group'}
                                    className="h-6 w-6"
                                />
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium text-gray-900">
                                {community.name}
                            </span>
                            {community.role === 'owner' && (
                                <span className="ml-auto flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    {t('profile.communities.owner')}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    {communitiesData.length > 3 && !loading && !error ? (
                        <button
                            type="button"
                            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            aria-expanded={communitiesExpanded}
                            onClick={() => {
                                if (communitiesExpanded) {
                                    setcommunitiesExpanded(false);
                                    setcommunitiesValue(3);
                                } else {
                                    setcommunitiesExpanded(true);
                                    setcommunitiesValue(communitiesData.length);
                                    ScrollIntoView(String(communitiesData[communitiesData.length - 1].id));
                                }
                            }}
                        >
                            {communitiesExpanded ? t('profile.communities.showFewer') : t('profile.communities.showAll')}
                            <Icon
                                icon={communitiesExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                                className="ml-1 h-4 w-4"
                            />
                        </button>
                    ) : <span />}

                    {isOwnProfile && (
                        <button
                            type="button"
                            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            onClick={() => navigate('/communities')}
                        >
                            {t('profile.communities.discoverNew')}
                            <Icon icon="mdi:arrow-right" className="ml-1 h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Communities;
