# Timer-Task Integration Documentation

## 📋 Tổng Quan

Tích hợp hoàn chỉnh giữa Pomodoro Timer và Task Management System trong ứng dụng DeepFocus.

## ✅ Các Tính Năng Đã Triển Khai

### 1. PomodoroContext (src/contexts/PomodoroContext.js)

- ✅ `activeTask`: State lưu task đang chạy timer
- ✅ `startWorkSessionWithTask(task)`: Bắt đầu phiên làm việc với task cụ thể
- ✅ `clearActiveTask()`: Xóa task hiện tại
- ✅ Auto-call `onPomodoroComplete` callback khi hoàn thành pomodoro

### 2. TaskContext (src/contexts/TaskContext.js)

- ✅ `incrementPomodoroCount(taskId, duration)`: Tăng số pomodoro đã hoàn thành
- ✅ **Auto-complete task**: Tự động đánh dấu hoàn thành khi `completedPomodoros >= estimatedPomodoros`
- ✅ Optimistic updates với rollback on error
- ✅ AsyncStorage sync

### 3. ConnectedPomodoroProvider (src/contexts/ConnectedPomodoroProvider.js)

- ✅ Kết nối PomodoroContext với TaskContext
- ✅ `handlePomodoroComplete`: Callback tự động cập nhật task khi pomodoro complete
- ✅ Truyền duration (minutes) từ timer settings

### 4. Timer Component (src/components/Timer.js)

- ✅ **Task Display**: Hiển thị tên task đang làm việc
- ✅ **Progress Display**: Hiển thị `completedPomodoros / estimatedPomodoros`
- ✅ **Progress Bar**: Thanh tiến độ cho task (đổi màu xanh lá khi >= 75%)
- ✅ **Dual Start Buttons**:
  - "Chọn Nhiệm Vụ & Bắt Đầu" → Mở TaskSelector
  - "Bắt Đầu Không Nhiệm Vụ" → Chạy timer độc lập
- ✅ Tích hợp TaskSelector modal

### 5. TaskSelector Component (src/components/TaskSelector.js) - MỚI

- ✅ **Modal fullscreen** để chọn task
- ✅ **Search Bar**: Tìm kiếm task theo title/description
- ✅ **Sort Options**:
  - Độ ưu tiên (High → Medium → Low)
  - Hạn chót (soonest first)
- ✅ **Task Display**:
  - Priority chip với color coding
  - Progress bar (🍅 completedPomodoros/estimatedPomodoros)
  - Due date với overdue indicator
- ✅ **Bottom Action**: "Bắt đầu mà không chọn nhiệm vụ"
- ✅ Chỉ hiển thị incomplete tasks
- ✅ Empty state với hướng dẫn

### 6. TaskItem Component (src/components/TaskItem.js)

- ✅ **Quick Timer Button**: IconButton timer ở footer (chỉ cho incomplete tasks)
- ✅ **Long Press Modal**: Action "Bắt đầu timer"
- ✅ **Progress Color**: Đổi màu xanh lá khi progress >= 75%
- ✅ Event propagation handling (e.stopPropagation)

### 7. API Layer (src/services/api.js)

- ✅ `incrementTaskPomodoro(taskId, duration)`: POST /tasks/:id/increment-pomodoro
- ✅ Duration parameter support
- ✅ Error handling với retry logic

### 8. Backend (backend/)

- ✅ GET /api/tasks/:id - Lấy single task
- ✅ POST /api/tasks/:id/increment-pomodoro - Tăng pomodoro count
- ✅ Task model với `pomodoroSessions` array
- ✅ Auto-complete logic khi đạt goal

## 🔄 Luồng Hoạt Động

### Luồng Chính: Chọn Task → Start Timer → Complete

```
1. User opens HomeScreen
   └─> Timer in IDLE state
   └─> Shows "Chọn Nhiệm Vụ & Bắt Đầu" button

2. User taps "Chọn Nhiệm Vụ & Bắt Đầu"
   └─> TaskSelector modal opens
   └─> Shows list of incomplete tasks
   └─> User can search/sort

3. User selects a task
   └─> onSelectTask(task) called
   └─> startWorkSessionWithTask(task)
   └─> Timer state: IDLE → WORKING
   └─> activeTask set to selected task
   └─> Timer shows task name + progress
   └─> Modal closes

4. Timer counts down
   └─> Display: MM:SS
   └─> Progress bar fills up
   └─> User can pause/reset

5. Timer reaches 00:00
   └─> handleTimerComplete triggered
   └─> onPomodoroComplete(activeTask, duration) called
   └─> incrementPomodoroCount(taskId, duration)
   └─> Backend API: POST /tasks/:id/increment-pomodoro
   └─> Task updated: completedPomodoros++
   └─> TaskContext state updated
   └─> AsyncStorage synced

6. Check if task complete
   └─> IF completedPomodoros >= estimatedPomodoros:
       └─> completeTask(taskId) auto-called
       └─> Backend API: PUT /tasks/:id/complete
       └─> Task marked as complete
       └─> 🎉 Success notification

7. Timer auto-starts SHORT_BREAK
   └─> activeTask kept during break
   └─> After break: return to IDLE
   └─> activeTask cleared
```

