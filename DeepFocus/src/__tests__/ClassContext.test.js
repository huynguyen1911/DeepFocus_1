import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClassProvider, useClass } from "../ClassContext";
import { classAPI } from "../../services/api";

// Mock dependencies
jest.mock("../../services/api");
jest.mock("../RoleContext", () => ({
  useRole: () => ({
    currentRole: "teacher",
    hasRole: jest.fn((role) => role === "teacher"),
  }),
}));

// Test component to access context
const TestComponent = ({ onRender }) => {
  const classContext = useClass();
  React.useEffect(() => {
    if (onRender) onRender(classContext);
  }, [classContext, onRender]);
  return null;
};

describe("ClassContext Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe("loadClasses", () => {
    test("should load teacher classes successfully", async () => {
      const mockClasses = [
        {
          _id: "class1",
          name: "Math 101",
          members: [],
          createdBy: "teacher1",
        },
        {
          _id: "class2",
          name: "Science 101",
          members: [],
          createdBy: "teacher1",
        },
      ];

      classAPI.getTeacherClasses.mockResolvedValue({
        success: true,
        data: { classes: mockClasses },
      });

      let contextValue;
      const { rerender } = render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.classes).toEqual(mockClasses);
        expect(contextValue.loading).toBe(false);
      });

      expect(classAPI.getTeacherClasses).toHaveBeenCalled();
    });

    test("should handle load error and fallback to cache", async () => {
      const cachedClasses = [
        { _id: "cached1", name: "Cached Class", members: [] },
      ];

      await AsyncStorage.setItem(
        "classes_teacher",
        JSON.stringify(cachedClasses)
      );

      classAPI.getTeacherClasses.mockRejectedValue(new Error("Network error"));

      let contextValue;
      render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.classes).toEqual(cachedClasses);
        expect(contextValue.error).toBeTruthy();
      });
    });
  });

  describe("createClass", () => {
    test("should create class successfully", async () => {
      const newClassData = {
        name: "New Class",
        description: "Test Description",
      };

      const createdClass = {
        _id: "newclass1",
        ...newClassData,
        joinCode: "ABC123",
      };

      classAPI.getTeacherClasses.mockResolvedValue({
        success: true,
        data: { classes: [] },
      });

      classAPI.createClass.mockResolvedValue({
        success: true,
        data: { class: createdClass },
      });

      let contextValue;
      render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.loading).toBe(false);
      });

      let result;
      await act(async () => {
        result = await contextValue.createClass(newClassData);
      });

      expect(result.success).toBe(true);
      expect(result.class).toEqual(createdClass);
      expect(contextValue.classes).toContainEqual(createdClass);
    });

    test("should fail if not teacher", async () => {
      // Mock non-teacher role
      jest.doMock("../RoleContext", () => ({
        useRole: () => ({
          currentRole: "student",
          hasRole: jest.fn((role) => role === "student"),
        }),
      }));

      classAPI.getStudentClasses.mockResolvedValue({
        success: true,
        data: { classes: [] },
      });

      let contextValue;
      render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.loading).toBe(false);
      });

      let result;
      await act(async () => {
        result = await contextValue.createClass({ name: "Test" });
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Only teachers");
    });
  });

  describe("joinClass", () => {
    test("should join class successfully", async () => {
      // Mock student role for join test
      jest.doMock("../RoleContext", () => ({
        useRole: () => ({
          currentRole: "student",
          hasRole: jest.fn((role) => role === "student"),
        }),
      }));

      classAPI.getStudentClasses.mockResolvedValue({
        success: true,
        data: { classes: [] },
      });

      classAPI.joinClass.mockResolvedValue({
        success: true,
        message: "Join request sent successfully",
      });

      let contextValue;
      render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.loading).toBe(false);
      });

      let result;
      await act(async () => {
        result = await contextValue.joinClass("ABC123");
      });

      expect(result.success).toBe(true);
      expect(classAPI.joinClass).toHaveBeenCalledWith("ABC123");
    });
  });

  describe("member management", () => {
    test("should approve join request successfully", async () => {
      classAPI.getTeacherClasses.mockResolvedValue({
        success: true,
        data: { classes: [] },
      });

      classAPI.approveRequest.mockResolvedValue({
        success: true,
      });

      let contextValue;
      render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.loading).toBe(false);
      });

      let result;
      await act(async () => {
        result = await contextValue.approveRequest("class1", "student1");
      });

      expect(result.success).toBe(true);
      expect(classAPI.approveRequest).toHaveBeenCalledWith(
        "class1",
        "student1"
      );
    });

    test("should reject join request successfully", async () => {
      classAPI.getTeacherClasses.mockResolvedValue({
        success: true,
        data: { classes: [] },
      });

      classAPI.rejectRequest.mockResolvedValue({
        success: true,
      });

      let contextValue;
      render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.loading).toBe(false);
      });

      let result;
      await act(async () => {
        result = await contextValue.rejectRequest("class1", "student1");
      });

      expect(result.success).toBe(true);
      expect(classAPI.rejectRequest).toHaveBeenCalledWith("class1", "student1");
    });

    test("should remove member successfully", async () => {
      classAPI.getTeacherClasses.mockResolvedValue({
        success: true,
        data: { classes: [] },
      });

      classAPI.removeMember.mockResolvedValue({
        success: true,
      });

      let contextValue;
      render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.loading).toBe(false);
      });

      let result;
      await act(async () => {
        result = await contextValue.removeMember("class1", "student1");
      });

      expect(result.success).toBe(true);
      expect(classAPI.removeMember).toHaveBeenCalledWith("class1", "student1");
    });
  });

  describe("regenerateCode", () => {
    test("should regenerate join code successfully", async () => {
      const mockClass = {
        _id: "class1",
        name: "Math 101",
        joinCode: "OLD123",
      };

      classAPI.getTeacherClasses.mockResolvedValue({
        success: true,
        data: { classes: [mockClass] },
      });

      classAPI.regenerateCode.mockResolvedValue({
        success: true,
        data: {
          joinCode: "NEW456",
          joinCodeExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      let contextValue;
      render(
        <ClassProvider>
          <TestComponent
            onRender={(context) => {
              contextValue = context;
            }}
          />
        </ClassProvider>
      );

      await waitFor(() => {
        expect(contextValue.classes).toHaveLength(1);
      });

      let result;
      await act(async () => {
        result = await contextValue.regenerateCode("class1");
      });

      expect(result.success).toBe(true);
      expect(result.joinCode).toBe("NEW456");

      // Verify class was updated in state
      expect(
        contextValue.classes.find((c) => c._id === "class1").joinCode
      ).toBe("NEW456");
    });
  });
});
