import React, { useState, useEffect } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostTypes';
import type {Post} from './PostTypes';
import API from '../../Service/service';

interface LFGFeedProps {
    communityId: string,
    activeTab: string,
}

const LFGFeed: React.FC<LFGFeedProps> = ({ communityId, activeTab }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsData = await API.getCommunityPosts(communityId, 'lfg');
                setPosts(postsData);
            } catch (error) {
                console.error('Failed to fetch LFG posts:', error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [communityId]);

    const handlePostCreate = async (postData: any) => {
        if (postData.type !== 'lfg') return;
        
        try {
            await API.createCommunityPost(communityId, postData);
            // Refresh posts after creating
            const updatedPosts = await API.getCommunityPosts(communityId, 'lfg');
            setPosts(updatedPosts);
        } catch (error) {
            console.error('Failed to create LFG post:', error);
        }
    };

    const handlePostDelete = (postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <CreatePost onPostCreate={handlePostCreate} activeTab={activeTab} />
                <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading LFG posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <CreatePost onPostCreate={handlePostCreate} activeTab={activeTab} />
            
            {posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        onPostUpdate={() => {
                            // Refresh posts when interactions happen
                            API.getCommunityPosts(communityId, 'lfg').then(setPosts).catch(console.error);
                        }}
                        onPostDelete={handlePostDelete}
                    />
                ))
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No LFG posts yet</p>
                    <p className="text-sm text-gray-400">Be the first to start a collaboration!</p>
                </div>
            )}
        </div>
    );
};

export default LFGFeed;