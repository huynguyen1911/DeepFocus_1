# TaskItem - Long Press & Swipe Implementation

## Date: October 8, 2025

## Overview

Thay thế menu 3 chấm bằng **Long Press** (hiển thị action sheet) và **Swipe Actions** để cải thiện UX và trải nghiệm tương tác.

---

## ✨ New Features

### 1. **Swipe Actions**

#### Swipe Left → View Details

- **Icon**: 👁️ Eye icon
- **Color**: Blue (#2196F3)
- **Action**: Navigate to TaskDetailsScreen
- **Width**: 100px

#### Swipe Right → Delete

- **Icon**: 🗑️ Delete icon
- **Color**: Red (#FF5252)
- **Action**: Show confirmation dialog, then delete
- **Width**: 100px

**Properties**:

- Smooth friction (friction={2})
- No overshoot (prevents over-swiping)
- Rounded corners matching card style
- Clear visual feedback with icons + text

---

### 2. **Long Press Action Sheet**

#### Trigger

- **Action**: Long press on task card
- **Duration**: Default React Native long press (500ms)

#### Modal Style

- **Type**: Bottom Sheet Modal
- **Background**: Semi-transparent overlay (rgba(0,0,0,0.5))
- **Position**: Bottom of screen
- **Animation**: Slide up from bottom

#### Available Actions

**1. Xem chi tiết (View Details)** 👁️

- Icon: eye
- Action: Navigate to TaskDetailsScreen
- Always visible

**2. Bắt đầu timer (Start Timer)** ⏱️

- Icon: timer
- Action: Start Pomodoro timer for task
- **Conditional**: Only visible for incomplete tasks
- Uses onStartTimer prop

**3. Xóa nhiệm vụ (Delete)** 🗑️

- Icon: delete
- Color: Red (#FF5252)
- Action: Show confirmation dialog
- Always visible

**4. Đóng (Close)** ✖️

- Primary button
- Action: Dismiss modal
- Always visible at bottom

---

## 🎨 Visual Design

### Swipe Actions Layout

```
Left Swipe (View Details):
┌──────────────────────┐
│   [Card Content]     │ →  │ 👁️ Chi tiết │
└──────────────────────┘    └──────────────┘
        (Blue, 100px)

Right Swipe (Delete):
┌──────────────────────┐
│ 🗑️ Xóa │  ←  │   [Card Content]     │
└────────┘      └──────────────────────┘
(Red, 100px)
```

### Action Sheet Layout

```
┌─────────────────────────────────┐
│                                 │
│  📱 Screen (Semi-transparent)   │
│                                 │
│     ┌───────────────────────┐  │
│     │  Task Title           │  │
│     ├───────────────────────┤  │
│     │  👁️  Xem chi tiết     │  │
│     │  ⏱️  Bắt đầu timer    │  │ ← Only incomplete
│     │  🗑️  Xóa nhiệm vụ     │  │
│     ├───────────────────────┤  │
│     │     [Đóng]           │  │
│     └───────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

## 🔄 User Interaction Flow

### Scenario 1: Quick View Details

```
User swipes task left
    ↓
Blue "Chi tiết" action appears
    ↓
User releases (action triggers)
    ↓
Navigate to TaskDetailsScreen
```

### Scenario 2: Quick Delete

```
User swipes task right
    ↓
Red "Xóa" action appears
    ↓
User releases (action triggers)
    ↓
Confirmation dialog appears
    ↓
User confirms
    ↓
Task deleted
```

### Scenario 3: Long Press Menu

```
User long presses task (500ms)
    ↓
Action sheet slides up from bottom
    ↓
User sees all available options:
  - Xem chi tiết
  - Bắt đầu timer (if incomplete)
  - Xóa nhiệm vụ
    ↓
User taps desired action
    ↓
Action executes & modal closes
```

### Scenario 4: Tap Card (unchanged)

```
User taps task card
    ↓
onPress callback executes
    ↓
Navigate to TaskDetailsScreen
(HomeScreen sets this)
```

---

## 💻 Technical Implementation

### Dependencies Added

```javascript
import { Swipeable } from "react-native-gesture-handler";
import { Portal, Modal, Button, Divider } from "react-native-paper";
```

### State Management

```javascript
const [modalVisible, setModalVisible] = useState(false);
```

### Key Functions

**1. handleLongPress()**

- Opens action sheet modal
- Triggered by onLongPress prop on Card

**2. handleViewDetails()**

- Closes modal
- Navigates to /task-details/[id]

**3. handleStartTimer()**

- Closes modal
- Calls onStartTimer prop with task

**4. handleDelete()**

- Closes modal
- Shows Alert confirmation
- Deletes task if confirmed

**5. renderRightActions()**

- Returns JSX for delete swipe action
- Red background, delete icon + text

**6. renderLeftActions()**

- Returns JSX for view details swipe action
- Blue background, eye icon + text

---

## 🎯 Component Structure

```jsx
<>
  <Swipeable
    renderRightActions={renderRightActions} // Delete
    renderLeftActions={renderLeftActions} // View Details
    overshootRight={false}
    overshootLeft={false}
    friction={2}
  >
    <Card
      onPress={onPress} // Tap to view
      onLongPress={handleLongPress} // Long press for menu
    >
      {/* Card Content */}
    </Card>
  </Swipeable>

  <Portal>
    <Modal visible={modalVisible} onDismiss={closeModal}>
      <Card style={actionSheet}>
        {/* Action Buttons */}
        <Button icon="eye" onPress={handleViewDetails}>
          Xem chi tiết
        </Button>
        {!task.isCompleted && (
          <Button icon="timer" onPress={handleStartTimer}>
            Bắt đầu timer
          </Button>
        )}
        <Button icon="delete" onPress={handleDelete}>
          Xóa nhiệm vụ
        </Button>
        <Button onPress={closeModal}>Đóng</Button>
      </Card>
    </Modal>
  </Portal>
</>
```

---

## 📊 Comparison: Before vs After

### Before (Menu 3 Chấm)

```
Interaction Methods:
1. Tap card → View details
2. Tap menu (⋮) → Show dropdown
   - Select "Xem chi tiết"
   - Select "Bắt đầu timer"
   - Select "Xóa"

Steps to delete: 3 steps
Steps to view: 2 steps
Steps to start timer: 3 steps
Visual clutter: Menu button always visible
```

### After (Long Press + Swipe)

```
Interaction Methods:
1. Tap card → View details (unchanged)
2. Swipe left → View details
3. Swipe right → Delete
4. Long press → Show action sheet
   - Select "Xem chi tiết"
   - Select "Bắt đầu timer"
   - Select "Xóa"

Steps to delete: 1-2 steps (swipe or long press)
Steps to view: 1-2 steps (tap or swipe)
Steps to start timer: 2 steps (long press + select)
Visual clutter: None (gestures are hidden)
```

---

## ✅ Advantages

### User Experience

1. **Faster Actions**:

   - Swipe to delete: 1 gesture
   - Swipe to view: 1 gesture
   - No need to aim for small menu button

2. **Cleaner UI**:

   - No menu button cluttering interface
   - More space for task content
   - Modern, minimal design

3. **Discoverability**:

   - Long press is intuitive (common pattern)
   - Swipe actions revealed on gesture
   - Action sheet clearly shows all options

4. **Flexibility**:
   - Multiple ways to access same function
   - Choose fastest method for context
   - Power users can use swipes
   - Casual users can use long press

### Developer Benefits

1. **Consistent Patterns**: Using platform-standard gestures
2. **Better State Management**: Modal state clearer than menu
3. **Easier Customization**: Action sheet easier to style
4. **Performance**: No menu positioning calculations

---

## 🔧 Customization Options

### Swipe Actions

- **Colors**: Easily changed in styles
- **Icons**: Configurable in renderActions
- **Width**: Adjustable (currently 100px)
- **Additional Actions**: Can add more swipe directions

### Action Sheet

- **Position**: Can change to center modal
- **Animation**: Can customize Modal animation
- **Actions**: Easy to add/remove buttons
- **Styling**: Fully customizable via styles

---

## 🧪 Testing Checklist

### Swipe Gestures

- [ ] Swipe left reveals blue "Chi tiết" action
- [ ] Swipe right reveals red "Xóa" action
- [ ] Releasing swipe triggers action
- [ ] Swiping back cancels action
- [ ] No overshoot beyond action width
- [ ] Smooth friction feels natural

### Long Press

- [ ] Long press (500ms) opens action sheet
- [ ] Action sheet slides up from bottom
- [ ] Backdrop is semi-transparent
- [ ] Tapping backdrop closes modal
- [ ] All actions visible in modal
- [ ] "Bắt đầu timer" hidden for completed tasks

### Actions

- [ ] "Xem chi tiết" navigates correctly
- [ ] "Bắt đầu timer" calls onStartTimer
- [ ] "Xóa" shows confirmation dialog
- [ ] Confirming delete removes task
- [ ] "Đóng" button dismisses modal
- [ ] Modal closes after action

### Integration

- [ ] Tap card still works (onPress)
- [ ] Checkbox still works
- [ ] Swipe doesn't interfere with tap
- [ ] Long press doesn't interfere with tap
- [ ] Multiple TaskItems work independently

---

## 📱 Platform Considerations

### iOS

- Long press duration: ~500ms (default)
- Swipe feels natural with friction={2}
- Modal animation: Native slide-up

### Android

- Long press duration: ~500ms (default)
- Swipe might need friction adjustment
- Modal animation: Fade in + slide

### Best Practices

- Test on both platforms
- Adjust friction if needed
- Ensure swipe threshold is comfortable
- Modal should be easy to dismiss

---

## 🚀 Future Enhancements

### Potential Additions

1. **Haptic Feedback**: Vibrate on long press start
2. **Swipe Hints**: Show partial swipe on first use
3. **More Swipe Actions**:
   - Swipe up for "Mark Complete"
   - Swipe down for "Archive"
4. **Customizable Swipes**: User can configure actions
5. **Animation Polish**:
   - Spring animations for swipe
   - Stagger action sheet items
6. **Contextual Actions**: Different actions based on task state

### Performance Optimization

1. **Memoization**: Memoize render functions
2. **Lazy Loading**: Load Modal only when needed
3. **Animation Config**: Fine-tune for 60fps

---

## 📝 Migration Notes

### Breaking Changes

- ❌ Removed: Menu button (dots-vertical icon)
- ❌ Removed: Menu.Item components
- ❌ Removed: menuVisible state
- ❌ Removed: toggleMenu, closeMenu functions
- ❌ Removed: Menu-related styles (menuButtonContainer, menuBackdrop, etc.)

### Added Features

- ✅ Added: Swipeable wrapper
- ✅ Added: Portal with Modal
- ✅ Added: renderLeftActions, renderRightActions
- ✅ Added: handleLongPress, openModal, closeModal
- ✅ Added: Swipe action styles
- ✅ Added: Action sheet styles

### Migration Steps for Developers

1. Update TaskItem import if using elsewhere
2. Ensure GestureHandlerRootView is in \_layout
3. Test on both iOS and Android
4. Adjust swipe friction if needed
5. Customize colors to match theme

---

## 🎨 Style Variables

### Colors

```javascript
// Swipe Actions
deleteAction: "#FF5252" (Red)
viewAction: "#2196F3" (Blue)

// Modal
modalBackdrop: "rgba(0, 0, 0, 0.5)"
actionSheet: White with elevation

// Delete Button (in action sheet)
deleteButtonLabel: "#FF5252" (Red)
```

### Dimensions

```javascript
swipeActionWidth: 100px
actionSheetPadding: 20px
actionSheetBorderRadius: 16px
modalBottomMargin: 20px
```

---

## 🏆 Success Metrics

### Expected Improvements

1. **Speed**:

   - Delete task: 50% faster (1 swipe vs 2 taps)
   - View details: Same speed (tap or swipe)

2. **Satisfaction**:

   - Cleaner UI without menu button
   - Modern gesture-based interaction
   - Multiple ways to achieve same goal

3. **Discoverability**:

   - Long press is standard pattern
   - Swipe actions revealed naturally
   - Clear labels on all actions

4. **Accessibility**:
   - Long press works with assistive touch
   - Large touch targets in action sheet
   - Clear visual feedback

---

## ✨ Conclusion

The new Long Press + Swipe implementation provides:

- ✅ **Faster interactions** via swipe gestures
- ✅ **Cleaner UI** without menu button
- ✅ **Better UX** with multiple interaction methods
- ✅ **Modern design** following platform conventions
- ✅ **Flexible** - users choose preferred method
- ✅ **Maintainable** - cleaner code structure

**Status**: ✅ READY FOR TESTING
