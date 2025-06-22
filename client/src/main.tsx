import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StytchProvider } from '@stytch/react'
import { StytchUIClient } from '@stytch/vanilla-js'
import './index.css'
import App from './App.tsx'

const stytch = new StytchUIClient(import.meta.env.VITE_STYTCH_PUBLIC_TOKEN)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StytchProvider stytch={stytch}>
      <App />
    </StytchProvider>
  </StrictMode>,
)
