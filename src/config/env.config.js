export const config = {
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    PUBLIC_SUPABASE_URL: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    GOOGLE_CALENDAR_ID: import.meta.env.VITE_GOOGLE_CALENDAR_ID,
    MEET_DURATION: import.meta.env.VITE_MEET_DURATION || 60,
};

// Validate environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY','GOOGLE_CALENDAR_ID'];
requiredEnvVars.forEach(envVar => {
  if (!config[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});