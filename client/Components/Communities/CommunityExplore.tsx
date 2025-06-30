import { Icon } from '@iconify/react/dist/iconify.js';
import Tag from '../../Components/Decal/Tag';

const CommunityExplore = () => {
    const communities = [
        {
            name: 'Tech Innovators',
            membersTotal: '2.4k',
            membersOnline: '1.1k',
            category: 'Technology',
            color: 'bg-gradient-to-r from-blue-500 to-purple-600',
            tags: ['trending'],
        },
        {
            name: 'Design Masters',
            membersTotal: '1.8k',
            membersOnline: '200',
            category: 'Design',
            color: 'bg-gradient-to-r from-red-500 to-yellow-500',
            tags: ['trending', 'new', 'premium'],
        },
        {
            name: 'Startup Hub',
            membersTotal: '3.2k',
            membersOnline: '2.5k',
            category: 'Business',
            color: 'bg-gradient-to-r from-green-500 to-emerald-600',
            tags: ['new'],
        },
        {
            name: 'Code Warriors',
            membersTotal: '4.1k',
            membersOnline: '1.2k',
            category: 'Programming',
            color: 'bg-gradient-to-r from-indigo-500 to-blue-600',
            tags: [],
        },
    ];

    return (
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-6 mt-10 mb-5 mx-5 lg:mx-0 border border-gray-100 bg-transparent w-[92vw] lg:w-[65vw]">
            {/* Header with gradient */}
            <div className="mb-6 md:mb-8">
                <div className="flex justify-center text-blue-800">
                    <Icon
                        icon="mdi:compass"
                        className="w-6 h-6 lg:w-8 lg:h-8 me-2"
                    />
                    <h2 className="text-xl lg:text-3xl font-bold mb-2">
                        Explore Communities
                    </h2>
                </div>
                <p className="text-gray-600 text-base text-sm lg:text-lg px-2">
                    Discover amazing communities and connect with like-minded
                    people
                </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="mb-6 lg:mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg lg:text-xl">
                        <Icon
                            icon="mdi:magnify"
                            className="w-6 h-6 lg:w-8 lg:h-8"
                        />
                    </span>
                </div>
                <input
                    type="text"
                    placeholder="Messages..."
                    className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 border-2 border-gray-200 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow-md text-sm lg:text-base"
                />
            </div>

            {/* Featured Badge */}
            <div className="mb-4 lg:mb-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4 flex items-center">
                    Top Communities
                </h3>
            </div>

            {/* Enhanced Community Cards */}
            <div className="space-y-4 lg:space-y-6">
                {communities.map((community, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg lg:rounded-xl p-4 lg:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                    >
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div
                                className={`w-12 h-12 lg:w-16 lg:h-16 ${community.color} rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                            >
                                <span className="text-white font-bold text-lg lg:text-xl">
                                    {community.name.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                    <h3 className="font-bold text-gray-800 text-base lg:text-lg truncate">
                                        {community.name}
                                    </h3>
                                </div>
                                <p className="flex space-x-2 pb-2">
                                    {community.tags.map((tagType, i) => (
                                        <Tag
                                            key={index + '-' + i}
                                            type={tagType}
                                        />
                                    ))}
                                </p>
                                <p className="text-xs lg:text-sm text-gray-600 mb-2 flex">
                                    {community.membersTotal} members
                                </p>
                                <p className="text-xs text-gray-400 mb-2 block text-nowrap">
                                    <span className="text-green-500 text-xs` me-2">
                                        ●
                                    </span>
                                    {community.membersOnline} online now
                                </p>
                            </div>
                            <button className="px-3 py-2 lg:px-6 lg:py-3 bg-gradient-to-r  from-blue-700 to-slate-950 text-white rounded-lg lg:rounded-xl hover:from-blue-600  hover:to-slate-950 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-xs lg:text-sm flex-shrink-0">
                                <span className="hidden lg:inline">
                                    Join Now
                                </span>
                                <span className="lg:hidden">Join</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            <div className="mt-6 lg:mt-8 text-center">
                <button className="px-6 py-2 lg:px-8 lg:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg lg:rounded-xl transition-colors duration-200 font-medium text-sm lg:text-base">
                    Load More Communities
                </button>
            </div>
        </div>
    );
};

export default CommunityExplore;
