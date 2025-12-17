# 🤖 AI Focus Training Feature

> Tính năng AI tạo kế hoạch tập luyện năng lực tập trung cá nhân hóa, tương tự như Huawei Health cho fitness.

## 📚 Tài Liệu

### 🚀 Bắt Đầu

1. **[SETUP_AI_FOCUS_TRAINING.md](./SETUP_AI_FOCUS_TRAINING.md)** - Hướng dẫn setup từng bước

   - Cài đặt dependencies
   - Config AI API keys
   - Test backend
   - Chạy frontend

2. **[AI_FOCUS_TRAINING_CHECKLIST.md](./AI_FOCUS_TRAINING_CHECKLIST.md)** - TODO checklist
   - Track tiến độ implementation
   - Next steps
   - Priority tasks

### 📖 Chi Tiết

3. **[AI_FOCUS_TRAINING_IMPLEMENTATION_GUIDE.md](./AI_FOCUS_TRAINING_IMPLEMENTATION_GUIDE.md)** - Tổng quan kiến trúc

   - Architecture overview
   - Database schema
   - API endpoints
   - AI prompts strategy
   - Cost estimation

4. **[AI_FOCUS_TRAINING_COMPLETION_SUMMARY.md](./AI_FOCUS_TRAINING_COMPLETION_SUMMARY.md)** - Tổng kết & next steps
   - What's completed
   - What's remaining
   - Future features roadmap

---

## ✨ Tính Năng Chính

### 🎯 AI-Powered Assessment

- Đánh giá năng lực tập trung qua 6 câu hỏi
- AI phân tích và tạo focus score
- Recommendations cá nhân hóa

### 📅 Personalized Training Plan

- Kế hoạch 4-8 tuần tùy level
- Progressive difficulty (tăng dần độ khó)
- Rest days tự động (mỗi 3-4 ngày)
- Variety challenges (focus, breathing, mindfulness)

### 📆 Visual Calendar

- Hiển thị training days trên lịch
- Color-coded status (completed ✅, rest 😴, upcoming 📅)
- One-tap access to daily challenges

### 💪 Daily Challenges

- AI encouragement messages
- Step-by-step instructions
- Multiple challenge types
- Points & rewards

### 📊 Progress Tracking

- Completion rate
- Streak counter
- Total focus hours
- Before/After score comparison
- Achievements

---

## 🏗️ Tech Stack

### Backend

- **Node.js + Express** - REST API
- **MongoDB + Mongoose** - Database
- **OpenAI API** - AI integration (hoặc Google Gemini, Anthropic, Ollama)
- **JWT** - Authentication

### Frontend

- **React Native + Expo** - Mobile app
- **Expo Router** - Navigation
- **Axios** - API calls
- **AsyncStorage** - Local storage

---

## 📦 Files Created

### Backend (`DeepFocus/backend/`)

```
models/
  ├─ FocusPlan.js          # Plan model
  ├─ TrainingDay.js        # Daily training model
  └─ UserAssessment.js     # Assessment model

services/
  └─ aiService.js          # AI integration service

controllers/
  └─ focusTrainingController.js  # API logic

routes/
  └─ focusTraining.js      # API endpoints

scripts/
  └─ test-focus-training-api.ps1  # Test script

.env.example               # Environment template
```

### Frontend (`DeepFocus/app/focus-training/`)

```
assessment.tsx            # Assessment questionnaire
calendar.tsx              # Calendar view
day-detail.tsx            # Daily challenge detail
```

### Documentation (`DeepFocus/`)

```
AI_FOCUS_TRAINING_IMPLEMENTATION_GUIDE.md
SETUP_AI_FOCUS_TRAINING.md
AI_FOCUS_TRAINING_COMPLETION_SUMMARY.md
AI_FOCUS_TRAINING_CHECKLIST.md
AI_FOCUS_TRAINING_README.md  # This file
```

---

## 🚀 Quick Start (5 phút)

### 1. Install Dependencies

```powershell
cd DeepFocus\backend
npm install openai
# Hoặc: npm install @google/generative-ai (FREE)
```

### 2. Setup Environment

```powershell
Copy-Item .env.example .env
# Thêm AI API key vào .env
```

**Lấy API Key (FREE):**

- Google Gemini: https://ai.google.dev/ (Khuyến nghị - FREE!)
- OpenAI: https://platform.openai.com/api-keys (Có phí)

