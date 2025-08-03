import { Icon } from "@iconify/react/dist/iconify.js"
import React from 'react'

function BillingPreferences() {
  const BillingOptions = [
    {
      name: 'Upgrade',
      icon: 'si:code-duotone'
    },
    {
      name: 'View Payment History',
      icon: 'si:code-duotone'
    },
    {
      name: 'Billing details',
      icon: 'si:code-duotone'
    }
    
  ]
  return (
    <div>
        {/* Billing Preferences*/}
            <div className="bg-white h-fit pb-4  md:w-200 md:rounded-xl col-start-1 row-start-1"id="Billing">
                   <span className="text-2xl font-serif ml-5   mb-2 flex items-center "> 
                  Payments & Subscriptions
                  </span>
                  {BillingOptions.map((item, index) => (
                        <>
                        <div key={index} className="flex justify-between pt-2">
                          <button className="ml-5 font-sans text-[16px] text-gray-900">
                            {item.name}
                          </button>
                          <Icon icon={item.icon} className="mr-2 mt-1.5" width="22" height="22" />
                        </div>
                           {index !== 2 ?  <hr className='border-gray-200'></hr> : null}
                        </>
                  ))}
                 
                </div> 
    </div>
  )
}

export default BillingPreferences

