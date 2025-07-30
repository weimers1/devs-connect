import React, { useRef } from 'react'
import Navbar from '../Navbar/Navbar';
import SettingsNavbar from './SettingsNavbar';
import SettingSidebar from './SettingSidebar';
import SettingsContent from './SettingsContent';

function Settings() {


  return (
    
    <div className="h-screen overflow-hidden">
      <SettingsNavbar />
      
   
      <div className="grid grid-cols-[300px_1fr] h-[calc(100vh-64px)]">
        {/* sidebar */}
        <div className="overflow-hidden">
          <SettingSidebar />
        </div>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto">
          <SettingsContent />
        </div>
      </div>
    </div>
  )
}


export default Settings;
