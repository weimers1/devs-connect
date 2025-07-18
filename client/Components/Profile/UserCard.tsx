import { assets } from "../../assets/assets";
import { Icon } from '@iconify/react';

function UserCard() {
    return (
        <div className="w-full bg-gray-100 overflow-hidden sm:rounded-lg shadow-md mb-2 mt-2"> 
            {/* Banner - Full width on mobile */}
            <div className="relative">
                <div className="w-full">
                    <img 
                        className="w-full h-28 sm:h-36 md:h-42 object-cover" 
                        src={assets.Banner} 
                        alt="Profile Banner"
                    />
                </div>
                
                {/* Profile Picture - Different positioning for mobile vs desktop */}
                <div className="absolute -bottom-10 sm:-bottom-12 md:-bottom-16 left-4 sm:left-6 md:left-8">
                    <img 
                        src={assets.Profile}
                        alt="Profile"
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                </div>
            </div>
            
            {/* Profile Info Section - Full width on mobile */}
            <div className="bg-white pt-12 sm:pt-16 md:pt-20 pb-4 sm:pb-6 px-4 sm:px-6 md:px-8">
                {/* Mobile: Stacked layout, Desktop: Side-by-side layout */}
                <div className="flex flex-col md:flex-row md:justify-between">
                    {/* Left Column - Basic Info */}
                    <div className="md:pr-8">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Ethan McLaughlin</h1>
                        <p className="text-gray-600 text-sm md:text-base">Student At Southwestern Community College</p>
                        <p className="text-gray-500 text-xs sm:text-sm">Coos Bay, Oregon, United States</p>
                        
                        {/* Connections */}
                        <div className="mt-2 flex items-center">
                            <span className="text-blue-600 text-xs sm:text-sm font-medium">500+ Mutuals</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-blue-600 text-xs sm:text-sm font-medium">Contact info</span>
                        </div>
                        
                        {/* Action Buttons - Full width on mobile, normal on desktop */}
                        <div className="flex flex-col sm:flex-row mt-3 sm:mt-4 sm:space-x-2 space-y-2 sm:space-y-0">
                            <button className="w-full sm:w-auto rounded-full bg-blue-600 text-white px-4 py-1.5 flex items-center justify-center transition-all duration-200 hover:bg-blue-700">
                                <Icon icon="mdi:account-plus" className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                                <span className="font-medium text-sm">Connect</span>
                            </button>
                            <button className="w-full sm:w-auto rounded-full bg-white border border-gray-400 text-gray-700 px-4 py-1.5 flex items-center justify-center transition-all duration-200 hover:bg-gray-50">
                                <Icon icon="mdi:message-reply-text" className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                                <span className="font-medium text-sm">Message</span>
                            </button>
                            <button className="w-full sm:w-auto rounded-full bg-white border border-gray-400 text-gray-700 px-3 py-1.5 flex items-center justify-center transition-all duration-200 hover:bg-gray-50">
                                <span className="font-medium text-sm">More</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Right Column - Career Goal (Moves below on mobile) */}
                    <div className="mt-4 md:mt-0 md:ml-4 md:flex-shrink-0">
                        <div className="bg-blue-50 px-3 py-2 rounded-lg">
                            <p className="font-semibold text-sm">Career goal</p>
                            <p className="text-blue-600 text-sm">Web Development</p>
                        </div>
                    </div>
                </div>
                
                {/*  section divider */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">About</p>
                        <button className="text-gray-400">
                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        Passionate web developer focused on creating responsive, user-friendly applications.
                        Currently studying at Southwestern Community College.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default UserCard;