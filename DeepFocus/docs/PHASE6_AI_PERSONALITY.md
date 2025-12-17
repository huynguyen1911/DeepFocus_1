# Phase 6: AI Personality & Adaptive Coaching

## Tổng quan

Phase 6 triển khai hệ thống AI Coach thông minh với khả năng học từ hành vi người dùng và đưa ra các đề xuất cá nhân hóa. Hệ thống bao gồm 4 thành phần chính:

1. **AI Coach Screen** - Giao diện trung tâm với AI personality
2. **Contextual Tips System** - Tips thông minh dựa trên ngữ cảnh
3. **Motivational Engine** - Động lực dựa trên achievements
4. **Adaptive Coaching** - Học từ patterns và đề xuất tối ưu

## 🎯 Mục tiêu

### Chức năng chính

- ✅ AI Coach với personality và reactions
- ✅ Contextual tips xuất hiện đúng lúc, đúng chỗ
- ✅ Motivational messages dựa trên user context
- ✅ Pattern recognition từ session history
- ✅ Personalized recommendations với confidence scores
- ✅ Optimal time prediction

### Trải nghiệm người dùng

- AI cảm thấy "sống" và responsive
- Tips hữu ích, không spam
- Recommendations có reasoning rõ ràng
- Học từ behavior thực tế của user

## 📁 Cấu trúc Files

```
DeepFocus/
├── app/focus-training/
│   └── ai-coach.tsx              # AI Coach main screen (1,150+ lines)
├── components/
│   └── ai-tip.tsx                # Reusable contextual tip component (300 lines)
├── services/
│   ├── motivational-engine.ts    # Message generation service (400 lines)
│   └── adaptive-coach.ts         # Pattern analysis & recommendations (450 lines)
└── docs/
    └── PHASE6_AI_PERSONALITY.md  # This file
```

## 🎨 Components

### 1. AI Coach Screen (`ai-coach.tsx`)

**Vị trí**: `app/focus-training/ai-coach.tsx`

**Chức năng**:

- AI avatar với pulse animation
- 4-tab interface: Tips, Motivation, Insights, Cá nhân hóa
- Quick stats display (streak, avg score, total sessions)
- Contextual greeting dựa trên time + performance
- Start session action button

**Tab Structure**:

#### Tab 1: Gợi ý (Tips)

- Tip cards với priority badges (high/medium/low)
- 7+ loại tips:
  - Time-based (buổi sáng/tối)
  - Performance-based (điểm thấp/cao)
  - Distraction-based (phone, noise)
  - Streak-based (maintain/break)
  - Duration-based (session length)
  - Environment tips

#### Tab 2: Động lực (Motivation)

- Gradient cards với icons
- 4 loại messages:
  - Celebration (streak 7+, 30+)
  - Achievement (high scores, milestones)
  - Encouragement (declining trend)
  - Daily motivation

#### Tab 3: Phân tích (Insights)

- 6 insight types:
  - Time pattern analysis
  - Duration effectiveness
  - Distraction patterns
  - Performance trends
  - Streak analysis
  - Rest recommendations
- Actionable suggestions cho mỗi insight

#### Tab 4: Cá nhân hóa (Adaptive)

- **Optimal Time Prediction**: Dự đoán giờ tốt nhất hôm nay với confidence %
- **Pattern Summary**: 4 metrics (best time, optimal duration, avg score, completion rate)
- **Personalized Recommendations**:
  - Timing recommendations
  - Duration adjustments
  - Difficulty scaling
  - Environment improvements
  - Technique suggestions
- **Learning Progress**: Progress bar hiển thị data đã phân tích

**Helper Functions**:

```typescript
getGreeting(userData); // Time + streak-based greeting
getEncouragement(userData); // Performance-based encouragement
getContextualTips(userData); // Priority-sorted tips array
getMotivationalMessages(userData); // Celebration + milestone messages
getAdaptiveInsights(userData); // 6 insight types
```

**Props**: Không có (standalone screen)

**Navigation**:

- Back button → Previous screen
- Start button → Calendar screen
- Settings icon → Future settings

**Animations**:

- Pulse animation cho avatar (1 → 1.05 → 1, 2s loop)
- Fade in animation cho content

---

### 2. AI Tip Component (`ai-tip.tsx`)

**Vị trí**: `components/ai-tip.tsx`

**Chức năng**:

