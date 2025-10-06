import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

export interface Post {
    id: number;
    type: 'programming' | 'lfg' | 'qa';
    author: string;
    avatar: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
    tags: string[];
    // Programming post specific
    codeSnippet?: string;
    language?: string;
    // LFG post specific
    projectType?: string;
    skillsNeeded?: string[];
    duration?: string;
    // Q&A post specific
    question?: string;
    isAnswered?: boolean;
    bestAnswer?: string;
}

interface PostCardProps {
    post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const getPostTypeIcon = () => {
        switch (post.type) {
            case 'programming':
                return { icon: 'mdi:code-tags', color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'lfg':
                return { icon: 'mdi:account-group', color: 'text-green-600', bg: 'bg-green-100' };
            case 'qa':
                return { icon: 'mdi:help-circle', color: 'text-purple-600', bg: 'bg-purple-100' };
        }
    };

    const typeInfo = getPostTypeIcon();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            {/* Post Header */}
            <div className="flex items-start space-x-3 mb-4">
                <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{post.author}</h4>
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                            <Icon icon={typeInfo.icon} className="w-3 h-3 mr-1" />
                            {post.type.toUpperCase()}
                        </div>
                        <span className="text-gray-500 text-sm">{post.timestamp}</span>
                    </div>
                    
                    {/* Post Content */}
                    <div className="mb-3">
                        {post.type === 'qa' && post.question && (
                            <div className="mb-3">
                                <h5 className="font-semibold text-gray-900 mb-2">Q: {post.question}</h5>
                                {post.isAnswered && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                                        <div className="flex items-center mb-1">
                                            <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600 mr-1" />
                                            <span className="text-green-800 font-medium text-sm">Best Answer</span>
                                        </div>
                                        <p className="text-green-700 text-sm">{post.bestAnswer}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <p className="text-gray-700">{post.content}</p>
                        
                        {/* Programming Post - Code Snippet */}
                        {post.type === 'programming' && post.codeSnippet && (
                            <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-xs font-medium">{post.language}</span>
                                    <button className="text-gray-400 hover:text-white text-xs">
                                        <Icon icon="mdi:content-copy" className="w-4 h-4" />
                                    </button>
                                </div>
                                <pre className="text-green-400 text-sm font-mono">
                                    <code>{post.codeSnippet}</code>
                                </pre>
                            </div>
                        )}
                        
                        {/* LFG Post - Project Details */}
                        {post.type === 'lfg' && (
                            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <span className="font-medium text-green-800">Project:</span>
                                        <p className="text-green-700">{post.projectType}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-green-800">Duration:</span>
                                        <p className="text-green-700">{post.duration}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-green-800">Skills Needed:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {post.skillsNeeded?.map((skill, index) => (
                                                <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                    
                    {/* Post Actions */}
                    <div className="flex items-center space-x-6 text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <Icon icon="mdi:heart-outline" className="w-4 h-4" />
                            <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <Icon icon="mdi:comment-outline" className="w-4 h-4" />
                            <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <Icon icon="mdi:share-outline" className="w-4 h-4" />
                            <span className="text-sm">Share</span>
                        </button>
                        {post.type === 'lfg' && (
                            <button className="flex items-center space-x-1 hover:text-green-600 transition-colors ml-auto">
                                <Icon icon="mdi:hand-heart" className="w-4 h-4" />
                                <span className="text-sm font-medium">Interested</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;