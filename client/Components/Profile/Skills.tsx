// Skills.tsx
import React from 'react';
import { Icon } from '@iconify/react';

function Skills() {
  // Sample skills data - replace with your actual data
  const skills = [
    {
      id: 1,
      name: "JavaScript",
      endorsements: 12,
      isEndorsedByConnections: true
    },
    {
      id: 2,
      name: "React",
      endorsements: 8,
      isEndorsedByConnections: true
    },
    {
      id: 3,
      name: "Node.js",
      endorsements: 5,
      isEndorsedByConnections: false
    },
    {
      id: 4,
      name: "HTML/CSS",
      endorsements: 10,
      isEndorsedByConnections: true
    },
    {
      id: 5,
      name: "Git",
      endorsements: 7,
      isEndorsedByConnections: false
    }
  ];

  // Only show top 3 skills initially
  const displayedSkills = skills.slice(0, 3);
  const hasMoreSkills = skills.length > 3;

  return (
    <div className="bg-white shadow-md p-4 sm:p-6 w-full sm:rounded-lg mb-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Skills</h2>
        <button className="text-blue-600 hover:text-blue-800">
          <Icon icon="mdi:plus" className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {displayedSkills.map(skill => (
          <div key={skill.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="overflow-hidden">
              <h3 className="font-medium text-gray-900 truncate">{skill.name}</h3>
              <p className="text-gray-500 text-sm">
                {skill.endorsements} endorsement{skill.endorsements !== 1 ? 's' : ''}
                {skill.isEndorsedByConnections && ' • Endorsed by connections'}
              </p>
            </div>
            
            <div className="flex items-center flex-shrink-0">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">
                Endorse
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {hasMoreSkills && (
        <button className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center">
          Show all {skills.length} skills
          <Icon icon="mdi:chevron-down" className="w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );
}

export default Skills;