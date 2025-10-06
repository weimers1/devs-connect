import React from 'react';

interface CommunitySidebarProps {
    community: {
        membersTotal: string;
        membersOnline: string;
        category: string;
        rules: string[];
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
                <div className="space-y-3">
                    {community.rules.map((rule, index) => (
                        <div key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 font-semibold text-sm mt-0.5">{index + 1}.</span>
                            <span className="text-gray-700 text-sm">{rule}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Members */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Active Members</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', status: 'online' },
                        { name: 'Maria Garcia', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face', status: 'online' },
                        { name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face', status: 'away' }
                    ].map((member, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                    member.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                                }`}></div>
                            </div>
                            <span className="text-sm text-gray-700">{member.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunitySidebar;