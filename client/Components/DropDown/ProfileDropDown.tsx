// ProfileDropdown.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

function ProfileDropdown() {
  return (
    <div className="absolute  mt-48 ml-100  w-48 bg-white  shadow-lg py-1 rounded-2xl ">
      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        Your Profile
      </Link>
      <Link to="/settings">
          <div className="lock px-4 py-2 flex items-center text-sm text-gray-700 hover:bg-gray-100">
             Settings
         <Icon className="ml-1"icon ="mdi:cog">
            
         </Icon>
         
            </div>
      </Link>
      <hr className="my-1" />
      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        Sign out
      </button>
    </div>
  );
}

export default ProfileDropdown;
