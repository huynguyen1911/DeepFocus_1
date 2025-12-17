import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { theme } from '@/src/config/theme';
import { useAlert } from '@/src/contexts/AlertContext';
import { useRole } from '@/src/contexts/RoleContext';
import { useGuardian } from '@/src/contexts/GuardianContext';
import AlertBadge from '@/src/components/AlertBadge';

export default function TabLayout() {
  const { unreadCount } = useAlert();
  const { currentRole, hasRole } = useRole();
  const { pendingRequests } = useGuardian();

  // Determine if user is in Teacher/Guardian mode
  const isTeacher = currentRole === 'teacher';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}>
      
      {/* Index/Home Tab - always visible, adapts to role */}
      <Tabs.Screen
        name="index"
        options={{
          title: isTeacher ? 'Trang Chủ' : 'DeepFocus',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name={isTeacher ? "house.fill" : "timer"} color={color} />,
        }}
      />

      {/* Classes Tab - always visible */}
      <Tabs.Screen
        name="classes"
        options={{
          title: isTeacher ? 'Quản Lý Lớp' : 'Lớp Học',
          tabBarLabel: 'Classes',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name={isTeacher ? "rectangle.stack.fill" : "book.fill"} color={color} />,
        }}
      />

      {/* Competitions Tab - always visible */}
      <Tabs.Screen
        name="competitions"
        options={{
          title: isTeacher ? 'Quản Lý Cuộc Thi' : 'Cuộc Thi',
          tabBarLabel: 'Compete',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
        }}
      />

      {/* Statistics Tab - visible for students, Analytics for teachers */}
      <Tabs.Screen
        name="statistics"
        options={{
          title: isTeacher ? 'Analytics' : 'Thống Kê',
          tabBarLabel: isTeacher ? 'Analytics' : 'Stats',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name={isTeacher ? "chart.line.uptrend.xyaxis" : "chart.bar.fill"} color={color} />,
        }}
      />

      {/* Explore Tab - visible for students, hidden for teachers */}
      <Tabs.Screen
        name="explore"
        options={{
          href: isTeacher ? null : undefined,
          title: 'Khám phá',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
        }}
      />

      {/* Focus Training Tab - always visible */}
      <Tabs.Screen
        name="focus-training"
        options={{
          title: 'Tập Trung',
          tabBarLabel: 'Focus',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="brain.head.profile" color={color} />,
        }}
      />

      {/* AI Planner Tab - Premium Feature (free for testing) */}
      <Tabs.Screen
        name="ai-planner"
        options={{
          title: 'AI Planner ✨',
          tabBarLabel: 'AI Plan',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
          headerShown: false, // AIPlannerNavigator handles its own headers
        }}
      />

      {/* Settings Tab - always visible */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài Đặt',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <View>
              <IconSymbol size={28} name="gearshape.fill" color={color} />
              {(unreadCount > 0 || pendingRequests.length > 0) && (
                <View style={styles.badgeContainer}>
                  <AlertBadge 
                    count={unreadCount + pendingRequests.length} 
                    size="small" 
                  />
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* Guardian Tab - hidden from tab bar */}
      <Tabs.Screen
        name="guardian"
        options={{
          href: null,
          title: 'Guardian',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
});
