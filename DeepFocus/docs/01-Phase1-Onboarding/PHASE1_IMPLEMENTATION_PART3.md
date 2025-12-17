# PHASE 1 IMPLEMENTATION - PART 3

## Redux, Navigation & Installation

---

## 📦 REDUX STORE SETUP

### store/actions/userActions.js

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

export const SAVE_ASSESSMENT_ANSWERS = "SAVE_ASSESSMENT_ANSWERS";
export const SAVE_PERSONALIZED_PLAN = "SAVE_PERSONALIZED_PLAN";
export const UPDATE_USER_PROFILE = "UPDATE_USER_PROFILE";
export const SET_ONBOARDING_COMPLETE = "SET_ONBOARDING_COMPLETE";

// Save assessment answers locally
export const saveAssessmentAnswers = (answers) => async (dispatch) => {
  try {
    await AsyncStorage.setItem("assessment_answers", JSON.stringify(answers));
    dispatch({
      type: SAVE_ASSESSMENT_ANSWERS,
      payload: answers,
    });
  } catch (error) {
    console.error("Error saving assessment answers:", error);
  }
};

// Generate personalized plan (AI-powered or rule-based)
export const generatePersonalizedPlan = (answers) => async (dispatch) => {
  try {
    // Call AI endpoint for personalized recommendations
    const response = await api.post("/api/onboarding/generate-plan", {
      answers,
    });

    const plan = response.data.plan;

    await AsyncStorage.setItem("personalized_plan", JSON.stringify(plan));

    dispatch({
      type: SAVE_PERSONALIZED_PLAN,
      payload: plan,
    });

    return plan;
  } catch (error) {
    console.error("Error generating plan:", error);

    // Fallback to client-side plan generation
    const fallbackPlan = generateFallbackPlan(answers);

    await AsyncStorage.setItem(
      "personalized_plan",
      JSON.stringify(fallbackPlan)
    );

    dispatch({
      type: SAVE_PERSONALIZED_PLAN,
      payload: fallbackPlan,
    });

    return fallbackPlan;
  }
};

// Save plan to user profile
export const savePlanToProfile = (plan) => async (dispatch, getState) => {
  try {
    const { auth } = getState();

    if (auth.isAuthenticated) {
      // Save to backend
      await api.put("/api/users/profile", {
        onboardingPlan: plan,
        onboardingCompleted: true,
        focusSettings: {
          defaultSessionLength: parseFocusTime(plan.focusTime),
          weeklyGoalHours: plan.targetHours,
        },
      });
    }

    // Save locally
    await AsyncStorage.setItem("onboarding_complete", "true");

    dispatch({
      type: SET_ONBOARDING_COMPLETE,
      payload: true,
    });

    dispatch({
      type: UPDATE_USER_PROFILE,
      payload: {
        onboardingPlan: plan,
        focusSettings: {
          defaultSessionLength: parseFocusTime(plan.focusTime),
          weeklyGoalHours: plan.targetHours,
        },
      },
    });
  } catch (error) {
    console.error("Error saving plan to profile:", error);
  }
};

// Helper: Parse focus time to minutes
const parseFocusTime = (focusTime) => {
  switch (focusTime) {
    case "15-20":
      return 20;
    case "25-30":
      return 25;
    case "45-60":
      return 50;
    case "60+":
      return 90;
    default:
      return 25;
  }
};

