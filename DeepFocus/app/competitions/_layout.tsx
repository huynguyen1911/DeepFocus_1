import { Stack } from 'expo-router';
import { theme } from '@/src/config/theme';

export default function CompetitionsLayout() {
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
          title: 'Competitions',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Competition Detail',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Competition',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
