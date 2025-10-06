import React, { useState } from 'react';
import CreatePost from './CreatePost';
import PostCard, { Post } from './PostTypes';

const QA_POSTS: Post[] = [
    {
        id: 1,
        type: 'qa',
        author: 'Emma Thompson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        timestamp: '1 day ago',
        content: 'I\'ve been struggling with this for hours. Any help would be greatly appreciated!',
        likes: 45,
        comments: 15,
        tags: ['question', 'help'],
        question: 'How do I properly handle async operations in React useEffect?',
        isAnswered: true,
        bestAnswer: 'You should create an async function inside useEffect and call it immediately, or use .then() with promises. Never make useEffect itself async.'
    },
    {
        id: 2,
        type: 'qa',
        author: 'Carlos Martinez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        timestamp: '3 hours ago',
        content: 'I\'m getting this error and can\'t figure out what\'s causing it. Has anyone encountered this before?',
        likes: 12,
        comments: 6,
        tags: ['error', 'debugging'],
        question: 'Why am I getting "Cannot read property of undefined" in my React component?',
        isAnswered: false
    },
    {
        id: 3,
        type: 'qa',
        author: 'Lisa Wang',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        timestamp: '6 hours ago',
        content: 'Looking for best practices and recommendations from the community.',
        likes: 28,
        comments: 11,
        tags: ['bestpractices', 'architecture'],
        question: 'What\'s the best way to structure a large React application?',
        isAnswered: true,
        bestAnswer: 'Use feature-based folder structure, implement proper state management with Context/Redux, and follow component composition patterns. Keep components small and focused.'
    },
    {
        id: 4,
        type: 'qa',
        author: 'Tom Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        timestamp: '2 days ago',
        content: 'New to React and trying to understand the fundamentals. This concept is confusing me.',
        likes: 35,
        comments: 18,
        tags: ['beginner', 'concepts'],
        question: 'What\'s the difference between props and state in React?',
        isAnswered: true,
        bestAnswer: 'Props are read-only data passed from parent to child components. State is mutable data that belongs to a component and can change over time, triggering re-renders when updated.'
    }
];

const QAFeed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(QA_POSTS);

    const handlePostCreate = (postData: any) => {
        if (postData.type !== 'qa') return;
        
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

export default QAFeed;