// Helper: Generate fallback plan when API fails
const generateFallbackPlan = (answers) => {
  const role = answers[1] || "student";
  const goal = answers[2] || "focus_time";
  const currentHours = answers[3] || 2;
  const focusTime = answers[5] || "25-30";
  const targetHours = answers[7] || 15;

  // Generate recommendations
  const recommendations = [];

  const gap = targetHours - currentHours;
  if (gap > 15) {
    recommendations.push({
      type: "gradual",
      title: "Tăng dần thôi nhé",
      message: `Mục tiêu ${targetHours}h/tuần là tuyệt vời! Nhưng hãy tăng từ từ từ ${currentHours}h hiện tại để cơ thể quen dần.`,
      icon: "🌱",
    });
  }

  if (focusTime === "15-20") {
    recommendations.push({
      type: "focus_build",
      title: "Xây dựng thời gian tập trung",
      message:
        "Bắt đầu với 15-20 phút rất tốt! Sau vài tuần, thử tăng lên 25 phút nhé.",
      icon: "⏰",
    });
  }

  const methods = answers[6] || [];
  if (methods.includes("none")) {
    recommendations.push({
      type: "method_intro",
      title: "Khám phá Pomodoro",
      message: "Pomodoro sẽ giúp bạn học hiệu quả hơn rất nhiều. Hãy thử nhé!",
      icon: "🍅",
    });
  }

  // Assign personality
  let personality;
  if (role === "student" && goal === "exam_prep") {
    personality = {
      name: "Coach Mai",
      style: "encouraging",
      trait: "Động viên nhiệt tình, hiểu được áp lực thi cử",
    };
  } else if (goal === "build_habit") {
    personality = {
      name: "Coach Tú",
      style: "patient",
      trait: "Kiên nhẫn, tập trung vào tiến bộ dài hạn",
    };
  } else {
    personality = {
      name: "Coach An",
      style: "balanced",
      trait: "Cân bằng, linh hoạt, dễ gần",
    };
  }

  return {
    role,
    goal,
    currentHours,
    focusTime,
    targetHours,
    recommendations,
    personality,
    createdAt: new Date().toISOString(),
  };
};
```

---

### store/reducers/userReducer.js

```javascript
import {
  SAVE_ASSESSMENT_ANSWERS,
  SAVE_PERSONALIZED_PLAN,
  UPDATE_USER_PROFILE,
  SET_ONBOARDING_COMPLETE,
} from "../actions/userActions";

const initialState = {
  assessmentAnswers: null,
  personalizedPlan: null,
  onboardingComplete: false,
  profile: {
    focusSettings: {
      defaultSessionLength: 25,
      weeklyGoalHours: 15,
    },
  },
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_ASSESSMENT_ANSWERS:
      return {
        ...state,
        assessmentAnswers: action.payload,
      };

    case SAVE_PERSONALIZED_PLAN:
      return {
        ...state,
        personalizedPlan: action.payload,
      };

    case SET_ONBOARDING_COMPLETE:
      return {
        ...state,
        onboardingComplete: action.payload,
      };

    case UPDATE_USER_PROFILE:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}
```

---

## 🧭 NAVIGATION SETUP

### navigation/OnboardingNavigator.js

```jsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "../screens/Onboarding/WelcomeScreen";
import AssessmentIntroScreen from "../screens/Onboarding/AssessmentIntroScreen";
import AssessmentScreen from "../screens/Onboarding/AssessmentScreen";
import AIAnalysisScreen from "../screens/Onboarding/AIAnalysisScreen";
import PersonalizedPlanScreen from "../screens/Onboarding/PersonalizedPlanScreen";

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AssessmentIntro" component={AssessmentIntroScreen} />
      <Stack.Screen name="Assessment" component={AssessmentScreen} />
      <Stack.Screen name="AIAnalysis" component={AIAnalysisScreen} />
      <Stack.Screen
        name="PersonalizedPlan"
        component={PersonalizedPlanScreen}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
```

---

### navigation/RootNavigator.js (Updated)

```jsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";

import OnboardingNavigator from "./OnboardingNavigator";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import LoadingScreen from "../screens/LoadingScreen";

const Stack = createStackNavigator();