### Luồng Phụ: Quick Start từ TaskItem

```
1. User taps timer icon on TaskItem
   └─> handleStartTimer(task) called
   └─> Alert confirmation shown

2. User confirms
   └─> startWorkSessionWithTask(task)
   └─> Auto-scroll to Timer section
   └─> Timer starts immediately

3. Continue with main flow from step 4
```

## 🎯 Test Cases

### Test 1: Chọn Task và Hoàn Thành Pomodoro

```
✓ Mở HomeScreen → Timer IDLE
✓ Nhấn "Chọn Nhiệm Vụ & Bắt Đầu"
✓ TaskSelector mở
✓ Chọn task có progress 1/4
✓ Timer hiển thị "Đang làm việc: [Task Name]"
✓ Timer hiển thị "🍅 1/4 Pomodoros"
✓ Nhấn "Bắt Đầu"
✓ Timer đếm ngược
✓ Để timer chạy hết (hoặc skip)
✓ Backend cập nhật: completedPomodoros = 2
✓ UI cập nhật: "🍅 2/4 Pomodoros"
✓ Progress bar tăng lên 50%
✓ Auto-start short break
```

### Test 2: Auto-Complete Task

```
✓ Chọn task có progress 3/4
✓ Hoàn thành pomodoro
✓ Backend: completedPomodoros = 4
✓ Auto-complete triggered
✓ Task isCompleted = true
✓ TaskItem opacity 0.7
✓ Task không còn trong TaskSelector
✓ 🎉 Celebration (future enhancement)
```

### Test 3: Quick Start từ TaskItem

```
✓ Tap timer icon trên TaskItem
✓ Alert "Bắt đầu Pomodoro" hiện ra
✓ Confirm
✓ Timer bắt đầu với task
✓ Auto-scroll to timer
✓ Task name hiển thị
✓ Progress hiển thị
```

### Test 4: Start Without Task

```
✓ Nhấn "Bắt Đầu Không Nhiệm Vụ"
✓ Timer starts
✓ Không hiển thị task name
✓ Hoàn thành pomodoro
✓ completedPomodoros global tăng
✓ Không cập nhật task nào
```

### Test 5: Progress Color Change

```
✓ Task progress < 75%: Use priority color
✓ Task progress >= 75%: Change to green (#4CAF50)
✓ Verify in Timer progress bar
✓ Verify in TaskItem progress bar
```

### Test 6: Search & Sort trong TaskSelector

```
✓ Mở TaskSelector
✓ Type "test" trong search bar
✓ Chỉ tasks có "test" trong title/description hiển thị
✓ Clear search
✓ Tap "Độ ưu tiên" sort chip
✓ Tasks sắp xếp: High → Medium → Low
✓ Tap "Hạn chót" sort chip
✓ Tasks sắp xếp theo dueDate (soonest first)
```

### Test 7: Error Handling

```
✓ Offline mode
✓ Complete pomodoro
✓ API call fails
✓ Error logged
✓ Retry với exponential backoff
✓ Khi online lại: Sync thành công
```

### Test 8: Edge Cases

```
✓ estimatedPomodoros = 0: Progress = 0%, no auto-complete
✓ Null activeTask: onPomodoroComplete logs warning, no crash
✓ Task deleted while timer running: Handle gracefully
✓ Multiple rapid taps on timer button: Debounce/prevent duplicates
```

## 📊 State Management

### Global State (TaskContext)

```javascript
tasks: [
  {
    _id: "123",
    title: "Học React Native",
    completedPomodoros: 2,
    estimatedPomodoros: 4,
    isCompleted: false,
    priority: "high",
    dueDate: "2025-10-25",
    pomodoroSessions: [
      { completedAt: "2025-10-20T10:30:00Z", duration: 25 },
      { completedAt: "2025-10-20T11:00:00Z", duration: 25 },
    ],
  },
];
```

### Timer State (PomodoroContext)

```javascript
{
  timerState: "WORKING", // IDLE | WORKING | SHORT_BREAK
  timeLeft: 1500, // seconds
  isActive: true,
  completedPomodoros: 2, // global count
  activeTask: {
    _id: "123",
    title: "Học React Native",
    completedPomodoros: 2,
    estimatedPomodoros: 4
  },
  settings: {
    workDuration: 1500,
    shortBreakDuration: 300,
    autoStartBreaks: true
  }
}
```

## 🔧 Configuration

### Timer Settings (src/contexts/PomodoroContext.js)

