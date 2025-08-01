import { Icon } from "@iconify/react/dist/iconify.js"
import React from 'react'

const PrivacyOptions = [
  {
    name: 'Email Address',
    icon: 'si:code-duotone'
  },
  {
    name: 'Phone Numbers',
    icon: 'si:code-duotone'
  },
  {
    name: 'PassKeys',
    icon: 'si:code-duotone'
  }
]

function Privacy() {
  return (
    <div>
      {/* Privacy & Security */} 
               <div className="bg-white h-fit pb-4 rounded-xl w-200 col-start-1 row-start-1" id="Privacy">
                   <span className="text-2xl font-serif ml-5  mb-2 flex items-center  "> 
                  Privacy & Security
                  </span>
                  {PrivacyOptions.map((item, index) => 
                  <>
                    <div key={index} className="flex justify-between pt-2">
                        <button className="ml-5 mt-2 font-sans text-[16px] text-gray-900">
                          {item.name}
                        </button>
                        <Icon icon={item.icon} className="mr-2 mt-1.5"width="22" height="22"></Icon>

                      </div>
                     {index !== PrivacyOptions.length - 1 && <hr className='border-gray-200'></hr>}
                   
                     </>
                  )}
                 
                </div>
    </div>
  )
}

export default Privacy
           
