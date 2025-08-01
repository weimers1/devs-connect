import React, { useRef } from 'react'
import Navbar from '../Navbar/Navbar';
import SettingsNavbar from './SettingsNavbar';
import SettingSidebar from './SettingSidebar';
import SettingsContent from './SettingsContent';

function Settings() {
  const [activeSection, setActiveSection] = React.useState<string | undefined>(undefined);

    const scrollToSection = (sectionId: string) => {
  setActiveSection(sectionId); {/*Ternary Operator To Scroll to the top if its profile-Information, so the UI looks better */}
 sectionId === 'Profile-Information'  ?  document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' }) : document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  

};


  return (
    
    <div className="h-screen overflow-hidden">
      <SettingsNavbar />
      
   
      <div className="grid grid-cols-[300px_1fr] h-[calc(100vh-64px)]">
        {/* sidebar */}
        <div className="overflow-hidden">
          <SettingSidebar activeSection={activeSection} onSelectionClick={scrollToSection} />
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
