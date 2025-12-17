# TaskDetailsScreen - Visual Layout Guide

## Screen Structure

```
┌─────────────────────────────────────────┐
│  ← Back         Task Details            │ ← Header (Navigation)
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  🟢 Hoàn thành    🔴 Cao         │ │ ← Status & Priority Chips
│  ├───────────────────────────────────┤ │
│  │                                   │ │
│  │          ┌─────────┐             │ │
│  │          │   85%   │             │ │ ← Circular Progress
│  │          │Hoàn thành│            │ │
│  │          └─────────┘             │ │
│  │      ━━━━━━━━━━━━━━━━━          │ │ ← Progress Bar
│  │                                   │ │
│  │     4              │        5     │ │
│  │  Đã hoàn thành     │    Dự kiến  │ │ ← Pomodoro Stats
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  📝 Thông tin cơ bản              │ │
│  ├───────────────────────────────────┤ │
│  │  Tiêu đề *                        │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ Học React Native            │ │ │ ← Editable Title
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  Mô tả                            │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ Hoàn thành khóa học         │ │ │
│  │  │ về React Native và          │ │ │ ← Editable Description
│  │  │ xây dựng ứng dụng...        │ │ │   (Multiline)
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  Số Pomodoro dự kiến *            │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ 5                           │ │ │ ← Editable Number
│  │  └─────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  ⚙️ Cài đặt                       │ │
│  ├───────────────────────────────────┤ │
│  │  Độ ưu tiên                       │ │
│  │  ┌─────┐ ┌──────────┐ ┌─────┐   │ │
│  │  │Thấp │ │Trung bình│ │ Cao │   │ │ ← Priority Buttons
│  │  └─────┘ └──────────┘ └─────┘   │ │   (Color-coded)
│  │                                   │ │
│  │  Ngày hết hạn                     │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ 📅  08/10/2025              │ │ │ ← Date Picker Button
│  │  └─────────────────────────────┘ │ │
│  │  [Xóa ngày hết hạn]              │ │ ← Clear Date Button
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  📊 Thông tin chi tiết            │ │
│  ├───────────────────────────────────┤ │
│  │  Ngày tạo:        05/10/2025 14:30│ │ ← Created At (Readonly)
│  │  ────────────────────────────────  │ │
│  │  Trạng thái:      🟢 Hoàn thành   │ │ ← Status Chip
│  │  ────────────────────────────────  │ │
│  │  Tiến độ Pomodoro:         4 / 5  │ │ ← Progress Ratio
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ │ ← Progress Bar
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  🎯 Hành động                     │ │
│  ├───────────────────────────────────┤ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ ✅ Đánh dấu hoàn thành      │ │ │ ← Toggle Complete
│  │  └─────────────────────────────┘ │ │   (Green/Orange)
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ 💾 Lưu thay đổi             │ │ │ ← Save Button
│  │  └─────────────────────────────┘ │ │   (Disabled if no changes)
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ 🗑️  Xóa nhiệm vụ            │ │ │ ← Delete Button
│  │  └─────────────────────────────┘ │ │   (Red outline)
│  │                                   │ │
│  │  [← Quay lại]                    │ │ ← Cancel/Back
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## Color Coding

### Priority Colors

- **🟢 Low (Thấp)**: #388E3C (Green)
- **🟠 Medium (Trung bình)**: #F57C00 (Orange)
- **🔴 High (Cao)**: #D32F2F (Red)

### Status Colors

- **Completed**:
  - Background: #E8F5E9 (Light Green)
  - Text: #2E7D32 (Dark Green)
- **In Progress**:
  - Background: #FFF3E0 (Light Orange)
  - Text: #E65100 (Dark Orange)

### Action Button Colors

- **Complete**: #4CAF50 (Green)
- **Incomplete**: #F57C00 (Orange)
- **Save**: Primary theme color
- **Delete**: #D32F2F (Red)

## Card Sections

### 1. Header Card (Status & Progress)

- **Purpose**: Quick visual overview of task status
- **Components**:
  - Status badge (Completed/In Progress)
  - Priority badge (Low/Medium/High)
  - Circular progress indicator (0-100%)
  - Progress bar visualization
  - Pomodoro statistics (completed vs estimated)

### 2. Basic Info Card

- **Purpose**: Core task information
- **Components**:
  - Title input (required, max 1 line in view)
  - Description input (optional, multiline)
  - Estimated Pomodoros input (required, number)
- **Validation**: Real-time error messages

### 3. Settings Card

- **Purpose**: Task configuration
- **Components**:
  - Priority selector (3 buttons)
  - Due date picker (calendar)
  - Clear date option (if date set)

### 4. Metadata Card

- **Purpose**: Read-only information
- **Components**:
  - Created at timestamp
  - Status chip (readonly)
  - Progress ratio (X/Y pomodoros)
  - Progress bar visualization

### 5. Actions Card

- **Purpose**: Task operations
- **Components**:
  - Toggle complete button (context-aware text)
  - Save changes button (disabled when no changes)
  - Delete task button (with confirmation)
  - Back/cancel button (warns if unsaved changes)

## Interaction States

### Loading States

```
Initial Load:
┌─────────────────┐
│                 │
│   ⏳ Loading    │
│ Đang tải dữ liệu│
│                 │
└─────────────────┘

Action Loading:
┌───────────────────────┐
│ ⏳ Đánh dấu hoàn thành│ ← Button with spinner
└───────────────────────┘
```

### Error States

```
Task Not Found:
┌─────────────────────┐
│                     │
│ ❌ Không tìm thấy  │
│    nhiệm vụ        │
│                     │
│  [Quay lại]        │
└─────────────────────┘

Validation Error:
┌──────────────────────┐
│ Tiêu đề *            │
│ [________________]   │
│ ❌ Tiêu đề là bắt buộc│ ← Error message
└──────────────────────┘
```

### Success States

```
Snackbar Notification:
┌─────────────────────────────┐
│ ✅ Đã lưu thay đổi thành công│ [Đóng]
└─────────────────────────────┘
```

## Responsive Behavior

### Keyboard Handling

- KeyboardAvoidingView wraps entire screen
- Inputs scroll into view when focused
- Date picker dismisses keyboard automatically
- "Done" button on numeric keyboard

### ScrollView

- Entire screen scrollable
- Cards stack vertically
- Consistent 16px padding
- Bottom padding (32px) for last card

### Touch Targets

- All buttons minimum 44px height
- Input fields minimum 56px height
- Adequate spacing between elements
- Menu items minimum 48px height

## Accessibility

### Labels

- All inputs have descriptive labels
- Required fields marked with \*
- Icon buttons have accessible names
- Error messages clearly linked to fields

### Visual Hierarchy

- Section titles use emoji + text
- Cards have subtle elevation
- Important actions use primary colors
- Destructive actions use red

### Feedback

- Loading states visible
- Success/error messages clear
- Progress indicators animated
- Button states (pressed/disabled) evident

## Animation Opportunities

### Potential Animations

1. Card entrance: Slide up + fade in
2. Progress circle: Animated fill on load
3. Status change: Color transition
4. Save success: Checkmark animation
5. Delete: Slide out animation
6. Toggle complete: Flip/rotate icon

### Micro-interactions

1. Button press: Scale down slightly
2. Input focus: Border highlight
3. Chip selection: Ripple effect
4. Menu open: Slide down
5. Snackbar: Slide up from bottom
