# 🔧 ONBOARDING TESTING COMMANDS

## Reset Onboarding (để test lại từ đầu)

### Method 1: Sử dụng console trong app

Thêm code này vào bất kỳ screen nào (ví dụ: SettingsScreen):

```javascript
import { resetOnboarding } from "../utils/onboardingUtils";

// Trong component
const handleResetOnboarding = async () => {
  await resetOnboarding();
  Alert.alert("Success", "Onboarding đã được reset. Restart app để test lại!");
};

// Button
<Button onPress={handleResetOnboarding}>Reset Onboarding</Button>;
```

### Method 2: React Native Debugger Console

1. Mở app với debugger: `npm start` → nhấn `j` để mở debugger
2. Trong console, chạy:

```javascript
import("react-native").then(({ AsyncStorage }) => {
  AsyncStorage.removeItem("onboardingComplete");
  AsyncStorage.removeItem("personalizedPlan");
  console.log("Onboarding reset!");
});
```

### Method 3: PowerShell (Clear app data - Android)

```powershell
# Clear app data
adb shell pm clear host.exp.exponent

# Hoặc restart app
adb shell am force-stop host.exp.exponent
```

### Method 4: Manual trong Settings

Thêm vào SettingsScreen một Developer Options section:

```javascript
// Add this to SettingsScreen.js imports
import { resetOnboarding } from "../utils/onboardingUtils";

// Add this button in render
<Button
  mode="outlined"
  onPress={async () => {
    await resetOnboarding();
    Alert.alert("Reset Onboarding", "Restart app để xem lại onboarding flow!");
  }}
>
  🔄 Reset Onboarding
</Button>;
```

---

## Quick Test Commands

### Test Onboarding Flow

```bash
cd DeepFocus
npm start -- --clear
```

### Check AsyncStorage (trong app console)

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Check onboarding status
AsyncStorage.getItem("onboardingComplete").then(console.log);

// Check saved plan
AsyncStorage.getItem("personalizedPlan").then((plan) => {
  console.log(JSON.parse(plan));
});
```

### Debug Navigation

```javascript
// Trong component, xem navigation state
console.log(navigation.getState());
```

---

## Expected Flow

### First Time User (onboardingComplete = null/false)

1. App starts
2. ✅ Shows Onboarding (WelcomeScreen)
3. User completes assessment
4. AI Analysis runs
5. Personalized Plan shown
6. User clicks "Bắt đầu hành trình!"
7. ✅ Saves `onboardingComplete = true`
8. ✅ Navigates to Login
9. After login → HomeScreen

### Returning User (onboardingComplete = true)

1. App starts
2. ❌ Skips Onboarding
3. ✅ Shows Login (if not authenticated)
4. After login → HomeScreen

---

## Verify Integration

### 1. Check AppNavigator.js

```javascript
// Should have:
import OnboardingNavigator from './OnboardingNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Should check onboarding before showing auth
{!onboardingComplete ? (
  <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
) : isAuthenticated ? (
  // Home
) : (
  // Login
)}
```

### 2. Check PersonalizedPlanScreen.js

```javascript
// Should save onboarding completion
await AsyncStorage.setItem("onboardingComplete", "true");
```

### 3. Check OnboardingNavigator.js location

```
✅ src/navigation/OnboardingNavigator.js
✅ src/screens/Onboarding/ (5 screens)
```

---

## Troubleshooting

### Onboarding shows every time

**Problem**: `onboardingComplete` not saving

**Fix**:

```javascript
// Check in PersonalizedPlanScreen handleStartJourney
console.log("Saving onboarding...");
await AsyncStorage.setItem("onboardingComplete", "true");
console.log("Saved!");
```

### Navigation not working

**Problem**: Stack navigation conflict

**Fix**: Make sure CommonActions is imported in PersonalizedPlanScreen:

```javascript
import { CommonActions } from "@react-navigation/native";
```

### App crashes after onboarding

**Problem**: Login screen not found

**Fix**: Check AppNavigator.js has Login screen in unauthenticated stack

---

## Files Modified

✅ **src/navigation/AppNavigator.js**

- Added OnboardingNavigator import
- Added onboarding check with AsyncStorage
- Added onboarding screen to stack

✅ **src/screens/Onboarding/PersonalizedPlanScreen.js**

- Added AsyncStorage import
- Added CommonActions for navigation reset
- Updated handleStartJourney to save onboarding completion

✅ **src/utils/onboardingUtils.js** (NEW)

- Utility functions for onboarding management
- resetOnboarding(), isOnboardingComplete(), etc.

---

## Next Steps After Testing

1. ✅ Test onboarding flow end-to-end
2. ✅ Verify AsyncStorage saves correctly
3. ✅ Test navigation from onboarding → login → home
4. 🔄 Add Redux/Context for personalized plan (optional)
5. 🔄 Integrate plan into HomeScreen welcome message
6. 🔄 Add "Reset Onboarding" button in Settings (developer mode)

---

**🎉 Onboarding Integration Complete!**

Ready to test: `npm start -- --clear`
