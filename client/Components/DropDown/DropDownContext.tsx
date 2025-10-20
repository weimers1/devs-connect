// DropdownContext.tsx
import ProfileDropdown from '../DropDown/ProfileDropDown';
import React, { createContext, useState, useContext, ReactNode } from 'react';

type DropdownContextType = {
    isProfileDropdownOpen: boolean;
    isSidebarOpen: boolean;
    toggleProfileDropdown: () => void;
    toggleSidebar: () => void;
    closeAll: () => void;
};

// Create context with default values
const DropdownContext = createContext<DropdownContextType>({
    isProfileDropdownOpen: false,
    isSidebarOpen: false,
    toggleProfileDropdown: () => {},
    toggleSidebar: () => {},
    closeAll: () => {},
});

type DropdownProviderProps = {
    children: ReactNode;
};

// Create provider component
export const DropdownProvider = ({ children }: DropdownProviderProps) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
        // Close sidebar when profile dropdown opens

        if (!isProfileDropdownOpen) {
            setIsSidebarOpen(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        // Close profile dropdown when sidebar opens
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
                toggleProfileDropdown,
                toggleSidebar,
                closeAll,
            }}
        >
            {children}
        </DropdownContext.Provider>
    );
};

// Custom hook to use the context
export const useDropdown = () => useContext(DropdownContext);
