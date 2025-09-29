# DeepFocus Backend API Documentation

## 🚀 Setup và chạy server

### Cài đặt dependencies:

```bash
cd backend
npm install
```

### Chạy server:

```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

Server sẽ chạy trên: **http://localhost:5000**

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "message": "DeepFocus Backend API is running!",
  "timestamp": "2025-09-29T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## 🔐 Authentication Endpoints

### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "focusProfile": {
    "dailyGoal": 6,
    "workDuration": 25,
    "shortBreakDuration": 5,
    "longBreakDuration": 15
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "focusProfile": {
        "level": 1,
        "dailyGoal": 6,
        "workDuration": 25,
        "shortBreakDuration": 5,
        "longBreakDuration": 15,
        "totalSessionsCompleted": 0,
        "totalFocusTime": 0
      },
      "joinDate": "2025-09-29T00:00:00.000Z",
      "profileCompleteness": 100
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "focusProfile": { ... },
      "lastLogin": "2025-09-29T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Get User Profile (Protected)

```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "focusProfile": { ... },
      "lastLogin": "2025-09-29T00:00:00.000Z",
      "joinDate": "2025-09-29T00:00:00.000Z",
      "profileCompleteness": 100,
      "isActive": true
    }
  }
}
```

### 4. Update Profile (Protected)

```http
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "username": "new_username",
  "focusProfile": {
    "dailyGoal": 8,
    "workDuration": 30
  }
}
```

### 5. Verify Token (Protected)

```http
GET /api/auth/verify
Authorization: Bearer <jwt_token>
```

### 6. Logout (Protected)

```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

## 🧪 Test với cURL Commands

### 1. Health Check:

```bash
curl -X GET http://localhost:5000/api/health
```

### 2. Register User:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Get Profile (Replace YOUR_JWT_TOKEN):

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 User Focus Profile Schema

```json
{
  "level": 1, // User level (1-100)
  "dailyGoal": 4, // Target sessions per day
  "workDuration": 25, // Work session minutes
  "shortBreakDuration": 5, // Short break minutes
  "longBreakDuration": 15, // Long break minutes
  "sessionsBeforeLongBreak": 4, // Sessions before long break
  "totalSessionsCompleted": 0, // Total completed sessions
  "totalFocusTime": 0, // Total focus time in minutes
  "currentStreak": 0, // Current daily streak
  "longestStreak": 0 // Longest daily streak
}
```

## 🐛 Error Responses

### Validation Error:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Username must be at least 3 characters"]
}
```

### Authentication Error:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Authorization Error:

```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

## 🔧 Environment Variables

Tạo file `.env` trong thư mục backend:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/deepfocus
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8081
```

## 📚 Postman Collection

Import vào Postman để test API:

1. **Base URL**: `http://localhost:5000`
2. **Authorization**: Bearer Token (cho protected routes)
3. **Headers**: `Content-Type: application/json`

## 🎯 Next Steps

Sau khi backend chạy thành công, bạn có thể:

1. **Connect frontend** React Native app tới API
2. **Implement Pomodoro session tracking** endpoints
3. **Add statistics và analytics** endpoints
4. **Setup push notifications** cho timer
5. **Add social features** như leaderboards

Backend đã sẵn sàng cho việc phát triển tiếp! 🚀
