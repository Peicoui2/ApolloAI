import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import App from './App'

const supabase = createClient(
  "https://aflsotbjwhioawqqlpwd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbHNvdGJqd2hpb2F3cXFscHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODQ0NDQsImV4cCI6MjA1NDk2MDQ0NH0.XQW_nwNdORDcWt20XFqiuaTIW88d9303N3UJozKDFe8",
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
