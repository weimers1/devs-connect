import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import CommunityHeader from './CommunityHeader';
import CommunityActionBar from './CommunityActionBar';
import CommunityTabs from './CommunityTabs';
import CommunitySidebar from './CommunitySidebar';

const COMMUNITY_DATA = {
    'react-developers': {
        id: 'react-developers',
        name: 'React Developers',
        description: 'A vibrant community of React developers sharing knowledge, best practices, and building amazing applications together.',
        membersTotal: '2.4k',
        membersOnline: '1.1k',
        category: 'Frontend Development',
        color: 'bg-gradient-to-r from-blue-400 to-cyan-500',
        icon: 'logos:react',
        tags: ['trending'],
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=400&fit=crop',
        createdDate: '2023-01-15',
        rules: [
            'Be respectful and professional',
            'No spam or self-promotion without permission',
            'Share knowledge and help others learn',
            'Use appropriate channels for discussions'
        ]
    },
    'ui-ux-designers': {
        id: 'ui-ux-designers',
        name: 'UI/UX Designers',
        description: 'Creative professionals focused on user experience design, interface design, and creating beautiful digital experiences.',
        membersTotal: '1.8k',
        membersOnline: '200',
        category: 'Design',
        color: 'bg-gradient-to-r from-pink-500 to-rose-500',
        icon: 'mdi:palette',
        tags: ['trending', 'new', 'premium'],
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=400&fit=crop',
        createdDate: '2023-03-20',
        rules: [
            'Share constructive feedback only',
            'Credit original designers when sharing work',
            'No portfolio spam',
            'Help junior designers grow'
        ]
    },
    'python-developers': {
        id: 'python-developers',
        name: 'Python Developers',
        description: 'Python enthusiasts building everything from web applications to machine learning models and automation scripts.',
        membersTotal: '3.2k',
        membersOnline: '2.5k',
        category: 'Backend Development',
        color: 'bg-gradient-to-r from-yellow-400 to-blue-500',
        icon: 'logos:python',
        tags: ['new'],
        coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=400&fit=crop',
        createdDate: '2023-02-10',
        rules: [
            'Follow PEP 8 style guidelines in code examples',
            'Provide context when asking for help',
            'Share learning resources',
            'Be patient with beginners'
        ]
    },
    'devops-engineers': {
        id: 'devops-engineers',
        name: 'DevOps Engineers',
        description: 'Infrastructure and deployment specialists focused on CI/CD, cloud platforms, and automation technologies.',
        membersTotal: '4.1k',
        membersOnline: '1.2k',
        category: 'Infrastructure',
        color: 'bg-gradient-to-r from-gray-700 to-gray-900',
        icon: 'mdi:server-network',
        tags: [],
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=400&fit=crop',
        createdDate: '2022-11-05',
        rules: [
            'Share infrastructure best practices',
            'No production credentials in posts',
            'Help with troubleshooting',
            'Discuss security considerations'
        ]
    }
};



const CommunityPage: React.FC = () => {
    const { communityId } = useParams<{ communityId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('posts');
    const [isJoined, setIsJoined] = useState(false);

    const community = communityId ? COMMUNITY_DATA[communityId as keyof typeof COMMUNITY_DATA] : null;

    useEffect(() => {
        if (!community) {
            navigate('/communities');
        }
    }, [community, navigate]);

    if (!community) {
        return null;
    }

    const handleJoinCommunity = () => {
        setIsJoined(!isJoined);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <CommunityHeader community={community} />
                
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <CommunityActionBar 
                                community={community} 
                                isJoined={isJoined} 
                                onJoinToggle={handleJoinCommunity} 
                            />
                            <CommunityTabs 
                                activeTab={activeTab} 
                                onTabChange={setActiveTab} 
                            />
                        </div>
                        
                        <CommunitySidebar community={community} />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CommunityPage;