import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';

interface Post {
    id: number;
    userId: number;
    type: string;
    author: string;
    avatar: string | null;
    timestamp: string;
    content: string;
    title?: string;
    communityName: string;
    communityId: number;
    likes: number;
    comments: number;
    isLiked?: boolean;
    codeSnippet?: string;
    language?: string;
    projectType?: string;
    skillsNeeded?: string;
    duration?: string;
    tags?: string[];
}

const Home = () => {
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch('http://localhost:6969/api/communities/feed/home', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('session_token')}`,
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });
                const data = await response.json();
                setUserPosts(data.userPosts || []);
                setSuggestedPosts(data.suggestedPosts || []);
            } catch (error) {
                console.error('Error fetching feed:', error);
                setUserPosts([]);
                setSuggestedPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const PostCard = ({ post, isSuggested = false }: { post: Post; isSuggested?: boolean }) => (
        <div className={`bg-white border shadow-md ${isSuggested ? 'border-blue-300' : 'border-gray-200'} mb-4`}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {post.avatar ? (
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" 
                        onClick={() => navigate(`/profile/${post.userId}`)} style={{ cursor: 'pointer' }}
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {post.author.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-sm"
                         onClick={() => navigate(`/profile/${post.userId}`)} style={{ cursor: 'pointer' }}
                        >{post.author}</p>
                        <p className="text-xs text-gray-500">
                            from{' '}
                            <span 
                                className="text-blue-600 hover:underline cursor-pointer font-medium"
                                onClick={() => navigate(`/community/${post.communityId}`)}
                            >
                                {post.communityName}
                            </span>
                            {' • '}
                            <span className="uppercase font-semibold">{post.type}</span>
                        </p>
                    </div>
                </div>
                {isSuggested && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                        Suggested
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-4 h-64 overflow-hidden">
                {post.title && <h3 className="font-bold text-lg mb-2">{post.title}</h3>}
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed line-clamp-6">{post.content}</p>
                
                {/* Code Snippet */}
                {post.codeSnippet && (
                    <div className="mt-3 bg-gray-900 rounded p-3 overflow-x-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">{post.language || 'code'}</span>
                        </div>
                        <pre className="text-sm text-green-400 font-mono">
                            <code>{post.codeSnippet}</code>
                        </pre>
                    </div>
                )}
                
                {/* LFG Details */}
                {post.type === 'lfg' && (
                    <div className="mt-3 space-y-2">
                        {post.projectType && (
                            <div className="flex items-center text-sm">
                                <span className="font-semibold text-gray-600 mr-2">Project:</span>
                                <span className="text-gray-800">{post.projectType}</span>
                            </div>
                        )}
                        {post.skillsNeeded && (
                            <div className="flex items-center text-sm">
                                <span className="font-semibold text-gray-600 mr-2">Skills:</span>
                                <span className="text-gray-800">{post.skillsNeeded}</span>
                            </div>
                        )}
                        {post.duration && (
                            <div className="flex items-center text-sm">
                                <span className="font-semibold text-gray-600 mr-2">Duration:</span>
                                <span className="text-gray-800">{post.duration}</span>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            {isSuggested ? (
                <div className="px-4 py-3 border-t border-gray-100 bg-blue-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                        </div>
                        <button 
                            onClick={() => navigate(`/community/${post.communityId}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-full transition"
                        >
                            Join to interact
                        </button>
                    </div>
                </div>
            ) : (
                <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center space-x-6 text-gray-600">
                        <button className={`flex items-center space-x-2 transition ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                            <svg className="w-6 h-6" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-blue-500 transition" onClick={() => navigate(`/community/${post.communityId}`)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-sm font-medium">{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-500 transition ml-auto">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Timestamp */}
            <div className="px-4 pb-3">
                <p className="text-xs text-gray-400">{post.timestamp}</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto py-6 px-4 mt-16">
                {/* Your Feed */}
                {userPosts.length > 0 ? (
                    <div className="space-y-0">
                        {userPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-gray-500 mb-2">No posts yet</p>
                        <p className="text-sm text-gray-400">Join some communities to see posts in your feed!</p>
                    </div>
                )}

                {/* Suggested Posts */}
                {suggestedPosts.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-bold mb-4 px-2">Discover More</h2>
                        <div className="space-y-0">
                            {suggestedPosts.map((post) => (
                                <PostCard key={post.id} post={post} isSuggested={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Home;