- Reusable contextual tip component
- Auto-cycle tips mỗi 10 giây
- Dismissible với slide animation
- Action buttons support
- Pagination dots cho multiple tips

**Props**:

```typescript
interface AITipProps {
  context: "pre-session" | "post-session" | "dashboard" | "break" | "calendar";
  userData?: UserData;
  onDismiss?: () => void;
  style?: ViewStyle;
}
```

**Context Types**:

#### `pre-session`

Tips trước khi bắt đầu phiên:

- Meditation/breathing exercises
- Phone management
- Time-based preparation

#### `post-session`

Tips sau khi hoàn thành:

- Score-based feedback
- Rest recommendations
- Next session suggestions

#### `dashboard`

Tips trên trang chủ:

- Streak reminders
- Time-based motivation
- Performance alerts

#### `break`

Tips trong break time:

- Stretch exercises
- 20-20-20 eye rule
- Hydration reminders

#### `calendar`

Tips trong calendar view:

- New user onboarding
- Weekly planning tips
- Schedule optimization

**Tip Structure**:

```typescript
interface Tip {
  icon: string; // MaterialCommunityIcons name
  title: string; // Tiêu đề ngắn gọn
  description: string; // Mô tả chi tiết
  gradient: [string, string]; // Gradient colors
  action?: {
    label: string;
    onPress: () => void;
  };
  priority?: "high" | "medium" | "low";
}
```

**Usage Example**:

```tsx
import AITip from "@/components/ai-tip";

<AITip
  context="pre-session"
  userData={userData}
  onDismiss={() => setShowTip(false)}
/>;
```

**Animations**:

- Slide in from top (-100 → 0)
- Fade in (0 → 1)
- Reverse animation on dismiss

---

### 3. Motivational Engine (`motivational-engine.ts`)

**Vị trí**: `services/motivational-engine.ts`

**Chức năng**:

- Centralized message generation service
- 5 message categories với 30+ unique messages
- Condition-based selection
- Priority-based algorithm

**Interfaces**:

```typescript
interface UserContext {
  currentStreak: number;
  totalSessions: number;
  avgFocusScore: number;
  recentTrend: "improving" | "declining" | "stable";
  lastSession?: {
    score: number;
    completed: boolean;
  };
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  achievements: string[];
  bestStreak: number;
}

interface MotivationalMessage {
  id: string;
  type: "encouragement" | "celebration" | "challenge" | "wisdom" | "reminder";
  message: string;
  icon: string;
  color: string;
  intensity: "low" | "medium" | "high";
  trigger: string;
}
```

**Message Categories**:

#### 1. Encouragement

Khi user cần động viên:

- Low scores (< 70)
- Declining trend
- Incomplete sessions
- Broken streak

**Example**: "Mỗi phiên tập trung, dù khó khăn, đều là một bước tiến!"

#### 2. Celebration

Khi đạt milestones:

- Streak milestones (7+, 30+)
- High scores (95+)
- Total session milestones (50, 100)
- Personal bests

**Example**: "🔥 7 ngày streak! Bạn đang on fire!"

#### 3. Challenge

Khuyến khích thử thách mới:

- High performers (85+ score)
- Near-goal (5-6 day streak)
- Consistent improvement

**Example**: "Bạn đã sẵn sàng cho thử thách lớn hơn! Tăng lên 45 phút?"

#### 4. Wisdom

Quotes về focus và discipline:

- 6 timeless quotes
- Không phụ thuộc context
- Luôn phù hợp

**Example**: "Focus is not about saying yes to the thing you've got to focus on..."

#### 5. Reminder

Time-based và behavioral reminders:

- Morning motivation
- Evening reflection
- Streak restart prompts

**Example**: "Buổi sáng tốt lành! Đã sẵn sàng cho ngày mới chưa?"

**Methods**:

```typescript
// Get single message based on priority
MotivationalEngine.getMotivationalMessage(context: UserContext): MotivationalMessage

// Get multiple diverse messages
MotivationalEngine.getMultipleMessages(context: UserContext, count: number): MotivationalMessage[]

// Get personalized greeting
MotivationalEngine.getGreeting(context: UserContext): string

// Helper: Random selection
private static selectRandom<T>(array: T[]): T
```

**Priority Logic**:

1. Celebration (highest)
2. Challenge
3. Encouragement
4. Reminder
5. Wisdom (fallback)

