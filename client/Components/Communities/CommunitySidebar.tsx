import React from 'react';

interface CommunitySidebarProps {
    community: {
        membersTotal: string;
        membersOnline: string;
        category: string;
        rules: string;
        members?: any[];
    };
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ community }) => {
    return (
        <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Community Stats</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Members</span>
                        <span className="font-semibold">{community.membersTotal}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Online Now</span>
                        <span className="font-semibold text-green-600">{community.membersOnline}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Category</span>
                        <span className="font-semibold">{community.category}</span>
                    </div>
                </div>
            </div>

            {/* Community Rules */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Community Rules</h3>
                <div className="space-y-3 w-full">
                        <div  className="flex space-x-2">
                            <p  className="rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">{community.rules}</p>
                        </div>
                   
                </div>
            </div>

            {/* Active Members */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Community Members</h3>
                <div className="space-y-3">
                    {community.members && community.members.length > 0 ? (
                        community.members.slice(0, 5).map((member, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className="relative">
                                    <img
                                        src={member.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.firstName + ' ' + member.lastName)}&background=random`}
                                        alt={`${member.firstName} ${member.lastName}`}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                        member.isOnline ? 'bg-green-400' : 'bg-gray-400'
                                    }`}></div>
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm text-gray-700">{member.firstName} {member.lastName}</span>
                                    {member.role === 'admin' && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Admin</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No members yet</p>
                    )}
                    {community.members && community.members.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2">+{community.members.length - 5} more members</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunitySidebar;