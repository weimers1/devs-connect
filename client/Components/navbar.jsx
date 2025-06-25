import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';


const Navbar = () => {
    {/* Mobile Responsive Feature */}
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white border-b border-gray-200 relative">
      <div className="flex items-center justify-between h-20 px-2 sm:px-6 lg:px-8">
        {/* Logo */}
        <img src={assets.Logo} className="w-14 h-15" alt="home" />
        
        {/* Desktop Search Bar */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
          <input 
            type="text" 
            className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none" 
            placeholder="Search...." 
          />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-4">
          <Link className="hover:bg-gray-50 rounded-lg px-3 transition-colors duration-200" to="/home">
            <img src={assets.Home} className="w-9 h-9 ml-1 mt-4" alt="home" />
            <span className="text-black font-medium">Home</span>
          </Link>
          
          <Link className="hover:bg-gray-50 rounded-lg px-3 transition-colors duration-200" to="/communities">
            <img src={assets.Communities} className="w-9 h-9 ml-8 mt-4" alt="communities" />
            <span className="text-black font-medium ml-1">Communities</span>
          </Link>
          
          <Link className="hover:bg-gray-50 rounded-lg px-3 transition-colors duration-200" to="/messages">
            <img src={assets.Message} className="w-10 h-10 ml-5 mt-3" alt="messages" />
            <span className="text-black font-medium ml-1">Messages</span>
          </Link>
          
          {/* For Now Just Hard Coded But in the future we will fetch the user profile from the API */}
          <Link className="hover:bg-gray-50 rounded-lg px-3 transition-colors duration-200" to="/profile">
            <img src={assets.Profile} className="w-11 h-11 rounded-full ml-1 mt-2" alt="profile" />
            <span className="text-black font-medium ml-1">Profile</span>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-2 space-y-2">
            <Link 
              className="block py-2 text-gray-700 hover:bg-gray-100 rounded" 
              to="/home"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              className="block py-2 text-gray-700 hover:bg-gray-100 rounded" 
              to="/communities"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Communities
            </Link>
            <Link 
              className="block py-2 text-gray-700 hover:bg-gray-100 rounded" 
              to="/messages"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Messages
            </Link>
            <Link 
              className="block py-2 text-gray-700 hover:bg-gray-100 rounded" 
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            
            {/* Mobile Search */}
            <div className="pt-2">
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                placeholder="Search...." 
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
