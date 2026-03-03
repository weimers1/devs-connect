import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Create: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Something New</h1>
                    <p className="text-gray-600">Choose what you'd like to create</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        to="/communities/create"
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Icon icon="mdi:account-group" className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 ml-4">Create Community</h3>
                        </div>
                        <p className="text-gray-600">Start a new community for developers to connect and collaborate</p>
                    </Link>

                    <Link
                        to="/communities"
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <Icon icon="mdi:post-outline" className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 ml-4">Create Post</h3>
                        </div>
                        <p className="text-gray-600">Share code, ask questions, or find collaborators in a community</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Create;