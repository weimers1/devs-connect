import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import API from '../../Service/service';
import { useAuthRedirect } from '../Auth/useAuthRedirect';

export interface Post {
    id: number;
    userId?: number;
    type: 'programming' | 'lfg' | 'qa';
    author: string;
    avatar: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
    tags: string[];
    canDelete?: boolean;
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
    onPostUpdate?: () => void;
    onPostDelete?: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdate, onPostDelete }) => {
    const navigate = useNavigate();
    const { requireAuth } = useAuthRedirect();
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(post.likes || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    
    const handleProfileClick = async () => {
        if (!post.userId) return;
        
        try {
            const currentUser = await API.getCurrentUser();
            if (post.userId.toString() === currentUser.id.toString()) {
                navigate('/profile');
            } else {
                navigate(`/profile/${post.userId}`);
            }
        } catch (error) {
            console.error('Failed to get current user:', error);
            // Fallback to other user profile
            navigate(`/profile/${post.userId}`);
        }
    };

    const handleLike = async () => {
        requireAuth(async () => {
            try {
                const result = await API.likePost(post.id.toString());
                setIsLiked(result.liked);
                setLikes(prev => result.liked ? prev + 1 : prev - 1);
            } catch (error) {
                console.error('Failed to like post:', error);
            }
        });
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;
        
        requireAuth(async () => {
            try {
                await API.commentOnPost(post.id.toString(), newComment);
                setNewComment('');
                loadComments();
                onPostUpdate?.();
            } catch (error) {
                console.error('Failed to comment:', error);
            }
        });
    };

    const handleInterest = async () => {
        requireAuth(async () => {
            try {
                await API.expressInterest(post.id.toString());
                loadComments();
                onPostUpdate?.();
            } catch (error) {
                console.error('Failed to express interest:', error);
            }
        });
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        
        try {
            await API.deletePost(post.id.toString());
            onPostDelete?.(post.id);
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    const loadComments = async () => {
        if (loadingComments) return;
        
        setLoadingComments(true);
        try {
            const commentsData = await API.getPostComments(post.id.toString());
            setComments(commentsData);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
        if (!showComments && comments.length === 0) {
            loadComments();
        }
    };
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
                <button onClick={handleProfileClick}>
                    <img
                        src={post.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=random`}
                        alt={post.author}
                        className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                    />
                </button>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={handleProfileClick}
                                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                                {post.author}
                            </button>
                            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                                <Icon icon={typeInfo.icon} className="w-3 h-3 mr-1" />
                                {post.type.toUpperCase()}
                            </div>
                            <span className="text-gray-500 text-sm">{post.timestamp}</span>
                        </div>
                        {post.canDelete && (
                            <button 
                                onClick={handleDelete}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete post"
                            >
                                <Icon icon="mdi:delete" className="w-4 h-4" />
                            </button>
                        )}
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
                        <button 
                            onClick={handleLike}
                            className={`flex items-center space-x-1 transition-colors ${
                                isLiked ? 'text-red-600' : 'hover:text-red-600'
                            }`}
                        >
                            <Icon icon={isLiked ? "mdi:heart" : "mdi:heart-outline"} className="w-4 h-4" />
                            <span className="text-sm">{likes}</span>
                        </button>
                        <button 
                            onClick={toggleComments}
                            className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                            <Icon icon="mdi:comment-outline" className="w-4 h-4" />
                            <span className="text-sm">{comments.length || post.comments || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <Icon icon="mdi:share-outline" className="w-4 h-4" />
                            <span className="text-sm">Share</span>
                        </button>
                        {post.type === 'lfg' && (
                            <button 
                                onClick={handleInterest}
                                className="flex items-center space-x-1 hover:text-green-600 transition-colors ml-auto"
                            >
                                <Icon icon="mdi:hand-heart" className="w-4 h-4" />
                                <span className="text-sm font-medium">Interested</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Comments Section */}
                    {showComments && (
                        <div className="mt-4 border-t pt-4">
                            {/* Add Comment */}
                            <div className="flex space-x-3 mb-4">
                                <img
                                    src="https://ui-avatars.com/api/?name=You&background=random"
                                    alt="You"
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onFocus={() => requireAuth()}
                                        placeholder="Write a comment..."
                                        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={2}
                                    />
                                    <button
                                        onClick={handleComment}
                                        disabled={!newComment.trim()}
                                        className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Comment
                                    </button>
                                </div>
                            </div>
                            
                            {/* Comments List */}
                            {loadingComments ? (
                                <div className="text-center py-4">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map((comment, index) => (
                                        <div key={index} className="flex space-x-3">
                                            <img
                                                src={comment.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=random`}
                                                alt={comment.author}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium text-sm">{comment.author}</span>
                                                    <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard;