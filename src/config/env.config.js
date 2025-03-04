export const config = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  // Add other environment variables here
};

// Validate environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];
requiredEnvVars.forEach(envVar => {
  if (!config[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});