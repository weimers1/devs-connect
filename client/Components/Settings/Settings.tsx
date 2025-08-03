import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../Navbar/Navbar';
import SettingsNavbar from './SettingsNavbar';
import SettingSidebar from './SettingSidebar';
import SettingsContent from './SettingsContent';

function Settings() {
  const [activeSection, setActiveSection] = React.useState<string | undefined>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'Profile-Information') {
      console.log('Scrolling to Account Preferences', scrollContainerRef.current);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      const container = scrollContainerRef.current;
      if (element && container) {
        const elementTop = element.offsetTop;
        container.scrollTo({ top: elementTop - 20, behavior: 'smooth' });
      }
    }
  };

  return (
    
    <div className="h-screen overflow-hidden">
      <SettingsNavbar />
      
   
      <div className="md:grid md:grid-cols-[300px_1fr] h-[calc(100vh-64px)]">
        {/* sidebar - hidden on mobile */}
        <div className="hidden md:flex">
          <SettingSidebar activeSection={activeSection} onSelectionClick={scrollToSection} />
        </div>
        
        {/* Scrollable content */}
        <div ref={scrollContainerRef} className="overflow-y-auto h-full w-full">
          <SettingsContent />
        </div>
      </div>
    </div>
  )
}


export default Settings;
