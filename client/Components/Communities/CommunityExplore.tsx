const CommunityExplore = () => {
    const communities = [
        {
            name: 'Tech Innovators',
            members: '2.4k',
            category: 'Technology',
            color: 'bg-gradient-to-r from-blue-500 to-purple-600',
            trending: true,
        },
        {
            name: 'Design Masters',
            members: '1.8k',
            category: 'Design',
            color: 'bg-gradient-to-r from-red-500 to-yellow-500',
            trending: false,
        },
        {
            name: 'Startup Hub',
            members: '3.2k',
            category: 'Business',
            color: 'bg-gradient-to-r from-green-500 to-emerald-600',
            trending: true,
        },
        {
            name: 'Code Warriors',
            members: '4.1k',
            category: 'Programming',
            color: 'bg-gradient-to-r from-indigo-500 to-blue-600',
            trending: false,
        },
    ];

    return (
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-6 mt-10 border border-gray-100 bg-transparent">
            {/* Header with gradient */}
            <div className="mb-6 md:mb-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-">
                    🌟 Explore Communities
                </h2>
                <p className="text-gray-600 text-base sm:text-lg px-2">
                    Discover amazing communities and connect with like-minded
                    people
                </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="mb-6 sm:mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg sm:text-xl">🔍</span>
                </div>
                <input
                    type="text"
                    placeholder="Search communities..."
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow-md text-sm sm:text-base"
                />
            </div>

            {/* Featured Badge */}
            <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <span className="mr-2">🔥</span>
                    Trending Communities
                </h3>
            </div>

            {/* Enhanced Community Cards */}
            <div className="space-y-4 sm:space-y-6">
                {communities.map((community, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                    >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div
                                className={`w-12 h-12 sm:w-16 sm:h-16 ${community.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                            >
                                <span className="text-white font-bold text-lg sm:text-xl">
                                    {community.name.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                    <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">
                                        {community.name}
                                    </h3>
                                    {community.trending && (
                                        <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse whitespace-nowrap">
                                            🔥 Trending
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                    <span className="font-medium">
                                        {community.members}
                                    </span>{' '}
                                    members •
                                    <span className="text-blue-600 font-medium">
                                        {community.category}
                                    </span>
                                </p>
                                <div className="flex items-center space-x-1">
                                    <span className="text-green-500 text-xs sm:text-sm">
                                        ●
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-500">
                                        Active now
                                    </span>
                                </div>
                            </div>
                            <button className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r  from-blue-700 to-slate-950 text-white rounded-lg sm:rounded-xl hover:from-blue-600  hover:to-slate-950 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm flex-shrink-0">
                                <span className="hidden sm:inline">
                                    Join Now
                                </span>
                                <span className="sm:hidden">Join</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            <div className="mt-6 sm:mt-8 text-center">
                <button className="px-6 py-2 sm:px-8 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl transition-colors duration-200 font-medium text-sm sm:text-base">
                    Load More Communities
                </button>
            </div>
        </div>
    );
};

export default CommunityExplore;
