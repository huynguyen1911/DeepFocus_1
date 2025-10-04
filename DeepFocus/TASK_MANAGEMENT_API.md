# 📝 Task Management System - DeepFocus Backend

## ✅ Implementation Complete

### 📁 Files Created/Updated

#### 1. **Task Model** (`backend/models/Task.js`)

**Schema Fields:**

```javascript
{
  title: String (required, trim, max 200 chars),
  description: String (optional, trim, max 1000 chars),
  userId: ObjectId (ref 'User', required, indexed),
  estimatedPomodoros: Number (default 1, min 1, max 50),
  completedPomodoros: Number (default 0, min 0),
  priority: String (enum: ['low', 'medium', 'high'], default 'medium'),
  isCompleted: Boolean (default false, indexed),
  completedAt: Date (optional),
  dueDate: Date (optional),
  timestamps: true (createdAt, updatedAt)
}
```

**Indexes:**

- `{ userId: 1, createdAt: -1 }` - Fast user task queries
- `{ userId: 1, isCompleted: 1 }` - Filter by completion status

**Virtual Fields:**

- `progress`: Percentage (completedPomodoros / estimatedPomodoros \* 100)
- `isOverdue`: Boolean (checks if past dueDate and not completed)

**Methods:**

- `incrementPomodoro()`: Increments completedPomodoros, auto-completes if reached estimated
- `getUserStats(userId)`: Static method returning user statistics

**Middleware:**

- Pre-save: Auto-sets completedAt when isCompleted changes to true

---

#### 2. **Task Controller** (`backend/controllers/taskController.js`)

**Functions Implemented:**

1. **getTasks(req, res, next)**

   - GET all tasks for authenticated user
   - Query params: isCompleted, priority, sortBy, order, limit
   - Default sort: createdAt desc
   - Returns array of tasks

2. **getTask(req, res, next)**

   - GET single task by ID
   - Verifies ownership
   - Returns 404 if not found, 403 if not owner

3. **createTask(req, res, next)**

   - POST create new task
   - Validates: title required, estimatedPomodoros >= 1, priority enum
   - Auto-assigns userId from req.user
   - Returns 201 with created task

4. **updateTask(req, res, next)**

   - PUT update existing task
   - Verifies ownership
   - Validates all fields
   - Returns 200 with updated task

5. **deleteTask(req, res, next)**

   - DELETE task by ID
   - Verifies ownership
   - Returns 200 on success

6. **incrementPomodoro(req, res, next)**

   - POST increment completedPomodoros by 1
   - Auto-completes task if reached estimatedPomodoros
   - Verifies ownership
   - Returns updated task

7. **completeTask(req, res, next)**

   - PUT mark task as completed
   - Sets isCompleted = true, completedAt = now
   - Verifies ownership
   - Returns updated task

8. **getTaskStats(req, res, next)**
   - GET user statistics
   - Returns: totalTasks, completedTasks, totalPomodoros, pendingTasks

**Error Handling:**

- ✅ 400: Validation errors with Vietnamese messages
- ✅ 403: Ownership verification failures
- ✅ 404: Task not found
- ✅ 500: Server errors with details

---

#### 3. **Task Routes** (`backend/routes/tasks.js`)

**All routes protected with authMiddleware**

| Method | Endpoint                            | Description         | Body/Query                                                      |
| ------ | ----------------------------------- | ------------------- | --------------------------------------------------------------- |
| GET    | `/api/tasks`                        | Get all user tasks  | Query: isCompleted, priority, sortBy, order, limit              |
| GET    | `/api/tasks/stats`                  | Get user statistics | -                                                               |
| GET    | `/api/tasks/:id`                    | Get single task     | -                                                               |
| POST   | `/api/tasks`                        | Create task         | Body: title, description, estimatedPomodoros, priority, dueDate |
| PUT    | `/api/tasks/:id`                    | Update task         | Body: any task fields                                           |
| DELETE | `/api/tasks/:id`                    | Delete task         | -                                                               |
| POST   | `/api/tasks/:id/increment-pomodoro` | Increment pomodoro  | -                                                               |
| PUT    | `/api/tasks/:id/complete`           | Mark completed      | -                                                               |

**Note:** `/api/tasks/stats` must be defined BEFORE `/api/tasks/:id` to avoid route conflicts

---

#### 4. **Auth Middleware** (`backend/middleware/auth.js`)

**Already exists - no changes needed**

**Features:**

- ✅ Extracts JWT from Authorization header
- ✅ Verifies token with JWT_SECRET
- ✅ Attaches user object to req.user
- ✅ Handles expired/invalid tokens
- ✅ Returns Vietnamese error messages

---

#### 5. **Server.js** (`backend/server.js`)

**Updated:**

```javascript
// Import task routes
const taskRoutes = require("./routes/tasks");

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes); // NEW
```

---

## 🎯 API Documentation

### Authentication

All task routes require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

---

### 1. Get All Tasks

```http
GET /api/tasks
Authorization: Bearer <token>
```

**Query Parameters:**

