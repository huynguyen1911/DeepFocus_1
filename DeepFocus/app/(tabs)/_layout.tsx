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
      
      {/* Student View Tabs */}
      {!isTeacher && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'DeepFocus',
              tabBarLabel: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="timer" color={color} />,
            }}
          />
          <Tabs.Screen
            name="classes"
            options={{
              title: 'Lớp Học',
              tabBarLabel: 'Classes',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="statistics"
            options={{
              title: 'Thống Kê',
              tabBarLabel: 'Stats',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: 'Khám phá',
              tabBarLabel: 'Explore',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
            }}
          />
        </>
      )}

      {/* Teacher View Tabs */}
      {isTeacher && (
        <>
          <Tabs.Screen
            name="classes"
            options={{
              title: 'Quản Lý Lớp',
              tabBarLabel: 'Classes',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="rectangle.stack.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="statistics"
            options={{
              title: 'Analytics',
              tabBarLabel: 'Analytics',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />,
            }}
          />
        </>
      )}

      {/* Settings - Always visible */}
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

      {/* Hide these tabs when not in use */}
      {isTeacher && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              href: null,
              title: 'Home',
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              href: null,
              title: 'Explore',
            }}
          />
        </>
      )}
      {/* Hidden routes - accessible via router.push but not shown in tabs */}
      <Tabs.Screen
        name="guardian"
        options={{
          href: null,
          title: 'Guardian',
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          href: null, // Hide from tab bar
          title: 'Achievements',
        }}
      />
      <Tabs.Screen
        name="competitions"
        options={{
          href: null, // Hide from tab bar
          title: 'Competitions',
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
