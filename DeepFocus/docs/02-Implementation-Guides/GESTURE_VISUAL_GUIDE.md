# TaskItem Gesture Guide - Visual Reference

## 🎯 Quick Reference

### Gesture Map

```
TaskItem Card
    │
    ├─ TAP → View Details (TaskDetailsScreen)
    │
    ├─ SWIPE LEFT → 👁️ View Details (Blue)
    │
    ├─ SWIPE RIGHT → 🗑️ Delete (Red, with confirmation)
    │
    └─ LONG PRESS (500ms) → Action Sheet Modal
         ├─ 👁️ Xem chi tiết
         ├─ ⏱️ Bắt đầu timer (incomplete only)
         ├─ 🗑️ Xóa nhiệm vụ
         └─ ✖️ Đóng
```

---

## 📱 Visual Demonstrations

### 1. Swipe Left (View Details)

**Before Swipe:**

```
┌────────────────────────────────────────┐
│ ☐ Learn React Native                  │
│   Complete tutorial series            │
│   🍅 2/5 Pomodoros         40%        │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│   🟠 Trung bình  📅 10/10/2025        │
└────────────────────────────────────────┘
```

**During Swipe Left:**

```
         ┌────────────────────────────┐
         │ ☐ Learn React Native      │  ←  │ 👁️      │
         │   Complete tutorial...    │     │ Chi tiết │
         │   🍅 2/5 Pomodoros  40%  │     └──────────┘
         └────────────────────────────┘       Blue
                                            (100px)
```

**Action:** Navigate to TaskDetailsScreen

---

### 2. Swipe Right (Delete)

**Before Swipe:**

```
┌────────────────────────────────────────┐
│ ☐ Learn React Native                  │
│   Complete tutorial series            │
│   🍅 2/5 Pomodoros         40%        │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│   🟠 Trung bình  📅 10/10/2025        │
└────────────────────────────────────────┘
```

**During Swipe Right:**

```
  ┌──────────┐  ┌────────────────────────────┐
  │    🗑️    │  │ ☐ Learn React Native      │  →
  │    Xóa   │  │   Complete tutorial...    │
  └──────────┘  │   🍅 2/5 Pomodoros  40%  │
     Red        └────────────────────────────┘
   (100px)
```

**Action:** Show confirmation dialog → Delete if confirmed

---

### 3. Long Press Action Sheet

**Step 1: User Long Presses Card (500ms)**

```
┌────────────────────────────────────────┐
│ ☐ Learn React Native                  │ ← Long Press
│   Complete tutorial series            │
│   🍅 2/5 Pomodoros         40%        │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━        │
└────────────────────────────────────────┘
```

**Step 2: Action Sheet Slides Up**

```
┌────────────────────────────────────────┐
│                                        │
│  📱 Screen Content (Dimmed)           │
│                                        │
│  ╔══════════════════════════════════╗ │
│  ║  Learn React Native              ║ │ ← Task title
│  ╠══════════════════════════════════╣ │
│  ║                                  ║ │
│  ║  👁️  Xem chi tiết                ║ │
│  ║                                  ║ │
│  ║  ⏱️  Bắt đầu timer               ║ │
│  ║                                  ║ │
│  ║  🗑️  Xóa nhiệm vụ                ║ │
│  ║                                  ║ │
│  ╠══════════════════════════════════╣ │
│  ║                                  ║ │
│  ║      [     Đóng     ]           ║ │
│  ║                                  ║ │
│  ╚══════════════════════════════════╝ │
│                                        │
└────────────────────────────────────────┘
```

**Step 3: User Selects Action**

- Tap "Xem chi tiết" → Navigate to details
- Tap "Bắt đầu timer" → Start Pomodoro
- Tap "Xóa nhiệm vụ" → Show confirmation
- Tap "Đóng" → Close modal
- Tap backdrop (dimmed area) → Close modal

---

## 🎨 Color Coding

### Swipe Actions

```
View Details (Left Swipe)
┌──────────────┐
│ Background:  │  #2196F3 (Material Blue)
│ Icon: eye    │  White
│ Text: White  │  "Chi tiết"
└──────────────┘

Delete (Right Swipe)
┌──────────────┐
│ Background:  │  #FF5252 (Material Red)
│ Icon: delete │  White
│ Text: White  │  "Xóa"
└──────────────┘
```

### Action Sheet

```
┌─────────────────────────┐
│ Background: White       │
│ Border Radius: 16px     │
│ Elevation: 4            │
│                         │
│ Title: Bold, Center     │
│ Dividers: Light Gray    │
│                         │
│ Actions:                │
│  - Normal: Default text │
│  - Delete: Red (#FF5252)│
│                         │
│ Close Button: Primary   │
└─────────────────────────┘
```

---

## 📏 Dimensions & Spacing

### Swipe Actions

```
┌───────────────────────────────────────┐
│                                       │
│  Task Card Content                   │
│  (Full width when not swiped)        │
│                                       │
└───────────────────────────────────────┘
        ↓ Swipe Left/Right
┌──────┐┌───────────────────────┐
│ 100px││  Card (compressed)    │
│Action││                       │
└──────┘└───────────────────────┘
```

**Measurements:**

- Swipe action width: 100px
- Icon size: 24px
- Text size: 12px
- Border radius: 8px (matches card)

### Action Sheet

```
┌─────────────────────────────────────┐
│                                     │
│  Padding: 20px                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Card Padding: 16px (vertical) │ │
│  │                               │ │
│  │ Title: 16px font              │ │
│  │ Padding: 12px vertical        │ │
│  │                               │ │
│  │ ─────────── 8px margin        │ │
│  │                               │ │
│  │ Button Height: 48px           │ │
│  │ Button Padding: 4px vertical  │ │
│  │                               │ │
│  │ ─────────── 8px margin        │ │
│  │                               │ │
│  │ Close Button: 48px height     │ │
│  │ Margin Top: 8px               │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  Bottom Margin: 20px               │
│                                     │
└─────────────────────────────────────┘
```

---

## ⚡ Animation Flow

### Swipe Animation

```
State 1: Rest
┌────────────────┐
│ Task Card      │
└────────────────┘

State 2: Swiping (20px)
┌──┐┌────────────┐
│  ││ Task Card  │
└──┘└────────────┘

State 3: Swiping (50px)
┌─────┐┌─────────┐
│     ││ Task    │
│ Act ││ Card    │
└─────┘└─────────┘

State 4: Action Revealed (100px)
┌──────────┐┌────┐
│ 👁️       ││Task│
│ Chi tiết ││    │
└──────────┘└────┘

State 5: Release → Action Triggers
```

**Properties:**

- Friction: 2 (smooth, not too fast)
- Overshoot: false (stops at action width)
- Spring back if released before threshold

### Modal Animation

```
State 1: Hidden
┌─────────────────────┐
│                     │
│  Normal Screen      │
│                     │
│                     │
└─────────────────────┘

State 2: Backdrop Fades In (200ms)
┌─────────────────────┐
│                     │
│  Dimmed Screen      │
│  (50% opacity)      │
│                     │
└─────────────────────┘

State 3: Sheet Slides Up (300ms)
┌─────────────────────┐
│  Dimmed Screen      │
│                     │
│  ┌───────────────┐  │
│  │ Action Sheet  │  │ ↑
│  └───────────────┘  │
└─────────────────────┘

State 4: Fully Visible
┌─────────────────────┐
│  Dimmed Screen      │
│                     │
│  ┌───────────────┐  │
│  │ Action Sheet  │  │
│  │ (All actions) │  │
│  └───────────────┘  │
└─────────────────────┘
```

---

## 🎯 Touch Target Sizes

### Minimum Sizes (Accessibility)

```
Checkbox: 44x44 px
├─ Icon: 24x24 px
└─ Touchable: 44x44 px

Swipe Action: 100px wide
├─ Icon: 24x24 px
├─ Text: 12px font
└─ Full height of card

Action Button: 48px height
├─ Icon: 24x24 px
├─ Text: 16px font
└─ Full width of card

Close Button: 48px height
└─ Full width of card
```

---

## 🔄 Interaction States

### Card States

