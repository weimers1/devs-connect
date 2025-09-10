import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useRef } from 'react';
import Privacy from './Content/Privacy';
import Visibility from './Content/Visibility';
import BillingPreferences from './Content/BillingPreferences';
import AccountManagement from './Content/AccountManagement';
import ProfileInfo from './Content/ProfileInfo';
import Display from './Content/Display';
import GeneralPreferences from './Content/GeneralPreferences';

function SettingsContent() {
    return (
        <>
            <div className="md:mt-6 flex flex-col gap-3 md:items-center pb-16">
                <ProfileInfo />
                {/* <Display/> WILL BE IN FUTURE ITERATION*/}
                <GeneralPreferences />
                <Privacy />
                <Visibility />
                <AccountManagement />
                <footer className="text-center">
                    &copy; Sam Weimer & Ethan Mclaughlin
                </footer>
            </div>
        </>
    );
}

export default SettingsContent;
