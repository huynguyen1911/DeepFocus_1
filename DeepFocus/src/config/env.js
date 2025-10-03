// Environment configuration
const ENV = {
  development: {
    // Use your computer's IP address instead of localhost for mobile testing
    API_BASE_URL: "http://192.168.1.58:5000/api",
    // Fallback to localhost for web testing
    API_BASE_URL_FALLBACK: "http://localhost:5000/api",
    TIMEOUT: 10000,
  },
  production: {
    API_BASE_URL: "https://your-production-api.com/api",
    TIMEOUT: 15000,
  },
};

// Get current environment
const getCurrentEnv = () => {
  // In development, always use development config
  return __DEV__ ? "development" : "production";
};

const currentEnv = getCurrentEnv();

export const API_CONFIG = {
  BASE_URL: ENV[currentEnv].API_BASE_URL,
  TIMEOUT: ENV[currentEnv].TIMEOUT,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export default {
  API_CONFIG,
  ENV: currentEnv,
  IS_DEV: __DEV__,
};
