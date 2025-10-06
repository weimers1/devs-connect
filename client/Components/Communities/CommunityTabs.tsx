import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import PostsFeed from './PostsFeed';
import LFGFeed from './LFGFeed';
import QAFeed from './QAFeed';

interface CommunityTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const CommunityTabs: React.FC<CommunityTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="flex border-b overflow-x-auto">
                {[
                    { key: 'posts', label: 'Posts', icon: 'mdi:code-tags' },
                    { key: 'lfg', label: 'LFG', icon: 'mdi:account-group' },
                    { key: 'qa', label: 'Q&A', icon: 'mdi:help-circle' },
                    { key: 'events', label: 'Events', icon: 'mdi:calendar' },
                    { key: 'resources', label: 'Resources', icon: 'mdi:book-open' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        className={`flex items-center px-4 py-4 font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.key
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Icon icon={tab.icon} className="w-4 h-4 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">
                {activeTab === 'posts' && <PostsFeed />}
                
                {activeTab === 'lfg' && <LFGFeed />}
                
                {activeTab === 'qa' && <QAFeed />}

                {activeTab === 'events' && (
                    <div className="text-center py-12">
                        <Icon icon="mdi:calendar" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
                        <p className="text-gray-600">Check back later for community events and meetups.</p>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-900 mb-2">Learning Resources</h3>
                            <p className="text-blue-700 mb-4">Curated resources for development.</p>
                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                View Resources →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityTabs;