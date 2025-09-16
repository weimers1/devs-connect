import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useTheme } from '../../src/ThemeContext';
function SettingsNavbar() {
    const { theme } = useTheme();
    return (
        <>
            <nav
                className={`sticky top-0 z-50 shadow-lg border-b  ${
                    theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white'
                }`}
            >
                <div className="max-w-10xl ml-1 px-4  sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link
                                to="/"
                                className="flex items-center space-x-2"
                            >
                                <img
                                    src={assets.Logo}
                                    className="h-10 w-auto"
                                    alt="DevConnect Logo"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </Link>
                        </div>
                        <div className="ml-0.5">
                            <img
                                alt="Profile"
                                src={assets.Profile}
                                className="w-10 h-10"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </nav>
            <hr></hr>
        </>
    );
}

export default SettingsNavbar;
