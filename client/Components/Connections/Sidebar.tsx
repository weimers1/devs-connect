import { Icon } from '@iconify/react/dist/iconify.js';
import { useState, useEffect } from 'react';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('network');
    const [notifications, setNotifications] = useState(3);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setNotifications(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const connections = [
        {
            name: 'Elon Musk',
            goal: 'CEO at Tesla & SpaceX',
            mutualConnections: 847,
            profileImage: 'EM',
            isOnline: true,
            connectionType: '1st',
            verified: true,
            lastActive: '2 min ago'
        },
        {
            name: 'Sarah Johnson',
            goal: 'Senior AI Engineer at OpenAI',
            mutualConnections: 234,
            profileImage: 'SJ',
            isOnline: true,
            connectionType: '2nd',
            verified: true,
            lastActive: 'Active now'
        },
        {
            name: 'Jensen Huang',
            goal: 'CEO at NVIDIA',
            mutualConnections: 156,
            profileImage: 'JH',
            isOnline: false,
            connectionType: '2nd',
            verified: true,
            lastActive: '1 hour ago'
        },
        {
            name: 'Satya Nadella',
            goal: 'CEO at Microsoft',
            mutualConnections: 298,
            profileImage: 'SN',
            isOnline: true,
            connectionType: '3rd',
            verified: true,
            lastActive: 'Active now'
        }
    ];

    const suggestions = [
        {
            name: 'Sam Altman',
            goal: 'CEO at OpenAI',
            mutualConnections: 89,
            profileImage: 'SA',
            reason: 'AI Industry Leader',
            verified: true,
            trending: true
        },
        {
            name: 'Marc Benioff',
            goal: 'Chairman & CEO at Salesforce',
            mutualConnections: 67,
            profileImage: 'MB',
            reason: 'Tech Executive',
            verified: true,
            trending: false
        }
    ];

    const tabs = [
        { id: 'network', label: 'Network', icon: 'mdi:account-group', count: connections.length },
        { id: 'suggestions', label: 'Discover', icon: 'mdi:compass', count: suggestions.length },
        { id: 'activity', label: 'Activity', icon: 'mdi:bell', count: notifications }
    ];

    return (
        <section className="overflow-hidden">
            {/* Floating Action Button */}
            <button
                type="button"
                className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 ${
                    isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                onClick={() => setIsOpen(true)}
            >
                <div className="relative">
                    <Icon icon="mdi:account-group" className="w-6 h-6" />
                    {notifications > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            {notifications}
                        </div>
                    )}
                </div>
            </button>

            {/* Sidebar Panel */}
            <div
                className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Professional Network</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <Icon icon="mdi:close" className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold">1.2K</div>
                                <div className="text-xs opacity-90">Connections</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">89</div>
                                <div className="text-xs opacity-90">This Week</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">4.8</div>
                                <div className="text-xs opacity-90">Rating</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                                activeTab === tab.id
                                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-1">
                                <Icon icon={tab.icon} className="w-4 h-4" />
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTab === 'network' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Your Network</h3>
                                <Icon icon="mdi:filter-variant" className="w-4 h-4 text-gray-400" />
                            </div>
                            
                            {connections.map((connection, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-blue-200"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {connection.profileImage}
                                            </div>
                                            {connection.isOnline && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full animate-pulse"></div>
                                            )}
                                            {connection.verified && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <Icon icon="mdi:check" className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">
                                                    {connection.name}
                                                </h4>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    connection.connectionType === '1st' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : connection.connectionType === '2nd'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {connection.connectionType}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700 font-medium mb-1">
                                                {connection.goal}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {connection.mutualConnections} mutual connections
                                            </p>
                                            <p className="text-xs text-green-600 font-medium">
                                                {connection.lastActive}
                                            </p>
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105">
                                                Message
                                            </button>
                                            <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'suggestions' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">People You Should Know</h3>
                                <Icon icon="mdi:refresh" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600" />
                            </div>
                            
                            {suggestions.map((person, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-200"
                                >
                                    <div className="flex items-start space-x-3 mb-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                                {person.profileImage}
                                            </div>
                                            {person.verified && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <Icon icon="mdi:check" className="w-2 h-2 text-white" />
                                                </div>
                                            )}
                                            {person.trending && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <Icon icon="mdi:trending-up" className="w-2 h-2 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm mb-1">
                                                {person.name}
                                            </h4>
                                            <p className="text-xs text-gray-700 font-medium mb-1">
                                                {person.goal}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-1">
                                                {person.mutualConnections} mutual connections
                                            </p>
                                            <p className="text-xs text-blue-600 font-medium">
                                                {person.reason}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg text-xs font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
                                            Connect
                                        </button>
                                        <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                                            Later
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                            
                            <div className="space-y-3">
                                <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Icon icon="mdi:account-plus" className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">New Connection</span>
                                    </div>
                                    <p className="text-xs text-blue-700">Elon Musk accepted your connection request</p>
                                    <p className="text-xs text-blue-500 mt-1">2 minutes ago</p>
                                </div>
                                
                                <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Icon icon="mdi:eye" className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-900">Profile View</span>
                                    </div>
                                    <p className="text-xs text-green-700">Your profile was viewed 23 times today</p>
                                    <p className="text-xs text-green-500 mt-1">1 hour ago</p>
                                </div>
                                
                                <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Icon icon="mdi:message" className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-900">New Message</span>
                                    </div>
                                    <p className="text-xs text-purple-700">Sarah Johnson sent you a message</p>
                                    <p className="text-xs text-purple-500 mt-1">3 hours ago</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                        Expand Network
                    </button>
                </div>
            </div>

            {/* Elon Musk Approved Backdrop - Tinted but Viewable */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-30 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                    style={{
                        backdropFilter: 'blur(2px) brightness(0.8)',
                        WebkitBackdropFilter: 'blur(2px) brightness(0.8)'
                    }}
                />
            )}
        </section>
    );
}

export default Sidebar;