# Offline Support Implementation

## ✅ Đã hoàn thành:

### 1. **TaskContext.js** - Optimistic Updates với Offline Support

Tất cả các operations đã được cập nhật với pattern:

1. **Update UI ngay lập tức** (optimistic update)
2. **Lưu vào AsyncStorage** (offline persistence)
3. **Sync với server** (khi có mạng)
4. **Không rollback** nếu network error

#### Functions đã cập nhật:

- ✅ `addTask()` - Tạo task offline với temp ID
- ✅ `updateTask()` - Cập nhật task offline
- ✅ `deleteTask()` - Xóa task offline
- ✅ `completeTask()` - Đánh dấu hoàn thành offline
- ✅ `incrementPomodoroCount()` - Tăng pomodoro offline

### 2. **Hooks & Components**

- ✅ `useNetworkStatus.js` - Hook để detect network status
- ✅ `OfflineIndicator.js` - Component hiển thị trạng thái offline

## 📦 Cần cài đặt package:

```bash
npm install @react-native-community/netinfo
```

hoặc

```bash
npx expo install @react-native-community/netinfo
```

## 🔧 Cách sử dụng OfflineIndicator:

### Thêm vào App.js hoặc layout chính:

```javascript
import OfflineIndicator from "./components/OfflineIndicator";

function App() {
  return (
    <>
      {/* Your app content */}
      <OfflineIndicator />
    </>
  );
}
```

## 🎯 Cách hoạt động:

### Khi Offline:

1. User thực hiện action (tạo/sửa/xóa task, hoàn thành pomodoro)
2. ✅ UI cập nhật ngay lập tức
3. ✅ Dữ liệu lưu vào AsyncStorage
4. ⚠️ Network request fail (nhưng không ảnh hưởng UX)
5. 📱 Snackbar hiển thị "Chế độ Offline"
6. ✅ Return success với flag `offline: true`

### Khi Online trở lại:

1. User thực hiện action mới
2. ✅ UI cập nhật ngay
3. ✅ Lưu vào AsyncStorage
4. ✅ Sync với server thành công
5. ✅ Update với dữ liệu từ server
6. 📱 Snackbar hiển thị "Đã kết nối lại"

### Auto-sync khi có mạng:

- Khi app khởi động, `loadTasks()` sẽ tự động tải từ server
- Nếu có conflict, dữ liệu server sẽ override local
- Tasks với temp ID sẽ được merge với server IDs

## 🔍 Console Logs:

### Offline mode:

```
🍅 Incremented pomodoro (offline): Task name (2/4)
⚠️ Could not sync with server (offline mode): Network error
✅ Task pomodoro updated successfully!
📡 Network: Offline
```

### Online mode:

```
🍅 Incremented pomodoro (offline): Task name (2/4)
✅ Synced with server: Task name
✅ Task pomodoro updated successfully!
📡 Network: Online
```

## 🎨 UI Feedback:

### Offline Snackbar:

- **Màu cam (#FF9800)**
- **Icon:** 📡
- **Message:** "Chế độ Offline - Dữ liệu sẽ đồng bộ khi có mạng"
- **Duration:** Indefinite (hiện cho đến khi có mạng trở lại)

### Back Online Snackbar:

- **Màu xanh (#4CAF50)**
- **Icon:** ✅
- **Message:** "Đã kết nối lại - Đang đồng bộ dữ liệu..."
- **Duration:** 3 seconds

## ⚠️ Lưu ý:

1. **Temp IDs:** Tasks tạo offline có temp ID dạng `temp_1234567890_abc123`
2. **Conflict resolution:** Server data luôn được ưu tiên khi sync
3. **Storage limit:** AsyncStorage có giới hạn ~6MB (đủ cho hàng nghìn tasks)
4. **No automatic sync:** App không tự động retry failed requests. User cần thực hiện action mới hoặc reload app.

## 🚀 Testing Offline Mode:

### iOS Simulator:

Settings → Toggle Network (Cmd+Shift+H → Settings)

### Android Emulator:

Settings → Network & Internet → Toggle WiFi/Mobile Data

### Expo:

- Bật Airplane mode trên device/simulator
- Hoặc tắt WiFi

## 📊 Kết quả:

✅ **UX tốt hơn:** Không có loading hoặc error khi offline
✅ **Data integrity:** Dữ liệu được lưu local và sync sau
✅ **User awareness:** Snackbar thông báo rõ ràng trạng thái
✅ **Seamless transition:** Tự động sync khi có mạng trở lại
