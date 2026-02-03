// Communities.tsx
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import API from '../../Service/service';

interface CommunitiesProps {
    userId?: string;
    isOwnProfile?: boolean;

}

function Communities({ userId }: CommunitiesProps) {
    const [communitiesData, setCommunitiesData] = useState([{
        name: '',
        description: '',
        createdBy: '',
        icon: '',
        color: '',
        image: '',
        memberCount: '',
        id: '',
        isOwner: false,
}]);
    const isOwnProfile = !userId;

    //Need to obtain community info 

    useEffect(() => {
        const  fetchusercommunities = async() => {
                try { 
                    const user = await API.getCurrentUser();
                    
                    const communityData = await API.getCommunitiesDataFromUser(user.userId);
                    setCommunitiesData(communityData);
                } catch(error) {
                    console.log(error, "error fetching user communities");
                }
        }
        fetchusercommunities();
    }, []) 

   

    return (
        <div className="bg-white shadow-md p-4 sm:p-6 w-full max-w-2xl mx-auto sm:rounded-lg mt-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Communities</h2>
                {isOwnProfile && (
                    <button className="text-blue-600 hover:text-blue-800">
                        <Icon
                            icon="mdi:plus"
                            className="w-5 h-5"
                        />
                    </button>
                )}
            </div>

            <div className="space-y-4 ">
                {communitiesData.map((community) => (
                    <div
                        key={community.id}
                        className="flex border-b border-gray-100 pb-4"
                    >
                        {/* Community Logo */}
                        <div className="flex-shrink-0 mr-4">
                            <Icon
                                icon={community.icon || 'mdi:account-group'}
                                className="w-10 h-10 rounded-full bg-gray-200 p-2 text-gray-600"
                            />
                        </div>

                        {/* Community Info */}
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center">
                                <h3 className="font-medium text-gray-900 truncate">
                                    {community.name}
                                </h3>
                                {community.isOwner && (
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        Admin
                                    </span>
                                )}
                            </div>
                            {/* <p className="text-gray-500 text-sm">
                                {community.members.toLocaleString()} members
                            </p> */}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0">
                            <button className="text-gray-400 hover:text-gray-600">
                                <Icon
                                    icon="mdi:dots-vertical"
                                    className="w-5 h-5"
                                />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between items-center">
                <button className="text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center">
                    Show all communities
                    <Icon
                        icon="mdi:chevron-down"
                        className="w-4 h-4 ml-1"
                    />
                </button>

                {isOwnProfile && (
                    <button className="text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center">
                        Discover new
                        <Icon
                            icon="mdi:arrow-right"
                            className="w-4 h-4 ml-1"
                        />
                    </button>
                )}
            </div>
        </div>
    );
}

export default Communities;
