import React, { useState } from 'react';
import CreatePost from './CreatePost';
import PostCard, { Post } from './PostTypes';

const LFG_POSTS: Post[] = [
    {
        id: 1,
        type: 'lfg',
        author: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        timestamp: '5 hours ago',
        content: 'Looking for 2-3 developers to join an exciting e-commerce project. We\'re building a modern marketplace with React, Node.js, and PostgreSQL. Great opportunity to learn and build something amazing together!',
        likes: 18,
        comments: 12,
        tags: ['collaboration', 'project'],
        projectType: 'E-commerce Marketplace',
        skillsNeeded: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
        duration: '3-4 months'
    },
    {
        id: 2,
        type: 'lfg',
        author: 'Jessica Park',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        timestamp: '1 day ago',
        content: 'Starting a mobile app for fitness tracking. Need someone passionate about health tech and React Native. This could turn into something big!',
        likes: 25,
        comments: 8,
        tags: ['mobile', 'startup'],
        projectType: 'Fitness Mobile App',
        skillsNeeded: ['React Native', 'Firebase', 'UI/UX Design'],
        duration: '2-3 months'
    },
    {
        id: 3,
        type: 'lfg',
        author: 'David Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        timestamp: '2 days ago',
        content: 'Open source project for developer productivity tools. Looking for contributors who want to make a difference in the dev community!',
        likes: 42,
        comments: 15,
        tags: ['opensource', 'productivity'],
        projectType: 'Developer Tools',
        skillsNeeded: ['JavaScript', 'Node.js', 'Electron'],
        duration: 'Ongoing'
    }
];

const LFGFeed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(LFG_POSTS);

    const handlePostCreate = (postData: any) => {
        if (postData.type !== 'lfg') return;
        
        const newPost: Post = {
            id: posts.length + 1,
            author: 'You',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            timestamp: 'Just now',
            likes: 0,
            comments: 0,
            ...postData
        };
        setPosts([newPost, ...posts]);
    };

    return (
        <div className="space-y-6">
            <CreatePost onPostCreate={handlePostCreate} />
            
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
};

export default LFGFeed;