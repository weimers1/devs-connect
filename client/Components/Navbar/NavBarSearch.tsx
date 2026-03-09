import React, { useState, useEffect } from "react";
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from "react-router-dom";
import API from '../../Service/service';

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

interface NavBarSearchProps {
    searchQuery: string;
    onClose: () => void;
}

const NavBarSearch: React.FC<NavBarSearchProps> = ({ searchQuery, onClose }) => {
    const navigate = useNavigate();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchPlatform = async () => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const [communities, users] = await Promise.all([
                    API.searchCommunities(searchQuery),
                    API.searchUsers(searchQuery)
                ]);

                const communityResults: SearchResult[] = communities.map((community: any) => ({
                    type: 'community',
                    id: community.id,
                    name: community.name,
                    description: community.description,
                    memberCount: community.memberCount,
                    icon: community.icon,
                    isPrivate: community.isPrivate
                }));

                const userResults: SearchResult[] = users.map((user: any) => ({
                    type: 'user',
                    id: user.userId || user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    career: user.career,
                    profileImageUrl: user.profileImageUrl
                }));

                setResults([...communityResults, ...userResults]);
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchPlatform, 200);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleResultClick = (result: SearchResult) => {
        if (result.type === 'community') {
            navigate(`/community/${result.id}`);
        } else {
            navigate(`/profile/${result.id}`);
        }
        onClose();
    };

    if (!searchQuery.trim()) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-hidden z-50">
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Searching...</span>
                </div>
            ) : results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                    {/* Communities Section */}
                    {results.filter(r => r.type === 'community').length > 0 && (
                        <div className="border-b border-gray-100">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                                COMMUNITIES
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
                                            <span>{result.memberCount?.toLocaleString()} members</span>
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
                                PEOPLE
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
                    <div className="text-sm">No results for "{searchQuery}"</div>
                </div>
            )}
        </div>
    );
};

export default NavBarSearch;