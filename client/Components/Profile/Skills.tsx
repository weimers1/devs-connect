// Skills.tsx
import React from 'react';
import { Icon } from '@iconify/react';
import ProfileCard from './ProfileCard'

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
    <ProfileCard title="Skills">
      <div className="space-y-4">
        {displayedSkills.map(skill => (
          <div key={skill.id} className=" rounded-2xl  flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-medium text-gray-900">{skill.name}</h3>
              <p className="text-gray-500 text-sm">
                {skill.endorsements} endorsement{skill.endorsements !== 1 ? 's' : ''}
                {skill.isEndorsedByConnections && ' • Endorsed by connections'}
              </p>
            </div>
            
            <div className="flex items-center">
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
    </ProfileCard>
  );
}

export default Skills;