### 3. Start Backend

```powershell
npm run dev
```

### 4. Test API

```powershell
cd scripts
.\test-focus-training-api.ps1
```

### 5. Run Frontend

```powershell
cd ..\..
npm start
```

---

## 🎮 User Flow

```
1. Assessment (5 phút)
   └─> Answer 6 questions
   └─> AI analyzes → Focus score

2. Plan Generation (10 giây)
   └─> AI creates personalized plan
   └─> 4-8 weeks, progressive difficulty

3. Calendar View
   └─> See all training days
   └─> Tap date → View challenges

4. Daily Training (15-30 phút)
   └─> Read AI encouragement
   └─> Complete challenges
   └─> Earn points

5. Progress Tracking
   └─> View stats & achievements
   └─> Weekly AI feedback
   └─> Adjust plan if needed
```

---

## 💡 Key Concepts

### Progressive Training

Giống như tập gym, plan sẽ tăng dần độ khó:

- **Week 1-2**: Short sessions (10-15 min)
- **Week 3-4**: Medium sessions (20-25 min)
- **Week 5-6**: Long sessions (30-40 min)
- **Week 7-8**: Mastery sessions (45-50 min)

### Rest Days

Quan trọng để tránh burnout:

- Tự động thêm rest day mỗi 3-4 training days
- User không bị penalty khi rest
- Encourage self-care

### Variety

Mix nhiều loại challenges:

- 🎯 **Focus sessions**: Tập trung làm việc
- 🧘 **Breathing exercises**: Thở thư giãn
- 🌟 **Mindfulness**: Awareness practices
- 💭 **Reflection**: End-of-day review

---

## 📊 Status

```
✅ Backend API       100%
✅ Documentation     100%
🟨 Frontend          70%
⬜ Testing           0%
⬜ Deployment        0%

Overall: 68% Complete
```

### Completed

- ✅ All backend models & APIs
- ✅ AI service with 4 providers
- ✅ Assessment screen
- ✅ Calendar screen
- ✅ Day detail screen
- ✅ Comprehensive docs

### TODO

- 🔲 Progress dashboard screen
- 🔲 Weekly assessment screen
- 🔲 Settings screen
- 🔲 Notifications
- 🔲 Testing
- 🔲 Deployment

---

## 💰 Cost

### Development

- Time: ~50 hours
- Cost: FREE (your time)

### Running (Production)

- **Google Gemini**: $0/month (FREE tier)
- **OpenAI GPT-4o-mini**: ~$6/month (100 users)
- **Database**: $0-9/month (MongoDB Atlas)
- **Hosting**: $0-7/month (Railway/Render)

**Recommended for students: 100% FREE with Google Gemini + MongoDB Free Tier**

---

## 🎯 Next Steps

1. **Read**: [SETUP_AI_FOCUS_TRAINING.md](./SETUP_AI_FOCUS_TRAINING.md)
2. **Setup**: Get AI API key & configure `.env`
3. **Test**: Run PowerShell test script
4. **Build**: Complete missing screens
5. **Launch**: Deploy and gather feedback

---

## 🐛 Troubleshooting

### Backend won't start

- Check MongoDB is running
- Check `.env` file exists
- Check port 5000 not in use

### AI not responding

- Check API key is valid
- Check internet connection
- Check rate limits (wait 1 minute)

### Frontend errors

- Check backend is running
- Check API_URL is correct
- Clear cache and re-login

**More help**: See Troubleshooting section in [SETUP_AI_FOCUS_TRAINING.md](./SETUP_AI_FOCUS_TRAINING.md)

---

## 🤝 Support

- **Setup Issues**: See [SETUP_AI_FOCUS_TRAINING.md](./SETUP_AI_FOCUS_TRAINING.md)
- **Architecture Questions**: See [AI_FOCUS_TRAINING_IMPLEMENTATION_GUIDE.md](./AI_FOCUS_TRAINING_IMPLEMENTATION_GUIDE.md)
- **What to do next**: See [AI_FOCUS_TRAINING_CHECKLIST.md](./AI_FOCUS_TRAINING_CHECKLIST.md)

---

## 📝 License

Part of DeepFocus App - Focus training for students

---

**Built with ❤️ and AI 🤖**

**Status**: Ready for testing! 🚀
**Last Updated**: December 8, 2025
