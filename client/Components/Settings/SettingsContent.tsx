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
        <div className="mt-6 flex overflow-y-auto flex-col gap-3 items-center">
             <AccountPreferences/>
             <Privacy/>
             <Visibility/>
             <BillingPreferences/>
             <AccountManagement/>
            <footer >&copy; Sam Weimer & Ethan Mclaughlin</footer>
      </div>
      </>
  )
}

export default SettingsContent
