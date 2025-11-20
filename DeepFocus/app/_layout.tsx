import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import { theme } from '@/src/config/theme';
import { LanguageProvider } from '@/src/contexts/LanguageContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { RoleProvider } from '@/src/contexts/RoleContext';
import { TaskProvider } from '@/src/contexts/TaskContext';
import { ConnectedPomodoroProvider } from '@/src/contexts/ConnectedPomodoroProvider';
import ErrorBoundary from '@/src/components/ErrorBoundary';
import OfflineIndicator from '@/src/components/OfflineIndicator';
import NetworkStatusBar from '@/src/components/NetworkStatusBar';
import { requestNotificationPermissions } from '@/src/services/notificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // Request notification permissions on app start
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <LanguageProvider>
              <AuthProvider>
                <RoleProvider>
                  <TaskProvider>
                    <ConnectedPomodoroProvider>
                      <NetworkStatusBar />
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
                      <OfflineIndicator />
                    </ConnectedPomodoroProvider>
                  </TaskProvider>
                </RoleProvider>
              </AuthProvider>
            </LanguageProvider>
      </PaperProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
