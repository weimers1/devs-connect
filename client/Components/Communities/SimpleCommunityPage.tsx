import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import Layout from '../Layout';
import API from '../../Service/service';

const SimpleCommunityPage: React.FC = () => {
    const { communityId } = useParams<{ communityId: string }>();
    const navigate = useNavigate();
    const [community, setCommunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommunity = async () => {
            if (!communityId) {
                navigate('/communities');
                return;
            }
            
            try {
                const data = await API.getCommunityById(communityId);
                setCommunity(data);
            } catch (error) {
                console.error('Failed to fetch community:', error);
                navigate('/communities');
            } finally {
                setLoading(false);
            }
        };
        
        fetchCommunity();
    }, [communityId, navigate]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </Layout>
        );
    }

    if (!community) return null;

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/communities')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-2" />
                    Back to Communities
                </button>

                {/* Community Header */}
                <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
                    <div className="flex items-start space-x-6">
                        {/* Community Image/Icon */}
                        <div className="flex-shrink-0">
                            {community.image ? (
                                <img 
                                    src={community.image} 
                                    alt={community.name}
                                    className="w-20 h-20 rounded-xl object-cover"
                                />
                            ) : (
                                <div className={`w-20 h-20 ${community.color || 'bg-blue-500'} rounded-xl flex items-center justify-center`}>
                                    <Icon 
                                        icon={community.icon || 'mdi:account-group'} 
                                        className="w-10 h-10 text-white" 
                                    />
                                </div>
                            )}
                        </div>

                        {/* Community Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {community.name}
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {community.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <Icon icon="mdi:account-group" className="w-4 h-4 mr-1" />
                                    {community.memberCount} members
                                </span>
                                <span className="flex items-center">
                                    <Icon icon="mdi:calendar" className="w-4 h-4 mr-1" />
                                    Created {new Date(community.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        {community.isOwner ? (
                            <div className="flex space-x-3">
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                    <Icon icon="mdi:cog" className="w-4 h-4 mr-2 inline" />
                                    Manage
                                </button>
                                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                                    <Icon icon="mdi:crown" className="w-4 h-4 mr-2 inline" />
                                    Owner
                                </div>
                            </div>
                        ) : (
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Join Community
                            </button>
                        )}
                    </div>
                </div>

                {/* Community Content */}
                <div className="bg-white rounded-xl shadow-sm border p-8">
                    <div className="text-center py-12">
                        <Icon icon="mdi:forum" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {community.isOwner ? `Manage ${community.name}` : `Welcome to ${community.name}`}
                        </h3>
                        <p className="text-gray-600">
                            {community.isOwner 
                                ? 'Community management features are coming soon. You can invite members and customize your community.'
                                : 'Community features are coming soon. Join now to be notified when we launch!'
                            }
                        </p>
                        {community.isOwner && (
                            <div className="mt-6 flex justify-center space-x-4">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Invite Members
                                </button>
                                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                    Edit Community
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>
        </Layout>
    );
};

export default SimpleCommunityPage;