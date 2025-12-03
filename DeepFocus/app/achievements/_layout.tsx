import { Stack } from 'expo-router';
import { theme } from '@/src/config/theme';

export default function AchievementsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Achievements',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Achievement Detail',
          headerShown: false, // Custom header in detail screen
        }}
      />
    </Stack>
  );
}
