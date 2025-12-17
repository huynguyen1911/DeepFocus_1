# Debug Guide - Timer Not Working

## Date: October 8, 2025

## Issue Report

User reports: "Tôi đã test và chẳng có gì xảy ra cả" khi nhấn timer.

## Debug Steps Added

### Console Logs Added

#### 1. HomeScreen.tsx - handleStartTimer

```typescript
🎯 handleStartTimer called with task: [task title]
📋 startWorkSession function: [function type]
✅ User confirmed, calling startWorkSession...
🔥 startWorkSession called
❌ User cancelled (if cancelled)
```

#### 2. TaskItem.js - handleStartTimer

```javascript
⏱️ TaskItem handleStartTimer called
📝 Task: [task title]
🔗 onStartTimer prop exists? [true/false]
✅ Calling onStartTimer prop with task
❌ onStartTimer prop is missing! (if missing)
```

#### 3. TaskItem.js - Swipe Action

```javascript
🟢 Timer swipe action pressed!
```

#### 4. TaskItem.js - Long Press Action

```javascript
🔵 Long press timer button pressed!
```

## How to Debug

### Step 1: Open Debug Console

```bash
# In terminal
npx expo start

# Press 'j' to open debugger
# Or use React Native Debugger
```

### Step 2: Try Swipe Action

1. Swipe incomplete task right
2. Tap green "Timer" button
3. **Expected Logs**:
   ```
   🟢 Timer swipe action pressed!
   ⏱️ TaskItem handleStartTimer called
   📝 Task: [your task name]
   🔗 onStartTimer prop exists? true
   ✅ Calling onStartTimer prop with task
   🎯 handleStartTimer called with task: [your task name]
   📋 startWorkSession function: function
   ```
4. **If Dialog Appears**: Good! Proceed to click "Bắt đầu"
5. **Expected Logs After Confirm**:
   ```
   ✅ User confirmed, calling startWorkSession...
   🔥 startWorkSession called
   🔥 Starting work session: 10s (from PomodoroContext)
   ⏱️ Timer running: WORKING, 10s left
   ```

### Step 3: Try Long Press Action

1. Long press any incomplete task
2. Tap "Bắt đầu timer" in modal
3. **Expected Logs**: Same as swipe action but with:
   ```
   🔵 Long press timer button pressed!
   ```

## Common Issues & Solutions

### Issue 1: No Logs at All

**Problem**: Console shows nothing when pressing timer

**Possible Causes**:

- App not connected to debugger
- Console filtering enabled
- App crashed silently

**Solutions**:

```bash
# Reload app
# In Expo: Press 'r'

# Clear cache and restart
npx expo start -c

# Check for errors in terminal
```

### Issue 2: Logs Stop at "Timer swipe action pressed"

**Problem**:

```
🟢 Timer swipe action pressed!
# Nothing after this
```

**Possible Causes**:

- `handleStartTimer` function has error
- Swipeable component not closing properly

**Solutions**:

- Check if `handleStartTimer` is defined
- Verify `task` object exists
- Check if `onStartTimer` prop is passed

### Issue 3: Logs Stop at "onStartTimer prop is missing"

**Problem**:

```
⏱️ TaskItem handleStartTimer called
🔗 onStartTimer prop exists? false
❌ onStartTimer prop is missing!
```

**Cause**: HomeScreen not passing `onStartTimer` to TaskItem

**Solution**: Check HomeScreen renderTaskItem:

```typescript
// Should be:
const renderTaskItem = useCallback(
  ({ item }: { item: any }) => (
    <TaskItem
      task={item}
      onPress={() => router.push(`/task-details/${item._id || item.id}`)}
      onStartTimer={handleStartTimer} // ← This line!
    />
  ),
  [handleStartTimer]
);
```

### Issue 4: Alert Not Showing

**Problem**:

```
🎯 handleStartTimer called with task: My Task
📋 startWorkSession function: function
# Alert doesn't appear
```

**Possible Causes**:

- Alert blocked by other modal
- Platform-specific issue
- Alert not supported in environment

**Solutions**:

1. Test on different device/emulator
2. Check if other modals are open
3. Try direct call (skip alert):

```typescript
// Temporary test
const handleStartTimer = useCallback(
  (task: any) => {
    console.log("Direct call test");
    startWorkSession();
  },
  [startWorkSession]
);
```

### Issue 5: startWorkSession Not Working

**Problem**:

```
🔥 startWorkSession called
# But timer doesn't start
```

**Check PomodoroContext**:

```javascript
// In PomodoroContext.js
const startWorkSession = () => {
  console.log("🔥 startWorkSession called in context");
  console.log("⚙️ Current settings:", state.settings);

  dispatch({
    type: POMODORO_ACTIONS.SET_STATE,
    payload: {
      state: TIMER_STATES.WORKING,
      duration: state.settings.workDuration,
      autoStart: true,
    },
  });
};
```

### Issue 6: Timer State Not Updating

**Problem**: startWorkSession works but Timer component doesn't update

**Check Timer Component**:

```javascript
// In Timer.js, add logs
const Timer = () => {
  const { timerState, timeLeft, isActive } = usePomodoro();

  console.log("🎬 Timer render:", { timerState, timeLeft, isActive });

  // ... rest of component
};
```

## Test Matrix

### Test Case 1: Swipe Timer on Incomplete Task

