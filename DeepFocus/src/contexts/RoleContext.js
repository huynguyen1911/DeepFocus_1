import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { roleAPI } from "../services/api";
import { STORAGE_KEYS } from "../config/constants";
import { useAuth } from "./AuthContext";

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [profiles, setProfiles] = useState({
    student: {},
    teacher: {},
    guardian: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Load roles when authentication state changes
  useEffect(() => {
    if (!authLoading) {
      checkAuthAndLoadRoles();
    }
  }, [isAuthenticated, authLoading]);

  const checkAuthAndLoadRoles = async () => {
    try {
      // If not authenticated, set default student role
      if (!isAuthenticated) {
        console.log("⚠️ Not authenticated, using default role");
        setRoles([{ type: "student", isPrimary: true, isActive: true }]);
        setCurrentRole("student");
        setLoading(false);
        return;
      }

      // User is authenticated, load roles from API
      await loadRoles();
    } catch (err) {
      console.error("Error checking auth:", err);
      setRoles([{ type: "student", isPrimary: true, isActive: true }]);
      setCurrentRole("student");
      setLoading(false);
    }
  };

  // Save current role to AsyncStorage whenever it changes
  useEffect(() => {
    if (currentRole) {
      AsyncStorage.setItem("currentRole", currentRole);
    }
  }, [currentRole]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Double-check token before API call
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        console.log("⚠️ No token in loadRoles, skipping API call");
        setRoles([{ type: "student", isPrimary: true, isActive: true }]);
        setCurrentRole("student");
        setLoading(false);
        return;
      }

      // Fetch roles from API
      const response = await roleAPI.getRoles();

      console.log("📥 getRoles response:", JSON.stringify(response, null, 2));

      if (response?.success) {
        const {
          roles: userRoles,
          defaultRole,
          profiles: userProfiles,
        } = response.data;

        setRoles(userRoles);
        setProfiles(userProfiles);

        // Try to load saved role from AsyncStorage, otherwise use default
        const savedRole = await AsyncStorage.getItem("currentRole");
        const roleToSet =
          savedRole && userRoles.find((r) => r.type === savedRole)
            ? savedRole
            : defaultRole;

        setCurrentRole(roleToSet);
      } else {
        const errorMsg = response?.message || "Failed to load roles";
        console.error("❌ API returned error:", errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      // Handle token expiration silently - user will be logged out by AuthContext
      if (
        err.status === 401 ||
        err.message?.includes("Token has expired") ||
        err.message?.includes("token")
      ) {
        console.log("⚠️ Auth error in loadRoles, using default role");
      } else {
        console.error("❌ Error loading roles:", err.message);
        setError(err.message || "Failed to load roles");
      }

      // Set default student role if API fails
      setRoles([{ type: "student", isPrimary: true, isActive: true }]);
      setCurrentRole("student");
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (roleType) => {
    try {
      setError(null);

      // Check if user has this role
      if (!hasRole(roleType)) {
        throw new Error(`You don't have ${roleType} role`);
      }

      // Call API to switch role
      const response = await roleAPI.switchRole(roleType);

      if (response.success) {
        setCurrentRole(roleType);

        // Update roles list with new primary status
        const updatedRoles = roles.map((role) => ({
          ...role,
          isPrimary: role.type === roleType,
        }));
        setRoles(updatedRoles);

        return { success: true };
      } else {
        throw new Error(response.message || "Failed to switch role");
      }
    } catch (err) {
      console.error("Error switching role:", err);
      setError(err.message || "Failed to switch role");
      return { success: false, error: err.message };
    }
  };

  const addRole = async (roleType) => {
    try {
      setError(null);

      // Call API to add role
      const response = await roleAPI.addRole(roleType);

      if (response.success) {
        // Reload roles to get updated data
        await loadRoles();
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to add role");
      }
    } catch (err) {
      console.error("Error adding role:", err);
      setError(err.message || "Failed to add role");
      return { success: false, error: err.message };
    }
  };

  const updateRoleProfile = async (roleType, profileData) => {
    try {
      setError(null);

      // Call API to update profile
      const response = await roleAPI.updateRoleProfile(roleType, profileData);

      if (response.data.success) {
        // Update local profiles state
        setProfiles((prev) => ({
          ...prev,
          [roleType]: response.data.data.profile,
        }));

        return { success: true };
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      return { success: false, error: err.message };
    }
  };

  const removeRole = async (roleType) => {
    try {
      setError(null);

      // Prevent removing current role
      if (currentRole === roleType) {
        throw new Error(
          "Cannot remove current active role. Switch to another role first."
        );
      }

      // Call API to remove role
      const response = await roleAPI.removeRole(roleType);

      if (response.data.success) {
        // Reload roles to get updated data
        await loadRoles();
        return { success: true };
      } else {
        throw new Error(response.data.message || "Failed to remove role");
      }
    } catch (err) {
      console.error("Error removing role:", err);
      setError(err.message || "Failed to remove role");
      return { success: false, error: err.message };
    }
  };

  const hasRole = (roleType) => {
    return roles.some((role) => role.type === roleType && role.isActive);
  };

  const getCurrentProfile = () => {
    if (!currentRole) return null;
    return profiles[currentRole];
  };

  const getPrimaryRole = () => {
    const primaryRole = roles.find((role) => role.isPrimary);
    return primaryRole ? primaryRole.type : null;
  };

  const value = {
    roles,
    currentRole,
    profiles,
    loading,
    error,
    switchRole,
    addRole,
    updateRoleProfile,
    removeRole,
    hasRole,
    getCurrentProfile,
    getPrimaryRole,
    loadRoles,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export default RoleContext;
