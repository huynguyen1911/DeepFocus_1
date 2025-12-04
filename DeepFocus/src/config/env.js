import { Platform } from "react-native";
import Constants from "expo-constants";

// Auto-detect backend URL for development
const getLocalBackendUrl = () => {
  // Get the device's local IP from Expo manifest
  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    // Extract IP from debuggerHost (format: "192.168.x.x:19000")
    const host = debuggerHost.split(":")[0];
    return `http://${host}:5000/api`;
  }

  // Fallback to localhost
  return "http://localhost:5000/api";
};

// Environment configuration
const ENV = {
  development: {
    // Auto-detect API URL based on platform
    API_BASE_URL:
      Platform.OS === "web"
        ? "http://localhost:5000/api"
        : getLocalBackendUrl(),
    TIMEOUT: 30000, // 30 seconds for mobile testing
  },
  production: {
    API_BASE_URL: "https://deepfocus1-production.up.railway.app/api",
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

  // Development mode - auto-detected URL
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
