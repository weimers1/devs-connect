import React, { ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface ProfileCardProps {
    title: string;
    children: ReactNode;
    showAddButton?: boolean;
    onAddClick?: () => void;
    className?: string;
}

function ProfileCard({
    title,
    children,
    showAddButton = true,
    onAddClick,
    className = '',
}: ProfileCardProps) {
    return (
        <div
            className={`w-full bg-white sm:rounded-lg shadow-md p-4 sm:p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex  items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                {showAddButton && (
                    <button 
                        onClick={onAddClick}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={`Add ${title.toLowerCase()}`}
                    >
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
