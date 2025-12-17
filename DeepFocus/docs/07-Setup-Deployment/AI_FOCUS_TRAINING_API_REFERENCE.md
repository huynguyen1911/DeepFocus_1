# 🚀 AI Focus Training - API Quick Reference

Base URL: `http://localhost:5000/api/focus-training`

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## 📋 Endpoints Overview

| Method | Endpoint                              | Description                      |
| ------ | ------------------------------------- | -------------------------------- |
| POST   | `/assess`                             | Submit initial assessment        |
| POST   | `/generate-plan`                      | Generate training plan           |
| GET    | `/plan`                               | Get active plan                  |
| GET    | `/days`                               | Get training days (for calendar) |
| GET    | `/day/:date`                          | Get specific day details         |
| POST   | `/day/:dayId/challenge/:idx/complete` | Complete a challenge             |
| POST   | `/weekly-assessment`                  | Submit weekly assessment         |
| GET    | `/progress`                           | Get progress dashboard           |
| PUT    | `/plan/status`                        | Pause/Resume/Cancel plan         |

---

## 1️⃣ Submit Assessment

**POST** `/api/focus-training/assess`

Submit initial assessment and get AI analysis.

### Request Body

```json
{
  "focusLevel": 5, // 1-10, required
  "distractionLevel": 7, // 1-10, optional
  "motivationLevel": 8, // 1-10, optional
  "energyLevel": 6, // 1-10, optional
  "stressLevel": 6, // 1-10, optional
  "primaryGoal": "study_habits", // required
  "availableTimePerDay": 60, // minutes, required
  "preferredSessionLength": 20, // minutes, optional
  "experienceLevel": "beginner", // required
  "distractions": ["phone", "social_media"]
}
```

**Primary Goal Options:**

- `exam_preparation`
- `work_productivity`
- `study_habits`
- `meditation`
- `deep_work`
- `reduce_distractions`
- `other`

**Experience Level Options:**

- `none`
- `beginner`
- `intermediate`
- `advanced`

**Distraction Options:**

- `phone`, `social_media`, `noise`, `people`, `thoughts`, `fatigue`, `hunger`, `other`

### Response (201 Created)

```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": {
    "assessmentId": "6756a1b2c3d4e5f6a7b8c9d0",
    "focusScore": 52,
    "analysis": "Dựa trên đánh giá của bạn, khả năng tập trung hiện tại...",
    "recommendations": [
      "Bắt đầu với phiên tập trung ngắn 15-20 phút",
      "Tạo môi trường làm việc không bị phân tâm",
      "..."
    ],
    "suggestedDifficulty": "beginner",
    "suggestedDuration": 6
  }
}
```

---

## 2️⃣ Generate Training Plan

**POST** `/api/focus-training/generate-plan`

Generate personalized training plan based on assessment.

### Request Body

```json
{
  "assessmentId": "6756a1b2c3d4e5f6a7b8c9d0", // optional
  "customDuration": 4, // weeks, optional
  "startDate": "2025-12-08" // YYYY-MM-DD, optional
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "Training plan generated successfully",
  "data": {
    "plan": {
      "id": "6756a2b3c4d5e6f7a8b9c0d1",
      "title": "Kế hoạch 6 tuần - beginner",
      "duration": 6,
      "difficulty": "beginner",
      "startDate": "2025-12-08T00:00:00.000Z",
      "endDate": "2026-01-19T00:00:00.000Z",
      "totalDays": 42,
      "trainingDays": 30,
      "restDays": 12
    },
    "previewDays": [
      {
        "date": "2025-12-08T00:00:00.000Z",
        "type": "training",
        "challengesCount": 2
      }
      // ... next 6 days
    ]
  }
}
```

---

## 3️⃣ Get Active Plan

**GET** `/api/focus-training/plan`

