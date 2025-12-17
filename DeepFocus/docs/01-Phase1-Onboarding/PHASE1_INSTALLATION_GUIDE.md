# 📦 HƯỚNG DẪN CÀI ĐẶT PHASE 1 - ONBOARDING

## DeepFocus Personalized Assessment

---

## 🎯 Tổng Quan

Phase 1 bao gồm:

- ✅ 5 màn hình Onboarding hoàn chỉnh
- ✅ Redux store cho user state
- ✅ Navigation setup
- ✅ Natural, conversational design

---

## 📋 BƯỚC 1: CÀI ĐẶT PACKAGES

### Mở Terminal trong VS Code và chạy:

```bash
# Navigation packages
npm install @react-navigation/native @react-navigation/stack

# React Native dependencies cho navigation
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# UI Components
npm install expo-linear-gradient
npm install lottie-react-native
npm install @react-native-community/slider

# Storage
npm install @react-native-async-storage/async-storage

# State Management
npm install redux react-redux redux-thunk

# Icons (nếu chưa có)
npm install @expo/vector-icons
```

### Hoặc dùng Expo (nếu đang dùng Expo):

```bash
expo install @react-navigation/native @react-navigation/stack
expo install react-native-screens react-native-safe-area-context
expo install react-native-gesture-handler react-native-reanimated
expo install expo-linear-gradient
expo install lottie-react-native
expo install @react-native-community/slider
expo install @react-native-async-storage/async-storage
```

---

## 🎨 BƯỚC 2: TẢI ANIMATIONS

### Tải 3 file Lottie Animation (JSON format):

1. **Vào trang LottieFiles:** https://lottiefiles.com/

2. **Tìm và tải các animation sau:**

   **Animation 1: Student Studying / Focus**

   - Tìm kiếm: "student studying" hoặc "focus work"
   - Tải file JSON
   - Đổi tên thành: `focus-study.json`
   - Lưu vào: `assets/animations/focus-study.json`

   **Animation 2: AI Thinking / Robot Brain**

   - Tìm kiếm: "ai thinking" hoặc "robot brain processing"
   - Tải file JSON
   - Đổi tên thành: `ai-thinking.json`
   - Lưu vào: `assets/animations/ai-thinking.json`

   **Animation 3: Confetti Celebration**

   - Tìm kiếm: "confetti celebration"
   - Tải file JSON
   - Đổi tên thành: `confetti.json`
   - Lưu vào: `assets/animations/confetti.json`

### Link gợi ý (miễn phí):

```
Focus Study: https://lottiefiles.com/search?q=student%20studying&category=animations
AI Thinking: https://lottiefiles.com/search?q=ai%20thinking&category=animations
Confetti: https://lottiefiles.com/search?q=confetti&category=animations
```

### Cấu trúc thư mục animation:

```
assets/
└── animations/
    ├── focus-study.json      ✅ (để trong Welcome screen)
    ├── ai-thinking.json      ✅ (để trong AI Analysis screen)
    └── confetti.json         ✅ (để trong Personalized Plan screen)
```

---

## 📁 BƯỚC 3: CẤU TRÚC THƯ MỤC

Đảm bảo project có cấu trúc như sau:

```
DeepFocus/
├── assets/
│   └── animations/           ✅ Đã tạo
│       ├── focus-study.json  ⏳ Cần tải
│       ├── ai-thinking.json  ⏳ Cần tải
│       └── confetti.json     ⏳ Cần tải
├── screens/
│   └── Onboarding/          ✅ Đã tạo
│       ├── WelcomeScreen.js              ✅ Đã có
│       ├── AssessmentIntroScreen.js      ✅ Đã có
│       ├── AssessmentScreen.js           ⏳ Đang tạo...
│       ├── AIAnalysisScreen.js           ⏳ Đang tạo...
│       └── PersonalizedPlanScreen.js     ⏳ Đang tạo...
├── store/                   ✅ Đã tạo
│   ├── actions/
│   │   └── userActions.js    ⏳ Đang tạo...
│   ├── reducers/
│   │   └── userReducer.js    ⏳ Đang tạo...
│   └── index.js              ⏳ Sẽ tạo
├── navigation/              ✅ Đã tạo
│   ├── OnboardingNavigator.js  ⏳ Đang tạo...
│   └── RootNavigator.js        ⏳ Sẽ update
└── App.js                    ⏳ Sẽ update
```

