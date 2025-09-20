import React, { ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface ProfileCardProps {
  title: string;
  children: ReactNode;
  showAddButton?: boolean;
  className?: string;
}

function ProfileCard({ title, children, showAddButton = true, className = '' }: ProfileCardProps) {
  return (
    <div className={`w-full bg-white sm:rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {showAddButton && (
          <button className="text-blue-600 hover:text-blue-800">
            <Icon icon="mdi:plus" className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
}

export default ProfileCard;