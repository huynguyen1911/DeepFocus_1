# DeepFocus - Ứng dụng Pomodoro Timer

DeepFocus là một ứng dụng Pomodoro Timer được phát triển bằng React Native và Expo, giúp bạn tập trung sâu và làm việc hiệu quả.

## 🚀 Tính năng

### Core Features

- ⏰ Pomodoro Timer với giao diện thân thiện
- ✅ Quản lý nhiệm vụ (Task Management)
- 🎯 Hệ thống vai trò đa dạng (Multi-Role System)
- 📊 Thống kê và theo dõi tiến độ
- 🎨 Giao diện Material Design với theme màu đỏ
- 📱 Hỗ trợ đa nền tảng (iOS, Android, Web)
- 💾 Lưu trữ dữ liệu cục bộ với AsyncStorage
- 🔄 Navigation mượt mà
- 🌐 Hỗ trợ đa ngôn ngữ (Tiếng Việt, English)

### Phase 2: Class Management System 🎓

- 👨‍🏫 **Tạo lớp học** (Teacher only)
  - Tạo và quản lý nhiều lớp học
  - Tự động tạo mã tham gia 6 ký tự
  - Mã có thời hạn 7 ngày và có thể tạo lại
- 👨‍🎓 **Tham gia lớp** (Student only)
  - Tham gia lớp bằng mã code
  - Hệ thống phê duyệt tự động
  - Theo dõi trạng thái (đang chờ/đã duyệt)
- 📋 **Quản lý thành viên**
  - Duyệt/từ chối yêu cầu tham gia
  - Xóa thành viên khỏi lớp
  - Xem danh sách thành viên với thống kê
- 🔒 **Bảo mật & Phân quyền**
  - JWT Authentication
  - Role-based access control
  - Chỉ creator mới có quyền quản lý lớp

### Phase 3: Focus Training System 🧠

- 🤖 **AI Planner**: Tạo kế hoạch training tự động dựa trên schedule
- 📅 **Calendar View**: Theo dõi training days với visual indicators
- 💪 **Progressive Difficulty**: Tăng độ khó từng tuần
- 📊 **Statistics**: Theo dõi streak, completion rate, performance
- 🎯 **Day Detail**: Chi tiết từng ngày training với missions

### Phase 4: Post-Session Feedback 📝

- ⭐ **Session Feedback**: Đánh giá 5 sao sau mỗi phiên
- 😊 **Emotion Tracking**: Chọn cảm xúc và ghi chú distractions
- 🧠 **AI Insights**: Phân tích hiệu suất và đưa ra recommendations
- 🏆 **Achievements**: 12 badges với progress tracking
- 📈 **Performance Charts**: 4 loại charts (Line, Bar, Area, Distraction)

### Phase 5: Weekly Review & Progress 📊

- 📅 **Weekly Review**: Tổng kết tuần với highlights và comparisons
- 🗓️ **Monthly Progress**: Calendar heatmap 31 ngày + weekly breakdown
- 🎯 **Goals**: Đặt mục tiêu Daily/Weekly/Monthly với rewards

### Phase 6: AI Personality & Adaptive Coaching 🤖

- 🎭 **AI Coach Avatar**: Personality system với animated reactions
- 💡 **Contextual Tips**: Tips thông minh dựa trên ngữ cảnh (5 contexts)
- 🎯 **Motivational Engine**: 5 loại messages (30+ unique messages)
- 🧠 **Adaptive Coaching**:
  - Pattern recognition từ session history
  - Personalized recommendations với confidence scores
  - Optimal time prediction
  - 7 loại recommendations (timing, duration, difficulty, etc.)

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

### 2. Cài đặt Frontend dependencies

```bash
npm install
```

### 3. Cài đặt Backend dependencies

```bash
cd backend
npm install
```

### 4. Cấu hình môi trường

Tạo file `.env` trong thư mục `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/deepfocus
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 5. Cài đặt Expo CLI (nếu chưa có)

```bash
npm install -g expo-cli
```

## 🚀 Chạy ứng dụng

### 1. Khởi động Backend Server

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

### 2. Khởi động Frontend

Mở terminal mới:

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
├── app/                      # Expo Router (App Directory)
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Home screen
│   │   ├── classes.tsx      # Classes list
│   │   ├── statistics.tsx   # Statistics
│   │   ├── explore.tsx      # Explore
│   │   └── settings.tsx     # Settings
│   ├── classes/             # Class management routes
│   │   ├── create.tsx       # Create class
│   │   ├── join.tsx         # Join class
│   │   └── [id].tsx         # Class details
│   ├── _layout.tsx          # Root layout with providers
│   └── modal.tsx            # Modal screens
│
├── src/
│   ├── components/          # Reusable components
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ClassListScreen.tsx
│   │   ├── CreateClassScreen.tsx
│   │   ├── JoinClassScreen.tsx
│   │   └── ClassDetailScreen.tsx
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.js
│   │   ├── RoleContext.js
│   │   ├── TaskContext.js
│   │   ├── ClassContext.js
│   │   └── LanguageContext.js
│   ├── services/           # API services
│   │   ├── api.js          # API client
│   │   └── notificationService.js
│   ├── locales/            # Translations
│   │   └── translations.js
│   ├── utils/              # Utility functions
│   └── config/             # Configuration
│       └── theme.js
│
├── backend/                 # Node.js Backend
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── classController.js
│   ├── models/             # MongoDB models
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── Class.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── classes.js
│   ├── middleware/         # Custom middleware
│   │   └── authMiddleware.js
│   ├── tests/              # Backend tests
│   │   ├── unit/
│   │   └── integration/
│   └── server.js           # Express server
│
├── docs/                    # Documentation
│   └── API.md              # API documentation
│
└── assets/                 # Static assets
    └── images/
```

