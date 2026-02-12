import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate, useParams } from 'react-router-dom';
import Tag from '../../Components/Decal/Tag';
import API from '../../Service/service';


export interface Community {
    id: string;
    name:  string;
    description?: string;
    memberCount: number;
    image?: string;
    color?: string;
    icon?: string;
    isPrivate: boolean;
}

const CommunityExplore = () => {
    const navigate = useNavigate();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [CommunityName, setName] = useState('');

      useEffect(() => {
        const fetchCommunities = async () => { 
            try {
                const currentUser = await API.getCurrentUser();
                 const data = await API.getCommunities(currentUser.userId);
                setCommunities(data);
              
            } catch (error) {
                console.error('Failed to fetch communities:', error);
            } finally {
                setLoading(false);
            }
        };
  
        
        fetchCommunities();
        
    }, []);
    //Constantly updating the name
    const handleChange = (e) => {
        setName(e.target.value);
    }

    //        const checkBanStatus = async (communityId: string) => {
    //     try {
    //         const user = API.getCurrentUser();
    //         if(!user) {
    //             navigate('/login');
    //         }
    //         //Check Is member banned from community
    //         const banned = await API.getCommunityMembership(communityId, user.toString());
    //         if(!banned) {
    //             console.log("Unable to detect if user was banned from communitiy");
    //         }   
    //         if(banned.role.toLowerCase() == "banned") {
    //             setBannedStatus(true);
    //         }
    //     } catch(error) {
    //         console.log("error checking the ban status", error);
    //     }
    // } 

    //FilteredCommunities
    const filteredCommunities = communities.filter((community) => community.name.toLowerCase().includes(CommunityName.toLowerCase()));

   

    // items.filter(item =>
    // item.name.toLowerCase().includes(searchQuery.toLowerCase())

    const handleCommunityClick = (communityId: string) => {
        navigate(`/community/${communityId}`);
    };
    return (
        <div className="py-6">
            {/* Modern Header */}
            <div className="mb-8 lg:mb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                    <Icon
                        icon="mdi:compass"
                        className="w-8 h-8 text-white"
                    />
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                    Explore Communities
                </h1>
                <p className="text-gray-600 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                    Discover vibrant communities, connect with like-minded
                    developers, and grow your professional network
                </p>
            </div>

            {/* Modern Search Bar */}
            <div className="mb-8 lg:mb-12 relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Icon
                        icon="mdi:magnify"
                        className="w-6 h-6 text-gray-400"
                    />
                </div>
                <input
                    onChange={handleChange}
                    type="text"
                    placeholder="Search communities, topics, or technologies..."
                    className="w-full pl-14 pr-6 py-4 lg:py-5 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 text-base lg:text-lg placeholder-gray-400"
                />
                <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Section Header */}
            <div className="mb-8 lg:mb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            Featured Communities
                        </h2>
                        <p className="text-gray-600">
                            Join the most active developer communities
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center space-x-4">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Filter
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Sort by
                        </button>
                    </div>
                </div>
            </div>

            {/*  Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-600">Loading communities...</p>
                    </div>
                ) : filteredCommunities.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Icon icon="mdi:account-group-outline" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">No communities found</p>
                    </div>
                ) : filteredCommunities.map((community, index) => (
                    <div
                        key={index}
                        onClick={() => handleCommunityClick(community.id)}
                        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-blue-300 hover:-translate-y-3 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCommunityClick(community.id);
                            }
                        }}
                        role="button"
                        aria-label={`Navigate to ${community.name} community`}
                    >
                        {/* Enhanced Image Header */}
                        <div
                            className={`h-48 ${community.color || 'bg-gradient-to-r from-blue-400 to-cyan-500'} relative overflow-hidden`}
                            style={community.image ? {
                                backgroundImage: `url(${community.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            } : {}}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                            {/* Large Topic Icon */}
                            {!community.image && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                                    <Icon
                                        icon={community.icon || 'mdi:account-group'}
                                        className="w-24 h-24 text-white"
                                    />
                                </div>
                            )}

                            {/* Floating Tags */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                <Tag type="new" />
                            </div>

                            {/* Community Title with Icon */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3">
                                        <Icon
                                            icon={community.icon || 'mdi:account-group'}
                                            className="w-5 h-5 text-white"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-xl leading-tight drop-shadow-lg">
                                            {community.name}
                                        </h3>
                                        <p className="text-white/90 text-sm font-medium">
                                            {community.memberCount} members
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Content */}
                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {community.description || 'Join this community to connect with like-minded developers.'}
                            </p>

                            {/* Enhanced Stats */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center text-gray-600 text-sm font-medium">
                                        <Icon
                                            icon="mdi:account-group"
                                            className="w-4 h-4 mr-1.5 text-blue-500"
                                        />
                                        {community.memberCount}
                                    </span>
                                    <span className="flex items-center text-green-600 text-sm font-medium">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                        Active
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Icon
                                            key={i}
                                            icon="mdi:star"
                                            className={`w-4 h-4 ${
                                                i < 4
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                    <span className="text-xs text-gray-500 ml-1">
                                        4.8
                                    </span>
                                </div>
                            </div>

                            {/* Enhanced Join Button */}
                         
                        </div>
                    </div>
                ))}
            </div>

            {/* Enhanced Load More Button */}
            <div className="mt-12 lg:mt-16 text-center">
                <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-2xl transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 group">
                    <Icon
                        icon="mdi:refresh"
                        className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500"
                    />
                    Load More Communities
                </button>
                <p className="text-gray-500 text-sm mt-4">
                    Showing 4 of 50+ communities
                </p>
            </div>
        </div>
    );
};

export default CommunityExplore;
