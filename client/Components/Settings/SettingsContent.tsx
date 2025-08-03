import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useRef } from 'react'
import AccountPreferences from './Content/AccountPreferences'
import Privacy from './Content/Privacy'
import Visibility from './Content/Visibility'
import BillingPreferences from './Content/BillingPreferences'
import AccountManagement from './Content/AccountManagement'


function SettingsContent() {

    return (
    <>
        <div className="md:mt-6 flex flex-col gap-3 md:items-center pb-16  ">
             <AccountPreferences/>
             <Privacy/>
             <Visibility/>
             <BillingPreferences/>
             <AccountManagement/>
            <footer className='text-center'>&copy; Sam Weimer & Ethan Mclaughlin</footer>
      </div>
      </>
  )
}

export default SettingsContent
