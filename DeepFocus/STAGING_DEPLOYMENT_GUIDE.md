# 🚀 HƯỚNG DẪN TRIỂN KHAI STAGING - DEEPFOCUS

**Ngày tạo:** 01/12/2025  
**Phiên bản:** 1.0  
**Mục đích:** Triển khai staging environment cho DeepFocus backend + mobile app

---

## 📋 MỤC LỤC

1. [Chuẩn bị](#1-chuẩn-bị)
2. [Firebase Setup](#2-firebase-setup)
3. [Backend Deployment](#3-backend-deployment)
4. [Database Setup](#4-database-setup)
5. [Mobile App Testing](#5-mobile-app-testing)
6. [Verification](#6-verification)

---

## 1. CHUẨN BỊ

### 1.1 Yêu cầu hệ thống

- [ ] Node.js 16+ đã cài đặt
- [ ] MongoDB đang chạy (local hoặc cloud)
- [ ] Git đã cài đặt
- [ ] Tài khoản Google (cho Firebase)
- [ ] Tài khoản hosting (Heroku/Railway/Render - chọn 1)

### 1.2 Kiểm tra backend tests

```powershell
# Đảm bảo tất cả tests pass
cd backend
npm test
```

**Expected:** 348/348 tests passing ✅

---

## 2. FIREBASE SETUP

### 2.1 Tạo Firebase Project

1. **Truy cập Firebase Console:**

   - Đi đến: https://console.firebase.google.com/
   - Đăng nhập bằng tài khoản Google

2. **Tạo project mới:**

   ```
   - Click "Add project" / "Thêm dự án"
   - Tên project: "DeepFocus Staging"
   - Disable Google Analytics (không cần cho staging)
   - Click "Create project"
   ```

3. **Chờ project khởi tạo** (~30-60 giây)

### 2.2 Thêm Android App (cho push notifications)

1. **Trong Firebase Console:**

   ```
   - Chọn project "DeepFocus Staging"
   - Click biểu tượng Android (hoặc "Add app")
   - Android package name: com.deepfocus.staging
   - App nickname: DeepFocus Staging Android
   - Click "Register app"
   ```

2. **Download `google-services.json`:**
   ```
   - Click "Download google-services.json"
   - Lưu file vào: DeepFocus/android/app/google-services.json
   ```

### 2.3 Thêm iOS App (nếu cần)

1. **Trong Firebase Console:**

   ```
   - Click biểu tượng iOS (hoặc "Add app")
   - iOS bundle ID: com.deepfocus.staging
   - App nickname: DeepFocus Staging iOS
   - Click "Register app"
   ```

2. **Download `GoogleService-Info.plist`:**
   ```
   - Click "Download GoogleService-Info.plist"
   - Lưu file vào: DeepFocus/ios/GoogleService-Info.plist
   ```

### 2.4 Cloud Messaging (Tự động được enable)

**Giải thích:** Cloud Messaging API tự động được kích hoạt khi bạn tạo Service Account ở bước tiếp theo. Không cần làm gì thêm!

💡 **Lưu ý Firebase Console mới:**

- Menu "Cloud Messaging" có thể không hiển thị cho đến khi bạn tạo Service Account
- API sẽ tự động enable khi cần thiết
- Bạn có thể bỏ qua bước này và chuyển sang bước 2.5

### 2.5 Tạo Service Account (cho backend) - QUAN TRỌNG NHẤT!

1. **Trong Firebase Console:**

   ```
   - Click biểu tượng ⚙️ (Settings) > "Project settings"
   - Vào tab "Service accounts"
   - Click "Generate new private key"
   - Confirm download
   - File JSON sẽ được tải về
   ```

2. **Lưu service account key:**

   ```powershell
   # Tạo thư mục cho credentials (local only)
   cd backend
   mkdir credentials -Force

   # Di chuyển file vừa download vào đây
   # Đổi tên file thành: firebase-admin-key.json
   # Path: backend/credentials/firebase-admin-key.json
   ```

3. **Thêm vào .gitignore:**
   ```powershell
   # Đảm bảo không commit credentials
   echo "credentials/" >> .gitignore
   echo "firebase-admin-key.json" >> .gitignore
   ```

### 2.6 Lấy Firebase credentials

**Mở file `firebase-admin-key.json` và ghi lại:**

```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID", // ← Cần cái này
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n", // ← Cần cái này
  "client_email": "firebase-adminsdk-xxxxx@YOUR_PROJECT_ID.iam.gserviceaccount.com" // ← Cần cái này
}
```

**Bạn cần 3 giá trị:**

- `FIREBASE_PROJECT_ID`: từ `project_id`
- `FIREBASE_PRIVATE_KEY`: từ `private_key` (giữ nguyên format với `\n`)
- `FIREBASE_CLIENT_EMAIL`: từ `client_email`

---

## 3. BACKEND DEPLOYMENT

### Option 1: Deploy lên Railway (Recommended - Free tier)

#### 3.1 Đăng ký Railway

1. **Truy cập:** https://railway.app/
2. **Sign up** bằng GitHub
3. **Verify email**

#### 3.2 Tạo project mới

```
- Click "New Project"
- Chọn "Deploy from GitHub repo"
- Authorize Railway truy cập GitHub
- Chọn repository: huynguyen1911/DeepFocus_1
- Chọn branch: main
```

#### 3.3 Configure deployment

1. **Trong Railway dashboard:**

   ```
   - Click vào service vừa tạo
   - Vào tab "Settings"
   - Root Directory: DeepFocus/backend
   - Build Command: npm install
   - Start Command: npm start
   ```

2. **Set environment variables:**
   ```
   - Vào tab "Variables"
   - Click "New Variable"
   - Thêm từng biến sau:
   ```

**Environment Variables cần thêm:**

```bash
# Node Environment
NODE_ENV=staging

# MongoDB Connection
MONGODB_URI=mongodb+srv://your-mongodb-connection-string

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Frontend URL (để CORS)
FRONTEND_URL=exp://your-expo-dev-client-url

# Firebase Credentials (từ bước 2.6)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----

# Server Port (Railway tự set)
PORT=3000
```

#### 3.4 Deploy

```
- Railway tự động deploy sau khi set variables
- Chờ build complete (~2-3 phút)
- Copy Railway URL: https://deepfocus-backend-staging.railway.app
```

---

### Option 2: Deploy lên Render (Alternative - Free tier)

#### 3.1 Đăng ký Render

1. **Truy cập:** https://render.com/
2. **Sign up** bằng GitHub
3. **Verify email**

#### 3.2 Tạo Web Service

```
- Click "New +"
- Chọn "Web Service"
- Connect repository: huynguyen1911/DeepFocus_1
- Service name: deepfocus-staging
- Root Directory: DeepFocus/backend
- Environment: Node
- Build Command: npm install
- Start Command: npm start
- Plan: Free
```

#### 3.3 Set Environment Variables

**Trong "Environment" tab, thêm:**

```bash
NODE_ENV=staging
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
FRONTEND_URL=exp://your-expo-url
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key-with-newlines
```

#### 3.4 Deploy

```
- Click "Create Web Service"
- Chờ deployment (~3-5 phút)
- Copy Render URL: https://deepfocus-staging.onrender.com
```

---

### Option 3: Deploy lên Heroku (Paid - $5/month minimum)

#### 3.1 Cài Heroku CLI

```powershell
# Download và cài: https://devcenter.heroku.com/articles/heroku-cli
# Hoặc dùng npm:
npm install -g heroku
```

#### 3.2 Login và tạo app

```powershell
# Login
heroku login

# Tạo app mới
cd backend
heroku create deepfocus-staging

# Add MongoDB addon (free tier)
heroku addons:create mongolab:sandbox
```

#### 3.3 Set environment variables

```powershell
# Set từng biến
heroku config:set NODE_ENV=staging
heroku config:set JWT_SECRET=your-jwt-secret-here
heroku config:set FRONTEND_URL=exp://your-expo-url

# Firebase credentials
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_CLIENT_EMAIL=your-client-email
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
```

#### 3.4 Deploy

```powershell
# Deploy từ backend folder
git subtree push --prefix DeepFocus/backend heroku main

# Hoặc nếu có lỗi, dùng force:
git push heroku `git subtree split --prefix DeepFocus/backend main`:main --force
```

---

## 4. DATABASE SETUP

### Option 1: MongoDB Atlas (Recommended - Free tier)

#### 4.1 Tạo cluster

1. **Truy cập:** https://www.mongodb.com/cloud/atlas
2. **Sign up / Login**
3. **Tạo cluster mới:**
   ```
   - Click "Build a Database"
   - Chọn "Shared" (Free tier)
   - Cloud Provider: AWS
   - Region: Singapore (gần Việt Nam nhất)
   - Cluster Name: DeepFocus-Staging
   - Click "Create"
   ```

#### 4.2 Tạo database user

```
- Vào "Database Access"
- Click "Add New Database User"
- Username: deepfocus_admin
- Password: [Generate secure password]
- Database User Privileges: "Read and write to any database"
- Click "Add User"
```

#### 4.3 Whitelist IP

```
- Vào "Network Access"
- Click "Add IP Address"
- Chọn "Allow Access from Anywhere" (0.0.0.0/0)
- Click "Confirm"
```

#### 4.4 Lấy connection string

```
- Vào "Database" > Click "Connect"
- Chọn "Connect your application"
- Driver: Node.js, Version: 4.1 or later
- Copy connection string:
  mongodb+srv://deepfocus_admin:<password>@deepfocus-staging.xxxxx.mongodb.net/?retryWrites=true&w=majority
- Thay <password> bằng password thật
```

#### 4.5 Cập nhật backend config

**Thêm vào environment variables của hosting service:**

```bash
MONGODB_URI=mongodb+srv://deepfocus_admin:your-password@deepfocus-staging.xxxxx.mongodb.net/deepfocus?retryWrites=true&w=majority
```

---

## 5. MOBILE APP TESTING

### 5.1 Cập nhật backend URL

**File: `DeepFocus/src/config/api.ts` (hoặc tương tự):**

```typescript
// Thêm staging config
const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api" // Development
  : "https://deepfocus-staging.railway.app/api"; // Staging/Production

export default API_BASE_URL;
```

### 5.2 Build và test trên Expo

```powershell
# Di chuyển đến root project
cd c:\Users\Public\Programming\DeepFocus\DeepFocus

# Start Expo dev server
npx expo start

# Chọn platform để test:
# - Press 'a' cho Android
# - Press 'i' cho iOS
# - Scan QR code trên Expo Go app (điện thoại)
```

### 5.3 Test push notifications

1. **Đăng ký device token:**

   - Mở app trên điện thoại thật (không phải emulator)
   - Allow notifications khi được hỏi
   - Device token sẽ tự động gửi lên backend

2. **Trigger một notification:**

   ```
   - Tạo một reward mới trong app
   - Hoặc unlock achievement
   - Check xem notification có hiện không
   ```

3. **Debug nếu không nhận được:**

   ```powershell
   # Check backend logs
   # Railway: Vào tab "Deployments" > Click latest > "View Logs"
   # Render: Vào tab "Logs"
   # Heroku: heroku logs --tail

   # Tìm log dạng:
   # "✅ Firebase Admin SDK initialized successfully"
   # Hoặc error message
   ```

---

## 6. VERIFICATION

### 6.1 Health check

**Test backend có hoạt động:**

```powershell
# Thay YOUR-BACKEND-URL bằng URL thật
curl https://your-backend-url.railway.app/health

# Expected response:
# { "status": "ok", "timestamp": "2025-12-01..." }
```

### 6.2 Test APIs

**Register user:**

```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-backend-url/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected:** User created successfully ✅

### 6.3 Test push notifications

**Send test notification (từ backend):**

```powershell
# Cần có authentication token và device token
# Gọi endpoint:
POST /api/notifications/test

# Check device có nhận được notification
```

### 6.4 Checklist cuối cùng

- [ ] Backend đã deploy thành công
- [ ] MongoDB connection hoạt động
- [ ] Firebase credentials được set đúng
- [ ] App mobile kết nối được với backend
- [ ] Push notifications hoạt động
- [ ] Có thể đăng ký/đăng nhập
- [ ] Có thể tạo class/task/reward
- [ ] Alerts hiển thị đúng
- [ ] 348 backend tests vẫn pass

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Cannot find module 'firebase-admin'"

**Nguyên nhân:** Dependencies chưa được install đúng

**Giải pháp:**

```powershell
cd backend
npm install firebase-admin expo-server-sdk pdfkit --save
git add package.json package-lock.json
git commit -m "Add notification dependencies"
git push
```

### Lỗi: "Firebase credentials not configured"

**Nguyên nhân:** Environment variables chưa set

**Giải pháp:**

- Check lại 3 biến: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Đảm bảo `FIREBASE_PRIVATE_KEY` có giữ nguyên `\n` (newlines)
- Restart service sau khi set variables

### Lỗi: "MongoDB connection timeout"

**Nguyên nhân:** IP chưa được whitelist hoặc connection string sai

**Giải pháp:**

- Vào MongoDB Atlas > Network Access
- Add IP: 0.0.0.0/0 (allow all)
- Check connection string có đúng format không

### Lỗi: Push notification không nhận được

**Nguyên nhân:** Nhiều khả năng

**Giải pháp:**

1. Check device có register token không (check DB collection `pushtokens`)
2. Check Firebase credentials đúng không
3. Test trên điện thoại thật (không phải emulator)
4. Check backend logs có error không
5. Verify FCM đã enable trong Firebase Console

---

## 📚 TÀI LIỆU THAM KHẢO

- Firebase Setup: https://firebase.google.com/docs/admin/setup
- Railway Docs: https://docs.railway.app/
- Render Docs: https://render.com/docs
- Heroku Docs: https://devcenter.heroku.com/
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview/

---

## 🎯 NEXT STEPS

Sau khi staging hoạt động ổn định:

1. **Setup CI/CD:**

   - GitHub Actions để auto-deploy khi push
   - Auto-run tests trước khi deploy

2. **Monitoring:**

   - Setup error tracking (Sentry)
   - Setup performance monitoring
   - Setup uptime monitoring

3. **Production Deployment:**
   - Tạo production environment riêng
   - Setup production MongoDB cluster
   - Setup production Firebase project
   - Domain name và SSL certificate

---

**Cập nhật:** 01/12/2025  
**Status:** Ready for staging deployment  
**Backend tests:** 348/348 passing ✅