- [ ] Swipe right works
- [ ] Timer button visible (green)
- [ ] Tap timer button
- [ ] Console shows: "🟢 Timer swipe action pressed!"
- [ ] Console shows: "⏱️ TaskItem handleStartTimer called"
- [ ] Console shows: "🎯 handleStartTimer called with task"
- [ ] Alert dialog appears
- [ ] Task title shown in dialog
- [ ] Click "Bắt đầu"
- [ ] Console shows: "✅ User confirmed"
- [ ] Console shows: "🔥 startWorkSession called"
- [ ] Timer starts counting down
- [ ] Timer shows "Tập Trung" state

### Test Case 2: Long Press Timer on Incomplete Task

- [ ] Long press works (hold 500ms)
- [ ] Action sheet appears
- [ ] "Bắt đầu timer" option visible
- [ ] Tap "Bắt đầu timer"
- [ ] Console shows: "🔵 Long press timer button pressed!"
- [ ] Rest same as Test Case 1

### Test Case 3: Completed Task (Should Not Have Timer)

- [ ] Swipe completed task right
- [ ] Only "Xóa" button visible (no timer)
- [ ] Long press completed task
- [ ] Action sheet shows no timer option

### Test Case 4: Direct Timer Start (Control Test)

- [ ] Scroll to Timer component at top
- [ ] Click "Bắt Đầu" button
- [ ] Timer should start (proves timer works)
- [ ] If this fails, issue is with PomodoroContext

## Advanced Debug

### Check Props Flow

```javascript
// In TaskItem, add this at top of component:
console.log("🔍 TaskItem Props:", {
  taskTitle: task.title,
  hasOnStartTimer: !!onStartTimer,
  hasOnPress: !!onPress,
  taskCompleted: task.isCompleted,
});
```

### Check Context Values

```typescript
// In HomeScreen, add this:
useEffect(() => {
  console.log("🔍 HomeScreen Context Check:", {
    hasStartWorkSession: !!startWorkSession,
    startWorkSessionType: typeof startWorkSession,
    completedPomodoros,
  });
}, [startWorkSession, completedPomodoros]);
```

### Check Swipeable Component

```javascript
// In TaskItem, wrap Swipeable:
<Swipeable
  renderRightActions={() => {
    console.log('🔍 Rendering right actions');
    console.log('  - Task completed:', task.isCompleted);
    console.log('  - Has onStartTimer:', !!onStartTimer);
    return renderRightActions();
  }}
  overshootRight={false}
  friction={2}
>
```

## Expected Complete Flow

```
User Action: Swipe right + Tap Timer
    ↓
🟢 Timer swipe action pressed!
    ↓
⏱️ TaskItem handleStartTimer called
📝 Task: Learn React Native
🔗 onStartTimer prop exists? true
✅ Calling onStartTimer prop with task
    ↓
🎯 handleStartTimer called with task: Learn React Native
📋 startWorkSession function: function
    ↓
[Alert Dialog Appears]
    ↓
User clicks "Bắt đầu"
    ↓
✅ User confirmed, calling startWorkSession...
🔥 startWorkSession called
    ↓
[PomodoroContext logs]
🔥 Starting work session: 10s
⏱️ Timer running: WORKING, 10s left
⏱️ Timer running: WORKING, 9s left
⏱️ Timer running: WORKING, 8s left
...
    ↓
[Timer Component Updates]
🎬 Timer render: { timerState: 'WORKING', timeLeft: 10, isActive: true }
🎬 Timer render: { timerState: 'WORKING', timeLeft: 9, isActive: true }
...
```

## Quick Verification Commands

### Check if app is running:

```bash
# Should see Metro bundler running
curl http://localhost:8081/status
```

### Check React Native debugger:

```bash
# Open Chrome DevTools
# Navigate to: chrome://inspect
# Click "inspect" on React Native app
```

### Check logs in real-time:

```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android

# Or Expo
# Press 'i' for iOS logs
# Press 'a' for Android logs
```

## Next Steps Based on Logs

### If NO logs appear:

1. App not running or crashed
2. Reload app
3. Check terminal for errors

### If logs stop at "🟢 Timer swipe action pressed":

1. Issue in `handleStartTimer` function
2. Check TaskItem code
3. Verify `onStartTimer` prop exists

### If logs stop at "🎯 handleStartTimer called":

1. Issue with Alert.alert
2. Try skipping alert (direct call)
3. Check platform compatibility

### If logs reach "🔥 startWorkSession called" but no timer:

1. Issue in PomodoroContext
2. Check context provider wrapping
3. Verify Timer component is subscribed to context

### If everything logs correctly but UI doesn't update:

1. React re-render issue
2. Check if Timer component is mounted
3. Verify context subscription

## Temporary Test Code

### Skip Alert (Direct Timer Start)

```typescript
// In HomeScreen.tsx
const handleStartTimer = useCallback(
  (task: any) => {
    console.log("🎯 DIRECT TEST - No alert");
    startWorkSession();
    console.log("🔥 Timer should start now");
  },
  [startWorkSession]
);
```

### Force Timer Start

```typescript
// Add test button in HomeScreen JSX
<Button
  onPress={() => {
    console.log("🧪 Test button pressed");
    startWorkSession();
  }}
>
  TEST TIMER START
</Button>
```

## Contact Developer

If none of these help, please provide:

1. **Console logs** (all of them)
2. **Device/Platform**: iOS/Android/Web
3. **Expo version**: Run `expo --version`
4. **Screenshot** of what you see
5. **Video** of the interaction (if possible)

---

**Status**: 🔍 DEBUGGING MODE ACTIVE

All console logs added. Please test again and share:

1. What you see in console
2. What happens (or doesn't happen)
3. Any error messages