- `isCompleted`: "true" | "false" (optional)
- `priority`: "low" | "medium" | "high" (optional)
- `sortBy`: "createdAt" | "title" | "priority" | "dueDate" (default: "createdAt")
- `order`: "asc" | "desc" (default: "desc")
- `limit`: number (default: 100)

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "title": "Học React Native",
      "description": "Hoàn thành khóa học",
      "userId": "...",
      "estimatedPomodoros": 4,
      "completedPomodoros": 2,
      "priority": "high",
      "isCompleted": false,
      "dueDate": "2025-10-10T00:00:00.000Z",
      "createdAt": "2025-10-04T...",
      "updatedAt": "2025-10-04T...",
      "progress": 50,
      "isOverdue": false
    }
  ]
}
```

---

### 2. Create Task

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Học React Native",
  "description": "Hoàn thành khóa học",
  "estimatedPomodoros": 4,
  "priority": "high",
  "dueDate": "2025-10-10"
}
```

**Required:** `title`  
**Optional:** `description`, `estimatedPomodoros` (default: 1), `priority` (default: "medium"), `dueDate`

**Response:**

```json
{
  "success": true,
  "message": "Task đã được tạo thành công",
  "data": {
    /* task object */
  }
}
```

---

### 3. Update Task

```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Học React Native - Updated",
  "priority": "medium"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Task đã được cập nhật",
  "data": {
    /* updated task */
  }
}
```

---

### 4. Delete Task

```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Task đã được xóa",
  "data": {}
}
```

---

### 5. Increment Pomodoro

```http
POST /api/tasks/:id/increment-pomodoro
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Pomodoro đã được ghi nhận",
  "data": {
    "_id": "...",
    "completedPomodoros": 3,
    "isCompleted": false
    /* ... rest of task */
  }
}
```

**Auto-completion:** If `completedPomodoros >= estimatedPomodoros`, task will be auto-marked as completed.

---

### 6. Complete Task

```http
PUT /api/tasks/:id/complete
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Task đã được đánh dấu hoàn thành",
  "data": {
    "_id": "...",
    "isCompleted": true,
    "completedAt": "2025-10-04T12:34:56.789Z"
    /* ... rest of task */
  }
}
```

---

### 7. Get Task Statistics

```http
GET /api/tasks/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalTasks": 10,
    "completedTasks": 6,
    "totalPomodoros": 25,
    "pendingTasks": 4
  }
}
```

---

## 🔒 Security Features

### Ownership Verification

Every task operation verifies:

```javascript
if (task.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    success: false,
    message: "Bạn không có quyền truy cập task này",
  });
}
```

### JWT Authentication

All routes protected:

```javascript
router.use(authMiddleware);
```

### Input Validation

- Title required and non-empty
- estimatedPomodoros >= 1
- Priority must be low/medium/high
- Mongoose validation for all fields

---

## 🐛 Error Responses

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Tiêu đề task là bắt buộc"
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập task này"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Task không tồn tại"
}
```

### 500 - Server Error

```json
{
  "success": false,
  "message": "Không thể tạo task",
  "error": "Detailed error message"
}
```

---

## 🧪 Testing with Postman/Thunder Client

### 1. Login First

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Copy the `token` from response.

---

### 2. Create Task

```http
POST http://localhost:5000/api/tasks
Authorization: Bearer <paste_token_here>
Content-Type: application/json

{
  "title": "Học React Native",
  "estimatedPomodoros": 4,
  "priority": "high"
}
```

---

### 3. Get All Tasks

```http
GET http://localhost:5000/api/tasks
Authorization: Bearer <token>
```

---

### 4. Increment Pomodoro

```http
POST http://localhost:5000/api/tasks/<task_id>/increment-pomodoro
Authorization: Bearer <token>
```

---

### 5. Complete Task

```http
PUT http://localhost:5000/api/tasks/<task_id>/complete
Authorization: Bearer <token>
```

---

## 📊 Database Queries Optimization

### Indexes Created:

1. `{ userId: 1, createdAt: -1 }` - Fast user task listing
2. `{ userId: 1, isCompleted: 1 }` - Fast completion filtering
3. `{ isCompleted: 1 }` - Auto-created by schema

### Query Performance:

- getTasks: O(log n) with index
- Ownership check: O(1) comparison
- Statistics: Aggregation pipeline optimized

---

## 🎯 Features Checklist

- [x] Task CRUD operations
- [x] JWT authentication on all routes
- [x] Ownership verification
- [x] Increment pomodoro with auto-completion
- [x] Mark task as completed
- [x] User statistics
- [x] Query filtering (isCompleted, priority)
- [x] Sorting and pagination
- [x] Input validation
- [x] Vietnamese error messages
- [x] Console logging for debugging
- [x] Virtual fields (progress, isOverdue)
- [x] Mongoose middleware (auto-set completedAt)
- [x] Optimized indexes

---

## 🚀 Next Steps

1. **Start Backend Server:**

```bash
cd backend
npm run dev
```

2. **Test Endpoints:** Use Postman/Thunder Client with examples above

3. **Frontend Integration:** Create API service in React Native to consume these endpoints

4. **Optional Enhancements:**

- [ ] Task categories/tags
- [ ] Task comments/notes
- [ ] Recurring tasks
- [ ] Task collaboration
- [ ] File attachments
- [ ] Reminders/notifications

---

## 📝 Console Logs

Expected logs when using API:

```
🔐 Authenticated user: john_doe (64f5a6b2c3d4e5f6a7b8c9d0)
✅ Created task: Học React Native for user: john_doe
📋 Retrieved 5 tasks for user: john_doe
🍅 Incremented pomodoro for task: Học React Native (3/4)
✅ Completed task: Học React Native
🗑️ Deleted task: Old task
📊 Retrieved stats for user: john_doe
```

---

**Status: ✅ COMPLETE & READY TO TEST**

All task management endpoints are implemented and ready for use! 🎉
