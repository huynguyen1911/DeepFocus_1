import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RoleProvider, useRole } from "../contexts/RoleContext";
import { roleAPI } from "../services/api";

// Mock the API
jest.mock("../services/api", () => ({
  roleAPI: {
    getRoles: jest.fn(),
    addRole: jest.fn(),
    switchRole: jest.fn(),
    updateRoleProfile: jest.fn(),
    removeRole: jest.fn(),
  },
}));

describe("RoleContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  const wrapper = ({ children }) => <RoleProvider>{children}</RoleProvider>;

  describe("Initial Load", () => {
    test("should load roles from API on mount", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [
              { type: "student", isPrimary: true, isActive: true },
              { type: "teacher", isPrimary: false, isActive: true },
            ],
            defaultRole: "student",
            profiles: {
              student: { grade: "10th", school: "Test School" },
              teacher: { title: "Mr.", school: "Test School", subject: "Math" },
              guardian: {},
            },
          },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRole(), { wrapper });

      // Initially loading
      expect(result.current.loading).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.roles).toHaveLength(2);
      expect(result.current.currentRole).toBe("student");
      expect(result.current.profiles.student.grade).toBe("10th");
    });

    test("should handle API error gracefully", async () => {
      roleAPI.getRoles.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.roles).toHaveLength(1); // Falls back to default student role
      expect(result.current.currentRole).toBe("student");
    });

    test("should load saved role from AsyncStorage", async () => {
      await AsyncStorage.setItem("currentRole", "teacher");

      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [
              { type: "student", isPrimary: false, isActive: true },
              { type: "teacher", isPrimary: true, isActive: true },
            ],
            defaultRole: "teacher",
            profiles: { student: {}, teacher: {}, guardian: {} },
          },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentRole).toBe("teacher");
    });
  });

  describe("Role Switching", () => {
    test("should switch role successfully", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [
              { type: "student", isPrimary: true, isActive: true },
              { type: "teacher", isPrimary: false, isActive: true },
            ],
            defaultRole: "student",
            profiles: { student: {}, teacher: {}, guardian: {} },
          },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);
      roleAPI.switchRole.mockResolvedValue({
        data: { success: true, data: { roles: mockResponse.data.data.roles } },
      });

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let switchResult;
      await act(async () => {
        switchResult = await result.current.switchRole("teacher");
      });

      expect(switchResult.success).toBe(true);
      expect(result.current.currentRole).toBe("teacher");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "currentRole",
        "teacher"
      );
    });

    test("should not switch to non-existent role", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [{ type: "student", isPrimary: true, isActive: true }],
            defaultRole: "student",
            profiles: { student: {}, teacher: {}, guardian: {} },
          },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let switchResult;
      await act(async () => {
        switchResult = await result.current.switchRole("teacher");
      });

      expect(switchResult.success).toBe(false);
      expect(switchResult.error).toContain("don't have");
    });
  });

  describe("Role Management", () => {
    test("should add new role", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [{ type: "student", isPrimary: true, isActive: true }],
            defaultRole: "student",
            profiles: { student: {}, teacher: {}, guardian: {} },
          },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);
      roleAPI.addRole.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let addResult;
      await act(async () => {
        addResult = await result.current.addRole("teacher");
      });

      expect(addResult.success).toBe(true);
      expect(roleAPI.addRole).toHaveBeenCalledWith("teacher");
    });

    test("should update role profile", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [{ type: "student", isPrimary: true, isActive: true }],
            defaultRole: "student",
            profiles: { student: {}, teacher: {}, guardian: {} },
          },
        },
      };

      const updatedProfile = {
        data: {
          success: true,
          data: { profile: { grade: "11th", school: "New School" } },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);
      roleAPI.updateRoleProfile.mockResolvedValue(updatedProfile);

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const profileData = { grade: "11th", school: "New School" };
      let updateResult;

      await act(async () => {
        updateResult = await result.current.updateRoleProfile(
          "student",
          profileData
        );
      });

      expect(updateResult.success).toBe(true);
      expect(result.current.profiles.student.grade).toBe("11th");
    });
  });

  describe("Helper Methods", () => {
    test("should check if user has role", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [
              { type: "student", isPrimary: true, isActive: true },
              { type: "teacher", isPrimary: false, isActive: true },
            ],
            defaultRole: "student",
            profiles: { student: {}, teacher: {}, guardian: {} },
          },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasRole("student")).toBe(true);
      expect(result.current.hasRole("teacher")).toBe(true);
      expect(result.current.hasRole("guardian")).toBe(false);
    });

    test("should get current profile", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [{ type: "student", isPrimary: true, isActive: true }],
            defaultRole: "student",
            profiles: {
              student: { grade: "10th", school: "Test School" },
              teacher: {},
              guardian: {},
            },
          },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const profile = result.current.getCurrentProfile();
      expect(profile.grade).toBe("10th");
      expect(profile.school).toBe("Test School");
    });

    test("should get primary role", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            roles: [
              { type: "student", isPrimary: true, isActive: true },
              { type: "teacher", isPrimary: false, isActive: true },
            ],
            defaultRole: "student",
            profiles: { student: {}, teacher: {}, guardian: {} },
          },
        },
      };

      roleAPI.getRoles.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRole(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getPrimaryRole()).toBe("student");
    });
  });
});
