# AI Focus Training - Quick Test Script
# Test cac API endpoints voi PowerShell

# Configuration
$BASE_URL = "http://localhost:5000/api"
$TEST_EMAIL = "test@deepfocus.com"
$TEST_PASSWORD = "test123456"

Write-Host "=== DeepFocus AI Focus Training - API Testing ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Register/Login
Write-Host "Step 1: Authentication..." -ForegroundColor Yellow

$loginBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.data.token
    Write-Host "[OK] Login successful! Token: $($TOKEN.Substring(0,20))..." -ForegroundColor Green
}
catch {
    Write-Host "[WARN] Login failed. Trying to register..." -ForegroundColor Red
    
    $registerBody = @{
        username = "testuser"
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
        defaultRole = "student"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
        $TOKEN = $registerResponse.data.token
        Write-Host "[OK] Registration successful!" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Registration failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 2: Submit Initial Assessment
Write-Host "Step 2: Submitting initial assessment to AI..." -ForegroundColor Yellow

$assessmentBody = @{
    focusLevel = 5
    distractionLevel = 7
    motivationLevel = 8
    energyLevel = 6
    stressLevel = 6
    primaryGoal = "study_habits"
    availableTimePerDay = 60
    preferredSessionLength = 20
    experienceLevel = "beginner"
    distractions = @("phone", "social_media", "noise")
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

try {
    Write-Host "   Waiting for AI analysis..." -ForegroundColor Gray
    $assessmentResponse = Invoke-RestMethod -Uri "$BASE_URL/focus-training/assess" -Method Post -Body $assessmentBody -Headers $headers
    
    Write-Host "[OK] Assessment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "   Focus Score: $($assessmentResponse.data.focusScore)/100" -ForegroundColor White
    Write-Host "   Suggested Duration: $($assessmentResponse.data.suggestedDuration) weeks" -ForegroundColor White
    Write-Host "   Suggested Difficulty: $($assessmentResponse.data.suggestedDifficulty)" -ForegroundColor White
    Write-Host ""
    Write-Host "AI Analysis:" -ForegroundColor Cyan
    Write-Host "   $($assessmentResponse.data.analysis)" -ForegroundColor White
    Write-Host ""
    
    $assessmentId = $assessmentResponse.data.assessmentId
}
catch {
    Write-Host "[ERROR] Assessment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Generate Training Plan
Write-Host "Step 3: Generating personalized training plan..." -ForegroundColor Yellow

$planBody = @{
    assessmentId = $assessmentId
    startDate = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json

try {
    Write-Host "   AI is creating your plan..." -ForegroundColor Gray
    $planResponse = Invoke-RestMethod -Uri "$BASE_URL/focus-training/generate-plan" -Method Post -Body $planBody -Headers $headers
    
    Write-Host "[OK] Plan generated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Plan Details:" -ForegroundColor Cyan
    Write-Host "   Title: $($planResponse.data.plan.title)" -ForegroundColor White
    Write-Host "   Duration: $($planResponse.data.plan.duration) weeks" -ForegroundColor White
    Write-Host "   Total Days: $($planResponse.data.plan.totalDays)" -ForegroundColor White
    Write-Host "   Training Days: $($planResponse.data.plan.trainingDays)" -ForegroundColor White
    Write-Host "   Rest Days: $($planResponse.data.plan.restDays)" -ForegroundColor White
    Write-Host "   Start Date: $($planResponse.data.plan.startDate)" -ForegroundColor White
    Write-Host ""
    
    $planId = $planResponse.data.plan.id
}
catch {
    Write-Host "[ERROR] Plan generation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Get Today's Training
Write-Host "Step 4: Fetching today's training..." -ForegroundColor Yellow

$today = (Get-Date).ToString("yyyy-MM-dd")

try {
    $todayResponse = Invoke-RestMethod -Uri "$BASE_URL/focus-training/day/$today" -Method Get -Headers $headers
    
    Write-Host "[OK] Today's training loaded!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Today's Challenges:" -ForegroundColor Cyan
    
    foreach ($challenge in $todayResponse.data.trainingDay.challenges) {
        Write-Host "   - $($challenge.type) - $($challenge.duration) min" -ForegroundColor White
        Write-Host "     $($challenge.description)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "AI Encouragement:" -ForegroundColor Cyan
    Write-Host "   $($todayResponse.data.trainingDay.aiEncouragement)" -ForegroundColor White
    
    $dayId = $todayResponse.data.trainingDay._id
}
catch {
    Write-Host "[WARN] No training for today (might be a rest day)" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Get Progress Dashboard
Write-Host "Step 5: Loading progress dashboard..." -ForegroundColor Yellow

try {
    $progressResponse = Invoke-RestMethod -Uri "$BASE_URL/focus-training/progress" -Method Get -Headers $headers
    
    Write-Host "[OK] Progress loaded!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Statistics:" -ForegroundColor Cyan
    Write-Host "   Completion Rate: $($progressResponse.data.stats.completionRate)%" -ForegroundColor White
    Write-Host "   Current Streak: $($progressResponse.data.stats.currentStreak) days" -ForegroundColor White
    Write-Host "   Total Points: $($progressResponse.data.stats.totalPoints)" -ForegroundColor White
    Write-Host "   Total Focus Time: $($progressResponse.data.stats.totalFocusHours) hours" -ForegroundColor White
}
catch {
    Write-Host "[ERROR] Failed to load progress: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "[OK] All tests completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Check calendar: GET /focus-training/days?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD" -ForegroundColor White
Write-Host "   2. Complete challenge: POST /focus-training/day/{dayId}/challenge/0/complete" -ForegroundColor White
Write-Host "   3. Submit weekly assessment: POST /focus-training/weekly-assessment" -ForegroundColor White
Write-Host ""
Write-Host "Your auth token: $TOKEN" -ForegroundColor Gray
Write-Host ""
