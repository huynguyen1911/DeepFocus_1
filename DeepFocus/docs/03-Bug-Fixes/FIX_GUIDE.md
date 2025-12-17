# Hướng dẫn Fix lỗi "main" has not been registered

## 🚨 Lỗi gặp phải:

```
[Invariant Violation: "main" has not been registered. This can happen if:
* Metro (the local dev server) is run from the wrong folder. Check if Metro is running, stop it and restart it in the current project.
* A module failed to load due to an error and `AppRegistry.registerComponent` wasn't called.]
```

## 🔧 Nguyên nhân:

- Đã thay đổi entry point từ `expo-router/entry` thành `App.js` trong package.json
- Nhưng không đăng ký component với AppRegistry đúng cách
- Expo Router cần cấu trúc file đặc biệt để hoạt động

## ✅ Giải pháp đã áp dụng:

### 1. Khôi phục Expo Router entry point

Cập nhật `package.json`:

```json
{
  "main": "expo-router/entry"
}
```

### 2. Cấu hình lại app.json

Thêm lại plugin expo-router:

```json
{
  "plugins": [
    "expo-router",
    [...other plugins]
  ]
}
```

### 3. Cập nhật app/\_layout.tsx

Tích hợp SafeAreaProvider và PaperProvider:

```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from '@/src/config/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={...}>
          ...
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

### 4. Cập nhật app/(tabs)/\_layout.tsx

Thêm header với theme màu đỏ:

```tsx
<Tabs
  screenOptions={{
    tabBarActiveTintColor: theme.colors.primary,
    headerShown: true,
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: theme.colors.onPrimary,
    ...
  }}
>
```

### 5. Tích hợp HomeScreen vào app/(tabs)/index.tsx

```tsx
import HomeScreen from "@/src/screens/HomeScreen";

export default function HomeTab() {
  return <HomeScreen />;
}
```

### 6. Convert HomeScreen.js thành HomeScreen.tsx

- Tạo file mới với TypeScript để tương thích với Expo Router
- Xóa SafeAreaView (vì đã có trong \_layout.tsx)
- Giữ nguyên tất cả logic và styling

## 🎯 Kết quả:

✅ Ứng dụng chạy thành công với Expo Router
✅ Header "DeepFocus" màu đỏ hiển thị đúng
✅ HomeScreen với full UI (welcome card, timer, buttons, stats)
✅ Tab navigation hoạt động
✅ Theme màu đỏ được áp dụng đúng

## 📱 Các tính năng hoạt động:

- Navigation với header màu đỏ
- Home tab với greeting động
- Timer card hiển thị 25:00
- Buttons "Bắt đầu" và "Tạm dừng"
- Statistics cards
- Material Design styling
- Responsive scroll view

## 🚀 Lệnh chạy:

```bash
cd "c:\Users\Public\Programming\DeepFocus\DeepFocus"
npm start
```

Sau đó có thể:

- Nhấn `w` để chạy trên web
- Nhấn `a` cho Android emulator
- Nhấn `i` cho iOS simulator
- Scan QR code bằng Expo Go app

## 💡 Bài học:

- Expo Router yêu cầu entry point là `expo-router/entry`
- Cần plugin "expo-router" trong app.json
- File structure phải tuân theo convention: app/\_layout.tsx, app/(tabs)/
- Provider setup nên ở root \_layout.tsx thay vì App.js riêng
- TypeScript files (.tsx) tương thích tốt hơn với Expo Router

Ứng dụng DeepFocus giờ đã chạy hoàn hảo! 🎉
