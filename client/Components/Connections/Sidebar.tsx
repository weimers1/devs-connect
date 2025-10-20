import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';
import { useDropdown } from '../DropDown/DropDownContext';
import { useTheme } from '../../src/ThemeContext';

const CONNECTIONS_DATA = [
    {
        name: 'Sarah Johnson',
        currentRole: 'Software Engineer at Google',
        lastOnline: '',
        profileImage: 'SJ',
        isOnline: true,
        connectionType: '2nd',
    },
    {
        name: 'Mike Chen',
        currentRole: 'Software Engineer',
        lastOnline: '2 days ago',
        profileImage: 'MC',
        isOnline: false,
        connectionType: '3rd',
    },
    {
        name: 'Emily Davis',
        currentRole: 'Web Development',
        lastOnline: '14 hours ago',
        profileImage: 'ED',
        isOnline: false,
        connectionType: '2nd',
    },
    {
        name: 'Sarah Johnson',
        currentRole: 'Software Engineer at Google',
        lastOnline: '',
        profileImage: 'SJ',
        isOnline: true,
        connectionType: '2nd',
    },
    {
        name: 'Mike Chen',
        currentRole: 'Software Engineer',
        lastOnline: '10 minutes ago',
        profileImage: 'MC',
        isOnline: false,
        connectionType: '3rd',
    },
    {
        name: 'Emily Davis',
        currentRole: 'Web Development',
        lastOnline: '',
        profileImage: 'ED',
        isOnline: true,
        connectionType: '2nd',
    },
];

const SUGGESTIONS_DATA = [
    {
        name: 'Alex Rodriguez',
        currentRole: 'Data Scientist at Netflix',
        mutualConnections: 5,
        profileImage: 'AR',
    },
    {
        name: 'Lisa Wang',
        currentRole: 'Marketing Director at Spotify',
        mutualConnections: 3,
        profileImage: 'LW',
        reason: 'Mutual connections',
    },
    {
        name: 'Alex Rodriguez',
        currentRole: 'Data Scientist at Netflix',
        mutualConnections: 5,
        profileImage: 'AR',
    },
    {
        name: 'Lisa Wang',
        currentRole: 'Marketing Director at Spotify',
        mutualConnections: 3,
        profileImage: 'LW',
        reason: 'Mutual connections',
    },
    {
        name: 'Alex Rodriguez',
        currentRole: 'Data Scientist at Netflix',
        mutualConnections: 5,
        profileImage: 'AR',
    },
    {
        name: 'Lisa Wang',
        currentRole: 'Marketing Director at Spotify',
        mutualConnections: 3,
        profileImage: 'LW',
        reason: 'Mutual connections',
    },
];

function Sidebar() {
    const { isSidebarOpen, toggleSidebar } = useDropdown();
    const { theme } = useTheme();

    return (
        <section className="overflow-hidden">
            {/* buttons for collapsing/opening sidebar */}
            <div
                className={`fixed right-0 duration-400 ease-in ${
                    isSidebarOpen ? 'translate-x-full' : 'translate-x-0'
                }`}
            >
                <button
                    type="button"
                    className={`border border-gray-200 md:mt-3 mt-15 rounded-s-lg bg-white opacity-75 hover:opacity-100 ps-2 pe-1 py-2 lg:ps-3 lg:pe-2 lg:py-4 transition-all cursor-pointer flex `}
                    onClick={toggleSidebar}
                >
                    <Icon
                        icon="mdi:arrow-left"
                        className="w-3 lg:w-4 h-3 lg:h-4 mt-2 text-blue-700"
                    />
                    <Icon
                        icon="mdi:account-group-outline"
                        className="w-6 h-6 lg:w-8 text-blue-700"
                    />
                </button>
            </div>
            {isSidebarOpen && (
                <div className="fixed left-0  w-screen h-screen bg-slate-900 opacity-50 z-1 "></div>
            )}

            <div
                className={`fixed right-0 bottom-0 lg:top-18.5 top-29  md:rounded-lg shadow-md border border-gray-200 z-2 h-[90vh] lg:h-[92vh] w-full lg:w-100 overflow-y-scroll transition-all duration-300 ease-in ${
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
                <button
                    type="button"
                    className="cursor-pointer text-blue-700 p-3"
                    onClick={toggleSidebar}
                >
                    <Icon
                        icon="mdi:close"
                        className="w-6 h-6 text-blue-700"
                    />
                </button>

                {/* Your Network Section */}
                <div className="p-4 border-b border-gray-100 ">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                        <Icon
                            icon="mdi:account-group"
                            className="w-6 h-6 text-blue-700 me-2"
                        />
                        Fellow Collaborators
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your professional network
                    </p>
                </div>

                <div className="p-4 border-b border-gray-100 h-[27vh] lg:h-[35vh]  overflow-y-scroll">
                    <div className="space-y-4">
                        {CONNECTIONS_DATA.map((connection, index) => (
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
                                        {connection.currentRole}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {connection.isOnline
                                            ? ''
                                            : 'Last seen: ' +
                                              connection.lastOnline}
                                    </p>
                                </div>

                                <button className="text-blue-600 hover:bg-blue-50 p-1 rounded text-xs">
                                    Message
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* People You May Know Section */}
                {/*@TODO create a separate component for Each Of The Cards */}
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center mb-4">
                        <span className="mr-2">🤝</span>
                        People you may know
                    </h3>

                    <div className="space-y-4 h-[30vh] lg:h-[35vh] overflow-y-scroll">
                        {SUGGESTIONS_DATA.map((person, index) => (
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
                                            {person.currentRole}
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
            </div>
        </section>
    );
}

export default Sidebar;
