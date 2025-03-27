import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import App from './App'
import { config } from './config/env.config.js'

export const supabase = createClient(
config.PUBLIC_SUPABASE_URL,  config.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: true
    }
  }
)

const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </StrictMode>
)
