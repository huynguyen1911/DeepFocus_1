import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "../locales/translations";

const LanguageContext = createContext();

const LANGUAGE_STORAGE_KEY = "@deepfocus:app_language";

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("vi"); // Default: Vietnamese
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === "vi" || savedLanguage === "en")) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preview language change WITHOUT saving to AsyncStorage
  // Used in Settings screen to allow undo if user doesn't save
  const setPreviewLanguage = (newLanguage) => {
    if (newLanguage !== "vi" && newLanguage !== "en") {
      console.warn(
        `Unsupported language: ${newLanguage}. Defaulting to Vietnamese.`
      );
      newLanguage = "vi";
    }
    setLanguage(newLanguage);
  };

  // Permanently save language to AsyncStorage
  // Called when user clicks Save in Settings or directly in other contexts
  const changeLanguage = async (newLanguage) => {
    try {
      if (newLanguage !== "vi" && newLanguage !== "en") {
        console.warn(
          `Unsupported language: ${newLanguage}. Defaulting to Vietnamese.`
        );
        newLanguage = "vi";
      }

      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  // Reset language to default (Vietnamese) - called on logout
  const resetLanguage = () => {
    setLanguage("vi");
    console.log("🌐 Language reset to Vietnamese (default)");
  };

  /**
   * Translation function
   * @param {string} key - Dot-notation key (e.g., 'home.title', 'settings.workDuration')
   * @param {object} params - Optional parameters for string interpolation (e.g., {count: 5})
   * @returns {string} - Translated text
   */
  const t = (key, params = {}) => {
    const keys = key.split(".");
    let value = translations[language];

    // Navigate through nested translation object
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Translation missing - log warning and return key as fallback
        console.warn(
          `Translation missing: "${key}" for language "${language}"`
        );
        return key;
      }
    }

    // Handle string interpolation if params provided
    if (typeof value === "string" && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    // Return final translated string
    if (typeof value === "string") {
      return value;
    }

    // If value is not a string (e.g., still an object), return key as fallback
    console.warn(
      `Translation incomplete: "${key}" resolves to non-string value for language "${language}"`
    );
    return key;
  };

  /**
   * Get current language name in native form
   */
  const getLanguageName = () => {
    return language === "vi" ? "Tiếng Việt" : "English";
  };

  /**
   * Check if a specific language is currently active
   */
  const isLanguage = (lang) => {
    return language === lang;
  };

  const value = {
    language,
    changeLanguage,
    setPreviewLanguage,
    resetLanguage,
    t,
    isLoading,
    getLanguageName,
    isLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
