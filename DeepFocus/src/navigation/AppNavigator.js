import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme, ActivityIndicator } from "react-native-paper";
import { View, StyleSheet } from "react-native";

import { useAuth } from "../contexts/AuthContext";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const theme = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
      {isAuthenticated ? (
        // Authenticated Stack
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "DeepFocus",
            headerStyle: {
              backgroundColor: theme.colors.primary,
              elevation: 4,
              shadowOpacity: 0.3,
            },
          }}
        />
      ) : (
        // Authentication Stack
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: "Đăng nhập",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: "Đăng ký",
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppNavigator;
