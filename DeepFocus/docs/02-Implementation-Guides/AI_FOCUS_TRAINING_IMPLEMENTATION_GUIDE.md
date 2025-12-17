# 🤖 AI Focus Training Plan - Hướng Dẫn Tích Hợp

## 📖 Tổng Quan

Tính năng AI Focus Training Plan giúp người dùng xây dựng thói quen tập trung thông qua:

- **Đánh giá ban đầu**: AI hỏi câu hỏi về khả năng tập trung hiện tại
- **Tạo kế hoạch cá nhân hóa**: Plan 2-8 tuần với bài tập tăng dần
- **Lịch trực quan**: Hiển thị challenges hàng ngày trên calendar
- **Ngày nghỉ**: Tự động đưa rest days vào plan
- **Theo dõi tiến độ**: AI đánh giá sau mỗi đợt tập luyện
- **Điều chỉnh động**: AI adapt plan dựa trên performance

---

## 🎯 Các Lựa Chọn AI Provider

### Option 1: OpenAI GPT (Khuyến nghị)

- **Ưu điểm**: Mạnh nhất, structured output tốt, function calling
- **Chi phí**: ~$0.002/request với GPT-4o-mini
- **Setup**: Cần API key từ platform.openai.com

### Option 2: Anthropic Claude

- **Ưu điểm**: Rất tốt với tiếng Việt, context window lớn
- **Chi phí**: ~$0.003/request với Claude 3 Haiku
- **Setup**: Cần API key từ console.anthropic.com

### Option 3: Google Gemini (Miễn phí)

- **Ưu điểm**: Free tier rộng rãi (60 requests/minute)
- **Chi phí**: FREE cho Gemini 1.5 Flash
- **Setup**: Cần API key từ ai.google.dev

### Option 4: Self-hosted (Nâng cao)

- **Ưu điểm**: Hoàn toàn free, privacy tốt
- **Chi phí**: Chi phí server/GPU
- **Options**: Ollama + Llama 3, Mistral, etc.

---

## 🚀 Implementation Roadmap

### Phase 1: Backend Setup (Week 1)

1. ✅ Cài đặt AI SDK
2. ✅ Tạo database models
3. ✅ Tạo AI service với prompt engineering
4. ✅ Tạo API endpoints
5. ✅ Testing với Postman

### Phase 2: Frontend UI (Week 2)

1. ✅ Onboarding questionnaire screen
2. ✅ Calendar view với training days
3. ✅ Daily challenge detail screen
4. ✅ Progress tracking dashboard
5. ✅ Post-training assessment

### Phase 3: Integration (Week 3)

1. ✅ Connect frontend với backend
2. ✅ Implement notification system
3. ✅ Add gamification (points, badges)
4. ✅ Testing end-to-end

---

## 📦 Cài Đặt Dependencies

### Backend

```bash
cd DeepFocus/backend
npm install openai
# HOẶC
npm install @anthropic-ai/sdk
# HOẶC
npm install @google/generative-ai
```

### Frontend (không cần thêm, đã có sẵn)

- `react-native-calendars` (hoặc sử dụng @react-native-community/datetimepicker)
- `axios` ✅ đã có

---

## 🔐 Configuration

### 1. Tạo file `.env` trong backend (nếu chưa có)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/deepfocus

# JWT
JWT_SECRET=your_jwt_secret_here

# AI Provider - Chọn 1 trong các options
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GOOGLE_AI_API_KEY=...

# AI Configuration
AI_PROVIDER=openai  # options: openai, anthropic, google, ollama
AI_MODEL=gpt-4o-mini  # openai models: gpt-4o-mini, gpt-4o, gpt-3.5-turbo
                      # anthropic models: claude-3-haiku-20240307, claude-3-5-sonnet-20241022
                      # google models: gemini-1.5-flash, gemini-1.5-pro
