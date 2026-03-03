import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAuthRedirect } from '../Auth/useAuthRedirect';

interface CreatePostProps {
    onPostCreate: (postData: any) => void,
    activeTab: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreate, activeTab }) => {
    const { requireAuth } = useAuthRedirect();
    const [content, setContent] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    
  
 
    //Different Post Types

    const PostTypes = 
    [
    { type: 'posts', icon: 'mdi:code-tags', label: 'Posts', color: 'blue' },
    { type: 'lfg', icon: 'mdi:account-group', label: 'LFG', color: 'green' },
    { type: 'qanda', icon: 'mdi:help-circle', label: 'Q&A', color: 'purple' }
    ];

    

    // Programming post fields
    const [codeSnippet, setCodeSnippet] = useState('');
    const [language, setLanguage] = useState('javascript');

    // LFG post fields
    const [projectType, setProjectType] = useState('');
    const [skillsNeeded, setSkillsNeeded] = useState('');
    const [duration, setDuration] = useState('');

    // Q&A post fields
    const [question, setQuestion] = useState('');
    const handleSubmit = () => {
        const basePost = {
            type: activeTab.toLowerCase().toString(),
            content,
            tags: []
        };

        let postData = { ...basePost };

        switch (activeTab) {
            case 'posts':
                postData = {
                    ...postData,
                    codeSnippet,
                    language,
                    tags: [language, 'code']
                };
                break;
            case 'lfg':
                postData = {
                    ...postData,
                    projectType,
                    skillsNeeded: skillsNeeded.split(',').map(s => s.trim()),
                    duration,
                    tags: ['collaboration', 'project']
                };
                break;
            case 'qanda':
                postData = {
                    ...postData,
                    question,
                    isAnswered: false,
                    tags: ['question', 'help']
                };
                break;
        }
      
        onPostCreate(postData);
        
        // Reset form
        setContent('');
        setCodeSnippet('');
        setProjectType('');
        setSkillsNeeded('');
        setDuration('');
        setQuestion('');
        setIsExpanded(false);
   
       

    };

    return (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
            {!isExpanded ? (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Icon icon="mdi:account" className="w-5 h-5 text-white" />
                    </div>
                    <input
                        type="text"
                        value={''}
                        placeholder="Share something with the community..."
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        onClick={() => requireAuth(() => setIsExpanded(true))}
                        readOnly
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Post Type Selector */}
                    <div className="flex space-x-2">
                        
                        {PostTypes.filter(posttype => posttype.type.toLowerCase() == activeTab.toLowerCase()).map(({ type, icon, label, color }) => (
                            <button
                                
                                key={type}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                           activeTab.toLowerCase()
                                        ? `bg-${color}-100 text-${color}-700 border border-${color}-200`
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`
                                
                            }
                            >
                                
                                <Icon icon={icon} className="w-4 h-4 mr-1" />
                                {label}
                            </button>
                        ))}
                    </div>
                    {/* Q&A Question Field */}
                    {activeTab == 'qanda' && (
                        <input
                            type="text"
                            placeholder="What's your question?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    )}

                    {/* Main Content */}
                    <textarea
                        placeholder={
                            activeTab === 'posts' ? "Post an exciting accomplishment or something you learned..." :
                            activeTab === 'lfg' ? "Describe your project and what you're looking for..." :
                            "Provide more details about your question..."
                        }
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                    />

                    {/* Programming Post Fields */}
                    {activeTab == 'posts' && (
                        <div className="space-y-3">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="react">React</option>
                                <option value="typescript">TypeScript</option>
                                <option value="css">CSS</option>
                                <option value="html">HTML</option>
                            </select>
                            <textarea
                                placeholder="Paste your code here (optional)..."
                                value={codeSnippet}
                                onChange={(e) => setCodeSnippet(e.target.value)}
                                className="w-full bg-gray-900 text-green-400 font-mono text-sm border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                            />
                        </div>
                    ) }

                    {/* LFG Post Fields */}
                    {activeTab === 'lfg' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="Project type (e.g., Web App)"
                                value={projectType}
                                onChange={(e) => setProjectType(e.target.value)}
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Duration (e.g., 2-3 months)"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Skills needed (comma separated)"
                                value={skillsNeeded}
                                onChange={(e) => setSkillsNeeded(e.target.value)}
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => requireAuth(handleSubmit)}
                            disabled={!content.trim() || (activeTab === 'qanda' && !question.trim())}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePost;