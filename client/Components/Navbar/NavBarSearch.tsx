import React from "react";
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from "react-router-dom";

export interface navSearch { 
    community: {
        id: string;
        name: string;
        description?: string;
        memberCount: number;
        image?: string;
        color?: string;
        icon?: string;
        isPrivate: boolean;
    }[];
}


const NavBarSearch: React.FC<navSearch> = ({community}) => {
          const navigate = useNavigate();
const handleCommunityClick = (communityId: string) => {
        navigate(`/community/${communityId}`);
    };
    return(
        <div className="absolute top-16 ml-38 z-50 ml-2 fixed bg-white rounded-xl w-72">
            <div className="py-2 flex flex-col">
                {community.map((communityItem, index) => (
                    <button 
                        key={index}
                        onClick={() => handleCommunityClick(communityItem.id)}
                        className="w-full text-left"
                    >
                        <div className="flex items-center px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Icon 
                                        icon={communityItem.icon || 'mdi:account-group'} 
                                        className="w-8 h-8 rounded-full bg-gray-200 p-2 text-gray-600" 
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">{communityItem.name}</p>
                                    <p className="text-xs text-gray-500">{communityItem.memberCount} members</p>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NavBarSearch;