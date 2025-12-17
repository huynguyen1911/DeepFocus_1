import { Stack } from 'expo-router';

export default function FocusTrainingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Focus Training',
          headerShown: false, // Hide for main screen since it has custom header
        }}
      />
      <Stack.Screen
        name="assessment"
        options={{
          title: 'Đánh Giá',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          title: 'Lịch Tập Luyện',
        }}
      />
      <Stack.Screen
        name="day-detail"
        options={{
          title: 'Chi Tiết Ngày',
        }}
      />
      <Stack.Screen
        name="progress"
        options={{
          title: 'Tiến Độ',
        }}
      />
      <Stack.Screen
        name="weekly-assessment"
        options={{
          title: 'Đánh Giá Tuần',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Cài Đặt',
        }}
      />
    </Stack>
  );
}
