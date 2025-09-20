import React from 'react';
import { Icon } from '@iconify/react';

const GitHubLink: React.FC = () => {
  const handleGitHubLink = () => {
    // Redirect to GitHub OAuth
    window.location.href = 'http://localhost:6969/oauth/github/callback';
  };

  return (
    <button
      onClick={handleGitHubLink}
      className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
    >
      <Icon icon="mdi:github" className="w-5 h-5 mr-2" />
      Link GitHub Account
    </button>
  );
};

export default GitHubLink;