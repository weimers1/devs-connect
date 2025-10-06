import React, { useState } from 'react';
import CreatePost from './CreatePost';
import PostCard, { Post } from './PostTypes';

const PROGRAMMING_POSTS: Post[] = [
    {
        id: 1,
        type: 'programming',
        author: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        timestamp: '2 hours ago',
        content: 'Just shipped a new React component library with TypeScript support! Here are some key patterns I learned...',
        likes: 24,
        comments: 8,
        tags: ['typescript', 'components'],
        codeSnippet: `interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};`,
        language: 'typescript'
    },
    {
        id: 2,
        type: 'programming',
        author: 'Alex Kim',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        timestamp: '3 hours ago',
        content: 'Here\'s a clean way to handle form validation in React with custom hooks. This pattern has saved me tons of time!',
        likes: 32,
        comments: 7,
        tags: ['react', 'hooks', 'validation'],
        codeSnippet: `const useFormValidation = (initialState, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (callback) => (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      callback();
    }
  };
  
  return { values, errors, handleChange, handleSubmit };
};`,
        language: 'javascript'
    },
    {
        id: 3,
        type: 'programming',
        author: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        timestamp: '1 day ago',
        content: 'Optimized our React app performance by 40% with these simple techniques. Here\'s what worked best:',
        likes: 67,
        comments: 23,
        tags: ['performance', 'optimization'],
        codeSnippet: `// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);
  
  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} />
      ))}
    </div>
  );
});`,
        language: 'javascript'
    }
];

const PostsFeed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(PROGRAMMING_POSTS);

    const handlePostCreate = (postData: any) => {
        if (postData.type !== 'programming') return;
        
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

export default PostsFeed;