**Usage Example**:

```typescript
import { MotivationalEngine } from "@/services/motivational-engine";

const message = MotivationalEngine.getMotivationalMessage({
  currentStreak: 8,
  totalSessions: 45,
  avgFocusScore: 87,
  recentTrend: "improving",
  timeOfDay: "morning",
});

console.log(message.message); // "🔥 8 ngày streak! Momentum đang tăng dần!"
```

---

### 4. Adaptive Coach (`adaptive-coach.ts`)

**Vị trí**: `services/adaptive-coach.ts`

**Chức năng**:

- Analyze user patterns từ session history
- Generate personalized recommendations
- Predict optimal session times
- Pattern recognition & learning

**Interfaces**:

```typescript
interface SessionData {
  id: string;
  startTime: Date;
  duration: number;
  score: number;
  distractions: string[];
  completed: boolean;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  dayOfWeek: number;
}

interface UserPattern {
  bestTimeOfDay: "morning" | "afternoon" | "evening" | "night";
  bestDayOfWeek: number;
  optimalDuration: number;
  commonDistractions: { type: string; frequency: number }[];
  averageScore: number;
  completionRate: number;
  peakPerformanceHours: number[];
  strugglingHours: number[];
}

interface CoachingRecommendation {
  id: string;
  type: "timing" | "duration" | "technique" | "environment" | "difficulty";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  reasoning: string;
  actionable: string;
  confidence: number; // 0-100
  icon: string;
  color: string;
}
```

**Methods**:

#### `analyzeUserPatterns(sessions: SessionData[]): UserPattern`

Phân tích patterns từ session history:

**Best Time of Day**:

- Tính avg score cho mỗi time period
- Chọn period có avg score cao nhất

**Best Day of Week**:

- Group sessions theo day of week
- Tính avg score cho mỗi ngày

**Optimal Duration**:

- Group sessions theo 15-min intervals
- Tìm interval có avg score cao nhất

**Common Distractions**:

- Count frequency của mỗi distraction type
- Sort và lấy top 5

**Peak/Struggling Hours**:

- Tính avg score theo từng giờ
- Peak: hours với avg ≥ 85 (min 2 sessions)
- Struggling: hours với avg < 70

---

#### `generateRecommendations(patterns: UserPattern, recentSessions: SessionData[]): CoachingRecommendation[]`

Tạo 7 loại recommendations:

**1. Timing - Optimal Time**

- **Condition**: có peak performance hours
- **Priority**: HIGH
- **Example**: "Bạn tập trung tốt nhất vào 9h-11h"
- **Confidence**: 90% nếu có 3+ peak hours, 70% nếu ít hơn

**2. Timing - Avoid Current Hour**

- **Condition**: current hour trong struggling hours
- **Priority**: HIGH
- **Example**: "Khung giờ 14h thường khó tập trung với bạn"
- **Confidence**: 85%

**3. Timing - Best Day**

- **Condition**: today = best day of week
- **Priority**: MEDIUM
- **Example**: "Thứ 2 là ngày bạn tập trung tốt nhất"
- **Confidence**: 80%

**4. Duration - Optimal Length**

- **Condition**: có optimal duration > 0
- **Priority**: HIGH
- **Example**: "Phiên 30 phút cho kết quả tốt nhất"
- **Confidence**: 85%

**5. Difficulty - Increase**

- **Condition**: avg score ≥ 90
- **Priority**: MEDIUM
- **Example**: "Bạn đã sẵn sàng cho thử thách lớn hơn"
- **Confidence**: 80%

**6. Difficulty - Decrease**

- **Condition**: avg score < 70 AND completion rate < 70%
- **Priority**: HIGH
- **Example**: "Bắt đầu với mục tiêu nhỏ hơn"
- **Confidence**: 85%

**7. Environment - Distraction Management**

- **Condition**: có common distractions
- **Priority**: HIGH/MEDIUM (dựa trên frequency)
- **Solutions** cho từng distraction type:
  - **phone**: "Bật không làm phiền hoặc để xa 2-3m"
  - **noise**: "Tai nghe chống ồn hoặc white noise"
  - **thoughts**: "Mindfulness 5 phút trước khi bắt đầu"
  - **people**: "Tìm không gian riêng tư"
  - **notifications**: "Tắt tất cả thông báo"
  - **hungry**: "Ăn nhẹ trước phiên"
  - **tired**: "Nghỉ 15-20 phút"
