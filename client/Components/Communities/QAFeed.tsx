import React, { useState, useEffect } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostTypes';
import type {Post} from './PostTypes';
import API from '../../Service/service';

//
interface QAFeedProps { //What props this component expects to receive
    communityId: string, //a string identifying which communities Q&A posts to display
    activeTab: string,
}
//Functional React component that accepts communityId as a prop
const QAFeed: React.FC<QAFeedProps> = ({ communityId, activeTab }) => { //Tells TypeScript this is a React functional component with specific 
    const [posts, setPosts] = useState<Post[]>([]);//Creates state variable posts (array of Post objects) with setter function setPosts
    const [loading, setLoading] = useState(true); //Loading State


    useEffect(() => { //Runs side  effects when component mounts or communityId changes
        setLoading(true);
        const fetchPosts = async () => { //Async function to fetch posts from the API
            try {
                const postsData = await API.getCommunityPosts(communityId, 'qanda'); //Calls API to get posts for this community, filtered by type 'qa'
                setPosts(postsData);
            } catch (error) {
                console.error('Failed to fetch Q&A posts:', error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [communityId]);
    //Function to handle when user creates a new post
    const handlePostCreate = async (postData: any) => { //postData contains the new post information
        if (postData.type !== 'qanda') return; //only process if the post type is 'qa' only
        
        try { //API to create the post in the community
            await API.createCommunityPost(communityId, postData);
            // Refresh posts after creating
            const updatedPosts = await API.getCommunityPosts(communityId, 'qanda');
            setPosts(updatedPosts); //fetch the list of  Q&A posts after creating a new one
        } catch (error) {
            console.error('Failed to create Q&A post:', error);
        }
    };
    //Handles the deletion of a user post
    const handlePostDelete = (postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId)); //Filter creates the new array excluding the post with matching postId
    };

    if (loading) { //Conditional rendering if still loading, show loading UI
        return (
            <div className="space-y-6">
                <CreatePost onPostCreate={handlePostCreate} activeTab={activeTab} />
                <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading Q&A posts...</p>
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
                            API.getCommunityPosts(communityId, 'qanda').then(setPosts).catch(console.error);
                        }}
                        onPostDelete={handlePostDelete}
                    />
                ))
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No Q&A posts yet</p>
                    <p className="text-sm text-gray-400">Be the first to ask a question!</p>
                </div>
            )}
        </div>
    );
};

export default QAFeed;