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
import { ClassProvider } from '@/src/contexts/ClassContext';
import { SessionProvider } from '@/src/contexts/SessionContext';
import { RewardProvider } from '@/src/contexts/RewardContext';
import { AlertProvider } from '@/src/contexts/AlertContext';
import { GuardianProvider } from '@/src/contexts/GuardianContext';
import { ConnectedPomodoroProvider } from '@/src/contexts/ConnectedPomodoroProvider';
import { FocusTrainingProvider } from '@/src/contexts/FocusTrainingContext';
import ErrorBoundary from '@/src/components/ErrorBoundary';
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
                    <ClassProvider>
                      <SessionProvider>
                        <RewardProvider>
                          <AlertProvider>
                            <GuardianProvider>
                              <ConnectedPomodoroProvider>
                                <FocusTrainingProvider>
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
                    headerShown: false,
                  }} 
                />
                <Stack.Screen 
                  name="task-details/[id]" 
                  options={{ 
                    headerShown: false,
                  }} 
                />
                <Stack.Screen 
                  name="classes/create" 
                  options={{ 
                    presentation: 'modal',
                    title: 'Tạo Lớp',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="classes/join" 
                  options={{ 
                    presentation: 'modal',
                    title: 'Tham Gia Lớp',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="classes/[id]" 
                  options={{ 
                    title: 'Chi Tiết Lớp',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="classes/statistics/[id]" 
                  options={{ 
                    title: 'Thống Kê Lớp',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="rewards/[classId]" 
                  options={{ 
                    title: 'Phần Thưởng & Phạt',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="rewards/create" 
                  options={{ 
                    presentation: 'modal',
                    title: 'Tạo Phần Thưởng',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="rewards/summary" 
                  options={{ 
                    title: 'Bảng Xếp Hạng',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="alerts" 
                  options={{ 
                    title: 'Thông Báo',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="guardian/dashboard" 
                  options={{ 
                    title: 'Quản Lý Con Em',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="guardian/link-child" 
                  options={{ 
                    presentation: 'modal',
                    title: 'Liên Kết Con Em',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="guardian/child-detail/[id]" 
                  options={{ 
                    title: 'Chi Tiết Con Em',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="guardian/pending-requests" 
                  options={{ 
                    title: 'Yêu Cầu Liên Kết',
                    headerStyle: {
                      backgroundColor: theme.colors.primary,
                    },
                  }} 
                />
                <Stack.Screen 
                  name="profile" 
                  options={{ 
                    headerShown: false,
                  }} 
                />
              </Stack>
                              <StatusBar style="light" />
                                </FocusTrainingProvider>
                              </ConnectedPomodoroProvider>
                            </GuardianProvider>
                          </AlertProvider>
                        </RewardProvider>
                      </SessionProvider>
                    </ClassProvider>
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