Get user's active training plan.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "plan": {
      "_id": "6756a2b3c4d5e6f7a8b9c0d1",
      "title": "Kế hoạch 6 tuần - beginner",
      "description": "Kế hoạch rèn luyện tập trung cá nhân hóa",
      "duration": 6,
      "difficulty": "beginner",
      "startDate": "2025-12-08T00:00:00.000Z",
      "endDate": "2026-01-19T00:00:00.000Z",
      "status": "active",
      "totalDays": 42,
      "completedDays": 5,
      "completionRate": 12,
      "currentStreak": 3,
      "longestStreak": 4,
      "totalPoints": 850,
      "totalFocusMinutes": 240,
      "currentWeek": 1,
      "initialAssessmentId": "6756a1b2c3d4e5f6a7b8c9d0"
    }
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "No active training plan found"
}
```

---

## 4️⃣ Get Training Days

**GET** `/api/focus-training/days`

Get training days for calendar view.

### Query Parameters

- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

### Example

```
GET /api/focus-training/days?startDate=2025-12-01&endDate=2025-12-31
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "days": [
      {
        "_id": "6756a3b4c5d6e7f8a9b0c1d2",
        "date": "2025-12-08T00:00:00.000Z",
        "dayNumber": 1,
        "weekNumber": 1,
        "type": "training",
        "completed": true,
        "completedAt": "2025-12-08T14:30:00.000Z",
        "challenges": [
          {
            "type": "focus_session",
            "duration": 15,
            "difficulty": 3,
            "completed": true,
            "score": 85
          }
        ],
        "totalPoints": 150
      },
      {
        "_id": "6756a4b5c6d7e8f9a0b1c2d3",
        "date": "2025-12-12T00:00:00.000Z",
        "dayNumber": 5,
        "weekNumber": 1,
        "type": "rest",
        "completed": false,
        "challenges": []
      }
      // ... more days
    ]
  }
}
```

---

## 5️⃣ Get Day Details

**GET** `/api/focus-training/day/:date`

Get specific training day details with challenges.

### Example

```
GET /api/focus-training/day/2025-12-08
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "trainingDay": {
      "_id": "6756a3b4c5d6e7f8a9b0c1d2",
      "date": "2025-12-08T00:00:00.000Z",
      "dayNumber": 1,
      "weekNumber": 1,
      "type": "training",
      "completed": false,
      "challenges": [
        {
          "type": "focus_session",
          "duration": 15,
          "difficulty": 3,
          "description": "Phiên tập trung 15 phút đầu tiên",
          "instructions": [
            "Tìm không gian yên tĩnh",
            "Tắt thông báo điện thoại",
            "Chọn một nhiệm vụ cụ thể",
            "Tập trung hoàn toàn trong 15 phút",
            "Ghi chú cảm nhận sau khi hoàn thành"
          ],
          "completed": false,
          "score": null
        },
        {
          "type": "breathing",
          "duration": 5,
          "difficulty": 2,
          "description": "Bài tập thở để chuẩn bị tâm trí",
          "instructions": [
            "Ngồi thoải mái, lưng thẳng",
            "Hít thở sâu 4 giây",
            "Giữ hơi 4 giây",
            "Thở ra 6 giây",
            "Lặp lại 10 lần"
          ],
          "completed": false,
          "score": null
        }
      ],
      "totalPoints": 0,
      "aiEncouragement": "🌟 Hôm nay là ngày tuyệt vời để bắt đầu hành trình..."
    }
  }
}
```

---

## 6️⃣ Complete Challenge

**POST** `/api/focus-training/day/:dayId/challenge/:challengeIndex/complete`

Mark a challenge as completed.

### Example

```
POST /api/focus-training/day/6756a3b4c5d6e7f8a9b0c1d2/challenge/0/complete
```

### Request Body

```json
{
  "score": 85, // 0-100, optional
  "feedback": "Felt great!" // optional
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Challenge completed successfully",
  "data": {
    "trainingDay": {
      "_id": "6756a3b4c5d6e7f8a9b0c1d2",
      "completed": true,
      "challenges": [
        {
          "type": "focus_session",
          "completed": true,
          "completedAt": "2025-12-08T10:30:00.000Z",
          "score": 85
        }
      ],
      "totalPoints": 150
    },
    "points": 150,
    "dayCompleted": true
  }
}
```

---

## 7️⃣ Submit Weekly Assessment

**POST** `/api/focus-training/weekly-assessment`

Submit weekly assessment and get AI feedback.

### Request Body

```json
{
  "weekNumber": 1,
  "responses": {
    "focusLevel": 6,
    "energyLevel": 7,
    "difficultyLevel": 4,
    "satisfaction": 8,
    "challenges": ["time management", "phone distractions"]
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Weekly assessment submitted",
  "data": {
    "assessment": {
      "_id": "6756a5b6c7d8e9f0a1b2c3d4",
      "type": "weekly",
      "focusScore": 68,
      "improvement": 15
    },
    "feedback": "Tuần này bạn đã làm rất tốt! Tỷ lệ hoàn thành 85%...",
    "encouragement": "🎯 Bạn đang trên đà phát triển tốt!",
    "improvement": 15
  }
}
```

---

## 8️⃣ Get Progress Dashboard

**GET** `/api/focus-training/progress`

Get comprehensive progress statistics.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "plan": {
      "title": "Kế hoạch 6 tuần - beginner",
      "duration": 6,
      "status": "active"
    },
    "stats": {
      "totalDays": 42,
      "completedDays": 8,
      "completionRate": 19,
      "currentStreak": 3,
      "longestStreak": 5,
      "totalPoints": 1250,
      "totalFocusMinutes": 420,
      "totalFocusHours": 7.0,
      "averageSessionDuration": 22,
      "focusScoreImprovement": 12
    },
    "assessments": [
      {
        "type": "initial",
        "focusScore": 52,
        "assessmentDate": "2025-12-01T00:00:00.000Z"
      },
      {
        "type": "weekly",
        "focusScore": 64,
        "assessmentDate": "2025-12-08T00:00:00.000Z",
        "improvement": 23
      }
    ],
    "recentActivity": [
      {
        "date": "2025-12-08T00:00:00.000Z",
        "completed": true,
        "type": "training",
        "totalPoints": 150
      }
      // ... last 7 days
    ]
  }
}
```

---

## 9️⃣ Update Plan Status

**PUT** `/api/focus-training/plan/status`

Pause, resume, or cancel plan.

### Request Body

```json
{
  "action": "pause" // "pause", "resume", or "cancel"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Plan paused successfully",
  "data": {
    "plan": {
      "_id": "6756a2b3c4d5e6f7a8b9c0d1",
      "status": "paused"
    }
  }
}
```

---

## ⚠️ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Missing required fields",
  "missingFields": ["focusLevel", "primaryGoal"]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No token provided"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "No active training plan found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Error processing assessment",
  "error": "OpenAI API error: Rate limit exceeded"
}
```

---

## 🔐 Authentication

All endpoints require JWT token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token from login endpoint:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 🧪 Testing with cURL

### Submit Assessment

```bash
curl -X POST http://localhost:5000/api/focus-training/assess \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "focusLevel": 5,
    "primaryGoal": "study_habits",
    "availableTimePerDay": 60,
    "experienceLevel": "beginner"
  }'
