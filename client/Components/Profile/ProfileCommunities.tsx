// Communities.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import API from '../../Service/service';
import { useNavigate } from 'react-router-dom';

interface CommunitiesProps {
    userId?: string;
    isOwnProfile?: boolean;
}

function Communities({ userId }: CommunitiesProps) {
    const [communitiesData, setCommunitiesData] = useState([
        {
            name: '',
            description: '',
            createdBy: '',
            icon: '',
            color: '',
            image: '',
            memberCount: '',
            id: '',
            isOwner: false,
            role: '',
        },
    ]);
    const [UserId, setUserId] = useState('');
    const [communitiesValue, setcommunitiesValue] = useState(3);
    const [communitiesExpanded, setcommunitiesExpanded] = useState(false);
    // const {userId} = useParams();
    const isOwnProfile = !userId;
    //Need to obtain community info
    const navigate = useNavigate();
    useEffect(() => {
        const fetchusercommunities = async () => {
            try {
                const user = await API.getCurrentUser();
                if (!user) {
                    console.log('No user is logged in');
                    return;
                }
                const targetUserId = userId || user.userId;
                setUserId(targetUserId);
                const communityData =
                    await API.getCommunitiesDataFromUser(targetUserId);
                if (Array.isArray(communityData)) {
                    setCommunitiesData(communityData);
                } else {
                    console.error(
                        'Received non-array community data',
                        communityData,
                    );
                    setCommunitiesData([]);
                }
            } catch (error) {
                console.log(error, 'error fetching user communities');
            }
        };

        fetchusercommunities();
    }, [userId]);

    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
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
        <div className="w-full max-w-2xl bg-white overflow-hidden sm:rounded-lg shadow-md mb-2 mt-2 mx-auto">
            <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Communities
                    </h2>
                </div>

                <div className="space-y-4 ">
                    {communitiesData
                        ?.slice(0, communitiesValue)
                        .map((community) => (
                            <div
                                key={community.id}
                                ref={(el) => {
                                    itemRefs.current[String(community.id)] = el;
                                }}
                                className="flex border-b border-gray-100 pb-4 hover:bg-gray-300"
                            >
                                {/* Community Logo */}
                                <div className="flex-shrink-0 mr-4">
                                    <Icon
                                        icon={
                                            community.icon ||
                                            'mdi:account-group'
                                        }
                                        className="w-10 h-10 rounded-full bg-gray-200 p-2 text-gray-600"
                                        onClick={() =>
                                            navigate(
                                                `/community/${community.id}`,
                                            )
                                        }
                                    />
                                </div>

                                {/* Community Info */}
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center">
                                        <h3
                                            className="font-medium text-gray-900 truncate"
                                            onClick={() =>
                                                navigate(
                                                    `/community/${community.id}`,
                                                )
                                            }
                                        >
                                            {community.name}
                                        </h3>
                                        {community.createdBy.toString() ==
                                            UserId.toString() && (
                                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                Owner
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
                    {communitiesData.length > 3 ? (
                        <button
                            className="text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center"
                            onClick={() => {
                                if (communitiesExpanded) {
                                    setcommunitiesExpanded(false);
                                    setcommunitiesValue(3);
                                } else {
                                    setcommunitiesExpanded(true);
                                    setcommunitiesValue(communitiesData.length);
                                    const lastCommunityId = String(
                                        communitiesData[
                                            communitiesData.length - 1
                                        ].id,
                                    );
                                    ScrollIntoView(lastCommunityId);
                                }
                            }}
                        >
                            Show all communities
                            <Icon
                                icon="mdi:chevron-down"
                                className="w-4 h-4 ml-1"
                            />
                        </button>
                    ) : (
                        <h1></h1>
                    )}

                    {isOwnProfile && (
                        <button
                            className="text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center"
                            onClick={() => navigate('/communities')}
                        >
                            Discover new
                            <Icon
                                icon="mdi:arrow-right"
                                className="w-4 h-4 ml-1"
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Communities;