const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { onboardingComplete } = useSelector((state) => state.user);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem(
        "onboarding_complete"
      );
      setHasCompletedOnboarding(onboardingStatus === "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding && !onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
```

---

## 🎨 REQUIRED ASSETS

### Required Lottie Animations

Create folder: `assets/animations/`

**Animations needed:**

1. **focus-study.json** - Student studying with focus
2. **ai-thinking.json** - AI brain processing
3. **confetti.json** - Celebration confetti

**Where to get free Lottie animations:**

- LottieFiles: https://lottiefiles.com/
- Search terms: "focus", "study", "ai thinking", "confetti celebration"

### Example animation URLs (download as JSON):

```
focus-study.json: https://lottiefiles.com/animations/student-studying
ai-thinking.json: https://lottiefiles.com/animations/ai-robot-thinking
confetti.json: https://lottiefiles.com/animations/confetti-celebration
```

---

## 📦 PACKAGE INSTALLATION

### Required Packages

```bash
# Core dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage

# UI Components
npm install expo-linear-gradient
npm install lottie-react-native
npm install @react-native-community/slider

# State Management (if not already installed)
npm install redux react-redux redux-thunk

# Icons (if not already installed)
npm install @expo/vector-icons
```

### For Expo projects:

```bash
expo install react-native-gesture-handler react-native-reanimated
expo install react-native-screens react-native-safe-area-context
expo install @react-native-async-storage/async-storage
expo install expo-linear-gradient
expo install lottie-react-native
```

---

## 🔧 BACKEND API ENDPOINTS (Optional)

### POST /api/onboarding/generate-plan

**Request Body:**

```json
{
  "answers": {
    "1": "student",
    "2": "focus_time",
    "3": 2,
    "4": ["morning", "evening"],
    "5": "25-30",
    "6": ["pomodoro", "todo_list"],
    "7": 15
  }
}
```

**Response:**

```json
{
  "success": true,
  "plan": {
    "role": "student",
    "goal": "focus_time",
    "currentHours": 2,
    "focusTime": "25-30",
    "targetHours": 15,
    "recommendations": [
      {
        "type": "gradual",
        "title": "Tăng dần thôi nhé",
        "message": "Mục tiêu 15h/tuần là tuyệt vời! Nhưng hãy tăng từ từ từ 2h hiện tại để cơ thể quen dần.",
        "icon": "🌱"
      }
    ],
    "personality": {
      "name": "Coach An",
      "style": "balanced",
      "trait": "Cân bằng, linh hoạt, dễ gần"
    }
  }
}
```

### Backend implementation (Node.js/Express):

```javascript
// routes/onboarding.js
const express = require("express");
const router = express.Router();

router.post("/generate-plan", async (req, res) => {
  try {
    const { answers } = req.body;

    // AI-powered analysis (OpenAI, Claude, or custom ML model)
    // For now, use rule-based logic
    const plan = generatePlanFromAnswers(answers);

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate plan",
    });
  }
});

function generatePlanFromAnswers(answers) {
  // Same logic as client-side fallback
  // ... (copy from userActions.js)

  return {
    role: answers[1],
    goal: answers[2],
    currentHours: answers[3],
    focusTime: answers[5],
    targetHours: answers[7],
    recommendations: [],
    personality: {
      name: "Coach An",
      style: "balanced",
      trait: "Cân bằng, linh hoạt, dễ gần",
    },
  };
}

