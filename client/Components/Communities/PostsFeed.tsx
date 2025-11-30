import React, { useState, useEffect } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostTypes';
import type {Post} from './PostTypes';
import API from '../../Service/service';

interface PostsFeedProps {
    communityId: string;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ communityId }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsData = await API.getCommunityPosts(communityId, 'programming');
                setPosts(postsData);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [communityId]);

    const handlePostCreate = async (postData: any) => {
        if (postData.type !== 'programming') return;
        
        try {
            await API.createCommunityPost(communityId, postData);
            // Refresh posts after creating
            const updatedPosts = await API.getCommunityPosts(communityId, 'programming');
            setPosts(updatedPosts);
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    const handlePostDelete = (postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <CreatePost onPostCreate={handlePostCreate} />
                <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <CreatePost onPostCreate={handlePostCreate} />
            
            {posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        onPostUpdate={() => {
                            // Refresh posts when interactions happen
                            API.getCommunityPosts(communityId, 'programming').then(setPosts).catch(console.error);
                        }}
                        onPostDelete={handlePostDelete}
                    />
                ))
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No programming posts yet</p>
                    <p className="text-sm text-gray-400">Be the first to share your code!</p>
                </div>
            )}
        </div>
    );
};

export default PostsFeed;