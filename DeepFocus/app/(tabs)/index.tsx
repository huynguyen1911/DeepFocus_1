import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import HomeScreen from '@/src/screens/HomeScreen';
import { useAuth } from '@/src/contexts/AuthContext';

export default function HomeTab() {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <HomeScreen />;
}