```
1. Default
   ┌────────────────┐
   │ Normal Card    │
   └────────────────┘
   Background: White
   Elevation: 2

2. Pressed (Tap)
   ┌────────────────┐
   │ Pressed Card   │
   └────────────────┘
   Background: Light Gray
   Scale: 0.98

3. Long Pressing
   ┌────────────────┐
   │ Pressed Card   │ ... (500ms)
   └────────────────┘
   Background: Light Gray
   Haptic: Vibrate (optional)

4. Swiping
   ┌──┐┌──────────┐
   │  ││ Moving   │ →
   └──┘└──────────┘
   Following finger

5. Completed Task
   ┌────────────────┐
   │ Grayed Card    │
   └────────────────┘
   Opacity: 0.7
   Background: #F5F5F5
```

---

## 📱 Platform-Specific Behavior

### iOS

```
Long Press:
- Duration: ~500ms
- Haptic: Light impact (optional)
- Cursor: No change

Swipe:
- Friction: Feels natural
- Bounce: Subtle
- Release: Smooth spring back

Modal:
- Animation: Native slide-up
- Backdrop: Blur (optional)
- Dismiss: Swipe down or tap backdrop
```

### Android

```
Long Press:
- Duration: ~500ms
- Haptic: Default vibration (optional)
- Visual: Ripple effect

Swipe:
- Friction: Same as iOS
- Bounce: Matches material design
- Release: Spring back

Modal:
- Animation: Fade + slide
- Backdrop: Dim (50% opacity)
- Dismiss: Tap backdrop or back button
```

---

## 🎮 Gesture Conflicts Resolution

### Tap vs Long Press

```
Time: 0ms ───────────── 500ms
       │                 │
Tap:   │ Press → Release │
       │  (< 500ms)      │
       └─ Trigger: onPress

Long:  │ Press ─────────── Hold
       │                   │
       └─ Trigger: onLongPress (at 500ms)
```

### Tap vs Swipe

```
Distance: 0px ────────── 10px ────────── 100px
          │              │                │
Tap:      │ Press ─ Release              │
          │  (< 10px movement)           │
          └─ Trigger: onPress

Swipe:    │ Press ───── Move ─────────── │
          │             (> 10px)          │
          └─ Trigger: Swipe gesture
```

### Priority Order

1. **Swipe** - If horizontal movement > 10px
2. **Long Press** - If held > 500ms without movement
3. **Tap** - If released < 500ms with movement < 10px

---

## ✨ Visual Feedback Summary

### Immediate Feedback

- **Tap**: Background color change
- **Swipe**: Action reveals progressively
- **Long Press**: Background color + haptic (optional)

### Confirmation Feedback

- **View Details**: Navigation animation
- **Delete**: Alert dialog → Deletion → Snackbar
- **Start Timer**: Timer starts → Snackbar (optional)

### Error Feedback

- **Failed Action**: Alert with error message
- **No Internet**: Snackbar with retry option

---

## 🎯 User Learning Curve

### Discovery Path

```
New User:
1. Sees task card
2. Taps → Views details ✓
3. Discovers long press (by accident or curiosity)
4. Sees action sheet with options ✓
5. Might discover swipe by accident
6. Learns swipe is shortcut ✓

Power User:
1. Uses swipe for quick delete
2. Uses swipe for quick view
3. Uses tap for normal view
4. Uses long press for timer (rare action)
```

### Discoverability Tips (Optional)

1. **First Use Hint**: Show subtle swipe indicator
2. **Tooltip**: "Try swiping or long pressing"
3. **Onboarding**: Brief gesture tutorial
4. **Help Button**: Gesture guide in settings

---

## 🏆 Best Practices

### Do ✅

- Keep swipe actions simple (max 2)
- Use contrasting colors for actions
- Provide clear icons and text
- Make touch targets 44x44px minimum
- Test on both platforms
- Ensure smooth animations (60fps)

### Don't ❌

- Don't add too many swipe directions
- Don't make swipe threshold too small
- Don't hide critical actions behind gestures only
- Don't forget fallback for action sheet
- Don't make modal hard to dismiss
- Don't use conflicting gestures

---

## 📊 Accessibility

### Screen Reader Support

```
Card: "Task: Learn React Native, 2 of 5 pomodoros complete, medium priority, due October 10"
Swipe Left: "View details"
Swipe Right: "Delete task"
Long Press: "Show actions"
Action Buttons: Proper labels with icons
```

### Alternative Access

- All gestures have action sheet alternative
- Action sheet usable with assistive touch
- Large touch targets (48px minimum)
- High contrast colors
- Clear labels on all actions

---

This visual guide should help anyone understand and implement the gesture system! 🎉
