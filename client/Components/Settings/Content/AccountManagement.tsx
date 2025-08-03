import { Icon } from "@iconify/react/dist/iconify.js"
    {/* Account Management*/}
import React from 'react'

const Management = [
  {
    name: 'Delete Account',
    icon: 'si:code-duotone'
  },
  {
    name: 'Logout',
    icon: 'si:code-duotone'
  }
]

function AccountManagement() {
  return (
    <div className="bg-white h-fit pb-4 md:rounded-xl col-start-1 w-full  md:w-200 row-start-1" id="Management">
                      <span className="text-2xl font-serif ml-5   pt-1 mb-2 flex items-center ">
                          Account Management
                        </span>
                     {Management.map((item, index) => (
                        <>
                        <div key={index} className="flex justify-between pt-2 ">
                          <button className="ml-5 font-sans text-[16px] text-gray-900">
                            {item.name}
                          </button>
                          <Icon icon={item.icon} className="mr-2 mt-1.5" width="22" height="22" />
                        </div>
                           {index !== 1 ?  <hr className='border-gray-200'></hr> : null}
                        </>
                     ))}
                       
                </div>
  )
}

export default AccountManagement;
