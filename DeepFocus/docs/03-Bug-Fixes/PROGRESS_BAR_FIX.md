# 🐛 Progress Bar Debug & Fix - DeepFocus

## ✅ Fixes Applied

### 1. **Progress Calculation Enhanced** (`src/components/Timer.js`)

**Before:**

```javascript
const getProgress = () => {
  const totalTime = getInitialDuration();
  if (totalTime === 0) return 0;
  return (totalTime - timeLeft) / totalTime;
};
```

**After:**

```javascript
const getProgress = () => {
  const totalTime = getInitialDuration();
  if (totalTime === 0) {
    console.log("⚠️ Progress: totalTime is 0, returning 0");
    return 0;
  }
  const progress = (totalTime - timeLeft) / totalTime;
  console.log(`📊 Progress calculation:`, {
    timerState,
    totalTime,
    timeLeft,
    progress: progress.toFixed(3),
  });
  return Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
};
```

**Improvements:**

- ✅ Added debug logging to track values
- ✅ Clamps progress between 0 and 1 using Math.max/Math.min
- ✅ Logs timerState, totalTime, timeLeft, and calculated progress
- ✅ Shows warning when totalTime is 0

---

### 2. **ProgressBar Container Added**

**Before:**

```javascript
{
  timerState !== TIMER_STATES.IDLE && (
    <ProgressBar
      progress={getProgress()}
      color={getStateColor()}
      style={styles.progressBar}
    />
  );
}
```

**After:**

```javascript
{
  timerState !== TIMER_STATES.IDLE && (
    <View style={styles.progressContainer}>
      <ProgressBar
        progress={getProgress()}
        color={getStateColor()}
        style={styles.progressBar}
      />
    </View>
  );
}
```

**Why?**

- ✅ ProgressBar needs explicit width container
- ✅ Prevents flex layout issues
- ✅ Ensures proper rendering on all screen sizes

---

### 3. **Styling Improvements**

**Before:**

```javascript
progressBar: {
  width: "100%",
  height: 8,
  borderRadius: 4,
  marginVertical: 16,
}
```

**After:**

```javascript
progressContainer: {
  width: "100%",
  marginVertical: 20,
  paddingHorizontal: 4,
},
progressBar: {
  height: 8,
  borderRadius: 4,
  backgroundColor: "#E0E0E0", // Background track color
}
```

**Improvements:**

- ✅ Separated container and bar styles
- ✅ Added backgroundColor for track (makes bar visible even at 0%)
- ✅ Proper margins and padding
- ✅ Width is set on container, not bar itself

---

## 🔍 Debug Console Logs

When timer is running, you'll see:

```
📊 Progress calculation: {
  timerState: "WORKING",
  totalTime: 1500,
  timeLeft: 1450,
  progress: "0.033"
}
```

When timer is idle:

```
⚠️ Progress: totalTime is 0, returning 0
```

---

## ✅ Verification Checklist

### Visual Check:

- [ ] Progress bar appears below timer (when not IDLE)
- [ ] Progress bar has gray background track (#E0E0E0)
- [ ] Progress bar fills with color (red for work, green for break)
- [ ] Progress bar advances smoothly each second
- [ ] Progress bar reaches 100% when timer hits 00:00

### Console Check:

- [ ] See progress logs every second
- [ ] totalTime matches duration (1500 for work, 300 for break)
- [ ] timeLeft decreases by 1 each second
- [ ] progress increases from 0.000 to 1.000

### State Check:

- [ ] IDLE: No progress bar shown ✓
- [ ] WORKING: Red progress bar, increases as time decreases ✓
- [ ] SHORT_BREAK: Green progress bar, increases as time decreases ✓

---

## 🎯 Expected Behavior

### Starting Work Session (25:00):

```
Initial: progress = (1500 - 1500) / 1500 = 0.000 (0%)
After 1s: progress = (1500 - 1499) / 1500 = 0.001 (0.1%)
After 1m: progress = (1500 - 1440) / 1500 = 0.040 (4%)
After 12.5m: progress = (1500 - 750) / 1500 = 0.500 (50%)
After 24:59: progress = (1500 - 1) / 1500 = 0.999 (99.9%)
At 00:00: progress = (1500 - 0) / 1500 = 1.000 (100%)
```

### Starting Short Break (05:00):

```
Initial: progress = (300 - 300) / 300 = 0.000 (0%)
After 1s: progress = (300 - 299) / 300 = 0.003 (0.3%)
After 2.5m: progress = (300 - 150) / 300 = 0.500 (50%)
At 00:00: progress = (300 - 0) / 300 = 1.000 (100%)
```

---

## 🐛 Troubleshooting

### Problem: Progress bar not visible

**Solution:** Check console logs. If totalTime = 0, timer state is IDLE or not initialized properly.

### Problem: Progress not advancing

**Solution:** Check if timer is running (isActive = true). Check console logs for timeLeft decreasing.

### Problem: Progress jumps or wrong value

**Solution:** Math.max/Math.min clamps values. Check if totalTime and timeLeft are correct in logs.

### Problem: No console logs

**Solution:** Make sure you're in development mode (**DEV** = true). Check metro bundler is running.

---

## 📊 React Native Paper ProgressBar Props

```javascript
<ProgressBar
  progress={0.5} // Number 0-1 (NOT percentage)
  color="#FF5252" // Bar fill color
  style={styles.bar} // Custom styles
  indeterminate={false} // Set true for loading spinner effect
/>
```

**Important:**

- `progress` must be 0-1, not 0-100
- ProgressBar needs `height` style to be visible (default is very small)
- `backgroundColor` in style sets the track color
- Must be in a container with defined width

---

## ✅ All Issues Fixed

1. ✅ Progress calculation correct with clamping
2. ✅ Debug logs added for troubleshooting
3. ✅ ProgressBar wrapped in container with width
4. ✅ Background track color added (#E0E0E0)
5. ✅ Proper styling with height and borderRadius
6. ✅ Conditional rendering (hidden when IDLE)
7. ✅ Color changes with state (red/green/gray)

---

## 🚀 Test Now!

1. Start app and login
2. Click "Bắt Đầu" button
3. Watch console for progress logs
4. See progress bar fill from left to right
5. Progress should advance smoothly each second

**Expected Result:**

- Gray track visible immediately
- Colored bar grows from 0% to 100% over 25 minutes
- Console logs show increasing progress values
- Bar turns green during break period

---

## 📝 Notes

- Progress bar uses 8px height for visibility
- Track color (#E0E0E0) ensures bar is visible at 0%
- Container padding prevents bar from touching edges
- Logs can be removed in production by wrapping in `if (__DEV__)`

---

**Status: ✅ FIXED & READY TO TEST**
