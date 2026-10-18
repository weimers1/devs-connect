import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import API from '../Service/service';
import { useAuthRedirect } from './Auth/useAuthRedirect';
import { useLanguage } from '../src/i18n/LanguageContext';
import ProjectCard from './Projects/ProjectCard';
import type { Project } from './Projects/ProjectCard';

type FeedItem =
    | { kind: 'post'; post: Post }
    | { kind: 'project'; project: Project };

interface Post {
    id: number;
    userId: number;
    publicId: string;
    type: string;
    author: string;
    avatar: string | null;
    timestamp: string;
    content: string;
    title?: string;
    communityName: string;
    communityId: string | number;
    likes: number;
    comments: number;
    isLiked?: boolean;
    isSaved?: boolean;
    codeSnippet?: string;
    language?: string;
    projectType?: string;
    skillsNeeded?: string;
    duration?: string;
    tags?: string[];
}

const Home = () => {
    const [userPosts, setUserPosts] = useState<FeedItem[]>([]);
    const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [feedError, setFeedError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useLanguage();

    const updateFeedPost = (postId: number, update: (post: Post) => Post) => {
        setUserPosts((items) =>
            items.map((item) =>
                item.kind === 'post' && item.post.id === postId
                    ? { kind: 'post', post: update(item.post) }
                    : item,
            ),
        );
        setSuggestedPosts((posts) =>
            posts.map((post) => (post.id === postId ? update(post) : post)),
        );
    };

    const { requireAuth } = useAuthRedirect();

    const handleLike = (post: Post) => {
        requireAuth(async () => {
            try {
                const result = await API.likePost(String(post.id));
                updateFeedPost(post.id, (currentPost) => ({
                    ...currentPost,
                    isLiked: result.liked,
                    likes: Math.max(0, currentPost.likes + (result.liked ? 1 : -1)),
                }));
            } catch (error) {
                console.error('Failed to like feed post:', error);
            }
        });
    };

    const handleSave = (post: Post) => {
        requireAuth(async () => {
            try {
                const result = await API.toggleSavedPost(String(post.id));
                updateFeedPost(post.id, (currentPost) => ({
                    ...currentPost,
                    isSaved: result.saved,
                }));
            } catch (error) {
                console.error('Failed to save feed post:', error);
            }
        });
    };

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        const fetchFeed = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:6969'}/api/communities/feed/home`, {
                    headers: {
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch home feed (${response.status})`);
                }
                const data = await response.json();
                if (!Array.isArray(data.userPosts) || !Array.isArray(data.suggestedPosts)) {
                    throw new Error('Invalid home feed response');
                }
                if (active) {
                    setUserPosts(
                        Array.isArray(data.feed)
                            ? data.feed
                            : data.userPosts.map((post: Post) => ({ kind: 'post', post })),
                    );
                    setSuggestedPosts(data.suggestedPosts);
                    setFeedError(null);
                }
            } catch (error) {
                if (!active) return;
                console.error('Error fetching feed:', error);
                setUserPosts([]);
                setSuggestedPosts([]);
                setFeedError('feed-error');
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchFeed();
        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    const PostCard = ({ post, isSuggested = false }: { post: Post; isSuggested?: boolean }) => (
        <div className={`bg-white border shadow-md ${isSuggested ? 'border-blue-300' : 'border-gray-200'} mb-4`}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {post.avatar ? (
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" 
                        onClick={() => post.publicId && navigate(`/profile/${post.publicId}`)} style={{ cursor: 'pointer' }}
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {post.author.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-sm"
                         onClick={() => post.publicId && navigate(`/profile/${post.publicId}`)} style={{ cursor: 'pointer' }}
                        >{post.author}</p>
                        <p className="text-xs text-gray-500">
                            {t('home.from')}{' '}
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
                        {t('home.suggested')}                    </span>
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
                                <span className="font-semibold text-gray-600 mr-2">{t('home.project')}</span>
                                <span className="text-gray-800">{post.projectType}</span>
                            </div>
                        )}
                        {post.skillsNeeded && (
                            <div className="flex items-center text-sm">
                                <span className="font-semibold text-gray-600 mr-2">{t('home.skills')}</span>
                                <span className="text-gray-800">{post.skillsNeeded}</span>
                            </div>
                        )}
                        {post.duration && (
                            <div className="flex items-center text-sm">
                                <span className="font-semibold text-gray-600 mr-2">{t('home.duration')}</span>
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
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleSave(post)}
                                className={`flex items-center gap-1 text-sm ${post.isSaved ? 'text-blue-700' : 'text-gray-600 hover:text-blue-700'}`}
                                aria-label={post.isSaved ? t('home.unsavePost') : t('home.savePost')}
                            >
                                <svg className="w-5 h-5" fill={post.isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                {post.isSaved ? t('home.saved') : t('home.save')}
                            </button>
                            <button
                                onClick={() => navigate(`/community/${post.communityId}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-full transition"
                            >
                                {t('home.joinToInteract')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center space-x-6 text-gray-600">
                        <button
                            onClick={() => handleLike(post)}
                            className={`flex items-center space-x-2 transition ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                            aria-label={post.isLiked ? t('home.unlikePost') : t('home.likePost')}
                        >
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
                        <button
                            onClick={() => handleSave(post)}
                            className={`flex items-center space-x-2 transition ml-auto ${post.isSaved ? 'text-blue-600' : 'hover:text-blue-500'}`}
                            aria-label={post.isSaved ? t('home.unsavePost') : t('home.savePost')}
                        >
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
                {feedError ? (
                    <div className="bg-white rounded-lg border border-red-200 p-8 text-center" role="alert">
                        <p className="text-red-600">{t('home.feedError')}</p>
                    </div>
                ) : userPosts.length > 0 ? (
                    <div className="space-y-0">
                        {userPosts.map((item) =>
                            item.kind === 'post' ? (
                                <PostCard key={`post-${item.post.id}`} post={item.post} />
                            ) : (
                                <div key={`project-${item.project.id}`} className="mb-4">
                                    <ProjectCard project={item.project} showFeedBadge />
                                </div>
                            ),
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-gray-500 mb-2">{t('home.noPosts')}</p>
                                                <p className="text-sm text-gray-400">{t('home.noPostsHint')}</p>
                    </div>
                )}

                {/* Suggested Posts */}
                {suggestedPosts.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-bold mb-4 px-2">{t('home.discoverMore')}</h2>
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
