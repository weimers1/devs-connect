import React, { useState, useEffect } from "react";
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from "react-router-dom";
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';

export interface SearchResult {
    type: 'user' | 'community';
    id: string;
    name: string;
    description?: string;
    memberCount?: number;
    profileImageUrl?: string;
    career?: string;
    icon?: string;
    isPrivate?: boolean;
}

interface CommunitySearchResponse {
    id: string;
    name: string;
    description?: string;
    memberCount?: number;
    icon?: string;
    isPrivate?: boolean;
}

interface UserSearchResponse {
    publicId: string;
    firstName: string;
    lastName: string;
    career?: string;
    profileImageUrl?: string;
}

interface NavBarSearchProps {
    searchQuery: string;
    onClose: () => void;
}

const NavBarSearch: React.FC<NavBarSearchProps> = ({ searchQuery, onClose }) => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [peopleSearchUnavailable, setPeopleSearchUnavailable] = useState(false);
    const [communitySearchUnavailable, setCommunitySearchUnavailable] =
        useState(false);

    useEffect(() => {
        let active = true;
        const query = searchQuery.trim();
        const searchPlatform = async () => {
            if (query.length < 2) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const [communitiesResult, usersResult] = await Promise.allSettled([
                API.searchCommunities(query),
                API.searchUsers(query),
            ]);
            if (!active) return;

            const communityResults: SearchResult[] =
                communitiesResult.status === 'fulfilled'
                    ? communitiesResult.value.map((community: CommunitySearchResponse) => ({
                    type: 'community',
                    id: community.id,
                    name: community.name,
                    description: community.description,
                    memberCount: community.memberCount,
                    icon: community.icon,
                    isPrivate: community.isPrivate
                    }))
                    : [];

            const userResults: SearchResult[] =
                usersResult.status === 'fulfilled'
                    ? usersResult.value.map((user: UserSearchResponse) => ({
                    type: 'user',
                    id: user.publicId,
                    name: `${user.firstName} ${user.lastName}`,
                    career: user.career,
                    profileImageUrl: user.profileImageUrl
                    }))
                    : [];

            if (communitiesResult.status === 'rejected') {
                console.error('Community search failed:', communitiesResult.reason);
            }
            if (usersResult.status === 'rejected') {
                console.error('People search failed:', usersResult.reason);
            }
            setPeopleSearchUnavailable(usersResult.status === 'rejected');
            setCommunitySearchUnavailable(communitiesResult.status === 'rejected');
            setResults([...communityResults, ...userResults]);
            setLoading(false);
        };

        const debounceTimer = setTimeout(() => void searchPlatform(), 200);
        return () => {
            active = false;
            clearTimeout(debounceTimer);
        };
    }, [searchQuery]);

    const handleResultClick = (result: SearchResult) => {
        if (result.type === 'community') {
            navigate(`/community/${result.id}`);
        } else {
            navigate(`/profile/${result.id}`);
        }
        onClose();
    };

    if (searchQuery.trim().length < 2) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-hidden z-50">
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">{t('social.search.searching')}</span>
                </div>
            ) : results.length > 0 ||
              peopleSearchUnavailable ||
              communitySearchUnavailable ? (
                <div className="max-h-80 overflow-y-auto">
                    {/* Communities Section */}
                    {results.filter(r => r.type === 'community').length > 0 && (
                        <div className="border-b border-gray-100">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                                {t('social.search.communities')}
                            </div>
                            {results.filter(r => r.type === 'community').slice(0, 3).map((result) => (
                                <button
                                    key={`community-${result.id}`}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                                >
                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                        <Icon
                                            icon={result.icon || 'mdi:account-group'}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 truncate">{result.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                                            <span>{t('social.search.members', { count: result.memberCount?.toLocaleString(language === 'es' ? 'es-ES' : 'en-US') ?? '' })}</span>
                                            {result.isPrivate && (
                                                <span className="inline-flex items-center">
                                                    <Icon icon="mdi:lock" className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Users Section */}
                    {results.filter(r => r.type === 'user').length > 0 && (
                        <div>
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                                {t('social.search.people')}
                            </div>
                            {results.filter(r => r.type === 'user').slice(0, 4).map((result) => (
                                <button
                                    key={`user-${result.id}`}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                                >
                                    <div className="w-8 h-8 flex-shrink-0">
                                        {result.profileImageUrl ? (
                                            <img
                                                src={result.profileImageUrl}
                                                alt={result.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                {result.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
                                        {peopleSearchUnavailable && (
                                            <p className="px-3 py-2 text-xs text-gray-500">
                                                {t('social.search.peopleUnavailable')}
                                            </p>
                                        )}
                                        {communitySearchUnavailable && (
                                            <p className="px-3 py-2 text-xs text-gray-500">
                                                {t('social.search.communitiesUnavailable')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 truncate">{result.name}</div>
                                        {result.career && (
                                            <div className="text-xs text-gray-500 truncate">{result.career}</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="px-3 py-4 text-center text-gray-500">
                    <div className="text-sm">{t('social.search.noResults', { query: searchQuery })}</div>
                </div>
            )}
        </div>
    );
};

export default NavBarSearch;