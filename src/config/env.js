// Environment configuration
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  },
  // Add other environment variables here as needed
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}; 