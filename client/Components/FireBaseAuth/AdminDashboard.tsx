import React from 'react';
import { SettingSidebar } from './Admin_SideBar';
import {AdminDashboardInfo} from './Admin_analytics.tsx';
import { DropdownProvider } from '../DropDown/DropDownContext.tsx';
import {UserData} from "./Users.tsx";


const AdminDashboard = () => {
    return (
        <>
        
        <DropdownProvider>

        <SettingSidebar />
        <AdminDashboardInfo />
        <UserData/> 
       
        </DropdownProvider>
       </>
    );
};

export default AdminDashboard;