```

### 2. Lấy API Keys

#### OpenAI (Khuyến nghị)

1. Truy cập: https://platform.openai.com/api-keys
2. Tạo account hoặc login
3. Click "Create new secret key"
4. Copy và paste vào `.env`
5. Nạp credit (tối thiểu $5)

#### Google Gemini (Free - Tốt cho testing)

1. Truy cập: https://ai.google.dev/
2. Click "Get API Key" → "Create API key"
3. Copy và paste vào `.env`
4. Free 60 requests/minute!

#### Anthropic Claude

1. Truy cập: https://console.anthropic.com/
2. Tạo account → API Keys
3. Copy và paste vào `.env`

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React Native)               │
├─────────────────────────────────────────────────────────────┤
│  Questionnaire → Calendar View → Daily Challenge → Assessment│
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Controllers → Services → AI Service → External AI API      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                      │
├─────────────────────────────────────────────────────────────┤
│  FocusPlan | TrainingDay | UserProgress | Assessment        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### FocusPlan Model

```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  duration: Number, // weeks
  difficulty: String, // beginner, intermediate, advanced
  goals: [String],
  createdAt: Date,
  startDate: Date,
  endDate: Date,
  status: String, // active, completed, paused
  completionRate: Number
}
```

### TrainingDay Model

```javascript
{
  planId: ObjectId,
  userId: ObjectId,
  date: Date,
  dayNumber: Number,
  weekNumber: Number,
  type: String, // training, rest
  challenges: [{
    type: String, // focus_session, breathing, mindfulness
    duration: Number, // minutes
    difficulty: Number, // 1-10
    description: String,
    instructions: [String],
    completed: Boolean,
    score: Number
  }],
  feedback: String,
  completed: Boolean
}
```

### UserAssessment Model

```javascript
{
  userId: ObjectId,
  planId: ObjectId,
  type: String, // initial, weekly, final
  date: Date,
  responses: Map, // Q&A pairs
  aiAnalysis: String,
  focusScore: Number, // 0-100
  recommendations: [String]
}
```

---

## 🎨 User Flow

### 1. Initial Assessment

```
User opens "Focus Training" tab
  ↓
AI asks 5-7 questions:
  - Current focus ability (1-10)
  - Typical work session length
  - Main distractions
  - Previous focus training experience
  - Goals (exam prep, work productivity, etc.)
  - Available time per day
  ↓
AI generates personalized plan
```

### 2. Plan Generation

```
AI analyzes responses
  ↓
Creates structured plan:
  Week 1-2: Short sessions (10-15 min)
  Week 3-4: Medium sessions (20-25 min)
  Week 5-6: Long sessions (30-40 min)
  Week 7-8: Mastery sessions (45-50 min)
  + Rest days every 3-4 days
  ↓
Save to database
```

### 3. Daily Training

```
User opens Calendar
  ↓
Sees training days marked
  ↓
Taps on today's date
  ↓
Views challenges for the day:
  - Morning: 15min focus session
  - Afternoon: 5min breathing exercise
  - Evening: 10min reflection
  ↓
Complete challenges → Mark as done
  ↓
Get points & feedback
```

### 4. Progress Assessment

```
Every week / at milestones:
  ↓
AI asks follow-up questions:
  - How did this week go?
  - Difficulties encountered?
  - Energy levels?
  ↓
AI adjusts next week's plan if needed
  ↓
Show progress chart
```

---

## 🤖 AI Prompt Strategy

### System Prompt (Example)

```
You are a focus training coach specialized in helping users build deep work habits.
Create personalized training plans similar to running training programs.

Key principles:
1. Progressive overload - gradually increase difficulty
2. Include rest days (every 3-4 days)
3. Vary activities (focus sessions, breathing, mindfulness)
4. Consider user's starting level
5. Provide encouraging, specific feedback

Output format: Structured JSON with weekly breakdown.
```

### Plan Generation Prompt

```
Based on this user profile:
- Current focus ability: {score}/10
- Goal: {goal}
- Available time: {minutes} min/day
- Experience: {level}

Create a {duration}-week focus training plan with:
- Daily challenges (including rest days)
- Progressive difficulty
- Variety of activities
- Specific instructions
- Milestone assessments

