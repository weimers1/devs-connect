import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';

interface CommunityActionBarProps {
    community: {
        id: string;
        description: string;
        createdDate?: string;
        createdAt?: string;
        isOwner?: boolean;
    };
    isJoined: boolean;
    onJoinToggle: () => void;
}

const CommunityActionBar: React.FC<CommunityActionBarProps> = ({ 
    community, 
    isJoined, 
    onJoinToggle 
}) => {
    const navigate = useNavigate();
    
    const handleEditCommunity = () => {
        navigate(`/edit-community/${community.id}`);
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-gray-600 mb-2">{community.description}</p>
                    <p className="text-sm text-gray-500">
                        Created {new Date(community.createdDate || community.createdAt || Date.now()).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <div className="flex space-x-3">
                    {community.isOwner ? (
                        <>
                            <button 
                                onClick={handleEditCommunity}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Icon icon="mdi:cog" className="w-4 h-4 mr-2 inline" />
                                Edit Community
                            </button>
                            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                                <Icon icon="mdi:crown" className="w-4 h-4 mr-2 inline" />
                                Owner
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={onJoinToggle}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                isJoined
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            <Icon 
                                icon={isJoined ? "mdi:check" : "mdi:plus"} 
                                className="w-4 h-4 mr-2 inline" 
                            />
                            {isJoined ? 'Joined' : 'Join Community'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityActionBar;