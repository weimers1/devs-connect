import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAuthRedirect } from '../Auth/useAuthRedirect';
import API from '../../Service/service';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CreatePostProps {
    onPostCreate: (postData: any) => void,
    activeTab: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreate, activeTab }) => {
    const { requireAuth } = useAuthRedirect();
    const [content, setContent] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const {communityId} = useParams();
    const [notMemberTab, setNotMemberTab] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    //Community Membership 
    const [isMember, setIsMember] = useState(false);

    //UseEffect to determine membership
    useEffect(() => {
        const getMembershipStatus = async() => {
        try{
        const userId = await API.getCurrentUser();
        if(userId && communityId) {
            const membershipStatus = await API.getCommunityMembership(communityId, userId.userId);
            if(membershipStatus.isMember == true) {
                 setIsMember(true);
            } else {
                setIsMember(false);
            }
        }
        } catch(error) {
            console.log("There was an error obtaining the membershipstatus", error);
        }
    }
     getMembershipStatus();
    },[])
    //Handle Post Click - if user is a member, expand the post form, if not show not member tab
    const handlePostClick = () => {
        if(isMember) {
            setIsExpanded(true);
        } else {
            setNotMemberTab(true);
        const timerId = setTimeout(() => {
            setNotMemberTab(false);
        }, 3000)
         return () => clearTimeout(timerId);
        }
        
    }

    //Different Post Types

    const PostTypes = 
    [
    { type: 'posts', icon: 'mdi:code-tags', label: 'Posts', color: 'blue' },
    { type: 'lfg', icon: 'mdi:account-group', label: 'LFG', color: 'green' },
    { type: 'qanda', icon: 'mdi:help-circle', label: 'Q&A', color: 'purple' },
    { type: 'event', icon: 'mdi:calendar', label: 'events', color: 'red' }
    ];

    //Const Times
    const Times = [
        {value: "1:00 am"},
         {value: "2:00 am"},
          {value: "3:00 am"},
           {value: "4:00 am"},
            {value: "5:00 am"},
             {value: "6:00 am"},
              {value: "7:00 am"},
               {value: "8:00 am"},
                {value: "9:00 am"},
                 {value: "10:00 am"},
                  {value: "11:00 am"},
                  {value: "12:00 pm"},
                     {value: "1:00 pm"},
                        {value: "2:00 pm"},
                           {value: "3:00 pm"},
                              {value: "4:00 pm"},
                                 {value: "5:00 pm"},
                                    {value: "6:00 pm"},
                                       {value: "7:00 pm"},
                                          {value: "8:00 pm"},
                                             {value: "9:00 pm"},
                                                {value: "10:00 pm"},
                                                   {value: "11:00 pm"},
                                                   {value: "12:00 am"},


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
    //Events
    const [event, setEvent] = useState('');
    const [Time, setTime] = useState('');
   

    //Min
    const minDate = new Date();
    const maxDate = new Date(2031, 0, 1);

        
    
// Mon Mar 09 2026 20:04:35 GMT-0700 (Pacific Daylight Time)

    const handleSubmit = () => {
        const basePost = {
            type: activeTab.toLowerCase().toString(),  
            content,
            tags: [],
            Time,
            event,
            DateOfEvent: selectedDate
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
            case 'events': 
                postData = {
                    ...postData,
                    content,
                    Time,
                    event,
                    DateOfEvent: selectedDate
                     //Lets see if that works
                }
        }
      
        onPostCreate(postData);
        
        // Reset form
        setContent('');
        setCodeSnippet('');
        setProjectType('');
        setSkillsNeeded('');
        setDuration('');
        setQuestion('');
        setEvent('');
      
        setIsExpanded(false);
   
       

    };
    console.log(Time);
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
                        onClick={() => requireAuth(() => handlePostClick())}
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
                     {activeTab === "events" &&  <p className="font-bold text-black text-xl">Event Topic</p>}
                    <textarea
                        placeholder={
                            activeTab === 'posts' ? "Post an exciting accomplishment or something you learned..." :
                            activeTab === 'lfg' ? "Describe your project and what you're looking for..." :
                            activeTab === "events" ? "What's Your event?"  :
                            "provide more details about your questions..."
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

                        {/* Events WIP */}
                               {activeTab == 'events' && (
                                
                       <div className="mx-4 container mb-4">
  <div className="flex flex-row items-end gap-4 w-full justify-around">
    <div className="flex flex-col">
      <label className="text-xl text-black">Start Date</label>
      <div className="react-datepicker rounded-x md:w-32 md:h-8  ">
        <DatePicker minDate={minDate} maxDate={maxDate} 
        className=" md:w-32 items-center md:h-8 px-6 text-black py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={date => setSelectedDate(date)}
        selected={selectedDate}
        />
      </div>
    </div>
    <div className="flex flex-col">
      <label className="text-xl text-black">Start Time</label>
      <select 
        value={Time}
        onChange={(e) => setTime(e.target.value)} 
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Times.map(option => {
       return <option key={option.value}
        
       >{option.value}</option> 
})}
      </select>
    </div>

  </div>
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
             {notMemberTab && (
                                                <>
                            <div className="fixed bg-gray/20 backdrop-invert backdrop-opacity-20 inset-0 flex items-center justify-center ">
                           
                    <div className="bg-white rounded-xl mb-12 p-6  md:w-90 mx-4">
                          <Icon icon="streamline-plump-color:sad-face-flat" className="mb-2 mx-auto" width="72" height="72" />
                        <h2 className="text-2xl font-bold mb-6 text-center">{`You are not a member of this community, consider joining!`}</h2>
                        <div className="flex flex-col gap-3">
                        </div>
                    </div> 
            
                </div>
                </>
                                )}
        </div>
        
    );
};

export default CreatePost;