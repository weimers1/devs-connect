// ProfileDropdown.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

function ProfileDropdown() {
  return (
    <div className="absolute  mt-48 ml-100  w-48 bg-white  shadow-lg py-1 rounded-2xl ">
      <Link to="/profile" className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-2xl">
        Your Profile
        <Icon className="ml-1" icon="material-symbols-light:accessible-forward-rounded" width="20" height="20" />
      </Link>
      <Link to="/settings">
          <div className="lock px-4 py-2 flex items-center text-sm text-gray-700 hover:bg-gray-100 rounded-2xl">
             Settings
         <Icon className="ml-1"icon ="mdi:cog">
            
         </Icon>
         
            </div>
      </Link>
     
      <hr className="my-1" />

      <button className="w-full flex justify-items-center text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100  rounded-2xl">
        Sign out
            <Icon className="ml-2" icon="icon-park:glasses" width="20" height="20" />
      </button>


    
    </div>
  );
}

export default ProfileDropdown;
