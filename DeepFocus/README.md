# DeepFocus - Ứng dụng Pomodoro Timer

DeepFocus là một ứng dụng Pomodoro Timer được phát triển bằng React Native và Expo, giúp bạn tập trung sâu và làm việc hiệu quả.

## 🚀 Tính năng

- ⏰ Pomodoro Timer với giao diện thân thiện
- 🎨 Giao diện Material Design với theme màu đỏ
- 📱 Hỗ trợ đa nền tảng (iOS, Android, Web)
- 💾 Lưu trữ dữ liệu cục bộ
- 🔄 Navigation mượt mà

## 📋 Yêu cầu hệ thống

- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Expo CLI
- React Native development environment

## 🛠️ Cài đặt

### 1. Clone dự án

```bash
git clone [repository-url]
cd DeepFocus
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cài đặt Expo CLI (nếu chưa có)

```bash
npm install -g expo-cli
```

## 🚀 Chạy ứng dụng

### Khởi động development server

```bash
npm start
```

### Chạy trên iOS Simulator

```bash
npm run ios
```

### Chạy trên Android Emulator

```bash
npm run android
```

### Chạy trên Web

```bash
npm run web
```

## 📁 Cấu trúc dự án

```
DeepFocus/
├── App.js                  # Entry point chính
├── app.json               # Cấu hình Expo
├── package.json           # Dependencies và scripts
│
├── src/
│   ├── components/        # Reusable components
│   ├── screens/          # Screen components
│   │   └── HomeScreen.js # Màn hình chính
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── contexts/         # React contexts
│   ├── services/         # API và services
│   │   └── StorageService.js
│   ├── utils/            # Utility functions
│   │   └── helpers.js
│   └── config/           # Configuration files
│       ├── theme.js      # Theme configuration
│       └── constants.js  # App constants
│
└── assets/               # Static assets
    └── images/          # Images và icons
```

## 🎨 Theme

Ứng dụng sử dụng React Native Paper với theme màu đỏ chủ đạo:

- **Primary Color**: #FF5252 (Material Red)
- **Secondary Color**: #F44336
- **Background**: #FFFFFF
- **Surface**: #FFFFFF

## 📱 Screens

### Home Screen

- Màn hình chào mừng với thiết kế Material Design
- Card container với styling đẹp mắt
- Text chào mừng và subtitle

## 🔧 Scripts có sẵn

- `npm start` - Khởi động Expo development server
- `npm run android` - Chạy trên Android
- `npm run ios` - Chạy trên iOS
- `npm run web` - Chạy trên web browser
- `npm run lint` - Kiểm tra code style

## 📦 Dependencies chính

- **React Native**: Framework phát triển mobile
- **Expo**: Platform phát triển và deployment
- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components
- **AsyncStorage**: Local storage solution
- **Safe Area Context**: Handle safe area

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Liên hệ

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/DeepFocus](https://github.com/yourusername/DeepFocus)

---

**Made with ❤️ by [Your Name]**
