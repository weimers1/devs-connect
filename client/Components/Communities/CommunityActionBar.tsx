import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface CommunityActionBarProps {
    community: {
        description: string;
        createdDate: string;
    };
    isJoined: boolean;
    onJoinToggle: () => void;
}

const CommunityActionBar: React.FC<CommunityActionBarProps> = ({ 
    community, 
    isJoined, 
    onJoinToggle 
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-gray-600 mb-2">{community.description}</p>
                    <p className="text-sm text-gray-500">
                        Created {new Date(community.createdDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
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
            </div>
        </div>
    );
};

export default CommunityActionBar;