# 🧪 Hướng Dẫn Test Hệ Thống Pomodoro

## ✅ Checklist Hoàn Chỉnh

### **Test 1: Short Break Flow** ☕

**Mục tiêu:** Kiểm tra chu kỳ nghỉ ngắn sau 1 pomodoro

1. ✅ Bắt đầu một work session (25 phút hoặc 10s test mode)
2. ✅ Để timer chạy hết thời gian
3. ✅ **Xác minh:** Modal xuất hiện với:
   - Icon 🎉
   - Text "Xuất sắc! Bạn đã hoàn thành 1 Pomodoro!"
   - Thống kê "Tổng cộng: 1 🍅 hôm nay"
   - "Đã đến lúc nghỉ ngắn (5 phút)" với icon ☕
4. ✅ Nhấn "Bắt Đầu Nghỉ"
5. ✅ **Xác minh:**
   - Timer chuyển sang 05:00 (hoặc 5s test mode)
   - Màu xanh lá (#66BB6A)
   - Label "Nghỉ Ngắn"
6. ✅ Để countdown hoàn thành
7. ✅ **Xác minh:**
   - Timer về IDLE state
   - Task được preserve (nếu có)
   - Có thể tiếp tục work session mới

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 2: Long Break Flow** 🌟

**Mục tiêu:** Kiểm tra chu kỳ nghỉ dài sau 4 pomodoros

1. ✅ Hoàn thành pomodoro #1 → Nghỉ ngắn → Hoàn thành
2. ✅ Hoàn thành pomodoro #2 → Nghỉ ngắn → Hoàn thành
3. ✅ Hoàn thành pomodoro #3 → Nghỉ ngắn → Hoàn thành
4. ✅ Hoàn thành pomodoro #4
5. ✅ **Xác minh:** Modal hiển thị:
   - "Tổng cộng: 4 🍅 hôm nay"
   - "Đã đến lúc nghỉ dài (15 phút)" với icon 🌟
   - Random motivational quote
6. ✅ Nhấn "Bắt Đầu Nghỉ"
7. ✅ **Xác minh:**
   - Timer chuyển sang 15:00 (hoặc 10s test mode)
   - Màu xanh tím (#5C6BC0)
   - Label "Nghỉ Dài"
8. ✅ Hoàn thành break
9. ✅ **Xác minh:**
   - Timer về IDLE
   - completedPomodoros = 4 (hoặc reset về 0)
   - Có thể bắt đầu chu kỳ mới

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 3: Skip Break** ⏭️

**Mục tiêu:** Kiểm tra chức năng bỏ qua break

1. ✅ Hoàn thành 1 pomodoro
2. ✅ Modal xuất hiện
3. ✅ Nhấn "Bỏ Qua"
4. ✅ **Xác minh:**
   - Modal đóng ngay lập tức
   - Timer về IDLE state (00:00)
   - completedPomodoros vẫn tăng (1)
   - Có thể bắt đầu work session mới ngay lập tức
5. ✅ Bắt đầu work session mới
6. ✅ **Xác minh:** Counter hiển thị #2

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 4: Auto Start Breaks** 🚀

**Mục tiêu:** Kiểm tra tự động bắt đầu break

**4A. Khi BẬT Auto Start Breaks:**

1. ✅ Vào Settings → Bật "Tự động bắt đầu nghỉ"
2. ✅ Nhấn "Lưu Cài Đặt"
3. ✅ **Xác minh:** Snackbar "✅ Đã lưu cài đặt thành công!"
4. ✅ Quay về HomeScreen
5. ✅ Hoàn thành 1 pomodoro
6. ✅ **Xác minh:**
   - KHÔNG có modal xuất hiện
   - Timer tự động chuyển sang break (5:00)
   - Label "Nghỉ Ngắn" hiển thị
   - Timer đang chạy (countdown)

**4B. Khi TẮT Auto Start Breaks:**

1. ✅ Vào Settings → Tắt "Tự động bắt đầu nghỉ"
2. ✅ Lưu settings
3. ✅ Hoàn thành 1 pomodoro
4. ✅ **Xác minh:**
   - Modal xuất hiện
   - User phải chọn "Bắt Đầu Nghỉ" hoặc "Bỏ Qua"

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 5: Auto Start Pomodoros** 🔄

**Mục tiêu:** Kiểm tra tự động bắt đầu pomodoro sau break

**5A. Khi BẬT Auto Start Pomodoros:**

1. ✅ Vào Settings → Bật "Tự động bắt đầu pomodoro"
2. ✅ Lưu settings
3. ✅ Chọn một task
4. ✅ Hoàn thành pomodoro + break
5. ✅ **Xác minh:**
   - Sau khi break hoàn thành
   - Timer TỰ ĐỘNG bắt đầu work session mới
   - Task vẫn được giữ
   - Timer hiển thị 25:00 và đang chạy

**5B. Khi TẮT Auto Start Pomodoros:**

1. ✅ Tắt setting
2. ✅ Hoàn thành pomodoro + break
3. ✅ **Xác minh:**
   - Timer về IDLE
   - Task được preserve
   - Nút "Tiếp Tục Nhiệm Vụ" hiển thị

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 6: Settings Screen** ⚙️

**Mục tiêu:** Kiểm tra cài đặt và persistence

**6A. Thay đổi Duration Settings:**

1. ✅ Vào SettingsScreen
2. ✅ Đổi "Thời gian làm việc" → 15 phút
3. ✅ **Xác minh:** Label hiển thị "15 phút" màu đỏ
4. ✅ Đổi "Nghỉ ngắn" → 3 phút
5. ✅ **Xác minh:** Label hiển thị "3 phút" màu xanh lá
6. ✅ Đổi "Nghỉ dài" → 20 phút
7. ✅ **Xác minh:** Label hiển thị "20 phút" màu xanh tím
8. ✅ Nhấn "Lưu Cài Đặt"
9. ✅ **Xác minh:** Snackbar success
10. ✅ Quay về HomeScreen
11. ✅ Bắt đầu work session
12. ✅ **Xác minh:** Timer hiển thị 15:00 (không phải 25:00)

**6B. Thay đổi Pomodoros Until Long Break:**

1. ✅ Vào Settings
2. ✅ Đổi "Số Pomodoro trước khi nghỉ dài" → 3
3. ✅ **Xác minh:**
   - Label "3"
   - Help text "Sau 3 pomodoro sẽ có nghỉ dài"
4. ✅ Lưu và test
5. ✅ Hoàn thành 3 pomodoros
6. ✅ **Xác minh:** Modal hiển thị long break (không phải 4)

**6C. Reset Settings:**

1. ✅ Nhấn "Khôi Phục Mặc Định"
2. ✅ **Xác minh:**
   - Work: 25 phút
   - Short: 5 phút
   - Long: 15 phút
   - Pomodoros: 4
   - Auto Start Breaks: ON
   - Auto Start Pomodoros: OFF
3. ✅ Snackbar "🔄 Đã khôi phục cài đặt mặc định"

**6D. Settings Persistence:**

1. ✅ Thay đổi settings và lưu
2. ✅ Tắt app hoàn toàn
3. ✅ Mở lại app
4. ✅ Vào Settings
5. ✅ **Xác minh:** Settings vẫn giữ giá trị đã lưu

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 7: Pomodoro Count Logic** 🔢

**Mục tiêu:** Kiểm tra logic đếm và pattern nghỉ

**Pattern mặc định (4 pomodoros):**

```
Pomodoro #1 → Short Break (5 min)
Pomodoro #2 → Short Break (5 min)
Pomodoro #3 → Short Break (5 min)
Pomodoro #4 → Long Break (15 min)
[Chu kỳ lặp lại]
Pomodoro #5 → Short Break
Pomodoro #6 → Short Break
Pomodoro #7 → Short Break
Pomodoro #8 → Long Break
```

1. ✅ Hoàn thành 7 pomodoros liên tiếp
2. ✅ **Xác minh pattern:**
   - #1, #2, #3 → Short breaks
   - #4 → Long break
   - #5, #6, #7 → Short breaks
3. ✅ Hoàn thành pomodoro #8
4. ✅ **Xác minh:** Long break xuất hiện
5. ✅ **Xác minh:** Pattern lặp lại chính xác

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 8: Modal UI & UX** 🎨

**Mục tiêu:** Kiểm tra giao diện và trải nghiệm modal

1. ✅ Hoàn thành pomodoro
2. ✅ **Xác minh Modal Design:**
   - ✅ Icon 🎉 lớn và rõ ràng
   - ✅ Title "Xuất sắc!" màu primary
   - ✅ Subtitle rõ ràng
   - ✅ Stats container có background highlight
   - ✅ Số pomodoros hiển thị lớn + icon 🍅
   - ✅ Random quote hiển thị
   - ✅ Break info có background màu khác nhau (short/long)
   - ✅ Buttons có đủ spacing
   - ✅ Modal center screen
   - ✅ Overlay làm mờ background
3. ✅ Test short break modal
4. ✅ **Xác minh:**
   - Icon ☕
   - Background màu cam nhạt
   - "nghỉ ngắn (5 phút)"
5. ✅ Test long break modal (sau 4 pomodoros)
6. ✅ **Xác minh:**
   - Icon 🌟
   - Background màu xanh nhạt
   - "nghỉ dài (15 phút)"

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 9: Task Integration** 📝

**Mục tiêu:** Kiểm tra tích hợp với task system

1. ✅ Chọn một task có estimate 4 pomodoros
2. ✅ Hoàn thành pomodoro #1
3. ✅ **Xác minh:**
   - Modal hiển thị
   - Task progress update (1/4)
   - Task không bị clear
4. ✅ Bắt đầu break
5. ✅ Hoàn thành break
6. ✅ **Xác minh:**
   - Task vẫn hiển thị
   - Nút "Tiếp Tục Nhiệm Vụ" có sẵn
7. ✅ Tiếp tục và hoàn thành 3 pomodoros nữa
8. ✅ **Xác minh:**
   - Task progress = 4/4
   - Task auto-complete
   - Task bị clear khỏi timer

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

### **Test 10: Offline Mode** 📡

**Mục tiêu:** Kiểm tra hoạt động offline

1. ✅ Tắt WiFi/Mobile Data
2. ✅ Hoàn thành pomodoro
3. ✅ **Xác minh:**
   - Modal vẫn hiển thị
   - Break có thể bắt đầu
   - Settings có thể thay đổi
   - Settings được lưu local
4. ✅ Bật lại mạng
5. ✅ **Xác minh:**
   - App vẫn hoạt động bình thường
   - Settings sync (nếu có backend)

**Kết quả mong đợi:** ✅ PASS / ❌ FAIL  
**Ghi chú:** ****************\_****************

---

## 📊 Test Summary

| Test Case                    | Status | Notes |
| ---------------------------- | ------ | ----- |
| Test 1: Short Break          | ⬜     |       |
| Test 2: Long Break           | ⬜     |       |
| Test 3: Skip Break           | ⬜     |       |
| Test 4: Auto Start Breaks    | ⬜     |       |
| Test 5: Auto Start Pomodoros | ⬜     |       |
| Test 6: Settings             | ⬜     |       |
| Test 7: Count Logic          | ⬜     |       |
| Test 8: Modal UI             | ⬜     |       |
| Test 9: Task Integration     | ⬜     |       |
| Test 10: Offline Mode        | ⬜     |       |

**Overall Result:** ⬜ PASS / ⬜ FAIL

**Tester:** ********\_********  
**Date:** ********\_********  
**App Version:** ********\_********  
**Device:** ********\_********  
**OS Version:** ********\_********

---

## 🐛 Bug Report Template

**Bug ID:** #**_  
**Test Case:** _**  
**Severity:** ⬜ Critical / ⬜ High / ⬜ Medium / ⬜ Low

**Steps to Reproduce:**

1.
2.
3.

**Expected Result:**

**Actual Result:**

**Screenshots/Videos:**

**Additional Notes:**

---

## ✅ Sign-off

**Tested by:** ********\_********  
**Date:** ********\_********  
**Signature:** ********\_********
