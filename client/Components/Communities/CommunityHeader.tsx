import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import Tag from '../Decal/Tag';

interface CommunityHeaderProps {
    community: {
        name: string;
        membersTotal: string;
        membersOnline: string;
        color: string;
        icon: string;
        tags: string[];
        image: string;
    };
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({ community }) => {
    const navigate = useNavigate();

    return (
        <div className="relative h-64 md:h-80 overflow-hidden">
            <img 
                src={community.image} 
                alt={community.name}
                className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            <button
                onClick={() => navigate('/communities')}
                className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
                <Icon icon="mdi:arrow-left" className="w-6 h-6 text-white" />
            </button>

            <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center mb-4">
                    <div className={`w-16 h-16 ${community.color} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                        <Icon icon={community.icon} className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{community.name}</h1>
                        <div className="flex items-center space-x-4 text-white/90">
                            <span className="flex items-center">
                                <Icon icon="mdi:account-group" className="w-4 h-4 mr-1" />
                                {community.membersTotal} members
                            </span>
                            <span className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                                {community.membersOnline} online
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    {community.tags.map((tag, index) => (
                        <Tag key={index} type={tag} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunityHeader;