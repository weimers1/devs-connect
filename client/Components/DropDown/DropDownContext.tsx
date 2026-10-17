// DropdownContext.tsx
import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

type DropdownContextType = {
    isProfileDropdownOpen: boolean;
    isSidebarOpen: boolean;
    isNavSideBarSidebarOpen: boolean;
    // togglemetrics: boolean,
    toggleProfileDropdown: () => void;
    toggleSidebar: () => void;
    closeAll: () => void;
    toggleAdminSidebar: () => void;
   
};

// Create context with default values
const DropdownContext = createContext<DropdownContextType>({
    isProfileDropdownOpen: false,
    isSidebarOpen: false,
     isNavSideBarSidebarOpen: false,
// togglemetrics: false,     
    toggleProfileDropdown: () => {},
    toggleSidebar: () => {},
    closeAll: () => {},
    toggleAdminSidebar: () => {},
  
});

type DropdownProviderProps = {
    children: ReactNode;
};

// Create provider component
export const DropdownProvider = ({ children }: DropdownProviderProps) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNavSideBarSidebarOpen, setIsNavSideBarSidebarOpen] = useState(false);
    // const [togglemetrics, settogglemetrics] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
        // Close sidebar when profile dropdown opens

        if (!isProfileDropdownOpen) {
            setIsSidebarOpen(false);
        }
    };
    const toggleAdminSidebar = () => {
    setIsNavSideBarSidebarOpen(!isNavSideBarSidebarOpen);
       
  
    }
        
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        // Close profile dropdown when sidebar opens
        // Debugging line
        if (!isSidebarOpen) {
            setIsProfileDropdownOpen(false);
        }
    };

    const closeAll = () => {
        setIsProfileDropdownOpen(false);
        setIsSidebarOpen(false);
    };

    return (
        <DropdownContext.Provider
            value={{
                isProfileDropdownOpen,
                isSidebarOpen,
                isNavSideBarSidebarOpen,
                toggleProfileDropdown,
                toggleSidebar,
                closeAll,
                toggleAdminSidebar,
                // togglemetrics
            
                
            }}
        >
            {children}
        </DropdownContext.Provider>
    );
};

// Custom hook to use the context
export const useDropdown = () => useContext(DropdownContext);
