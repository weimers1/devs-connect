import { Icon } from "@iconify/react/dist/iconify.js"
import React from 'react'

export default function Visibility() {

  const VisibilityOptions = [
    {
      name: 'Edit Profile',
      icon: 'si:code-duotone'
    },
    {
      name: 'Who can see your profile',
      icon: 'si:code-duotone'
    },
    {
      name: 'Who can see your communities',
      icon: 'si:code-duotone'
    },
    {
      name: 'Who can see your connections',
      icon: 'si:code-duotone'
    },
    {
      name: 'Who can see your associates',
      icon: 'si:code-duotone'
    }
  ]

  return (
    <div>
               {/*Visibility */}  
                   <div className="bg-white h-fit pb-4 md:rounded-xl md:w-200 w-full  col-start-1 row-start-1" id="Visibility">
                   <span className="text-2xl font-serif ml-5  pt-1 mb-2 flex items-center "> 
                  Visibility
                  </span>
                  {VisibilityOptions.map((item, index) => 
                      <>
                      <div key={index} className="flex justify-between pt-2">
                        <button className="ml-5 mt-2 font-sans text-[16px] text-gray-900">
                          {item.name}
                        </button>
                        <Icon icon={item.icon} className="mr-2 mt-1.5" width="22" height="22" />
                      </div>
                      {index !== VisibilityOptions.length - 1 && <hr className='border-gray-200'></hr>}
                      </>
                    
                )}
                
                </div> 
    </div>
  )
}

