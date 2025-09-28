import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage service for handling local data
 */
class StorageService {
  /**
   * Store data with key
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  static async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error storing data:", error);
      throw error;
    }
  }

  /**
   * Get data by key
   * @param {string} key - Storage key
   * @returns {any} Stored value
   */
  static async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error retrieving data:", error);
      throw error;
    }
  }

  /**
   * Remove data by key
   * @param {string} key - Storage key
   */
  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data:", error);
      throw error;
    }
  }

  /**
   * Clear all stored data
   */
  static async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }

  /**
   * Get all keys
   * @returns {string[]} Array of keys
   */
  static async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error("Error getting keys:", error);
      throw error;
    }
  }
}

export default StorageService;
