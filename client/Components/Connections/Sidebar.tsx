import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const connections = [
        {
            name: 'Sarah Johnson',
            goal: 'Software Engineer at Google',
            mutualConnections: 12,
            profileImage: 'SJ',
            isOnline: true,
            connectionType: '2nd',
        },
        {
            name: 'Mike Chen',
            goal: 'Software Engineer',
            mutualConnections: 8,
            profileImage: 'MC',
            isOnline: false,
            connectionType: '3rd',
        },
        {
            name: 'Emily Davis',
            goal: 'Web Development',
            mutualConnections: 15,
            profileImage: 'ED',
            isOnline: true,
            connectionType: '2nd',
        },
    ];

    const suggestions = [
        {
            name: 'Alex Rodriguez',
            goal: 'Data Scientist at Netflix',
            mutualConnections: 5,
            profileImage: 'AR',
        },
        {
            name: 'Lisa Wang',
            goal: 'Marketing Director at Spotify',
            mutualConnections: 3,
            profileImage: 'LW',
            reason: 'Mutual connections',
        },
    ];

    return (
        <section className="overflow-hidden">
            {/* @TODO: make sidebar responsive */}
            {/* buttons for collapsing/opening sidebar */}
            <button
                type="button"
                className={`fixed right-0 border border-gray-200 mt-10 rounded-s-lg bg-white ps-3 pe-2 py-4 transition-all duration-400 ease-in cursor-pointer flex ${
                    isOpen ? 'translate-x-full' : 'translate-x-0'
                }`}
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                <Icon
                    icon="mdi:arrow-left"
                    className="w-4 h-4 mt-2 text-blue-700"
                />
                <Icon
                    icon="mdi:account-group-outline"
                    className="w-8 h-8 text-blue-700"
                />
            </button>
            <div
                className={`fixed right-0 bg-white rounded-lg shadow-md border border-gray-200 z-2 h-screen transition-all duration-300 ease-in ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <button
                    type="button"
                    className="cursor-pointer text-blue-700 p-3"
                    onClick={() => {
                        setIsOpen(false);
                    }}
                >
                    <Icon
                        icon="mdi:close"
                        className="w-6 h-6 text-blue-700"
                    />
                </button>
                {/*@TODO create a separate component for Each Of The Cards */}
                {/* Your Network Section */}
                <div className="p-4 border-b border-gray-100 hidden md:block">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                        <span className="mr-2">👥</span>
                        Fellow Collaborators
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your professional network
                    </p>
                </div>

                <div className="p-4 border-b border-gray-100 hidden md:block">
                    <div className="space-y-4">
                        {connections.map((connection, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {connection.profileImage}
                                    </div>
                                    {connection.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium text-gray-900 text-sm truncate">
                                            {connection.name}
                                        </h4>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {connection.connectionType}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        <span className="text-black font-medium">
                                            Career Goal:
                                        </span>{' '}
                                        {connection.goal}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {connection.mutualConnections} mutual
                                        connections
                                    </p>
                                </div>

                                <button className="text-blue-600 hover:bg-blue-50 p-1 rounded text-xs">
                                    Message
                                </button>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 text-center text-blue-600 hover:bg-blue-50 py-2 rounded-lg text-sm font-medium hidden ">
                        See all connections
                    </button>
                </div>

                {/* People You May Know Section */}
                {/*@TODO create a separate component for Each Of The Cards */}
                <div className="p-4 border-b border-gray-100 hidden md:block">
                    <h3 className="font-semibold text-gray-900 flex items-center mb-4">
                        <span className="mr-2">🤝</span>
                        People you may know
                    </h3>

                    <div className="space-y-4">
                        {suggestions.map((person, index) => (
                            <div
                                key={index}
                                className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {person.profileImage}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 text-sm">
                                            {person.name}
                                        </h4>

                                        <p className="text-xs text-gray-600 mt-1">
                                            <span className="text-black font-medium">
                                                Career Goal:{' '}
                                            </span>
                                            {person.goal}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {person.mutualConnections} mutual
                                            connections
                                        </p>
                                    </div>
                                </div>

                                <div className="flex space-x-2 mt-3">
                                    <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                                        Connect
                                    </button>
                                    <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 text-center text-blue-600 hover:bg-blue-50 py-2 rounded-lg text-sm font-medium md:block">
                        See all suggestions
                    </button>
                </div>
                {/*@TODO create a separate component for Each Of The Cards */}
                {/* Quick Stats */}
                <div className="p-4 hidden md:block">
                    {' '}
                    {/* Hides the Quick States Upon Switch To Mobile*/}
                    <h3 className="font-semibold text-gray-900 mb-3">
                        Network Stats
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Connections</span>
                            <span className="font-medium">247</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Profile views</span>
                            <span className="font-medium text-green-600">
                                +12 this week
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                                Search appearances
                            </span>
                            <span className="font-medium">89</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block">
                    <button className="w-full text-center text-blue-600 hover:bg-blue-50 py-2 rounded-lg text-sm font-medium ">
                        See all suggestions
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Sidebar;
