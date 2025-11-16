# Date Range Selector Testing Guide

## Tính năng: Date Range Selector trong Statistics Screen

### Mục đích

Cho phép người dùng lọc và xem thống kê theo khoảng thời gian tùy chọn.

---

## Test Cases

### 1. Date Range Selector UI

**Mục đích**: Kiểm tra giao diện bộ lọc thời gian

**Các bước**:

1. Mở app và đăng nhập
2. Điều hướng đến tab "Thống Kê" (Statistics)
3. Quan sát SegmentedButtons bên dưới header

**Kết quả mong đợi**:

- ✅ Có 4 nút: "Hôm nay", "7 ngày", "30 ngày", "Tùy chỉnh"
- ✅ Mặc định chọn "7 ngày"
- ✅ Giao diện đẹp, dễ sử dụng

---

### 2. Filter "Hôm nay"

**Mục đích**: Kiểm tra lọc theo ngày hôm nay

**Điều kiện tiên quyết**:

- Đã có data của ngày hôm nay (hoàn thành ít nhất 1 pomodoro hôm nay)

**Các bước**:

1. Nhấn vào nút "Hôm nay"
2. Quan sát:
   - Overview cards (Pomodoros, Thời gian, Tasks)
   - Chart title
   - Chart data

**Kết quả mong đợi**:

- ✅ Chart title hiển thị: "📈 Hôm Nay"
- ✅ Overview cards chỉ hiển thị số liệu của hôm nay
- ✅ Chart chỉ hiển thị data hôm nay
- ✅ Nếu chưa có data hôm nay, chart hiển thị [0]

---

### 3. Filter "7 ngày"

**Mục đích**: Kiểm tra lọc theo 7 ngày gần nhất

**Điều kiện tiên quyết**:

- Có data trong 7 ngày gần nhất

**Các bước**:

1. Nhấn vào nút "7 ngày"
2. Quan sát overview cards và chart

**Kết quả mong đợi**:

- ✅ Chart title hiển thị: "📈 7 Ngày Gần Đây"
- ✅ Overview cards hiển thị tổng cộng 7 ngày gần nhất
- ✅ Chart hiển thị 7 điểm data (hoặc ít hơn nếu chưa đủ data)
- ✅ Labels chart hiển thị ngày/tháng (DD/MM)

---

### 4. Filter "30 ngày"

**Mục đích**: Kiểm tra lọc theo 30 ngày gần nhất

**Điều kiện tiên quyết**:

- Có data trong 30 ngày gần nhất

**Các bước**:

1. Nhấn vào nút "30 ngày"
2. Quan sát overview cards và chart

**Kết quả mong đợi**:

- ✅ Chart title hiển thị: "📈 30 Ngày Gần Đây"
- ✅ Overview cards hiển thị tổng cộng 30 ngày gần nhất
- ✅ Chart hiển thị tất cả data có trong 30 ngày
- ✅ Chart có thể scroll nếu có nhiều data points

---

### 5. Custom Date Range (iOS)

**Mục đích**: Kiểm tra chọn khoảng thời gian tùy chỉnh trên iOS

**Các bước**:

1. Nhấn vào nút "Tùy chỉnh"
2. Modal xuất hiện với DatePicker spinner
3. Chọn ngày bắt đầu bằng cách scroll
4. Tự động chuyển sang chọn ngày kết thúc
5. Chọn ngày kết thúc
6. Nhấn nút "Xong"

**Kết quả mong đợi**:

- ✅ Modal hiển thị với title "Chọn ngày bắt đầu"
- ✅ DatePicker iOS spinner style
- ✅ Sau khi chọn start date, tự động chuyển sang "Chọn ngày kết thúc"
- ✅ Có nút "Xong" để hoàn tất
- ✅ Chart title hiển thị: "📈 DD/MM/YYYY - DD/MM/YYYY"
- ✅ Data được filter chính xác theo range đã chọn

---

### 6. Custom Date Range (Android)

**Mục đích**: Kiểm tra chọn khoảng thời gian tùy chỉnh trên Android

**Các bước**:

1. Nhấn vào nút "Tùy chỉnh"
2. Calendar picker xuất hiện cho start date
3. Chọn ngày bắt đầu
4. Calendar picker tự động xuất hiện cho end date
5. Chọn ngày kết thúc

**Kết quả mong đợi**:

- ✅ Calendar picker Android style
- ✅ Tự động chuyển từ start date picker sang end date picker
- ✅ Chart và cards update ngay sau khi chọn xong
- ✅ Data được filter chính xác

---

### 7. Custom Date Range - Tap Outside

**Mục đích**: Kiểm tra đóng modal khi tap outside

**Các bước**:

1. Nhấn vào nút "Tùy chỉnh"
2. Modal mở ra
3. Tap vào vùng overlay bên ngoài modal (vùng tối)

**Kết quả mong đợi**:

- ✅ Modal đóng lại
- ✅ Date range revert về "7 ngày" (giá trị trước đó)
- ✅ Chart và cards không thay đổi

---

### 8. Overview Cards Calculation

**Mục đích**: Kiểm tra tính toán đúng của overview cards theo range

**Các bước**:

1. Ghi chú số liệu hiện tại khi chọn "30 ngày"
2. Chuyển sang "7 ngày"
3. So sánh số liệu

**Kết quả mong đợi**:

