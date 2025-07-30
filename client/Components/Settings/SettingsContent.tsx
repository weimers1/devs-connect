import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useRef } from 'react'

function SettingsContent() {
    const section1Ref = useRef(null);
    const section2Ref =useRef(null);
    const section3Ref = useRef(null);

  
  const Options = [
      {
        name: "Profile Information",

      }
  ]

  return (
    <>
        <div className="flex overflow-y-auto flex-col gap-3 items-center">
              {/* Profile Information */}
    <div className="bg-white h-45 w-200 rounded-xl mt-4 col-start-1 row-start-1 ">
       <span className="text-2xl font-serif ml-5 mt-2 mb-3 flex items-center" id="section1" ref={section1Ref}> 
        Profile Information
       </span>
            <div className="flex justify-between pt-1 ">
        
        <button className='ml-5 font-sans text-[16px] text-gray-900'>
            Name, Location, and 
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
      
        </div>
          {/*Display */}
        <div className="bg-white h-23 w-200 rounded-xl col-start-1 row-start-1">
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
                <div className="bg-white h-80 w-200 rounded-xl col-start-1 row-start-1">
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
             </div>
            <div className="bg-white h-35 rounded-xl w-200 col-start-1 row-start-1">
                   <span className="text-2xl font-serif ml-5 mt-2 mb-3 flex items-center  "> 
                  Payments and Subscriptions
                  </span>
                  <div className="flex justify-between pt-2">
                  <button className="ml-5 mt-2 font-sans text-[16px] text-gray-900">
                      Upgrade for free
                  </button>
                    <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                    
                  </div>
                  <hr className='border-gray-200'></hr>
                   <div className="flex justify-between pt-2">
                  <button className="ml-5 mt-2 font-sans text-[16px] text-gray-900">
                     View Payment History
                  </button>
                    <Icon icon="si:code-duotone" className="mr-2 mt-1.5" width="22" height="22" />
                    
                  </div>
                
                 
                </div> 
                     <div className="bg-white h-80 rounded-xl w-200 col-start-1 row-start-1">
                      
                </div> 
                 <div className="bg-white h-80 rounded-xl w-200 col-start-1 row-start-1">

                </div> 
                 <div className="bg-white h-80 rounded-xl w-200 col-start-1 row-start-1">

                </div> 
                 <div className="bg-white h-80 rounded-xl w-200 col-start-1 row-start-1">

                </div> 

        </div>
        </>
  )
}

export default SettingsContent
