// Communities.tsx
import React from 'react';
import { Icon } from '@iconify/react';

function Communities() {
  // Sample communities data - replace with your actual data
  const communities = [
    {
      id: 1,
      name: "React Developers",
      members: 25430,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
      isAdmin: false
    },
    {
      id: 2,
      name: "JavaScript Enthusiasts",
      members: 42800,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/800px-JavaScript-logo.png",
      isAdmin: true
    },
    {
      id: 3,
      name: "Web Development Professionals",
      members: 78500,
      logo: "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
      isAdmin: false
    }
  ];

  return (
    <div className="bg-white shadow-md p-4 sm:p-6 w-full sm:rounded-lg mt-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Communities</h2>
        <button className="text-blue-600 hover:text-blue-800">
          <Icon icon="mdi:plus" className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {communities.map(community => (
          <div key={community.id} className="flex border-b border-gray-100 pb-4">
            {/* Community Logo */}
            <div className="flex-shrink-0 mr-4">
              <img 
                src={community.logo} 
                alt={community.name} 
                className="w-12 h-12 rounded-md object-contain"
              />
            </div>
            
            {/* Community Info */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900 truncate">{community.name}</h3>
                {community.isAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {community.members.toLocaleString()} members
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex-shrink-0">
              <button className="text-gray-400 hover:text-gray-600">
                <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <button className="text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center">
          Show all communities
          <Icon icon="mdi:chevron-down" className="w-4 h-4 ml-1" />
        </button>
        
        <button className="text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center">
          Discover new
          <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

export default Communities;