Return as JSON.
```

---

## 🎮 Gamification Elements

1. **Points System**

   - Complete daily challenge: +50 points
   - Complete weekly goal: +200 points
   - Perfect week (all days): +500 points

2. **Badges**

   - 🔥 "First Focus" - Complete first session
   - 🎯 "Week Warrior" - Complete full week
   - 💪 "Focus Master" - Complete 8-week plan
   - 🌟 "Consistent" - 7 days streak

3. **Progress Dashboard**
   - Total focus hours
   - Streak counter
   - Completion percentage
   - Before/After focus score comparison

---

## 📱 Screen Mockups

### 1. Onboarding Screen

```
┌─────────────────────────┐
│ Let's Build Your Focus  │
│      Training Plan      │
├─────────────────────────┤
│                         │
│ Question 1/5:           │
│ How would you rate your │
│ current ability to focus│
│ on a single task?       │
│                         │
│ ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐   │
│ 1 ──────────────── 10   │
│                         │
│      [Continue] →       │
└─────────────────────────┘
```

### 2. Calendar View

```
┌─────────────────────────┐
│    December 2025        │
│  Mo Tu We Th Fr Sa Su   │
│   1  2  3  4  5  6  7   │
│   8 🔥 10 💪 12 😴 14   │
│  15 🔥 17 💪 19 😴 21   │
│  22 🔥 24 💪 26 😴 28   │
├─────────────────────────┤
│ 🔥 Training Day         │
│ 💪 Challenge Day        │
│ 😴 Rest Day             │
└─────────────────────────┘
```

### 3. Daily Challenge Detail

```
┌─────────────────────────┐
│   Today's Challenges    │
├─────────────────────────┤
│ Morning Session         │
│ 🎯 15 min Focus Block   │
│ ⏱️  Start Timer         │
│ ✅ Complete             │
├─────────────────────────┤
│ Afternoon Practice      │
│ 🧘 5 min Breathing      │
│ 📝 Instructions         │
│ ⭕ Not Started          │
├─────────────────────────┤
│ Today's Progress: 1/2   │
│ Points Earned: 50       │
└─────────────────────────┘
```

---

## 🧪 Testing Plan

### Backend Testing

```bash
# Test AI service
curl -X POST http://localhost:3000/api/focus-training/assess \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "focusLevel": 5,
      "goal": "Study better",
      "availableTime": 30
    }
  }'

# Test plan generation
curl -X POST http://localhost:3000/api/focus-training/generate-plan \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get plan
curl -X GET http://localhost:3000/api/focus-training/plan \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

1. Complete questionnaire
2. View generated plan on calendar
3. Complete a daily challenge
4. Check progress updates
5. Test weekly assessment

---

## 💰 Cost Estimation

### OpenAI GPT-4o-mini

- Assessment: ~500 tokens = $0.0001
- Plan generation: ~2000 tokens = $0.0006
- Weekly feedback: ~1000 tokens = $0.0003
- **Total per user/month**: ~$0.05

### Google Gemini (FREE)

- 60 requests/minute free tier
- Unlimited for reasonable usage
- **Total per user/month**: $0.00

### Self-hosted Ollama

- One-time setup
- **Total per user/month**: $0.00 (chỉ có chi phí server)

---

## 🎓 Best Practices

1. **Cache AI responses** - Lưu plan đã generate, không generate lại
2. **Rate limiting** - Giới hạn số lần user request plan mới (1x/day)
3. **Fallback logic** - Nếu AI fail, có template plans sẵn
4. **Privacy** - Không lưu sensitive info trong prompts
5. **Monitoring** - Log AI requests để track cost & quality

---

## 🐛 Troubleshooting

### AI không response

- Check API key hợp lệ
- Check network connection
- Check rate limits (đợi 1 phút)

### Plan không phù hợp

- Improve prompts với examples
- Add more context từ user profile
- Use higher quality model (GPT-4 thay vì GPT-3.5)

### Cost quá cao

- Switch sang Gemini (free)
- Cache responses aggressively
- Use smaller models
- Implement request quotas

---

## 📚 Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Gemini Docs](https://ai.google.dev/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

## ✅ Implementation Checklist

### Backend

- [ ] Install AI SDK
- [ ] Create database models
- [ ] Build AI service với prompts
- [ ] Create REST API endpoints
- [ ] Add authentication middleware
- [ ] Test với Postman

### Frontend

- [ ] Create questionnaire screen
- [ ] Build calendar component
- [ ] Daily challenge detail screen
- [ ] Progress dashboard
- [ ] Integrate với backend APIs

### Testing

- [ ] Unit tests cho AI service
- [ ] Integration tests cho APIs
- [ ] E2E testing user flow
- [ ] Load testing

### Deployment

- [ ] Add AI keys to production env
- [ ] Setup monitoring
- [ ] Configure rate limiting
- [ ] Launch beta testing

---

**Note**: Tôi sẽ tạo tất cả code files cần thiết trong các bước tiếp theo. Đây là document tổng quan để bạn hiểu flow trước khi dive vào code!
