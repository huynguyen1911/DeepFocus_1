import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import { theme } from '@/src/config/theme';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { TaskProvider } from '@/src/contexts/TaskContext';
import { ConnectedPomodoroProvider } from '@/src/contexts/ConnectedPomodoroProvider';
import ErrorBoundary from '@/src/components/ErrorBoundary';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <AuthProvider>
              <TaskProvider>
                <ConnectedPomodoroProvider>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: theme.colors.primary,
                  },
                  headerTintColor: theme.colors.onPrimary,
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                  headerTitleAlign: 'center',
                }}
              >
                <Stack.Screen 
                  name="(tabs)" 
                  options={{ 
                    headerShown: false 
                  }} 
                />
                <Stack.Screen 
                  name="modal" 
                  options={{ 
                    presentation: 'modal', 
                    title: 'Modal',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="add-task" 
                  options={{ 
                    presentation: 'modal', 
                    title: 'Tạo Nhiệm Vụ',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="task-details/[id]" 
                  options={{ 
                    title: 'Chi Tiết Nhiệm Vụ',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
              </Stack>
              <StatusBar style="light" />
            </ConnectedPomodoroProvider>
          </TaskProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