module.exports = router;
```

---

## 🚀 TESTING & VALIDATION

### Manual Testing Checklist

**Welcome Screen:**

- ✅ Animation plays smoothly
- ✅ Gradient background displays correctly
- ✅ "Bắt Đầu Đánh Giá" button navigates to AssessmentIntro
- ✅ "Đã có tài khoản? Đăng nhập" navigates to Login

**Assessment Intro:**

- ✅ 4 steps display with icons
- ✅ Privacy message shows
- ✅ "Bắt đầu thôi!" navigates to Assessment step 1
- ✅ "Để sau vậy" goes back

**Assessment Flow:**

- ✅ Progress dots update correctly
- ✅ Single choice questions allow only one selection
- ✅ Multiple choice questions allow multiple selections
- ✅ Slider questions display value correctly
- ✅ "Tiếp theo" button disabled until answer selected
- ✅ "Quay lại" button works correctly
- ✅ All 7 questions flow smoothly
- ✅ Animations between questions

**AI Analysis:**

- ✅ Loading animation plays
- ✅ Progress bar updates
- ✅ Different phases display with emojis
- ✅ Fun facts rotate
- ✅ Navigates to PersonalizedPlan after completion

**Personalized Plan:**

- ✅ Confetti animation plays once
- ✅ Cards animate in sequence
- ✅ Summary card shows correct stats
- ✅ Coach personality displays
- ✅ Focus time recommendation shows
- ✅ Recommendations display if present
- ✅ "Bắt đầu hành trình!" saves plan and navigates to MainApp

---

## 📱 SCREEN ORGANIZATION

```
app/
├── screens/
│   ├── Onboarding/
│   │   ├── WelcomeScreen.js
│   │   ├── AssessmentIntroScreen.js
│   │   ├── AssessmentScreen.js
│   │   ├── AIAnalysisScreen.js
│   │   └── PersonalizedPlanScreen.js
│   └── ...
├── navigation/
│   ├── OnboardingNavigator.js
│   ├── RootNavigator.js
│   └── ...
├── store/
│   ├── actions/
│   │   └── userActions.js
│   ├── reducers/
│   │   └── userReducer.js
│   └── index.js
└── assets/
    └── animations/
        ├── focus-study.json
        ├── ai-thinking.json
        └── confetti.json
```

---

## 🎯 NATURAL DESIGN PRINCIPLES APPLIED

✅ **Conversational Language:**

- "Hãy cho tôi biết về bạn! 👋" instead of "User Assessment"
- "Bắt đầu thôi!" instead of "Start"
- "Để sau vậy" instead of "Skip"

✅ **Personality & Warmth:**

- Coach personalities with different styles
- Personal messages, not templates
- Emojis used naturally

✅ **Realistic Scenarios:**

- Real study hours (not perfect numbers)
- Actual focus times students experience
- Genuine motivational messages

✅ **Human Imperfections:**

- "Chỉ mất 2-3 phút thôi" (casual estimate)
- "Trung bình thôi, không cần chính xác đâu"
- Flexible language, not rigid

✅ **Visual Variety:**

- Different card styles
- Varied animations
- Natural color gradients
- Not everything perfectly aligned

✅ **Emotional Connection:**

- Celebration moments
- Encouraging messages
- Personal recommendations
- Coach that understands you

---

## 💡 CUSTOMIZATION TIPS

**To make it even more natural:**

1. **Add more personality variations:**

   - Different coach avatars (not just emoji)
   - Voice/tone variations
   - Random encouraging phrases

2. **User-generated feel:**

   - Handwritten font for some elements
   - Sketch-style illustrations
   - Imperfect animations

3. **Context-aware responses:**

   - Time-of-day greetings
   - Weather-based messages
   - Real-world examples

4. **Micro-interactions:**
   - Haptic feedback on selections
   - Subtle wobble animations
   - Sound effects (optional)

---

## 🎨 COLOR PALETTE REFERENCE

```javascript
const colors = {
  // Primary Gradients
  purpleGradient: ["#667eea", "#764ba2"],
  pinkGradient: ["#F093FB", "#F5576C"],

  // Backgrounds
  background: "#F9FAFB",
  cardBackground: "#FFFFFF",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",

  // Accents
  accentPurple: "#667eea",
  accentPink: "#F5576C",
  accentYellow: "#FCD34D",
  accentGreen: "#10b981",

  // States
  border: "#E5E7EB",
  divider: "#E5E7EB",
  disabled: "#D1D5DB",
};
```

---

**Next Steps:** Install packages, add animations, and test the flow! 🚀