```

### Get Training Days

```bash
curl -X GET "http://localhost:5000/api/focus-training/days?startDate=2025-12-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Complete Challenge

```bash
curl -X POST http://localhost:5000/api/focus-training/day/DAYID/challenge/0/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"score": 85}'
```

---

## 🧪 Testing with PowerShell

Use the provided test script:

```powershell
cd DeepFocus\backend\scripts
.\test-focus-training-api.ps1
```

This script will:

1. Login/Register test user
2. Submit assessment
3. Generate plan
4. Get today's training
5. Show progress dashboard

---

## 📊 Response Times

Expected response times:

| Endpoint         | Expected Time | Note                            |
| ---------------- | ------------- | ------------------------------- |
| `/assess`        | 5-10s         | AI analysis                     |
| `/generate-plan` | 10-20s        | AI plan generation (first time) |
| `/generate-plan` | 2-5s          | Subsequent calls (cached)       |
| `/days`          | <500ms        | Database query                  |
| `/day/:date`     | 1-3s          | Include AI encouragement        |
| `/complete`      | <300ms        | Database update                 |
| `/progress`      | <500ms        | Aggregated query                |

---

## 💡 Tips

1. **Cache Responses**: AI responses should be cached to avoid repeated calls
2. **Rate Limiting**: Implement rate limiting (1 plan per day per user)
3. **Pagination**: For large date ranges in `/days`, consider pagination
4. **Background Jobs**: Generate AI encouragement in background
5. **Error Handling**: Always handle AI API failures gracefully

---

## 📚 Related Docs

- [SETUP_AI_FOCUS_TRAINING.md](./SETUP_AI_FOCUS_TRAINING.md) - Setup guide
- [AI_FOCUS_TRAINING_IMPLEMENTATION_GUIDE.md](./AI_FOCUS_TRAINING_IMPLEMENTATION_GUIDE.md) - Architecture
- [AI_FOCUS_TRAINING_CHECKLIST.md](./AI_FOCUS_TRAINING_CHECKLIST.md) - Progress tracking

---

**Last Updated**: December 8, 2025
**API Version**: 1.0.0
