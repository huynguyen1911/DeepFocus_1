# Hướng dẫn Setup và Chạy DeepFocus App

## 🎯 Tổng quan

DeepFocus là ứng dụng Pomodoro Timer được phát triển bằng React Native và Expo với giao diện Material Design màu đỏ chủ đạo.

## ✅ Setup đã hoàn thành

### 1. Cấu trúc thư mục đã tạo:

```
DeepFocus/
├── App.js                    # Entry point chính với SafeAreaProvider, PaperProvider, Navigation
├── app.json                  # Cấu hình Expo
├── package.json             # Dependencies và scripts
│
├── src/
│   ├── components/          # Reusable components
│   │   ├── CustomButton.js  # Custom button component
│   │   └── TimerCard.js     # Timer display card
│   ├── screens/            # Screen components
│   │   └── HomeScreen.js   # Màn hình chính với welcome message và timer UI
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.js # Stack Navigator với theme đỏ
│   ├── contexts/           # React contexts (trống, sẵn sàng mở rộng)
│   ├── services/           # API và services
│   │   └── StorageService.js # AsyncStorage wrapper service
│   ├── utils/              # Utility functions
│   │   └── helpers.js      # Format time, greeting, validation utilities
│   ├── config/             # Configuration files
│   │   ├── theme.js        # Material Design theme với màu đỏ #FF5252
│   │   └── constants.js    # App constants (timer durations, storage keys, etc.)
│   └── index.js            # Export barrel file
│
└── assets/                 # Static assets
    └── images/            # Images và icons
```

### 2. Dependencies đã cài đặt:

✅ @react-navigation/native
✅ @react-navigation/stack  
✅ @react-navigation/bottom-tabs
✅ react-native-paper
✅ @react-native-async-storage/async-storage
✅ react-native-safe-area-context
✅ react-native-screens
✅ Expo SDK và các dependencies cần thiết

### 3. Features đã implement:

#### App.js:

- SafeAreaProvider wrapper cho safe area handling
- PaperProvider với custom theme màu đỏ (#FF5252 primary)
- NavigationContainer setup
- StatusBar configuration

#### HomeScreen.js:

- Greeting message động theo thời gian
- Welcome card với "Chào mừng đến với DeepFocus!"
- Subtitle "Ứng dụng Pomodoro Timer"
- Timer section với TimerCard component
- Button controls (Bắt đầu, Tạm dừng)
- Statistics section hiển thị stats hôm nay
- Responsive design với ScrollView
- Material Design styling

#### AppNavigator.js:

- Stack Navigator setup
- Custom header với màu đỏ theme
- Route đến HomeScreen
- Header styling với elevation và shadow

#### Theme Configuration:

- Material Design 3 theme
- Primary color: #FF5252 (Material Red)
- Secondary color: #F44336
- Proper color mapping cho light mode
- Consistent color palette

### 4. Components đã tạo:

#### CustomButton:

- Contained và outlined modes
- Disabled state handling
- Theme-aware colors
- TouchableOpacity với activeOpacity

#### TimerCard:

- Display timer với format MM:SS
- Active/inactive states
- Customizable title và time
- Card elevation và border styling

## 🚀 Cách chạy ứng dụng

### Bước 1: Cài đặt dependencies

```bash
cd "c:\Users\Public\Programming\DeepFocus\DeepFocus"
npm install
```

### Bước 2: Khởi động development server

```bash
npm start
```

### Bước 3: Chạy trên thiết bị/simulator

- **Android**: Nhấn `a` hoặc `npm run android`
- **iOS**: Nhấn `i` hoặc `npm run ios`
- **Web**: Nhấn `w` hoặc `npm run web`
- **Expo Go**: Scan QR code bằng Expo Go app

## 📱 Giao diện hiện tại

Khi chạy ứng dụng, bạn sẽ thấy:

1. **Header**: "DeepFocus" với background màu đỏ
2. **Welcome Section**:
   - Greeting động (Chào buổi sáng/chiều/tối!)
   - "Chào mừng đến với DeepFocus!"
   - "Ứng dụng Pomodoro Timer"
   - Description text
3. **Timer Section**:
   - Timer card hiển thị "25:00"
   - Nút "Bắt đầu" và "Tạm dừng"
4. **Stats Section**:
   - Pomodoro hoàn thành: 0
   - Thời gian tập trung: 0m

## 🎨 Theme Colors

- **Primary**: #FF5252 (Material Red)
- **Secondary**: #F44336
- **Background**: #FFFFFF
- **Surface**: #FFFFFF
- **Text**: #212121

## 📂 Files quan trọng đã tạo

1. **App.js** - Entry point chính
2. **src/screens/HomeScreen.js** - Màn hình chính
3. **src/navigation/AppNavigator.js** - Navigation setup
4. **src/config/theme.js** - Theme configuration
5. **src/config/constants.js** - App constants
6. **src/utils/helpers.js** - Utility functions
7. **src/services/StorageService.js** - Storage service
8. **src/components/CustomButton.js** - Custom button
9. **src/components/TimerCard.js** - Timer display card

## ✅ Status: READY TO RUN!

Ứng dụng đã sẵn sàng chạy với `npm start`. Tất cả setup cơ bản đã hoàn thành và có thể mở rộng thêm features như:

- Timer functionality
- Sound notifications
- Statistics tracking
- Settings screen
- Multiple timer sessions
- Background tasks

## 🎯 Next Steps

1. Implement timer logic với useState/useEffect
2. Add sound notifications với expo-av
3. Persist stats với AsyncStorage
4. Add settings screen cho customization
5. Implement background timer với background tasks
