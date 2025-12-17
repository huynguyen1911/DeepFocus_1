# 🚀 Setup Guide - AI Focus Training Feature

## Prerequisites

- Node.js 16+ installed
- MongoDB running
- Terminal/PowerShell access

## Step-by-Step Setup

### 1️⃣ Install Backend Dependencies

```powershell
cd DeepFocus\backend
npm install openai
```

**Lựa chọn AI Provider** (chọn 1):

```powershell
# Option A: OpenAI (Khuyến nghị - Mạnh nhất)
npm install openai

# Option B: Google Gemini (FREE - Tốt cho testing)
npm install @google/generative-ai

# Option C: Anthropic Claude
npm install @anthropic-ai/sdk

# Option D: Ollama (Self-hosted)
# Không cần install npm package, chỉ cần download Ollama app
```

---

### 2️⃣ Setup Environment Variables

#### A. Copy example file

```powershell
cd DeepFocus\backend
Copy-Item .env.example .env
```

#### B. Edit `.env` file với notepad hoặc VS Code

```powershell
notepad .env
# HOẶC
code .env
```

#### C. Chọn AI Provider và thêm API key

**OPTION 1: Google Gemini (MIỄN PHÍ - Khuyến nghị cho testing)**

1. Truy cập: https://ai.google.dev/
2. Click "Get API Key" → "Create API key"
3. Copy API key
4. Thêm vào `.env`:

```env
AI_PROVIDER=google
AI_MODEL=gemini-1.5-flash
GOOGLE_AI_API_KEY=AIzaSy...your_key_here
```

**OPTION 2: OpenAI (Tốt nhất nhưng có phí)**

1. Truy cập: https://platform.openai.com/api-keys
2. Tạo account hoặc login
3. Click "Create new secret key"
4. Copy key
5. Thêm vào `.env`:

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-proj-...your_key_here
```

6. Nạp credit: https://platform.openai.com/settings/organization/billing
   - Tối thiểu $5
   - GPT-4o-mini: ~$0.002/request (rất rẻ!)

**OPTION 3: Anthropic Claude**

1. Truy cập: https://console.anthropic.com/
2. Tạo account → API Keys → Create Key
3. Thêm vào `.env`:

```env
AI_PROVIDER=anthropic
AI_MODEL=claude-3-haiku-20240307
ANTHROPIC_API_KEY=sk-ant-...your_key_here
```

---

### 3️⃣ Verify MongoDB is Running

```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# If not running, start it:
Start-Service -Name MongoDB

# OR if using MongoDB Community Edition manually:
# Open MongoDB Compass and connect to mongodb://localhost:27017
```

---

### 4️⃣ Start Backend Server

```powershell
cd DeepFocus\backend
npm run dev
```

**Expected output:**

```
✅ MongoDB Connected: localhost
🚀 DeepFocus Backend Server running on port 5000
📡 Environment: development
🔗 Local: http://localhost:5000/api/health
```

---

### 5️⃣ Test API Endpoints

#### Method 1: Using PowerShell Script (Recommended)

```powershell
cd DeepFocus\backend\scripts
.\test-focus-training-api.ps1
```

This will:

- ✅ Register/Login test user
- ✅ Submit assessment to AI
- ✅ Generate training plan
- ✅ Get today's challenges
- ✅ Show progress dashboard

#### Method 2: Using Postman/Thunder Client

**A. Login to get token**

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123456"
}
```

**B. Submit Assessment**

```
POST http://localhost:5000/api/focus-training/assess
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "focusLevel": 5,
  "distractionLevel": 7,
  "motivationLevel": 8,
  "energyLevel": 6,
  "stressLevel": 6,
  "primaryGoal": "study_habits",
  "availableTimePerDay": 60,
  "preferredSessionLength": 20,
  "experienceLevel": "beginner",
  "distractions": ["phone", "social_media"]
}
```

**C. Generate Plan**

```
POST http://localhost:5000/api/focus-training/generate-plan
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "startDate": "2025-12-08"
}
```

**D. Get Training Days for Calendar**

```
GET http://localhost:5000/api/focus-training/days?startDate=2025-12-01&endDate=2025-12-31
Authorization: Bearer YOUR_TOKEN
```

**E. Get Today's Training**

```
GET http://localhost:5000/api/focus-training/day/2025-12-08
Authorization: Bearer YOUR_TOKEN
```

**F. Complete a Challenge**

```
POST http://localhost:5000/api/focus-training/day/{dayId}/challenge/0/complete
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "score": 85,
  "feedback": "Felt great, very focused!"
}
```