## 🎨 Theme

Ứng dụng sử dụng React Native Paper với theme màu đỏ chủ đạo:

- **Primary Color**: #FF5252 (Material Red)
- **Secondary Color**: #F44336
- **Background**: #FFFFFF
- **Surface**: #FFFFFF

## 📱 Screens

### Home Screen

- Pomodoro Timer với các chế độ Focus/Break
- Chọn và theo dõi nhiệm vụ
- Thống kê Pomodoros hàng ngày
- Material Design với animations

### Classes Screen (Phase 2)

- **Class List**: Hiển thị danh sách lớp theo role
- **Create Class** (Teacher): Form tạo lớp với mã code tự động
- **Join Class** (Student): Nhập mã 6 ký tự để tham gia
- **Class Details**:
  - Teacher view: Quản lý thành viên, duyệt requests, regenerate code
  - Student view: Xem thông tin lớp và trạng thái

### Task Management

- Tạo, chỉnh sửa, xóa nhiệm vụ
- Gán nhiệm vụ vào Pomodoro session
- Theo dõi tiến độ hoàn thành

### Statistics

- Xem thống kê Pomodoros theo ngày/tuần/tháng
- Phân tích năng suất
- Lịch sử nhiệm vụ hoàn thành

## 🔧 Scripts có sẵn

### Frontend

- `npm start` - Khởi động Expo development server
- `npm run android` - Chạy trên Android
- `npm run ios` - Chạy trên iOS
- `npm run web` - Chạy trên web browser
- `npm test` - Chạy frontend tests
- `npm run lint` - Kiểm tra code style

### Backend

- `npm run dev` - Khởi động backend với nodemon
- `npm start` - Khởi động backend (production)
- `npm test` - Chạy backend tests
  - Unit tests: `npm test -- classController.test.js`
  - Integration tests: `npm test -- class.test.js`

## 📦 Dependencies chính

### Frontend

- **React Native**: Framework phát triển mobile
- **Expo**: Platform phát triển và deployment
- **Expo Router**: File-based navigation
- **React Native Paper**: Material Design components
- **AsyncStorage**: Local storage solution
- **Axios**: HTTP client
- **React Testing Library**: Testing utilities

### Backend

- **Express**: Web framework
- **MongoDB & Mongoose**: Database
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Jest**: Testing framework
- **Supertest**: HTTP testing

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test suite
npm test -- classController.test.js
npm test -- class.test.js
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- ClassContext.test.js
```

## 📚 Documentation

### API Documentation

Xem chi tiết API documentation tại: [docs/API.md](./docs/API.md)

### Phase Documentation

- **Phase 1-3**: [docs/PHASE_4_IMPLEMENTATION_SUMMARY.md](./docs/PHASE_4_IMPLEMENTATION_SUMMARY.md)
- **Phase 4**: Post-Session Feedback (included in Phase 4 summary)
- **Phase 5**: Weekly Review & Progress (included in Phase 4 summary)
- **Phase 6**: [docs/PHASE6_AI_PERSONALITY.md](./docs/PHASE6_AI_PERSONALITY.md) - AI Personality & Adaptive Coaching

### Testing Guides

- **Phase 1 Onboarding**: [docs/01-Phase1-Onboarding/ONBOARDING_TEST_GUIDE.md](./docs/01-Phase1-Onboarding/ONBOARDING_TEST_GUIDE.md)
- **Pomodoro**: [docs/POMODORO_TESTING_GUIDE.md](./docs/POMODORO_TESTING_GUIDE.md)
- **Date Range Selector**: [docs/DATE_RANGE_SELECTOR_TESTING.md](./docs/DATE_RANGE_SELECTOR_TESTING.md)
- **Offline Support**: [docs/OFFLINE_SUPPORT.md](./docs/OFFLINE_SUPPORT.md)

### Quick API Reference

**Authentication:**

```
POST /api/auth/register - Đăng ký
POST /api/auth/login - Đăng nhập
```

**Classes:**

```
POST   /api/classes - Tạo lớp
GET    /api/classes/:id - Chi tiết lớp
PUT    /api/classes/:id - Cập nhật lớp
DELETE /api/classes/:id - Xóa lớp
POST   /api/classes/join - Tham gia lớp
POST   /api/classes/:id/regenerate-code - Tạo lại mã
PUT    /api/classes/:id/members/:memberId/approve - Duyệt thành viên
PUT    /api/classes/:id/members/:memberId/reject - Từ chối
DELETE /api/classes/:id/members/:memberId - Xóa thành viên
```

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