---

## ⚙️ BƯỚC 4: CẤU HÌNH REACT-NATIVE-REANIMATED

### Thêm plugin vào `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin", // ⚠️ Phải để cuối cùng!
    ],
  };
};
```

### Sau khi thêm, clear cache:

```bash
npm start -- --reset-cache
# hoặc
expo start -c
```

---

## 🔧 BƯỚC 5: CẤU HÌNH GESTURE HANDLER

### Bọc App trong `GestureHandlerRootView` ở `App.js`:

```javascript
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Các components khác */}
    </GestureHandlerRootView>
  );
}
```

---

## 🧪 BƯỚC 6: TEST THỬ

### Chạy ứng dụng:

```bash
# Expo
npm start
# hoặc
expo start

# Sau đó nhấn:
# - "a" cho Android
# - "i" cho iOS
# - "w" cho Web
```

### Test checklist:

1. ✅ Welcome screen hiển thị animation
2. ✅ Gradient background đẹp
3. ✅ Button "Bắt Đầu Đánh Giá" hoạt động
4. ✅ Chuyển sang Assessment Intro screen
5. ✅ 4 steps hiển thị đúng
6. ✅ Chuyển sang Assessment với 7 câu hỏi

---

## 🎨 CUSTOMIZATION (Tùy chọn)

### Thay đổi màu sắc:

Trong các file screen, tìm và thay đổi:

```javascript
// Gradient chính
colors={['#667eea', '#764ba2']}  // Purple gradient

// Gradient CTA
colors={['#F093FB', '#F5576C']}  // Pink gradient
```

### Thay đổi font:

```javascript
// Trong styles
title: {
  fontFamily: 'YourCustomFont', // Thêm custom font
  fontSize: 36,
  fontWeight: '800',
}
```

---

## ❗ TROUBLESHOOTING

### Lỗi: "Cannot find module 'lottie-react-native'"

```bash
npm install lottie-react-native
expo install lottie-react-native
```

### Lỗi: "Invariant Violation: requireNativeComponent: RNSScreen"

```bash
npm install react-native-screens
cd ios && pod install && cd ..  # Chỉ iOS
```

### Lỗi: Animation không hiển thị

- Đảm bảo đã tải đúng 3 file JSON
- Kiểm tra đường dẫn: `assets/animations/`
- Restart app: `npm start -- --reset-cache`

### Lỗi: Slider không hoạt động

```bash
npm install @react-native-community/slider --save
```

### Lỗi: "Module not found: @react-navigation/stack"

```bash
npm install @react-navigation/stack
```

---

## 📝 NOTES

### Các file đã tạo tự động:

✅ `screens/Onboarding/WelcomeScreen.js`
✅ `screens/Onboarding/AssessmentIntroScreen.js`

### Các file sẽ được tạo tiếp:

⏳ `screens/Onboarding/AssessmentScreen.js`
⏳ `screens/Onboarding/AIAnalysisScreen.js`
⏳ `screens/Onboarding/PersonalizedPlanScreen.js`
⏳ `store/actions/userActions.js`
⏳ `store/reducers/userReducer.js`
⏳ `navigation/OnboardingNavigator.js`

### Cần làm thủ công:

⏳ Tải 3 file Lottie JSON từ LottieFiles
⏳ Cập nhật `babel.config.js`
⏳ Cập nhật `App.js` với GestureHandlerRootView

---

## 🎯 KẾ TIẾP

Sau khi cài đặt xong packages và tải animations:

1. Mình sẽ tạo tiếp 3 screens còn lại
2. Tạo Redux store
3. Tạo Navigation
4. Update App.js
5. Test toàn bộ flow

---

## 💡 TIPS

1. **Dùng Expo Go App** để test nhanh trên điện thoại
2. **Enable Hot Reload** để thấy thay đổi ngay lập tức
3. **Dùng React DevTools** để debug
4. **Test trên cả iOS và Android** nếu có thể

---

## 📞 HỖ TRỢ

Nếu gặp lỗi:

1. Clear cache: `npm start -- --reset-cache`
2. Xóa node_modules: `rm -rf node_modules && npm install`
3. Check React Native version compatibility
4. Google error message (thường có solution)

---

**Bước tiếp theo:** Hãy chạy lệnh install packages ở trên, sau đó cho mình biết để mình tạo tiếp các file còn lại! 🚀
