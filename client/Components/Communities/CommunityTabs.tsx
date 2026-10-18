import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import PostsFeed from './PostsFeed';
import LFGFeed from './LFGFeed';
import QAFeed from './QAFeed';
import Events from "./Events";
import CommunityProjects from './CommunityProjects';
import { useLanguage } from '../../src/i18n/LanguageContext';

interface CommunityTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    communityId: string;
}

const CommunityTabs: React.FC<CommunityTabsProps> = ({ activeTab, onTabChange, communityId }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="flex border-b overflow-x-auto">
                {[
                    { key: 'posts', label: t('communities.tabs.posts'), icon: 'mdi:code-tags' },
                    { key: 'lfg', label: t('communities.tabs.lfg'), icon: 'mdi:account-group' },
                    { key: 'qanda', label: t('communities.tabs.qa'), icon: 'mdi:help-circle' },
                    { key: 'events', label: t('communities.tabs.events'), icon: 'mdi:calendar' },
                    { key: 'projects', label: t('communities.tabs.projects'), icon: 'mdi:rocket-launch-outline' },
                    // { key: 'resources', label: 'Resources', icon: 'mdi:book-open' }
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
                {activeTab === 'posts' && <PostsFeed communityId={communityId} activeTab={activeTab} />}
                
                {activeTab === 'lfg' && <LFGFeed communityId={communityId} activeTab={activeTab} />}
                
                {activeTab === 'qanda' && <QAFeed communityId={communityId}  activeTab={activeTab}/>}

                {activeTab === 'events' && <Events communityId={communityId} activeTab={activeTab}/>}

                {activeTab === 'projects' && <CommunityProjects communityId={communityId} />}
                {/* {activeTab === 'events' && (
                    <div className="text-center py-12">
                        <Icon icon="mdi:calendar" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
                        <p className="text-gray-600">Check back later for community events and meetups.</p>
                    </div>
                )} */}

                {/* {activeTab === 'resources' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-900 mb-2">Learning Resources</h3>
                            <p className="text-blue-700 mb-4">Curated resources for development.</p>
                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                View Resources →
                            </button>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default CommunityTabs;