import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import { useDropdown } from '../DropDown/DropDownContext';
import {UserData} from './Users';
import {AdminDashboardInfo} from './Admin_analytics.tsx';

export function SettingSidebar() {
 const { isNavSideBarSidebarOpen, toggleAdminSidebar } = useDropdown();
 const BackEnd_Admin = [
     {'label': 'Users', 'icon': 'mdi:account-group'},
     {'label': 'Settings', 'icon': 'mdi:cog'},
         {'label': 'Communities', 'icon': 'mdi:cog'},
 ]
const [settingicons, setsettingicons] = useState(false);
const [CurrentStatusValue, setCurrentStatusValue] = useState<string | undefined>();
    //Function That Determines What To Display On The Screen 
 useEffect(() => {
 
    const timer = setTimeout(() => {

       if(isNavSideBarSidebarOpen == true) {
           setsettingicons(true);
       } else if (isNavSideBarSidebarOpen == false) {
           setsettingicons(false);
       }

 }, 325)
     //Function That Determines What To Display On The Screen 

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [isNavSideBarSidebarOpen]);

 return (
          <section className="overflow-hidden absolute left-0 flex ">
               
          <div className="bg-[#1f2937] flex  border-r-2 border-black ">
                    
            <div className={`flex h-screen w-full relative z-50  justify-start  p-4 `}
            >
                
                 <div className="rounded p-2 text-white">
                    
                               <button
                         type="button"
                     
                         onClick={ toggleAdminSidebar }
                        >
                         <Icon icon="mdi:menu"   className={`hover:bg-slate-900 rounded duration-400 ease-in ${
                              isNavSideBarSidebarOpen ? 'ml-50' : 'translate-x-0'
                         }`} width='26 ' />
                                   </button>
                    
                          
                          {settingicons && BackEnd_Admin.map((index) => {
                                
                              return (
                                 <div key={index.label} className="p-4 tab-[12px] justify-items-center text-center   ">
                                  <Icon icon={index.icon} onClick={() => setCurrentStatusValue(index.label.toLowerCase())} width='32' className=" border-rounded hover:bg-slate-900" />
                                  <span className=" font-medium border-rounded hover:bg-slate-900">{index.label} </span>
                                 </div>
                              )
                          }) 
                        }  

                                 </div>                    
                </div>

                    </div>
                    <div className="bg-white">
                        <div className='flex inset-0 h-screen w-screen z-50 bg-slate-900  flex-col gap-2  items-center  '
        style={{
            backgroundColor:'#1f2937'
        }}>
               {CurrentStatusValue === BackEnd_Admin[0].label.toLowerCase() &&  <UserData  />}
               {CurrentStatusValue === BackEnd_Admin[1].label.toLowerCase() &&  <AdminDashboardInfo/>}
               {CurrentStatusValue === BackEnd_Admin[2].label.toLowerCase() &&  <div></div>}
                        </div>
                        </div>
               </section> 
               
              
    )
}
