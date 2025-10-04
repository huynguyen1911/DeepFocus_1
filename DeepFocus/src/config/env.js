import { Platform } from "react-native";

// Environment configuration
const ENV = {
  development: {
    // Use your computer's IP address instead of localhost for mobile testing
    API_BASE_URL: "http://172.16.1.28:5000/api", // Updated WiFi IP
    // Fallback to localhost for web testing
    API_BASE_URL_FALLBACK: "http://localhost:5000/api",
    TIMEOUT: 30000, // Increase to 30 seconds for mobile testing
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

// Get the correct API URL based on platform
const getApiUrl = () => {
  const currentEnv = getCurrentEnv();

  if (currentEnv === "production") {
    return ENV.production.API_BASE_URL;
  }

  // Development mode
  if (Platform.OS === "web") {
    return ENV.development.API_BASE_URL_FALLBACK; // localhost for web
  }

  // For mobile (iOS/Android), use the computer's network IP
  // Make sure your computer and mobile are on the same WiFi network
  return ENV.development.API_BASE_URL;
};

const currentEnv = getCurrentEnv();

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: ENV[currentEnv].TIMEOUT,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔗 API URL: ${API_CONFIG.BASE_URL}`);

export default {
  API_CONFIG,
  ENV: currentEnv,
  IS_DEV: __DEV__,
};