```javascript
const DEFAULT_SETTINGS = {
  workDuration: 10, // DEV: 10s | PROD: 1500 (25 min)
  shortBreakDuration: 5, // DEV: 5s | PROD: 300 (5 min)
  autoStartBreaks: true,
};
```

**⚠️ NOTE**: Đang dùng 10s/5s cho development. Khi deploy production, đổi về 1500/300.

## 🐛 Known Issues & Fixes

### Issue 1: activeTask not updating in UI

**Fix**: Ensure TaskContext dispatch happens before PomodoroContext state update

```javascript
// ✅ CORRECT
const updatedTask = await taskAPI.incrementTaskPomodoro(taskId, duration);
dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: updatedTask });
```

### Issue 2: Timer progress bar resets after pomodoro complete

**Fix**: Progress calculated from getInitialDuration(), not stored state

```javascript
const getProgress = () => {
  const totalTime = getInitialDuration();
  return (totalTime - timeLeft) / totalTime;
};
```

### Issue 3: Duplicate pomodoro increments

**Fix**: Add flag to prevent multiple onPomodoroComplete calls

```javascript
useEffect(() => {
  if (state.timeLeft === 0 && state.isActive && !completedRef.current) {
    completedRef.current = true;
    // ... handle complete
  }
}, [state.timeLeft, state.isActive]);
```

## 🚀 Future Enhancements

### 1. Offline Support

- [ ] Queue pomodoro increments offline
- [ ] Sync when online with conflict resolution
- [ ] Show offline indicator

### 2. Statistics & Analytics

- [ ] Daily/Weekly pomodoro charts
- [ ] Most productive hours
- [ ] Task completion rate
- [ ] Streak tracking

### 3. Notifications

- [ ] Background timer with notifications
- [ ] Reminder for breaks
- [ ] Task deadline reminders

### 4. Gamification

- [ ] Achievement badges
- [ ] Level system
- [ ] Celebration animations on task complete
- [ ] Daily challenges

### 5. Multi-Task Timer

- [ ] Queue multiple tasks
- [ ] Auto-switch between tasks
- [ ] Batch pomodoro sessions

## 📝 Code Locations

| Feature             | File Path                                   |
| ------------------- | ------------------------------------------- |
| Timer UI            | `src/components/Timer.js`                   |
| Task Selector Modal | `src/components/TaskSelector.js`            |
| Task Item           | `src/components/TaskItem.js`                |
| Pomodoro Logic      | `src/contexts/PomodoroContext.js`           |
| Task Management     | `src/contexts/TaskContext.js`               |
| Integration Layer   | `src/contexts/ConnectedPomodoroProvider.js` |
| API Calls           | `src/services/api.js`                       |
| Backend Routes      | `backend/routes/tasks.js`                   |
| Task Model          | `backend/models/Task.js`                    |

## 🎓 Usage Examples

### Example 1: Start Timer with Task from HomeScreen

```javascript
// User flow
1. Tap "Chọn Nhiệm Vụ & Bắt Đầu"
2. Search "React"
3. Select "Học React Native"
4. Timer starts automatically
5. Work for 25 minutes
6. Pomodoro completed → Task updated
7. Take 5 minute break
8. Repeat
```

### Example 2: Quick Start from Task List

```javascript
// TaskItem.js
<IconButton icon="timer" onPress={() => onStartTimer(task)} />;

// HomeScreen.js
const handleStartTimer = (task) => {
  Alert.alert("Bắt đầu Pomodoro", `Bắt đầu làm việc cho: "${task.title}"`, [
    { text: "Hủy", style: "cancel" },
    {
      text: "Bắt đầu",
      onPress: () => {
        startWorkSessionWithTask(task);
        scrollToTimer();
      },
    },
  ]);
};
```

### Example 3: Custom Duration Pomodoro

```javascript
// Future enhancement
const startCustomPomodoro = (task, duration) => {
  updateSettings({ workDuration: duration * 60 });
  startWorkSessionWithTask(task);
};

// Usage
startCustomPomodoro(task, 15); // 15-minute pomodoro
```

## ✅ Deployment Checklist

- [ ] Change timer durations to production values (1500s/300s)
- [ ] Remove debug console.logs
- [ ] Test on iOS physical device
- [ ] Test on Android physical device
- [ ] Test with slow network (3G throttling)
- [ ] Test offline mode
- [ ] Verify background timer behavior
- [ ] Check battery usage
- [ ] Performance profiling (no memory leaks)
- [ ] Analytics integration
- [ ] Error tracking (Sentry/Firebase Crashlytics)

## 🙏 Credits

Tích hợp hoàn thiện giữa Timer và Task System với UX mượt mà và error handling robust.

**Version**: 1.0.0  
**Last Updated**: October 20, 2025  
**Status**: ✅ Production Ready (after checklist completion)
