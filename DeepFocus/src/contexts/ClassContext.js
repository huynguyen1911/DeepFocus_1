import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { classAPI } from "../services/api";
import { useRole } from "./RoleContext";

const ClassContext = createContext();

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error("useClass must be used within a ClassProvider");
  }
  return context;
};

export const ClassProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentRole, hasRole } = useRole();

  // Load classes when role changes
  useEffect(() => {
    if (currentRole && (hasRole("teacher") || hasRole("student"))) {
      loadClasses();
    }
  }, [currentRole]);

  // Load classes based on current role
  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (currentRole === "teacher") {
        response = await classAPI.getTeacherClasses();
      } else if (currentRole === "student") {
        response = await classAPI.getStudentClasses();
      } else {
        setClasses([]);
        return;
      }

      if (response?.success) {
        setClasses(response.data || []);
        await AsyncStorage.setItem(
          `classes_${currentRole}`,
          JSON.stringify(response.data)
        );
      }
    } catch (err) {
      console.error("Error loading classes:", err);
      setError(err.message || "Failed to load classes");

      // Try to load from cache
      try {
        const cached = await AsyncStorage.getItem(`classes_${currentRole}`);
        if (cached) {
          setClasses(JSON.parse(cached));
        }
      } catch (cacheErr) {
        console.error("Cache read error:", cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create a new class (Teacher only)
  const createClass = async (classData) => {
    try {
      setError(null);

      if (currentRole !== "teacher") {
        throw new Error("Only teachers can create classes");
      }

      const response = await classAPI.createClass(classData);

      if (response?.success) {
        // Backend returns { data: { class: {...} } }
        const newClass = response.data?.class || response.data;
        console.log("✅ Class created:", newClass._id || newClass.id);
        setClasses((prev) => [newClass, ...prev]);
        return { success: true, class: newClass };
      } else {
        throw new Error(response?.message || "Failed to create class");
      }
    } catch (err) {
      console.error("Error creating class:", err);
      setError(err.message || "Failed to create class");
      return { success: false, error: err.message };
    }
  };

  // Join a class (Student only)
  const joinClass = async (joinCode) => {
    try {
      setError(null);

      if (currentRole !== "student") {
        throw new Error("Only students can join classes");
      }

      const response = await classAPI.joinClass(joinCode);

      if (response?.success) {
        // Reload classes to show the new pending class
        await loadClasses();
        return { success: true, message: response.message };
      } else {
        throw new Error(response?.message || "Failed to join class");
      }
    } catch (err) {
      console.error("Error joining class:", err);
      setError(err.message || "Failed to join class");
      return { success: false, error: err.message };
    }
  };

  // Get class details
  const getClassDetails = async (classId) => {
    try {
      setError(null);

      if (!classId || classId === "undefined") {
        throw new Error("Invalid class ID");
      }

      const response = await classAPI.getClass(classId);

      if (response?.success) {
        console.log(
          "📋 Class details received:",
          JSON.stringify(
            {
              members: response.data?.members?.map((m) => ({
                _id: m._id,
                role: m.role,
                user: {
                  _id: m.user?._id,
                  email: m.user?.email,
                  focusProfile: m.user?.focusProfile,
                },
              })),
            },
            null,
            2
          )
        );
        setCurrentClass(response.data);
        return { success: true, class: response.data };
      } else {
        throw new Error(response?.message || "Failed to get class details");
      }
    } catch (err) {
      console.error("Error getting class details:", err);
      setError(err.message || "Failed to get class details");
      return { success: false, error: err.message };
    }
  };

  // Update class (Teacher only)
  const updateClass = async (classId, updates) => {
    try {
      setError(null);

      if (currentRole !== "teacher") {
        throw new Error("Only teachers can update classes");
      }

      const response = await classAPI.updateClass(classId, updates);

      if (response?.success) {
        // Update in list
        setClasses((prev) =>
          prev.map((c) => (c._id === classId ? { ...c, ...response.data } : c))
        );

        // Update current class if viewing
        if (currentClass?._id === classId) {
          setCurrentClass(response.data);
        }

        return { success: true, class: response.data };
      } else {
        throw new Error(response?.message || "Failed to update class");
      }
    } catch (err) {
      console.error("Error updating class:", err);
      setError(err.message || "Failed to update class");
      return { success: false, error: err.message };
    }
  };

  // Delete class (Teacher only)
  const deleteClass = async (classId) => {
    try {
      setError(null);

      if (currentRole !== "teacher") {
        throw new Error("Only teachers can delete classes");
      }

      const response = await classAPI.deleteClass(classId);

      if (response?.success) {
        // Remove from list
        setClasses((prev) => prev.filter((c) => c._id !== classId));

        // Clear current class if viewing
        if (currentClass?._id === classId) {
          setCurrentClass(null);
        }

        return { success: true };
      } else {
        throw new Error(response?.message || "Failed to delete class");
      }
    } catch (err) {
      console.error("Error deleting class:", err);
      setError(err.message || "Failed to delete class");
      return { success: false, error: err.message };
    }
  };

  // Regenerate join code (Teacher only)
  const regenerateCode = async (classId) => {
    try {
      setError(null);

      const response = await classAPI.regenerateCode(classId);

      if (response?.success) {
        // Update in list
        setClasses((prev) =>
          prev.map((c) =>
            c._id === classId
              ? {
                  ...c,
                  joinCode: response.data.joinCode,
                  joinCodeExpiry: response.data.joinCodeExpiry,
                }
              : c
          )
        );

        // Update current class if viewing
        if (currentClass?._id === classId) {
          setCurrentClass((prev) => ({
            ...prev,
            joinCode: response.data.joinCode,
            joinCodeExpiry: response.data.joinCodeExpiry,
          }));
        }

        return {
          success: true,
          joinCode: response.data.joinCode,
          joinCodeExpiry: response.data.joinCodeExpiry,
        };
      } else {
        throw new Error(response?.message || "Failed to regenerate code");
      }
    } catch (err) {
      console.error("Error regenerating code:", err);
      setError(err.message || "Failed to regenerate code");
      return { success: false, error: err.message };
    }
  };

  // Get class members
  const getMembers = async (classId) => {
    try {
      setError(null);

      const response = await classAPI.getMembers(classId);

      if (response?.success) {
        return {
          success: true,
          approved: response.data.approved,
          pending: response.data.pending,
          total: response.data.total,
        };
      } else {
        throw new Error(response?.message || "Failed to get members");
      }
    } catch (err) {
      console.error("Error getting members:", err);
      setError(err.message || "Failed to get members");
      return { success: false, error: err.message };
    }
  };

  // Approve join request (Teacher only)
  const approveRequest = async (classId, memberId) => {
    try {
      setError(null);

      const response = await classAPI.approveRequest(classId, memberId);

      if (response?.success) {
        return { success: true };
      } else {
        throw new Error(response?.message || "Failed to approve request");
      }
    } catch (err) {
      console.error("Error approving request:", err);
      setError(err.message || "Failed to approve request");
      return { success: false, error: err.message };
    }
  };

  // Reject join request (Teacher only)
  const rejectRequest = async (classId, memberId) => {
    try {
      setError(null);

      const response = await classAPI.rejectRequest(classId, memberId);

      if (response?.success) {
        return { success: true };
      } else {
        throw new Error(response?.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      setError(err.message || "Failed to reject request");
      return { success: false, error: err.message };
    }
  };

  // Remove member (Teacher only)
  const removeMember = async (classId, memberId) => {
    try {
      setError(null);

      const response = await classAPI.removeMember(classId, memberId);

      if (response?.success) {
        return { success: true };
      } else {
        throw new Error(response?.message || "Failed to remove member");
      }
    } catch (err) {
      console.error("Error removing member:", err);
      setError(err.message || "Failed to remove member");
      return { success: false, error: err.message };
    }
  };

  const value = {
    classes,
    currentClass,
    loading,
    error,
    loadClasses,
    createClass,
    joinClass,
    getClassDetails,
    updateClass,
    deleteClass,
    regenerateCode,
    getMembers,
    approveRequest,
    rejectRequest,
    removeMember,
  };

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
};
