import React from 'react'
import Layout from '../Layout';
import UserCard from './UserCard';
import Sidebar from '../Connections/Sidebar';
import Certifications from './Certifactions';
import Skills from './Skills';
import Communities from './ProfileCommunities';

function Profile() {
  return (
    <Layout>
      {/* Main container with full width on mobile */}
      <div className="bg-gradient-to-b  min-h-screen md:mr-7">
        {/* User Profile Card - Full width on mobile */}
        <UserCard />
        
        {/* Profile sections - No spacing between sections on mobile */}
        <div className="divide-y-0 divide-transparent">
          <Skills />
          <Certifications />
          <Communities />
        </div>
        
        {/* Sidebar for desktop only */}
        <div className="hidden lg:block fixed right-4 top-24">
          <Sidebar />
        </div>
      </div>
    </Layout>
  )
}

export default Profile;