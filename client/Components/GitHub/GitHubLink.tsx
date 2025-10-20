import React from 'react';
import { Icon } from '@iconify/react';

const GitHubLink: React.FC = () => {
    const handleGitHubLink = () => {
        try {
            const authUrl =
                import.meta.env.VITE_AUTH_URL || 'http://localhost:6969';
            console.log('Auth URL:', authUrl);
            console.log('Final GitHub URL:', `${authUrl}/oauth/github`);
            
            if (!authUrl || typeof authUrl !== 'string') {
                throw new Error('Authentication URL not configured');
            }

            // Validate URL format
            if (!/^https?:\/\/.+/.test(authUrl)) {
                throw new Error('Invalid authentication URL format');
            }

            window.location.href = `${authUrl}/oauth/github`;
        } catch (error) {
            console.error('Navigation failed:', error);
            // Better user feedback without blocking UI
            const errorMsg = document.createElement('div');
            errorMsg.textContent =
                'Failed to redirect to GitHub. Please try again.';
            errorMsg.className =
                'fixed top-4 right-4 bg-red-500 text-white p-3 rounded z-50';
            document.body.appendChild(errorMsg);
            setTimeout(() => errorMsg.remove(), 3000);
        }
    };

    return (
        <button
            onClick={handleGitHubLink}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
            <Icon
                icon="mdi:github"
                className="w-5 h-5 mr-2"
            />
            Link GitHub Account
        </button>
    );
};

export default GitHubLink;