- ✅ Số Pomodoros giảm (hoặc bằng nếu chỉ có data trong 7 ngày)
- ✅ Thời gian làm việc giảm tương ứng
- ✅ Tasks hoàn thành giảm tương ứng
- ✅ Chuỗi ngày (streak) KHÔNG đổi (vì đây là lifetime stat)

---

### 9. Switch Between Ranges

**Mục đích**: Kiểm tra chuyển đổi mượt mà giữa các range

**Các bước**:

1. Nhấn "Hôm nay" → Quan sát
2. Nhấn "7 ngày" → Quan sát
3. Nhấn "30 ngày" → Quan sát
4. Nhấn "Tùy chỉnh" → Chọn range → Quan sát
5. Nhấn lại "7 ngày" → Quan sát

**Kết quả mong đợi**:

- ✅ Chuyển đổi không bị lag
- ✅ Data update ngay lập tức
- ✅ Chart re-render smooth
- ✅ Không có crash hoặc error

---

### 10. Edge Cases

#### 10.1. No Data for Selected Range

**Các bước**:

1. Chọn "Tùy chỉnh"
2. Chọn range không có data (ví dụ: 2 tháng trước)

**Kết quả mong đợi**:

- ✅ Overview cards hiển thị 0
- ✅ Chart hiển thị empty state với label [""]
- ✅ Không crash

#### 10.2. Today with No Data

**Các bước**:

1. Chọn "Hôm nay" khi chưa hoàn thành pomodoro nào

**Kết quả mong đợi**:

- ✅ Overview cards hiển thị 0
- ✅ Chart hiển thị [0]
- ✅ Message khuyến khích hoàn thành pomodoro

#### 10.3. Custom Range with Same Start and End Date

**Các bước**:

1. Chọn "Tùy chỉnh"
2. Chọn cùng 1 ngày cho start và end

**Kết quả mong đợi**:

- ✅ Chỉ hiển thị data của ngày đó
- ✅ Chart title: "📈 DD/MM/YYYY - DD/MM/YYYY" (same date)
- ✅ Hoạt động giống filter "Hôm nay" nếu chọn today

---

### 11. Pull to Refresh

**Mục đích**: Kiểm tra refresh với date range đã chọn

**Các bước**:

1. Chọn một date range (ví dụ: "7 ngày")
2. Pull down để refresh
3. Quan sát

**Kết quả mong đợi**:

- ✅ Data được refresh từ API
- ✅ Date range vẫn giữ nguyên (vẫn là "7 ngày")
- ✅ Overview cards và chart update với data mới

---

### 12. Navigate Away and Back

**Mục đích**: Kiểm tra state persistence

**Các bước**:

1. Chọn "30 ngày"
2. Navigate sang tab khác (Home, Tasks, etc.)
3. Navigate lại Statistics tab

**Kết quả mong đợi**:

- ✅ Date range reset về "7 ngày" (default)
- ✅ Data được reload từ API
- ✅ Chart hiển thị đúng với "7 ngày"

_(Note: Đây là behavior hiện tại - có thể improve sau để persist state)_

---

## Checklist Tổng Hợp

### UI/UX

- [ ] SegmentedButtons hiển thị đúng
- [ ] Buttons có style đẹp, rõ ràng
- [ ] Active state của button dễ nhận biết
- [ ] DatePicker modal hiển thị đúng trên iOS
- [ ] Calendar picker hiển thị đúng trên Android
- [ ] Modal có thể đóng bằng tap outside
- [ ] Chart title thay đổi theo range

### Functionality

- [ ] Filter "Hôm nay" hoạt động đúng
- [ ] Filter "7 ngày" hoạt động đúng
- [ ] Filter "30 ngày" hoạt động đúng
- [ ] Custom date range hoạt động đúng
- [ ] Overview cards tính toán đúng theo range
- [ ] Chart data filter đúng theo range
- [ ] Streak card vẫn hiển thị lifetime stats

### Performance

- [ ] Chuyển đổi range không lag
- [ ] Chart re-render mượt mà
- [ ] Không có memory leak khi switch nhiều lần
- [ ] Pull to refresh hoạt động tốt

### Edge Cases

- [ ] Handle no data gracefully
- [ ] Handle same start/end date
- [ ] Handle future dates (không cho chọn)
- [ ] Handle invalid date ranges

---

## Known Issues & Limitations

### Current Limitations:

1. **Data Source**: Chỉ filter từ `last30Days` data có sẵn từ API. Nếu chọn custom range > 30 ngày, sẽ chỉ hiển thị data trong 30 ngày gần nhất.

2. **State Persistence**: Date range không được persist khi navigate away. Mỗi lần vào lại Statistics screen sẽ reset về "7 ngày".

3. **Chart Performance**: Với "30 ngày", chart có thể hơi đông data points. Có thể cần optimize visualization.

### Future Improvements:

- [ ] Persist selected date range trong AsyncStorage
- [ ] Add API endpoint để fetch data > 30 ngày
- [ ] Add comparison view (so sánh 2 khoảng thời gian)
- [ ] Add export stats functionality
- [ ] Add animated transitions khi switch ranges

---

## Bug Report Template

Nếu phát hiện bug, report theo format:

```
**Date Range**: [Hôm nay / 7 ngày / 30 ngày / Tùy chỉnh: DD/MM/YYYY - DD/MM/YYYY]
**Device**: [iOS/Android version]
**Steps to Reproduce**:
1. ...
2. ...

**Expected Result**:
...

**Actual Result**:
...

**Screenshots**: (if applicable)
...
```

---

## Contact

Nếu có vấn đề hoặc câu hỏi, liên hệ development team.
