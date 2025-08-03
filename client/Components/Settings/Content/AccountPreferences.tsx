 import { Icon } from "@iconify/react/dist/iconify.js"
 import React from 'react'
 
 function AccountPreferences() {
   return (
    <div>
        {/* Profile Information */}
    <div className="bg-white h-54 md:w-200 w-full  md:rounded-xl mt-4 col-start-1 row-start-1">
       <span className="text-2xl font-serif ml-5 mt-2 pt-1 mb-2 flex items-center "> 
        Profile Information
       </span>
            <div className="flex justify-between pt-1 ">
        
        <button className='ml-5 font-sans text-[16px] text-gray-900'>
            Name & Location
        </button>

        <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
         </div>
        <hr className="mt-1 border-gray-200"></hr>
                 <div className="flex justify-between pt-2">
        <button className='ml-5 mt-1 font-sans text-[16px]  text-gray-900'>
            Personal demographic information
        </button>
        <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
         </div>
        <hr className="border-gray-200 mt-1"></hr>
                  <div className="flex justify-between pt-2">
        <button className='ml-5 mt-1 font-sans text-[16px]  text-gray-900'>
                    Verifications
        </button>
        <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
         </div>
           <hr className="border-gray-200 mt-1"></hr>
             <div className="flex justify-between pt-2">
        <button className='ml-5 mt-1 font-sans text-[16px]  text-gray-900'>
                    Certifactions
        </button>
        <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
         </div>
        </div>
         {/*Display */}
                <div className="bg-white h-23 md:w-200 w-full md:rounded-xl col-start-1 row-start-1" id="Display">
                        <span className="text-2xl font-serif ml-5 mt-2 mb-3 flex items-center  "> 
                    Display
               </span>
                          <div className="flex justify-between">
                <button className='ml-5 mt-1A font-sans text-[16px]  text-gray-900'>
                            Color Mode
                </button>
                <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                 </div>
                     </div>
                    {/* General Preferences */}
                                    <div className="bg-white h-98 md:w-200 w-full md:rounded-xl col-start-1 row-start-1" id="General-Preferences">
                                    <span className="text-2xl font-serif ml-5 mt-2 mb-3 flex items-center  "> 
                                General Preferences
                           </span>
                                      <div className="flex justify-between">
                            <button className='ml-5 mt-2 font-sans text-[16px]  text-gray-900'>
                                        Language
                            </button>
                            <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                             </div>
                              <hr className="border-gray-200 mt-1"></hr>
                                    <div className="flex justify-between pt-1">
                            <button className='ml-5 mt-2 font-sans text-[16px]  text-gray-900'>
                                      Time Zone
                            </button>
                            <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                             </div>
                               <hr className="border-gray-200 mt-1"></hr>
                                   <div className="flex justify-between pt-2">
                            <button className='ml-5 mt-2 font-sans text-[16px]  text-gray-900'>
                                     Sound Effects
                            </button>
                            <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                             </div>
                               <hr className="border-gray-200 mt-1"></hr>
                                      <div className="flex justify-between pt-2">
                            <button className='ml-5 mt-2 font-sans text-[16px]  text-gray-900'>
                                     Preferred Feed
                            </button>
                            <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                             </div>
                               <hr className="border-gray-200 mt-1"></hr>
                                  <div className="flex justify-between pt-1 ">
                            <button className='ml-5 mt-2 font-sans text-[16px] text-gray-900'>
                                   Content Filtering
                            </button>
                            <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                             </div>
                                    <hr className="border-gray-200 mt-1"></hr>
                                  <div className="flex justify-between pt-2">
                            <button className='ml-5 mt-2 font-sans text-[16px]  text-gray-900'>
                                  Font and Style
                            </button>
                            <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                             </div>
                               <hr className="border-gray-200 mt-1"></hr>
                              <div className="flex justify-between pt-1 ">
                            <button className='ml-5 mt-2 font-sans text-[16px] text-gray-900'>
                                   Blocked Accounts
                            </button>
                            <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                             </div>
                                   <hr className="border-gray-200 mt-1"></hr>
                              <div className="flex justify-between pt-1 ">
                            <button className='ml-5 mt-2 font-sans text-[16px] text-gray-900'>
                                   Blocked Communities
                            </button>
                            <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                             </div>
                             </div>
    </div>

   )
 }
 
 export default AccountPreferences
 
 