**G. Get Progress Dashboard**

```
GET http://localhost:5000/api/focus-training/progress
Authorization: Bearer YOUR_TOKEN
```

---

### 6️⃣ Verify Database

```powershell
# Connect to MongoDB using mongo shell or MongoDB Compass
# Check collections:
# - focusplans
# - trainingdays
# - userassessments
```

**Using MongoDB Compass:**

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select `deepfocus` database
4. You should see new collections:
   - `focusplans`
   - `trainingdays`
   - `userassessments`

---

## 🐛 Troubleshooting

### Issue: "OPENAI_API_KEY not found"

**Solution:**

- Check `.env` file exists in `backend` folder
- Verify API key is set correctly without quotes
- Restart server after changing `.env`

### Issue: "AI request failed"

**Solution:**

- For OpenAI: Check if you have credits (https://platform.openai.com/usage)
- For Google: Verify API key is valid
- Check internet connection
- Try different AI provider

### Issue: "MongoDB connection error"

**Solution:**

```powershell
# Check MongoDB service
Get-Service -Name MongoDB | Start-Service

# OR install MongoDB if not installed:
# Download from: https://www.mongodb.com/try/download/community
```

### Issue: "Port 5000 already in use"

**Solution:**

```powershell
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill the process
Stop-Process -Id <PROCESS_ID> -Force

# OR change port in .env
# PORT=5001
```

### Issue: "Plan generation takes too long"

**Solution:**

- Normal for first request (AI cold start)
- Subsequent requests will be faster
- For faster testing, use Google Gemini (fastest)
- Or implement caching

---

## 💰 Cost Estimation

### Google Gemini (FREE)

- **Free Tier**: 60 requests/minute
- **Cost**: $0.00
- **Best for**: Testing, development, small apps

### OpenAI GPT-4o-mini

- **Input**: $0.150 / 1M tokens
- **Output**: $0.600 / 1M tokens
- **Average per request**: ~$0.002
- **100 users/day**: ~$0.20/day = $6/month
- **Best for**: Production apps

### Anthropic Claude 3 Haiku

- **Cost**: ~$0.003/request
- **Best for**: Better Vietnamese support

---

## 🎯 Next Steps

### For Development:

1. ✅ Backend setup complete
2. 🔲 Create frontend screens:
   - Questionnaire screen
   - Calendar view
   - Daily challenge screen
   - Progress dashboard
3. 🔲 Connect frontend to API
4. 🔲 Add notifications
5. 🔲 Test end-to-end flow

### For Production:

1. 🔲 Add rate limiting
2. 🔲 Implement caching for AI responses
3. 🔲 Add error monitoring (Sentry)
4. 🔲 Setup environment variables in deployment
5. 🔲 Configure CORS for production domain

---

## 📚 API Reference

Full API documentation available in: `AI_FOCUS_TRAINING_IMPLEMENTATION_GUIDE.md`

Quick reference:

- `POST /api/focus-training/assess` - Submit assessment
- `POST /api/focus-training/generate-plan` - Generate plan
- `GET /api/focus-training/plan` - Get active plan
- `GET /api/focus-training/days` - Get calendar days
- `GET /api/focus-training/day/:date` - Get day details
- `POST /api/focus-training/day/:dayId/challenge/:idx/complete` - Complete challenge
- `GET /api/focus-training/progress` - Get progress
- `POST /api/focus-training/weekly-assessment` - Submit weekly assessment

---

## ✅ Checklist

- [ ] Node.js 16+ installed
- [ ] MongoDB running
- [ ] Backend dependencies installed (`npm install openai`)
- [ ] `.env` file created and configured
- [ ] AI API key added to `.env`
- [ ] Backend server running (`npm run dev`)
- [ ] API test successful
- [ ] MongoDB collections created
- [ ] Ready to build frontend!

---

## 🆘 Need Help?

1. Check logs in terminal for error messages
2. Verify all environment variables are set
3. Test individual API endpoints with Postman
4. Check MongoDB is running and accessible
5. Verify AI API key is valid and has credits

**Common Commands:**

```powershell
# Check backend logs
cd DeepFocus\backend
npm run dev

# Check MongoDB
Get-Service MongoDB

# Test API
cd DeepFocus\backend\scripts
.\test-focus-training-api.ps1

# View environment
cd DeepFocus\backend
Get-Content .env
```

---

**🎉 Setup Complete! Ready to build the frontend screens!**
