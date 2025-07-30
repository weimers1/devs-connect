import React from 'react'
import { assets } from '../../assets/assets'
import { Icon } from '@iconify/react/dist/iconify.js'

function SettingSidebar() {
  
  const SettingsOptions = [

    {
        link: '',
        icon: '',
        title: '',
    }
  ]

    return (
    
    <div className="bg-white w-80 h-screen pt-8 border-gray-200 sticky top-0">
   
            <div className="flex justify-start ml-3">
                  <Icon className="ml-2.5 mt-3" width="35" height="35" icon ="mdi:cog"></Icon>
                
            <span className="font-semi-bold text-4xl mt-2 ml-3">
                    Settings
            </span>
                
                </div>
                <div className="flex pt-8 justify-start hover:text-blue-700 text-gray-600 ml-6">
                        <Icon icon="mdi:account-card" width="26" height="30" />
                        <span className="ml-6 text-xl mt-0.5">
                                Account Preferences
                            </span>   

                            </div>
                             <div className="flex pt-8 mt-3 justify-start hover:text-blue-700 text-gray-600 ml-5">
                        <Icon icon="dashicons:privacy" width="32" height="32" />
                        <span className="ml-6 text-xl mt-0.5">
                                    Account Privacy 
                            </span>   
                                    
                            </div>
                             <div className="flex pt-8 mt-3 justify-start hover:text-blue-700 focus:outline-2 focus:outline-offset-2 text-gray-600 ml-6">
                       <Icon icon="material-symbols:visibility-outline" width="30" height="30" />
                        <span className="ml-6 text-xl mt-0.5">
                               Profile Visibility 
                            </span>   
                                    
                            </div>
                                 <div className="flex pt-8 mt-3 justify-start hover:text-blue-700 text-gray-600 ml-6">
                            <Icon icon="mage:dollar-fill" width="28" height="28" />
                        <span className="ml-6 text-xl mt-0.5">
                               Billing Preferences
                            </span>   
                                    
                            </div>
                             <div className="flex pt-8 mt-3 justify-start hover:text-blue-700 text-gray-600 ml-6">
                            <Icon icon="ion:notifications-sharp" width="28" height="28" />
                        <span className="ml-6 text-xl mt-0.5">
                               Notifications
                            </span>   
                                    
                            </div>
                            
            </div>
 
  )
}

export default SettingSidebar