- **Confidence**: 90%

**8. Technique - Pomodoro**

- **Condition**: avg score < 80
- **Priority**: MEDIUM
- **Example**: "Thử 25 phút tập trung + 5 phút nghỉ"
- **Confidence**: 75%

**Sort Priority**: high → medium → low, then by confidence

---

#### `predictOptimalTime(patterns: UserPattern): { hour: number; confidence: number }`

Dự đoán giờ tốt nhất để focus hôm nay:

**Logic**:

1. Nếu có peak performance hours:
   - Tìm peak hour tiếp theo sau current hour
   - Confidence: 85%
   - Fallback: Peak hour đầu tiên, confidence: 70%
2. Nếu không có peak hours:
   - Dựa vào best time of day:
     - morning: 9h
     - afternoon: 14h
     - evening: 19h
     - night: 21h
   - Confidence: 60%

**Example Output**:

```typescript
{ hour: 9, confidence: 85 }
// → "Best time to focus today: 9h (85% confidence)"
```

---

**Usage Example**:

```typescript
import { AdaptiveCoach } from "@/services/adaptive-coach";

// Analyze patterns
const userPattern = AdaptiveCoach.analyzeUserPatterns(sessionHistory);

// Get recommendations
const recommendations = AdaptiveCoach.generateRecommendations(
  userPattern,
  recentSessions
);

recommendations.forEach((rec) => {
  console.log(`[${rec.priority}] ${rec.title}`);
  console.log(`${rec.description}`);
  console.log(`💡 ${rec.actionable}`);
  console.log(`Confidence: ${rec.confidence}%\n`);
});

// Predict optimal time
const optimalTime = AdaptiveCoach.predictOptimalTime(userPattern);
console.log(
  `Best time today: ${optimalTime.hour}h (${optimalTime.confidence}%)`
);
```

---

## 🔄 Data Flow

### 1. Session Completion Flow

```
User completes session
    ↓
Save SessionData to storage
    ↓
Load session history (last 30 sessions)
    ↓
AdaptiveCoach.analyzeUserPatterns()
    ↓
Update UserPattern in storage
    ↓
Generate new recommendations
```

### 2. AI Coach Screen Flow

```
User opens AI Coach
    ↓
Load UserPattern from storage
    ↓
Load recent sessions (10-20 sessions)
    ↓
Generate contextual content:
  - getGreeting() → Display greeting
  - getEncouragement() → Display mood message
  - getContextualTips() → Tips tab
  - getMotivationalMessages() → Motivation tab
  - getAdaptiveInsights() → Insights tab
  - generateRecommendations() → Adaptive tab
```

### 3. Contextual Tip Flow

```
User enters screen (calendar/dashboard/etc)
    ↓
<AITip context="..." userData={...} />
    ↓
getContextualTips(context, userData)
    ↓
Filter tips by conditions
    ↓
Display first tip
    ↓
Auto-cycle every 10s
    ↓
User dismisses → onDismiss()
```

---

## 🎨 Design System

### Colors

**AI Coach Primary**:

```typescript
["#667eea", "#764ba2"]; // Purple gradient
```

**Message Type Colors**:

```typescript
encouragement: ["#FF6B6B", "#EF5350"]; // Red
celebration: ["#FFD700", "#FFA000"]; // Gold
challenge: ["#FF9800", "#F57C00"]; // Orange
wisdom: ["#9C27B0", "#7B1FA2"]; // Purple
reminder: ["#4CAF50", "#66BB6A"]; // Green
```

**Priority Badges**:

```typescript
high: "#EF5350"; // Red
medium: "#FF9800"; // Orange
low: "#9E9E9E"; // Gray
```

**Confidence Indicators**:

```typescript
90-100: '#4CAF50' // Green (High confidence)
70-89: '#FF9800'  // Orange (Medium)
<70: '#9E9E9E'    // Gray (Low)
```

### Typography

**Headings**:

- Tab Title: 18px, bold (#1A1A1A)
- Card Title: 16px, bold (#1A1A1A)
- Section Title: 18px, bold (#1A1A1A)

**Body**:

- Description: 15px, regular (#374151)
- Reasoning: 13px, regular (#6B7280)
- Label: 12px, regular (#666)

**Accent**:

- Badge Text: 12px, semibold
- Action Text: 14px, semibold
- Button Text: 14-17px, bold

### Spacing

- Card padding: 20px
- Card margin: 16px bottom
- Section gap: 24px
- Item gap: 12px

---

## 📊 Metrics & Analytics

### Pattern Analysis Requirements

**Minimum Data**:

- 5 sessions: Basic patterns
- 10 sessions: Reliable recommendations (confidence 70%+)
- 20+ sessions: High confidence recommendations (85%+)

**Update Frequency**:

- After each session completion
- Re-analyze patterns when opening AI Coach
- Cache patterns for 24 hours

### Recommendation Confidence

**High (85-100%)**:

- Backed by 10+ sessions
- Clear pattern (>70% consistency)
- Multiple data points support

**Medium (70-84%)**:

- 5-9 sessions
- Moderate pattern (50-70% consistency)

**Low (<70%)**:

- <5 sessions
- Weak pattern (<50% consistency)
- Use with caution

---

## 🚀 Integration Guide

### Add AI Tip to Screen

```tsx
import AITip from "@/components/ai-tip";

function MyScreen() {
  const [showTip, setShowTip] = useState(true);
  const userData = useUserData(); // Your user data hook

  return (
    <View>
      {showTip && (
        <AITip
          context="pre-session"
          userData={userData}
          onDismiss={() => setShowTip(false)}
          style={{ margin: 20 }}
        />
      )}
      {/* Rest of screen */}
    </View>
  );
}
```

### Add AI Coach Link

```tsx
import { useRouter } from "expo-router";

function MyScreen() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push("/focus-training/ai-coach")}>
      <MaterialCommunityIcons name="robot" size={24} color="#667eea" />
      <Text>AI Coach</Text>
    </TouchableOpacity>
  );
}
```

### Use Motivational Engine

```tsx
import { MotivationalEngine } from "@/services/motivational-engine";

function MyScreen() {
  const context = {
    currentStreak: 7,
    avgFocusScore: 85,
    timeOfDay: "morning",
    // ... other context
  };

  const message = MotivationalEngine.getMotivationalMessage(context);

  return (
    <View style={{ backgroundColor: message.color }}>
      <MaterialCommunityIcons name={message.icon} size={32} />
      <Text>{message.message}</Text>
    </View>
  );
}
```

### Use Adaptive Coach

```tsx
import { AdaptiveCoach } from "@/services/adaptive-coach";

function MyScreen() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const sessions = await loadSessionHistory();
    const patterns = AdaptiveCoach.analyzeUserPatterns(sessions);
    const recs = AdaptiveCoach.generateRecommendations(
      patterns,
      sessions.slice(0, 10)
    );
    setRecommendations(recs);
  }, []);

  return (
    <ScrollView>
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </ScrollView>
  );
}
```

---

## 🔧 Customization

### Add New Tip Context

1. Edit `components/ai-tip.tsx`
2. Add to context type:

```typescript
context: "pre-session" |
  "post-session" |
  "dashboard" |
  "break" |
  "calendar" |
  "MY_NEW_CONTEXT";
```

3. Add case in `getContextualTips()`:

```typescript
case 'MY_NEW_CONTEXT':
  tips = [
    {
      icon: 'icon-name',
      title: 'Tip Title',
      description: 'Tip description',
      gradient: ['#color1', '#color2']
    }
  ];
  break;
```

### Add New Message Type

1. Edit `services/motivational-engine.ts`
2. Update `MotivationalMessage` type:

```typescript
type: 'encouragement' | 'celebration' | ... | 'MY_NEW_TYPE'
```

3. Add message group:

```typescript
private static myNewTypeMessages = [
  {
    message: "Message text",
    icon: "icon-name",
    color: "#HEX",
    condition: (ctx) => /* condition */
  }
];
```

4. Add to `getMotivationalMessage()` logic

### Add New Recommendation Type

1. Edit `services/adaptive-coach.ts`
2. Update `CoachingRecommendation` type:

```typescript
type: 'timing' | 'duration' | ... | 'MY_NEW_TYPE'
```

3. Add in `generateRecommendations()`:

```typescript
if (/* condition */) {
  recommendations.push({
    id: 'my-new-type',
    type: 'MY_NEW_TYPE',
    priority: 'high',
    title: 'Title',
    description: 'Description',
    reasoning: 'Why',
    actionable: 'What to do',
    confidence: 85,
    icon: 'icon-name',
    color: '#HEX'
  });
}
```

---

## 🧪 Testing Guide

### Test AI Coach Screen

1. **Avatar Animation**:

   - Open screen → Avatar should pulse smoothly
   - No jank, smooth 2s loop

2. **Tab Switching**:

   - Tap each tab → Content changes instantly
   - Active tab highlighted in purple

3. **Tips Tab**:

   - Should show 5-7 tips with priority badges
   - High priority tips should have red "Quan trọng" badge
   - Icons and colors should match tip type

4. **Motivation Tab**:

   - Gradient cards với celebration messages
   - At least 3-4 cards visible
   - Icons match message type

5. **Insights Tab**:

   - 5-6 insight cards
   - Each has suggestion section
   - "Áp dụng ngay" button present

6. **Adaptive Tab**:

   - Prediction card shows optimal time
   - Confidence bar fills to correct %
   - Pattern summary shows 4 metrics
   - Recommendations list với priority badges
   - Learning progress bar shows correctly

7. **Start Button**:
   - Green gradient button at bottom
   - Navigates to calendar on tap

### Test AI Tip Component

1. **Display**:

   - Tip appears with slide-in animation
   - Gradient background matches tip type
   - Icon displays correctly

2. **Auto-cycle**:

   - Wait 10 seconds → Should switch to next tip
   - Pagination dots update
   - Smooth transition

3. **Dismiss**:

   - Tap X button → Slide out animation
   - Component removed after animation
   - onDismiss callback fires

4. **Contexts**:
   - Test each context type
   - Verify context-specific tips show
   - No duplicate tips

### Test Motivational Engine

1. **Message Selection**:

```typescript
// Low score → Encouragement
const ctx1 = { avgFocusScore: 65, recentTrend: "declining" };
const msg1 = MotivationalEngine.getMotivationalMessage(ctx1);
expect(msg1.type).toBe("encouragement");

// High streak → Celebration
const ctx2 = { currentStreak: 10 };
const msg2 = MotivationalEngine.getMotivationalMessage(ctx2);
expect(msg2.type).toBe("celebration");

// High score → Challenge
const ctx3 = { avgFocusScore: 92 };
const msg3 = MotivationalEngine.getMotivationalMessage(ctx3);
expect(msg3.type).toBe("challenge");
```

2. **Greeting**:

```typescript
// Morning with streak
const ctx = {
  timeOfDay: "morning",
  currentStreak: 5,
  recentTrend: "improving",
};
const greeting = MotivationalEngine.getGreeting(ctx);
expect(greeting).toContain("Chào buổi sáng");
```

### Test Adaptive Coach

1. **Pattern Analysis**:

```typescript
const sessions = [
  /* mock sessions */
];
const pattern = AdaptiveCoach.analyzeUserPatterns(sessions);

expect(pattern.bestTimeOfDay).toBeDefined();
expect(pattern.optimalDuration).toBeGreaterThan(0);
expect(pattern.averageScore).toBeGreaterThanOrEqual(0);
expect(pattern.completionRate).toBeLessThanOrEqual(100);
```

2. **Recommendations**:

```typescript
const recs = AdaptiveCoach.generateRecommendations(pattern, sessions);

expect(recs.length).toBeGreaterThan(0);
expect(recs[0].priority).toBeDefined();
expect(recs[0].confidence).toBeGreaterThan(0);
expect(recs[0].confidence).toBeLessThanOrEqual(100);

// High priority should come first
const priorities = recs.map((r) => r.priority);
expect(priorities[0]).toBe("high");
```

3. **Optimal Time Prediction**:

```typescript
const prediction = AdaptiveCoach.predictOptimalTime(pattern);

expect(prediction.hour).toBeGreaterThanOrEqual(0);
expect(prediction.hour).toBeLessThan(24);
expect(prediction.confidence).toBeGreaterThan(0);
expect(prediction.confidence).toBeLessThanOrEqual(100);
```

### Test Data Scenarios

**Scenario 1: New User (0-5 sessions)**

- Should show default recommendations
- Low confidence (<70%)
- Encourage to complete more sessions

**Scenario 2: Regular User (10-20 sessions)**

- Clear patterns emerging
- Medium-high confidence (70-85%)
- Actionable recommendations

**Scenario 3: Power User (50+ sessions)**

- Strong patterns
- High confidence (85-100%)
- Detailed optimization suggestions

**Scenario 4: Struggling User**

- Low scores (<70)
- Low completion rate
- Should recommend easier goals

**Scenario 5: High Performer**

- High scores (90+)
- High completion rate
- Should suggest challenges

---

## 📝 API Integration (Future)

### Session Storage

```typescript
// Save session after completion
await api.saveSession({
  startTime: new Date(),
  duration: 25,
  score: 87,
  distractions: ['phone'],
  completed: true,
  timeOfDay: getTimeOfDay(),
  dayOfWeek: new Date().getDay()
});

// Load session history
const sessions = await api.getSessionHistory(limit: 30);
```

### Pattern Sync

```typescript
// Save analyzed patterns
await api.saveUserPattern(pattern);

// Load from server (cached 24h)
const pattern = await api.getUserPattern();
```

### Recommendation Tracking

```typescript
// Track which recommendations were shown
await api.trackRecommendation(rec.id, "shown");

// Track user actions
await api.trackRecommendation(rec.id, "applied");
await api.trackRecommendation(rec.id, "dismissed");
```

---

## 🎯 Best Practices

### Performance

- Cache patterns for 24 hours
- Analyze max 30 recent sessions
- Lazy load recommendations
- Debounce pattern recalculation

### UX

- Show loading states during analysis
- Animate confidence bars smoothly
- Provide reasoning for all recommendations
- Make actionable steps clear

### Data Quality

- Validate session data before analysis
- Handle missing/incomplete data gracefully
- Set minimum thresholds (5 sessions)
- Show confidence scores honestly

### Privacy

- Process data locally when possible
- Don't over-collect
- Clear what data is used for what
- Allow user to reset patterns

---

## 🚨 Troubleshooting

### Tips not showing

- Check context type matches
- Verify userData is passed
- Check conditions in getContextualTips()

### Recommendations empty

- Need at least 5 sessions
- Check session data format
- Verify patterns were analyzed

### Low confidence scores

- Not enough data (< 10 sessions)
- Inconsistent user behavior
- Need more sessions in specific time slots

### Avatar not animating

- Check Animated.loop is started
- Verify useNativeDriver: true
- Check no conflicting animations

---

## 📚 Resources

### Icons Used

- robot-outline (AI avatar)
- lightbulb-on (tips)
- heart, rocket-launch (motivation)
- brain, chart-line (insights)
- auto-fix (adaptive)
- clock-star-four-points (optimal time)
- shield-check (confidence)

### Gradients

```typescript
const gradients = {
  aiCoach: ["#667eea", "#764ba2"],
  celebration: ["#FFD700", "#FFA000"],
  encouragement: ["#FF6B6B", "#EF5350"],
  challenge: ["#FF9800", "#F57C00"],
  wisdom: ["#9C27B0", "#7B1FA2"],
  success: ["#4CAF50", "#66BB6A"],
};
```

### References

- Pomodoro Technique
- Fogg Behavior Model (motivation + ability + prompt)
- Habit formation research
- Machine learning pattern recognition

---

## ✅ Completion Checklist

- [x] AI Coach screen với 4 tabs
- [x] Reusable AI Tip component
- [x] Motivational Engine service
- [x] Adaptive Coach service với pattern analysis
- [x] Optimal time prediction
- [x] Personalized recommendations
- [x] Confidence scoring
- [x] Priority-based sorting
- [x] Animations và transitions
- [x] Mock data cho testing
- [ ] API integration
- [ ] AsyncStorage persistence
- [ ] Analytics tracking
- [ ] A/B testing framework

---

## 🔜 Future Enhancements

### Machine Learning

- TensorFlow.js integration
- Predictive modeling
- Anomaly detection
- Personalized difficulty curves

### Advanced Features

- Voice coach (text-to-speech)
- Real-time coaching during sessions
- Social comparison (anonymous)
- Coaching style preferences (strict/gentle)

### Gamification

- Coach relationship level
- Unlock advanced tips
- Achievement-based tips
- Coach personality variants

### Integrations

- Calendar sync for optimal scheduling
- Health app data (sleep quality)
- Weather-based recommendations
- Location-based tips (home/office/cafe)

---

**Phase 6 Status**: ✅ COMPLETED

**Last Updated**: December 17, 2025

**Lines of Code**: ~2,300+ lines across 4 files
