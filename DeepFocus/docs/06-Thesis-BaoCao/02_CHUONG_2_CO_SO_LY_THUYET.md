
# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT

Chương này trình bày các nền tảng lý thuyết và công nghệ được sử dụng trong việc xây dựng ứng dụng DeepFocus. Nội dung bao gồm: phương pháp Pomodoro và các kỹ thuật quản lý thời gian, kiến trúc ứng dụng di động đa nền tảng, các công nghệ cụ thể (React Native, Expo, Node.js, MongoDB), hệ thống xác thực và phân quyền, mô hình thiết kế hệ thống, cùng các design patterns và best practices trong phát triển ứng dụng full-stack.

## 2.1. Phương pháp Pomodoro và các kỹ thuật quản lý thời gian

### 2.1.1. Lịch sử và nguồn gốc của kỹ thuật Pomodoro

Kỹ thuật Pomodoro được phát triển bởi Francesco Cirillo vào cuối những năm 1980 khi ông còn là sinh viên đại học. Tên gọi "Pomodoro" (tiếng Ý nghĩa là "quả cà chua") xuất phát từ chiếc đồng hồ hình quả cà chua mà Cirillo sử dụng để theo dõi thời gian làm việc của mình [2].

Ban đầu, đây chỉ là một phương pháp cá nhân giúp Cirillo cải thiện khả năng tập trung và năng suất học tập. Tuy nhiên, sau nhiều năm nghiên cứu và hoàn thiện, kỹ thuật này đã được công bố rộng rãi thông qua cuốn sách "The Pomodoro Technique" (2006) và nhanh chóng trở thành một trong những phương pháp quản lý thời gian phổ biến nhất trên thế giới.

### 2.1.2. Nguyên lý cơ bản của kỹ thuật Pomodoro

Kỹ thuật Pomodoro dựa trên nguyên lý chia nhỏ công việc thành các khoảng thời gian cố định (thường là 25 phút), gọi là "pomodoro", xen kẽ với các khoảng nghỉ ngắn. Cấu trúc cơ bản bao gồm:

**1. Chu kỳ Pomodoro chuẩn:**

- **Làm việc tập trung:** 25 phút không gián đoạn
- **Nghỉ ngắn:** 5 phút sau mỗi pomodoro
- **Nghỉ dài:** 15-30 phút sau mỗi 4 pomodoro

**2. Quy trình 6 bước:**

**Bước 1 - Lập kế hoạch:** Chọn một nhiệm vụ cụ thể cần hoàn thành. Nhiệm vụ có thể là một task nhỏ hoặc một phần của task lớn hơn.

**Bước 2 - Đặt timer:** Đặt đồng hồ đếm ngược 25 phút. Đây là một "pomodoro" - khoảng thời gian bạn cam kết làm việc hoàn toàn tập trung.

**Bước 3 - Làm việc:** Tập trung hoàn toàn vào nhiệm vụ cho đến khi timer kêu. Không làm bất kỳ việc gì khác, không check email, điện thoại hay mạng xã hội.

**Bước 4 - Đánh dấu hoàn thành:** Khi timer kêu, đánh dấu một pomodoro đã hoàn thành (thường bằng cách ghi chép hoặc tích vào danh sách).

**Bước 5 - Nghỉ ngắn:** Nghỉ ngơi 5 phút. Đứng dậy, đi lại, uống nước, thả lỏng não bộ.

**Bước 6 - Lặp lại và nghỉ dài:** Sau mỗi 4 pomodoro, nghỉ dài hơn (15-30 phút) để phục hồi hoàn toàn năng lượng và sự tập trung.

### 2.1.3. Cơ sở khoa học của kỹ thuật Pomodoro

**A. Lý thuyết về khả năng tập trung có giới hạn (Limited Attention Span)**

Nghiên cứu trong tâm lý học nhận thức cho thấy khả năng tập trung liên tục của con người có giới hạn. Theo nghiên cứu của Ericsson và cộng sự (1993) về "deliberate practice", con người chỉ có thể duy trì mức độ tập trung cao nhất trong khoảng 20-30 phút trước khi hiệu suất bắt đầu giảm [19]. Kỹ thuật Pomodoro với chu kỳ 25 phút nằm đúng trong khoảng thời gian tối ưu này.

**B. Hiệu ứng Zeigarnik (Zeigarnik Effect)**

Hiệu ứng Zeigarnik, được phát hiện bởi nhà tâm lý học Bluma Zeigarnik (1927), chỉ ra rằng con người dễ nhớ và bị ám ảnh bởi các nhiệm vụ chưa hoàn thành hơn là những nhiệm vụ đã hoàn thành [20]. Pomodoro tận dụng hiệu ứng này: khi timer kêu giữa chừng một task lớn, não bộ tự động "đánh dấu" task đó là chưa xong, tạo động lực quay lại làm tiếp sau khi nghỉ.

**C. Lý thuyết về nghỉ ngơi và phục hồi nhận thức**

Nghiên cứu của Ariga và Lleras (2011) chứng minh rằng việc nghỉ ngơi ngắn giúp "làm mới" khả năng tập trung thông qua cơ chế "habituation" và "dishabituation" [5]. Khi làm việc liên tục, não bộ dần "quen" với kích thích (habituation), dẫn đến giảm chú ý. Nghỉ ngắn giúp "reset" trạng thái này (dishabituation), khôi phục khả năng tập trung.

**D. Quản lý căng thẳng và burnout**

Nghiên cứu của Demerouti và cộng sự (2012) về "work-related flow and energy" cho thấy việc xen kẽ giữa làm việc và nghỉ ngơi có thể cải thiện hiệu suất nhận thức lên đến 25% và giảm nguy cơ burnout [3]. Pomodoro áp dụng nguyên tắc này bằng cách cưỡng chế người dùng nghỉ ngơi đều đặn, ngay cả khi họ cảm thấy vẫn còn năng lượng.

### 2.1.4. Lợi ích của kỹ thuật Pomodoro

**1. Tăng cường khả năng tập trung:**

- Loại bỏ multitasking - một trong những kẻ thù lớn nhất của năng suất
- Tạo "time pressure" nhẹ, kích thích não bộ làm việc hiệu quả hơn
- Giảm thiểu gián đoạn từ bên ngoài (email, tin nhắn, notification)

**2. Cải thiện quản lý thời gian:**

- Ước lượng chính xác thời gian cần để hoàn thành tasks (bằng số pomodoro)
- Nhận thức rõ ràng về cách thời gian được sử dụng
- Lập kế hoạch thực tế dựa trên historical data

**3. Giảm procrastination:**

- "Chỉ 25 phút thôi" dễ bắt đầu hơn "làm xong cả task"
- Chia nhỏ task lớn thành các pomodoro nhỏ, giảm cảm giác overwhelmed
- Tạo momentum: sau pomodoro đầu tiên, dễ tiếp tục hơn

**4. Duy trì động lực và năng lượng:**

- Cảm giác hoàn thành sau mỗi pomodoro tạo satisfaction
- Nghỉ ngơi đều đặn giúp duy trì năng lượng suốt ngày
- Tránh burnout do làm việc quá sức

**5. Thu thập dữ liệu và cải thiện:**

- Track số pomodoro hoàn thành mỗi ngày
- Phân tích task nào tốn nhiều thời gian
- Điều chỉnh và tối ưu workflow dựa trên insights

### 2.1.5. Ứng dụng Pomodoro trong DeepFocus

DeepFocus áp dụng kỹ thuật Pomodoro với các điều chỉnh phù hợp cho môi trường học tập:

**1. Timer linh hoạt:**

- Cho phép tùy chỉnh thời gian work/break theo nhu cầu
- Hỗ trợ pause/resume cho các trường hợp khẩn cấp
- Skip break nếu người dùng muốn tiếp tục momentum

**2. Tích hợp với Task Management:**

- Liên kết mỗi pomodoro với một task cụ thể
- Tự động track số pomodoro cho mỗi task
- Estimate effort bằng số pomodoro cần thiết

**3. Gamification:**

- Điểm thưởng cho mỗi pomodoro hoàn thành
- Achievements cho milestones (10, 50, 100 pomodoros)
- Streak tracking (số ngày liên tiếp đạt daily goal)

**4. Analytics:**

- Biểu đồ số pomodoro theo ngày/tuần/tháng
- Phân tích thời gian tập trung theo subject/task type
- Insights về thói quen học tập

## 2.2. Kiến trúc ứng dụng di động đa nền tảng

### 2.2.1. So sánh các phương pháp phát triển mobile app

**A. Native Development**

Phát triển native là cách tiếp cận truyền thống, sử dụng ngôn ngữ và công cụ chính thức của từng nền tảng:

**iOS Native:**

- Ngôn ngữ: Swift hoặc Objective-C
- IDE: Xcode
- Framework: UIKit, SwiftUI
- Ưu điểm: Performance tối ưu, access đầy đủ APIs, UX native
- Nhược điểm: Chỉ chạy trên iOS, chi phí phát triển cao

**Android Native:**

- Ngôn ngữ: Kotlin hoặc Java
- IDE: Android Studio
- Framework: Android SDK, Jetpack Compose
- Ưu điểm: Performance tốt, access đầy đủ APIs, Material Design
- Nhược điểm: Chỉ chạy trên Android, phân mảnh thiết bị

**Đánh giá:** Native development cho performance và UX tốt nhất, nhưng yêu cầu:

- Hai team riêng biệt (iOS và Android)
- Viết code hai lần cho cùng một logic
- Chi phí và thời gian phát triển gấp đôi

**B. Cross-Platform Native (React Native)**

React Native được chọn cho DeepFocus vì:

**1. Code Reusability (90%):**

- Một codebase cho iOS, Android và Web
- Chia sẻ business logic, state management, API calls
- Chỉ customize platform-specific code khi cần thiết

**2. Performance đủ tốt:**

- Render native components, không phải WebView
- Smooth animations với React Native Reanimated
- 60 FPS cho hầu hết use cases

**3. Time-to-Market:**

- Deploy cho cả iOS và Android từ một codebase
- Faster development cycle nhờ hot reload
- Phù hợp với đồ án có deadline 4 tháng

### 2.2.2. Kiến trúc React Native

**A. Kiến trúc 3 lớp (Three-Thread Architecture)**

React Native hoạt động trên 3 threads chính:

**1. JavaScript Thread:** Chạy JavaScript code (React components, business logic), sử dụng JavaScript engine: Hermes (Android) hoặc JavaScriptCore (iOS).

**2. Native Thread (UI Thread):** Chạy native code, render UI components, handle gestures và animations.

**3. Shadow Thread:** Tính toán layout bằng Yoga (Flexbox engine), tạo "shadow tree" - representation của UI tree.

**B. Bridge - Cầu nối giữa JavaScript và Native**

Bridge serialize method calls thành JSON messages và gửi asynchronously giữa JavaScript và Native realms. Mặc dù có overhead, nhưng đủ hiệu quả cho hầu hết use cases.

## 2.3. Công nghệ React Native và Expo Framework

### 2.3.1. React - Thư viện UI cốt lõi

React áp dụng triết lý "UI là hàm của state": `UI = f(state)`

**Component-Based Architecture:**

- Components là các building blocks tái sử dụng
- Mỗi component quản lý state và props riêng
- Composition over inheritance
- Unidirectional data flow

**React Hooks:**
Hooks cho phép sử dụng state và lifecycle trong functional components:

- `useState`: Local state management
- `useEffect`: Side effects (API calls, subscriptions)
- `useContext`: Global state access
- `useCallback`: Memoize functions
- `useMemo`: Memoize values
- `useReducer`: Complex state logic

### 2.3.2. Expo Framework

Expo là framework được xây dựng trên React Native, cung cấp bộ công cụ và dịch vụ giúp đơn giản hóa việc phát triển.

**Expo SDK - Bộ APIs:**

- Camera, Notifications, File System
- Device Info, Clipboard, Haptics
- 50+ modules cho các tính năng thông dụng

**Expo Router - File-based Navigation:**
File-based routing tương tự Next.js, giúp tổ chức code rõ ràng và dễ maintain.

**Expo Application Services (EAS):**

- **EAS Build:** Build iOS/Android app trên cloud
- **EAS Submit:** Submit app lên stores tự động
- **EAS Update:** Over-the-air updates cho JavaScript code

### 2.3.3. State Management với Context API

DeepFocus sử dụng React Context API để quản lý global state:

**Kiến trúc Context:**

```
App Root
├── LanguageProvider
├── AuthProvider
│   ├── RoleProvider
│   ├── PomodoroProvider
│   ├── TaskProvider
│   ├── ClassProvider
│   ├── AchievementProvider
│   └── CompetitionProvider
└── App Components
```

**Lợi ích:**

- Built-in, không cần thêm library
- Đủ đơn giản cho medium-sized apps
- Dễ học và maintain
- Performance tốt với proper optimization

## 2.4. Kiến trúc Backend với Node.js và Express.js

### 2.4.1. Node.js - JavaScript Runtime

Node.js cho phép chạy JavaScript phía server với các đặc điểm:

**1. Event-Driven Architecture:** Sử dụng Event Loop để handle multiple requests concurrently.

**2. Non-Blocking I/O:** Phù hợp cho I/O-intensive applications (APIs, real-time apps).

**3. NPM Ecosystem:** 2+ million packages, dependency management dễ dàng.

### 2.4.2. Express.js - Web Framework

Express.js là minimal và flexible web framework cho Node.js.

**Mẫu thiết kế Middleware:**
Middleware là functions có access tới `req`, `res`, và `next`, cho phép xử lý request theo chuỗi.

**RESTful API Design trong DeepFocus:**

| HTTP Method | Route                | Description         |
| ----------- | -------------------- | ------------------- |
| POST        | `/api/auth/register` | Đăng ký user mới    |
| POST        | `/api/auth/login`    | Đăng nhập           |
| GET         | `/api/tasks`         | Lấy danh sách tasks |
| POST        | `/api/tasks`         | Tạo task mới        |
| PUT         | `/api/tasks/:id`     | Update task         |
| DELETE      | `/api/tasks/:id`     | Xóa task            |

**Request/Response Flow:**

```
Client Request → Middleware (CORS, Auth) → Route Handler →
Controller (Business Logic) → Model (Database) → Response
```

---

**[KẾT THÚC PHẦN 2A - CHƯƠNG 2]**

_Đã hoàn thành: 2.1 - 2.4 (Khoảng 8-10 trang)_

---

## 2.5. Cơ sở dữ liệu MongoDB và Mongoose ORM

### 2.5.1. MongoDB - Cơ sở dữ liệu NoSQL

**A. Giới thiệu và đặc điểm**

MongoDB là một hệ quản trị cơ sở dữ liệu NoSQL (Not Only SQL) hướng document, được phát triển bởi MongoDB Inc. từ năm 2009. Khác với các hệ quản trị cơ sở dữ liệu quan hệ truyền thống (RDBMS) như MySQL hay PostgreSQL sử dụng bảng và hàng, MongoDB lưu trữ dữ liệu dưới dạng các documents có cấu trúc giống JSON (Binary JSON - BSON).

**Các đặc điểm nổi bật của MongoDB:**

**1. Lưu trữ hướng tài liệu (Document-Oriented Storage):** Dữ liệu được lưu trữ dưới dạng các tài liệu (documents) - các đối tượng JSON có thể chứa các đối tượng lồng nhau (nested objects) và mảng (arrays). Mỗi document là một đơn vị dữ liệu độc lập, có thể có cấu trúc phức tạp mà không cần phải tách ra nhiều bảng như trong SQL.

**2. Tính linh hoạt về lược đồ (Schema Flexibility):** MongoDB không yêu cầu lược đồ cố định (schema-less), cho phép các tài liệu trong cùng một bộ sưu tập (collection) có cấu trúc khác nhau. Điều này mang lại sự linh hoạt cao trong quá trình phát triển ứng dụng, đặc biệt khi requirements thay đổi thường xuyên.

**3. Khả năng mở rộng theo chiều ngang (Horizontal Scalability):** MongoDB được thiết kế để mở rộng theo chiều ngang thông qua phân mảnh (sharding) - kỹ thuật phân tán dữ liệu ra nhiều máy chủ (servers). Điều này cho phép xử lý lượng dữ liệu lớn và traffic cao một cách hiệu quả.

**4. Tính sẵn sàng cao (High Availability):** Các bộ sao chép (Replica Sets) cung cấp khả năng sao lưu tự động và chuyển đổi dự phòng (failover), đảm bảo hệ thống vẫn hoạt động ngay cả khi một hoặc nhiều máy chủ gặp sự cố.

**5. Ngôn ngữ truy vấn phong phú (Rich Query Language):** MongoDB hỗ trợ các truy vấn phức tạp với nhiều toán tử (operators), khung tổng hợp (aggregation framework) mạnh mẽ, tìm kiếm văn bản (text search), và truy vấn không gian địa lý (geospatial queries).

**B. So sánh MongoDB với SQL Databases**

**Về mô hình dữ liệu:** Cơ sở dữ liệu SQL sử dụng mô hình quan hệ với bảng (tables), hàng (rows) và cột (columns), yêu cầu lược đồ cố định được định nghĩa trước. MongoDB sử dụng tài liệu linh hoạt, cho phép cấu trúc lồng nhau và không bắt buộc lược đồ cố định.

**Về mối quan hệ (relationships):** Trong SQL, các mối quan hệ được thiết lập thông qua khóa ngoại (foreign keys) và các phép toán nối (JOIN operations). MongoDB hỗ trợ hai cách: nhúng tài liệu (embedded documents) - nhúng dữ liệu liên quan trực tiếp vào tài liệu, hoặc tham chiếu (references) - tham chiếu đến các tài liệu khác.

**Về khả năng mở rộng:** Cơ sở dữ liệu SQL thường mở rộng theo chiều dọc (scale vertically - tăng sức mạnh máy chủ), trong khi MongoDB được thiết kế để mở rộng theo chiều ngang (scale horizontally - thêm nhiều máy chủ).

**Về các trường hợp sử dụng:** SQL phù hợp với dữ liệu có cấu trúc chặt chẽ, các mối quan hệ phức tạp và yêu cầu giao dịch ACID mạnh mẽ. MongoDB phù hợp với phát triển nhanh (rapid development), dữ liệu bán cấu trúc (semi-structured), và các ứng dụng cần mở rộng quy mô lớn.

**C. Lý do chọn MongoDB cho DeepFocus**

**1. Sự phù hợp với hệ sinh thái JavaScript:** Cả giao diện người dùng (frontend - React Native) và phía máy chủ (backend - Node.js) của DeepFocus đều sử dụng JavaScript. MongoDB với các tài liệu BSON tương thích hoàn hảo với JSON, tạo ra luồng dữ liệu (data flow) nhất quán từ cơ sở dữ liệu đến backend rồi frontend mà không cần chuyển đổi phức tạp.

**2. Tính linh hoạt trong phát triển Agile:** Trong quá trình phát triển đồ án, các yêu cầu (requirements) thường thay đổi và các tính năng (features) mới được thêm vào. Tính linh hoạt về lược đồ của MongoDB cho phép thêm/sửa các trường (fields) dễ dàng mà không cần thay đổi cấu trúc bảng hay di chuyển dữ liệu phức tạp như SQL.

**3. Hiệu suất phù hợp với các trường hợp sử dụng:** DeepFocus có nhiều thao tác đọc (xem nhiệm vụ, thống kê, bảng xếp hạng) và cấu trúc dữ liệu tương đối đơn giản. MongoDB với các tài liệu nhúng giảm nhu cầu nối bảng (JOINs), cải thiện hiệu suất đáng kể.

**4. Dễ dàng triển khai:** MongoDB Atlas cung cấp cơ sở dữ liệu dưới dạng dịch vụ (database-as-a-service) với gói miễn phí, giúp thiết lập và triển khai nhanh chóng mà không cần quản lý hạ tầng phức tạp.

**5. Trải nghiệm lập trình viên:** Mongoose ODM cung cấp giao diện lập trình (API) trực quan và dễ học, phù hợp với thời gian thực hiện ngắn của đồ án (4 tháng).

### 2.5.2. Mongoose - Thư viện mô hình hóa dữ liệu đối tượng

**A. Vai trò và tầm quan trọng của Mongoose**

Mongoose là một thư viện mô hình hóa dữ liệu đối tượng (ODM - Object Data Modeling) cho MongoDB và Node.js, đóng vai trò như một lớp trung gian trừ tượng hóa giữa mã ứng dụng và MongoDB. Mặc dù MongoDB không yêu cầu lược đồ cố định, Mongoose cung cấp khả năng định nghĩa lược đồ (schemas) với kiểm tra tính hợp lệ (validation), chuyển đổi kiểu dữ liệu (type casting), và logic nghiệp vụ (business logic).

Mongoose giải quyết các thách thức quan trọng:

- **Kiểm tra tính hợp lệ dữ liệu:** Đảm bảo dữ liệu đúng định dạng và đáp ứng các quy tắc nghiệp vụ trước khi lưu vào cơ sở dữ liệu
- **Định nghĩa lược đồ:** Mặc dù MongoDB linh hoạt, việc có lược đồ giúp duy trì tính nhất quán của dữ liệu và cung cấp tài liệu mô tả
- **Quản lý các mối quan hệ:** Đơn giản hóa việc thiết lập và quản lý các mối quan hệ giữa các bộ sưu tập
- **Tích hợp logic nghiệp vụ:** Các hook trung gian (middleware hooks) cho phép chèn logic tùy chỉnh vào các thao tác cơ sở dữ liệu

**B. Schema Modeling và Validation**

**Định nghĩa lược đồ** trong Mongoose giúp cấu trúc hóa documents, định nghĩa các fields, kiểu dữ liệu, default values, và validation rules. Điều này mang lại nhiều lợi ích:

**Tính nhất quán dữ liệu:** Mặc dù MongoDB không áp đặt lược đồ, việc định nghĩa lược đồ trong tầng ứng dụng đảm bảo tất cả tài liệu tuân theo cùng cấu trúc cơ bản, giảm thiểu lỗi và sự không nhất quán.

**Kiểm tra tự động:** Mongoose tự động validate data trước khi save. Quy tắc xác thực có thể đơn giản (bắt buộc, độ dài tối thiểu/tối đa) hoặc phức tạp (trình xác thực tùy chỉnh với regex hoặc logic nghiệp vụ). Điều này giúp từ chối dữ liệu không hợp lệ ngay từ tầng ứng dụng, tránh lưu "garbage" vào database.

**An toàn kiểu dữ liệu:** Mỗi field có kiểu dữ liệu cụ thể (String, Number, Date, Boolean, ObjectId, Array, Mixed, Buffer). Mongoose tự động chuyển đổi giá trị sang đúng kiểu, và ném lỗi nếu chuyển đổi thất bại. Điều này giảm đáng kể các lỗi liên quan đến kiểu dữ liệu.

**Tài liệu:** Định nghĩa lược đồ đóng vai trò như tài liệu sống, giúp các nhà phát triển hiểu cấu trúc dữ liệu mà không cần đọc cơ sở dữ liệu hoặc dịch ngược mã.

**C. Relationships và Data Modeling Strategies**

Một trong những quyết định quan trọng nhất khi thiết kế MongoDB schema là chọn giữa embedding và referencing cho relationships.

**Nhúng tài liệu (Embedded Documents):**

Nhúng là kỹ thuật lưu trữ dữ liệu liên quan trực tiếp bên trong tài liệu cha. Chiến lược này phù hợp khi:

- Mối quan hệ là một-nhiều-ít (một cha có ít con)
- Dữ liệu liên quan luôn được truy cập cùng cha
- Dữ liệu liên quan ít thay đổi và không được chia sẻ giữa nhiều cha

**Ưu điểm của embedding:**

- **Hiệu suất cao:** Chỉ cần một truy vấn để lấy toàn bộ dữ liệu liên quan
- **Tính nguyên tử:** Cập nhật là nguyên tử - cập nhật toàn bộ tài liệu một lượt, không có thất bại một phần
- **Đơn giản:** Mã đơn giản hơn, không cần điền đầy hoặc nhiều truy vấn

**Nhược điểm:**

- **Giới hạn kích thước tài liệu:** MongoDB giới hạn kích thước tài liệu ở 16MB
- **Trùng lặp dữ liệu:** Nếu dữ liệu nhúng cần chia sẻ giữa nhiều cha
- **Khó truy vấn:** Khó truy vấn hoặc cập nhật các tài liệu nhúng độc lập

Trong DeepFocus, Tài liệu User nhúng focusProfile và settings vì chúng luôn được tải cùng user, có kích thước nhỏ và là mối quan hệ một-một.

**Tham chiếu tài liệu (Referenced Documents):**

Tham chiếu là kỹ thuật lưu ObjectId của tài liệu liên quan thay vì toàn bộ dữ liệu. Chiến lược này phù hợp khi:

- Mối quan hệ là một-nhiều hoặc nhiều-nhiều
- Các tài liệu liên quan thường được truy cập độc lập
- Dữ liệu liên quan lớn hoặc thay đổi thường xuyên
- Dữ liệu liên quan được chia sẻ giữa nhiều tài liệu

**Ưu điểm của referencing:**

- **Tính linh hoạt:** Không giới hạn số lượng related documents
- **Không trùng lặp:** Mỗi document chỉ tồn tại một lần
- **Truy vấn độc lập:** Dễ query và update riêng từng document
- **Tài liệu cha nhỏ hơn:** Parent document nhẹ hơn

**Nhược điểm:**

- **Nhiều truy vấn:** Cần populate (similar to JOIN) để get full data
- **Chi phí hiệu suất:** Chậm hơn embedded do cần additional lookups
- **Không có tính nguyên tử:** Không thể update parent và referenced documents atomically

Trong DeepFocus, Tasks reference User qua userId vì một user có thể có hàng trăm tasks, và tasks thường được query riêng biệt (filter by priority, due date, completion status).

**D. Indexing cho Tối ưu hóa hiệu suất**

Indexes trong MongoDB hoạt động tương tự như indexes trong sách - giúp tìm kiếm nhanh chóng mà không cần đọc hết toàn bộ. Trong database context, indexes là data structures đặc biệt lưu trữ một tập con của collection data theo cách dễ traverse.

**Các loại indexes:**

**Chỉ mục đơn trường:** Index trên một field duy nhất. MongoDB automatically tạo unique index cho \_id field. Application thường tạo indexes cho các fields hay được query (userId, email, createdAt).

**Chỉ mục kết hợp:** Index trên nhiều fields, hữu ích cho queries filter theo nhiều điều kiện. Thứ tự fields trong compound index quan trọng - index có thể được sử dụng cho queries match prefix của index.

**Chỉ mục văn bản:** Cho phép full-text search trên string fields. Hữu ích cho search functionality trong title và description fields.

**Chỉ mục duy nhất:** Enforce uniqueness constraint, đảm bảo không có hai documents nào có cùng value cho indexed field (ví dụ: email, username).

**Đánh đổi hiệu suất:**

**Lợi ích:**

- Queries nhanh hơn exponentially: O(log n) với index vs O(n) without index
- Sorting operations hiệu quả hơn khi sort field được indexed

**Chi phí:**

- Storage overhead: Indexes chiếm disk space
- Write performance: Insert, update, delete chậm hơn vì phải update indexes
- Maintenance: Too many indexes có thể làm performance worse instead of better

**Chiến lược:** Index các fields frequently queried, nhưng không over-index. Monitor query performance và add indexes based on actual usage patterns.

Trong DeepFocus, các indexes quan trọng:

- userId index trên Tasks collection (most common query)
- Compound index (userId, createdAt) cho pagination
- Compound index (userId, isCompleted) cho filtering
- Chỉ mục văn bản trên (title, description) cho chức năng tìm kiếm
- Chỉ mục duy nhất trên User.email và User.username

**E. Middleware (Hooks) và Business Logic**

Mongoose middleware là các hàm được thực thi tại các điểm cụ thể trong vòng đời của thao tác tài liệu. Chúng cho phép chèn logic tùy chỉnh vào các thao tác tích hợp sẵn như validate, save, remove.

**Trung gian tiền xử lý (Pre-hooks):**

Execute TRƯỚC một operation. Use cases:

- **Chuyển đổi dữ liệu:** Sửa đổi tài liệu trước khi lưu (băm mật khẩu, tạo slug tiêu đề, tạo dấu thời gian)
- **Kiểm tra bổ sung:** Xác thực logic nghiệp vụ vượt ra ngoài ràng buộc lược đồ
- **Ghi log:** Ghi lại ai/khi nào thực hiện thay đổi

Ví dụ trong DeepFocus: Hook trước lưu trên mô hình User băm mật khẩu trước khi lưu vào cơ sở dữ liệu, đảm bảo mật khẩu không bao giờ được lưu trữ dưới dạng văn bản thuần.

**Trung gian hậu xử lý (Post-hooks):**

Execute SAU một operation. Use cases:

- **Thông báo:** Gửi email hoặc thông báo đẩy sau khi dữ liệu thay đổi
- **Ghi log:** Ghi nhật ký các thao tác thành công cho dấu vết kiểm toán
- **Tác dụng phụ:** Cập nhật các tài liệu liên quan hoặc hệ thống bên ngoài

**Các thao tác dây chuyền:**

Một trường hợp sử dụng quan trọng của middleware là triển khai xóa dây chuyền. Khi xóa một tài liệu, middleware tự động xóa tất cả tài liệu liên quan. Ví dụ: Khi xóa User, hook trước xóa xóa tất cả Tasks, Sessions và Achievements của user đó, duy trì tính toàn vẹn tham chiếu.

**F. Virtual Properties**

Thuộc tính ảo là các trường được tính toán không được lưu trữ trong cơ sở dữ liệu nhưng được tính toán ngay lập tức khi truy cập. Chúng hữu ích cho:

**Dữ liệu phái sinh:** Tính toán từ các trường hiện có. Ví dụ: Task.progress = (completedPomodoros / estimatedPomodoros) \* 100. Thay vì lưu trữ tiến độ trong cơ sở dữ liệu (lãng phí không gian và có nguy cơ không nhất quán), tính toán nó khi cần.

**Chuyển đổi dữ liệu:** Định dạng dữ liệu trước khi gửi cho client. Ví dụ: User.fullName = firstName + ' ' + lastName.

**Tối ưu hóa lưu trữ:** Tránh lưu trữ dữ liệu dư thừa có thể được tính toán từ dữ liệu hiện có.

**Xem xét hiệu suất:** Các thuộc tính ảo được tính toán mỗi khi truy cập, vì vậy đối với các tính toán tốn kém, hãy xem xét lưu cache hoặc phi chuẩn hóa.

**G. Query Building và Optimization**

Mongoose cung cấp API trôi chảy để xây dựng và thực thi các truy vấn MongoDB hiệu quả.

**Phương thức truy vấn:** Find, findOne, findById cho truy xuất cơ bản. Các phương thức cập nhật (updateOne, updateMany, findByIdAndUpdate) cho sửa đổi. Các phương thức xóa (deleteOne, deleteMany) cho việc xóa.

**Toán tử truy vấn:** Ngôn ngữ truy vấn MongoDB hỗ trợ bộ toán tử phong phú:

- Comparison: $eq, $gt, $gte, $lt, $lte, $ne, $in, $nin
- Logical: $and, $or, $not, $nor
- Element: $exists, $type
- Array: $all, $elemMatch, $size

**Kỹ thuật tối ưu hóa truy vấn:**

**Truy xuất trường có chọn lọc:** Sử dụng select() để chỉ truy xuất các trường cần thiết thay vì toàn bộ tài liệu. Giảm truyền mạng và sử dụng bộ nhớ đáng kể, đặc biệt cho các tài liệu lớn.

**Truy vấn gọn nhẹ:** Mongoose theo mặc định trả về các tài liệu Mongoose đầy đủ với tất cả các phương thức và getters. Các truy vấn lean trả về các đối tượng JavaScript thuần túy, nhanh hơn và sử dụng ít bộ nhớ hơn. Hữu ích khi chỉ cần đọc dữ liệu mà không sửa đổi.

**Phân trang:** Giới hạn số tài liệu trả về với limit() và skip(). Thiết yếu cho danh sách và bảng có nhiều mục, cải thiện thời gian phản hồi và UX.

**Sắp xếp:** Sắp xếp kết quả hiệu quả khi trường sắp xếp được đánh chỉ mục. Sắp xếp trong bộ nhớ (không có chỉ mục) tốn kém cho tập dữ liệu lớn.

**Điền dữ liệu:** Thay thế các tham chiếu ObjectId bằng các tài liệu thực tế. Hữu ích nhưng có chi phí hiệu suất (truy vấn bổ sung), nên chỉ điền đầy khi thực sự cần và giới hạn các trường được điền đầy.

**Đường ống tổng hợp:** Khung tổng hợp của MongoDB là công cụ mạnh mẽ cho xử lý dữ liệu phức tạp:

- **$match:** Lọc tài liệu (giống như WHERE trong SQL)
- **$group:** Nhóm tài liệu và tính toán tổng hợp (giống như GROUP BY)
- **$project:** Định hình lại tài liệu, bao gồm/loại trừ các trường
- **$sort:** Sort results
- **$limit và $skip:** Pagination
- **$lookup:** Nối với các bộ sưu tập khác (giống như JOIN)

Tổng hợp mạnh mẽ nhưng phức tạp và có thể tốn kém. Sử dụng cho báo cáo, thống kê và phân tích khi truy vấn đơn giản không đủ.

### 2.5.3. Database Schema Design trong DeepFocus

DeepFocus sử dụng 13 mô hình chính, được thiết kế để cân bằng giữa hiệu suất, tính linh hoạt và khả năng bảo trì.

**Các mô hình cốt lõi:**

**User Model:** Thực thể trung tâm lưu thông tin xác thực (tên người dùng, email, mật khẩu đã băm), focusProfile nhúng (level, dailyGoal, work/break durations, stats), cài đặt nhúng (thông báo, âm thanh, rung), và trạng thái tài khoản (isActive, roles).

**Task Model:** Tham chiếu User, chứa chi tiết nhiệm vụ (tiêu đề, mô tả, ưu tiên, ngày đáo hạn), theo dõi Pomodoro (estimatedPomodoros, completedPomodoros, pomodoroSessions array), và completion status.

**Session Model:** Ghi lại các phiên Pomodoro riêng lẻ, tham chiếu cả User và Task, lưu trữ thông tin thời gian (startTime, endTime, duration) và loại phiên (work, shortBreak, longBreak).

**Các mô hình quản lý lớp học:**

**Class Model:** Lưu trữ thông tin lớp học, tham chiếu người tạo (giáo viên), có mảng thành viên nhúng (userId, role, status, joinedAt), joinCode duy nhất với thời hạn và thống kê tổng hợp.

**Các mô hình trò chơi hóa:**

**Achievement Model:** Định nghĩa các thành tích có sẵn với code, name, description, category, difficulty, icon, đối tượng điều kiện và điểm thưởng.

**UserAchievement Model:** Bảng nối liên kết Users với Achievements, lưu trữ dấu thời gian mở khóa và tiến độ.

**Competition Model:** Định nghĩa các cuộc thi với loại (cá nhân/đội), phạm vi (toàn cầu/lớp/riêng tư), phạm vi ngày, mảng người tham gia và bảng xếp hạng.

**Tính năng giám hộ:**

**GuardianLink Model:** Links guardian users với child users, stores approval status và linking timestamp.

**Alert Model:** In-app notifications và alerts, references User, chứa message, type, status, và related object references.

**Reward Model:** Stores rewards và penalties issued by teachers hay guardians, references User and issuer, amount, reason, và status.

**Thông báo đẩy:**

**PushToken Model:** Stores Expo push notification tokens, references User, stores token, platform (iOS/Android/Web), deviceId, và activity status.

**Quyết định thiết kế quan hệ:**

**Quan hệ nhúng:** focusProfile và settings trong User (always accessed together), pomodoroSessions trong Task (bounded, small array), members trong Class (moderate size, frequently accessed with class).

**Quan hệ tham chiếu:** User ← Tasks (one-to-many, unbounded), User ← Sessions (one-to-many, large number), Class ← Users (many-to-many through members array), Achievements ← Users (many-to-many through UserAchievement).

**Các cân nhắc thiết kế:**

**Phi chuẩn hóa:** Some stats (totalSessionsCompleted, totalFocusTime) denormalized trong User.focusProfile cho quick access, updated via middleware khi Sessions change.

**Chiến lược đánh chỉ mục:** Heavy indexes trên userId fields (most common query pattern), compound indexes cho common filters, text indexes cho search features.

**Toàn vẹn dữ liệu:** Middleware ensures cascading deletes và stat updates, schema validation prevents invalid data, unique indexes prevent duplicates.

## 2.6. Hệ thống xác thực và phân quyền

### 2.6.1. Xác thực bằng JSON Web Token (JWT)

**A. Giới thiệu về JWT**

JSON Web Token (JWT) là một open standard (RFC 7519) định nghĩa cách truyền tải thông tin một cách compact và self-contained giữa các parties dưới dạng JSON object. JWT được widely adopted cho authentication trong modern web và mobile applications, đặc biệt trong kiến trúc RESTful APIs và microservices.

**Đặc điểm cốt lõi của JWT:**

**Tự chứa:** Token chứa tất cả thông tin cần thiết về user (user ID, roles, permissions) ngay trong chính nó. Server không cần query database để validate token hay lấy user info - chỉ cần verify token signature.

**Không trạng thái:** Server không cần maintain session state. Điều này critical cho scalability - multiple servers có thể handle requests mà không cần share session storage.

**Nhỏ gọn:** JWT size nhỏ, có thể truyền qua URL, POST parameter, hay HTTP header một cách hiệu quả.

**Bảo mật:** Token được sign bằng secret key (HMAC) hay public/private key pair (RSA, ECDSA), đảm bảo không thể giả mạo.

**B. Cấu trúc JWT**

JWT gồm ba phần separated by dots (.), mỗi phần được Base64Url encoded:

**Phần đầu:** Chứa metadata về token - algorithm sử dụng để sign (ví dụ: HS256, RS256) và token type (JWT). Header giúp server biết cách verify signature.

**Nội dung (Claims):** Chứa dữ liệu thực tế cần truyền tải. Claims có thể là:

- **Claims đã đăng ký:** Các claims được định nghĩa sẵn như iss (issuer), exp (expiration time), sub (subject), aud (audience), iat (issued at)
- **Claims công khai:** Các claims tùy chỉnh được định nghĩa công khai để avoid collisions
- **Claims riêng tư:** Các claims tùy chỉnh được thỏa thuận giữa các bên

Trong DeepFocus, payload chứa userId và email, cùng với thời gian hết hạn để bắt buộc token hết hiệu lực.

**Chữ ký:** Tạo bằng cách hash (header + payload) với secret key. Chữ ký đảm bảo:

- Token không bị sửa đổi (tính toàn vẹn)
- Token được phát hành bởi máy chủ hợp pháp (tính xác thực)

Nếu ai đó cố gắng sửa đổi payload, chữ ký sẽ không hợp lệ vì họ không có khóa bí mật để ký lại.

**C. Luồng xác thực JWT**

**Quy trình đăng nhập:**

1. User gửi thông tin xác thực (email + mật khẩu) lên server
2. Server xác minh thông tin xác thực bằng cách:
   - Truy vấn người dùng từ cơ sở dữ liệu theo email
   - Mã hóa mật khẩu được cung cấp và so sánh với mật khẩu đã được mã hóa lưu trữ
3. Nếu thông tin xác thực hợp lệ, server tạo JWT:
   - Tạo payload với userId, email, và expiration time
   - Ký payload với khóa bí mật
   - Trả JWT về client
4. Client lưu JWT (trong AsyncStorage cho ứng dụng React Native)

**Các yêu cầu đã xác thực:**

1. Client đính kèm JWT vào header Authorization của mọi yêu cầu API
   - Format: "Authorization: Bearer <token>"
2. Server trích xuất và xác minh JWT:
   - Phân tích header để lấy token
   - Xác minh chữ ký bằng khóa bí mật
   - Kiểm tra thời gian hết hạn
3. Nếu token hợp lệ, trích xuất userId từ payload
4. Query user từ database by userId
5. Đính kèm đối tượng user vào đối tượng request (req.user)
6. Tiếp tục với logic nghiệp vụ

**D. JWT vs Session-based Authentication**

**Xác thực dựa trên phiên (cách tiếp cận truyền thống):**

Khi user login, server tạo đối tượng phiên lưu trữ thông tin người dùng và lưu trữ trong bộ nhớ máy chủ hoặc cơ sở dữ liệu (Redis). Session ID được gửi về client dưới dạng cookie. Mỗi request, client send session ID, server tra cứu phiên để xác định người dùng.

**Nhược điểm:**

- **Stateful:** Server phải maintain session state, difficult to scale horizontally
- **Storage overhead:** Need Redis hay database để store sessions
- **Cross-domain issues:** Cookies have security restrictions với cross-domain requests

**Cách tiếp cận JWT:**

Token self-contained, server stateless. No session storage needed.

**Ưu điểm:**

- **Khả năng mở rộng:** Any server có thể validate token mà không cần shared session store
- **Tính linh hoạt:** Works well với mobile apps (cookies problematic), microservices, và cross-domain requests
- **Performance:** No database lookup để validate token (chỉ cryptographic verification)

**Nhược điểm:**

- **Cannot revoke before expiration:** Once issued, token hợp lệ cho đến khi expire. Logout chỉ delete token ở client-side, but token still valid nếu attacker có được
- **Token size:** Larger than session IDs, transferred trong mọi requests
- **Bảo mật:** Nếu secret key leaked, all tokens compromised

**Các chiến lược giảm thiểu:**

- Short expiration times (7 days trong DeepFocus)
- Secure secret key storage (environment variables, secrets management)
- HTTPS để prevent token interception
- Refresh token mechanism cho better security (advanced)

**E. JWT Các thực hành bảo mật tốt nhất trong DeepFocus**

**Quản lý khóa bí mật:** JWT secret key never hardcoded trong source code. Stored trong environment variables (.env file), never committed to version control. For production, use secure secrets management service.

**Thời gian hết hạn token:** Tokens có expiration time (7 days). Trade-off giữa security (short) và UX (long). 7 days reasonable cho mobile apps where re-login annoying.

**Bắt buộc HTTPS:** Production API must use HTTPS để prevent man-in-the-middle attacks stealing tokens.

**Kiểm tra đầu vào:** Server always validate token format, check Bearer prefix, handle malformed tokens gracefully.

**Xử lý lỗi:** Don't leak sensitive info trong error messages. Generic "Invalid token" hay "Unauthorized" messages.

### 2.6.2. Kiểm soát truy cập dựa trên vai trò (RBAC)

**A. Khái niệm RBAC**

Role-Based Access Control là security paradigm trong đó access rights granted based on roles rather than individual users. Users được assign roles, và roles được grant permissions. Điều này simplify management khi có nhiều users và permissions.

**Các thành phần RBAC:**

**Người dùng:** Individual entities using the system

**Vai trò:** Chức năng công việc hoặc trách nhiệm (Student, Teacher, Guardian trong DeepFocus)

**Quyền hạn:** Quyền truy cập cụ thể đến tài nguyên hoặc thao tác

**Ánh xạ vai trò-quyền:** Định nghĩa những gì mỗi vai trò có thể làm

**Gán vai trò cho người dùng:** Gán vai trò cho người dùng

**B. Multi-Role System trong DeepFocus**

Điểm độc đáo của DeepFocus là hỗ trợ hệ thống đa vai trò - một người dùng có thể có nhiều vai trò đồng thời. Ví dụ: một người có thể vừa là student (học), vừa là teacher (dạy ở trường khác), vừa là guardian (có con nhỏ).

**Roles trong DeepFocus:**

**Vai trò học sinh:** Tập trung vào học tập và năng suất cá nhân

- Permissions: Sử dụng đồng hồ Pomodoro, quản lý nhiệm vụ cá nhân, tham gia lớp học, xem thống kê của mình, đạt thành tích, tham gia thi đấu

**Vai trò giáo viên:** Tập trung vào giảng dạy và giám sát học sinh

- Permissions: Tạo và quản lý lớp học, xem thành viên lớp, phê duyệt yêu cầu tham gia, xem thống kê lớp và bảng xếp hạng, gán phần thưởng/hình phạt

**Vai trò giám hộ:** Tập trung vào giám sát con cái

- Permissions: Liên kết với tài khoản con (với sự chấp thuận của con), xem tiến độ và thống kê của con, nhận thông báo về hoạt động của con, gửi lời động viên

**C. Role Model và Database Design**

Thông tin vai trò được lưu trữ trong bộ sưu tập Role riêng biệt thay vì nhúng vào User. Rationale:

**Tính linh hoạt:** Người dùng có thể thêm/xóa vai trò một cách linh hoạt mà không sửa đổi cấu trúc tài liệu User.

**Quản lý độc lập:** Các vai trò có vòng đời riêng - có thể được kích hoạt/vô hiệu hóa độc lập.

**Hồ sơ theo vai trò:** Mỗi vai trò có thể có dữ liệu hồ sơ riêng biệt. Ví dụ: Hồ sơ Giáo viên có thông tin trường học, hồ sơ Giám hộ có danh sách con cái.

Role model schema:

- tham chiếu userId (người dùng nào)
- type (student/teacher/guardian)
- cờ isPrimary (vai trò hoạt động mặc định)
- cờ isActive (được bật/tắt)
- đối tượng profile (dữ liệu cụ thể theo vai trò)
- Timestamps

**Ràng buộc duy nhất:** Chỉ mục kép trên (userId, type) đảm bảo người dùng không thể có vai trò trùng lặp cùng loại.

**D. Role Middleware và Access Control**

**Trung gian xác thực:** Xác minh JWT và đính kèm đối tượng người dùng vào yêu cầu.

**Trung gian phân quyền:** Kiểm tra xem vai trò hiện tại của người dùng có quyền cho thao tác được yêu cầu không.

Implementation approach:

- Định nghĩa yêu cầu vai trò cho mỗi route (những vai trò nào được phép)
- Middleware kiểm tra vai trò hoạt động hiện tại của người dùng
- Nếu vai trò được phép, tiếp tục; nếu không trả về 403 Forbidden

**Thiết kế ma trận quyền:**

Thay vì quyền hạn chi tiết, DeepFocus sử dụng quyền hạn dựa trên vai trò trong đó mỗi vai trò có tập hợp các thao tác được phép đã định nghĩa sẵn. Đơn giản hơn để triển khai và bảo trì cho ứng dụng quy mô trung bình.

Examples:

- Route POST /classes yêu cầu vai trò Giáo viên
- POST /classes/:id/join yêu cầu vai trò Học sinh
- GET /guardian/children/:id/progress yêu cầu vai trò Giám hộ với con được liên kết

**E. Role Switching Mechanism**

Người dùng với nhiều vai trò có thể chuyển đổi giữa các vai trò trong ứng dụng. Vai trò hoạt động hiện tại được lưu trữ trong:

- Trạng thái Frontend (Context API)
- Backend xác định từ hệ thống vai trò khi người dùng thực hiện yêu cầu

Benefits:

- Clear separation of concerns
- UI/UX khác nhau cho mỗi vai trò
- Ngăn chặn nhầm lẫn quyền hạn (người dùng luôn hoạt động trong bối cảnh của vai trò cụ thể)

Implementation:

- Role selection screen khi user có multiple roles
- API để switch active role
- Frontend adapts UI based on active role
- Backend validates permissions based on active role

**F. Security Considerations**

**Ngăn chặn leo thang đặc quyền:** Users cannot grant themselves roles. Roles must be explicitly assigned:

- Student role: Self-registration
- Teacher role: Self-registration
- Guardian role: Self-registration plus child approval

**Leo thang đặc quyền ngang:** Users cannot access resources của other users, even with same role. Middleware always checks resource ownership before allowing access.

**Phân cấp vai trò:** No hierarchy trong DeepFocus (all roles equal). Different approach would be hierarchical RBAC where higher roles inherit lower roles' permissions.

## 2.7. Mô hình thiết kế và kiến trúc hệ thống

### 2.7.1. Kiến trúc tổng quan - 3 tầng Client-Server

DeepFocus áp dụng kiến trúc three-tier architecture, một mô hình phổ biến trong phát triển ứng dụng web và mobile hiện đại. Kiến trúc này tách ứng dụng thành ba logical layers độc lập, mỗi layer có responsibilities riêng biệt.

**Tầng trình diễn (Lớp Client):**

Layer này là React Native mobile application, responsible cho:

- **Giao diện người dùng:** Render UI components, handle user interactions
- **Logic trình diễn:** Format và validate data trước khi display hay submit
- **Quản lý trạng thái:** Maintain application state với Context API
- **Giao tiếp API:** Make HTTP requests tới backend

Separation này allows UI changes without affecting business logic hay database.

**Tầng logic nghiệp vụ (Lớp ứng dụng):**

Layer này là Node.js/Express backend server, responsible cho:

- **Quy tắc nghiệp vụ:** Implement application logic (ví dụ: calculate pomodoro progress, determine achievements earned)
- **Xử lý yêu cầu:** Handle incoming yêu cầu API, validate inputs
- **Xác thực/Phân quyền:** Verify users và check permissions
- **Chuyển đổi dữ liệu:** Convert data between formats khi needed
- **Tích hợp bên ngoài:** Interact với third-party services (push notifications, email)

Separation này centralizes business logic, making it reusable và easier to maintain.

**Tầng dữ liệu (Lớp lưu trữ):**

Layer này là MongoDB database, responsible cho:

- **Lưu trữ dữ liệu:** Persist application data durably
- **Truy xuất dữ liệu:** Execute queries efficiently
- **Toàn vẹn dữ liệu:** Enforce constraints và indexes
- **Giao dịch:** Handle concurrent access safely

Separation này allows database changes (schema, technology) without affecting application logic.

**Benefits của 3-tier architecture:**

**Tính mô-đun:** Mỗi tier có thể developed, tested, và deployed independently.

**Khả năng bảo trì:** Changes trong một tier ít impact other tiers. Bug fixes và enhancements easier.

**Khả năng mở rộng:** Mỗi tier có thể scaled independently. Có thể add more API servers mà không touch database hay client.

**Khả năng tái sử dụng:** Business logic trong middle tier có thể reused bởi multiple clients (mobile app, web app, desktop app).

**Bảo mật:** Các thao tác nhạy cảm (xác thực, phân quyền, xác thực dữ liệu) được tập trung trong máy chủ, không phơi bày cho client.

### 2.7.2. Các mẫu thiết kế được áp dụng

Các mẫu thiết kế là các giải pháp có thể tái sử dụng cho các vấn đề phổ biến trong thiết kế phần mềm. DeepFocus áp dụng nhiều mẫu đã được chứng minh.

**A. Mẫu thiết kế Model-View-Controller (MVC)**

MVC là mẫu kiến trúc tách ứng dụng thành ba thành phần kết nối với nhau:

**Model (Mô hình):** Đại diện cho dữ liệu và logic nghiệp vụ. Trong DeepFocus, Các mô hình Mongoose (User, Task, Session) là Models. Chúng định nghĩa cấu trúc dữ liệu, quy tắc xác thực và các thao tác cơ sở dữ liệu.

**View (Giao diện):** Trình bày dữ liệu cho người dùng. Trong ngữ cảnh di động, các thành phần React Native là Views. Chúng render giao diện dựa trên dữ liệu từ Models.

**Controller (Bộ điều khiển):** Xử lý đầu vào của người dùng và cập nhật Models. Trong backend, Các trình xử lý route Express và controllers đóng vai trò Controllers. Chúng xử lý yêu cầu, gọi Models để thao tác dữ liệu và trả về phản hồi.

**Luồng:** User interaction → Controller → Model (update data) → View (render updated data)

**Lợi ích:**

- **Tách biệt các mối quan tâm:** Logic trình bày tách khỏi logic nghiệp vụ
- **Khả năng kiểm thử:** Mỗi thành phần có thể được kiểm thử độc lập
- **Phát triển song song:** Nhiều nhà phát triển có thể làm việc trên các thành phần khác nhau đồng thời

**B. Mẫu thiết kế Repository**

Mẫu Repository trừu tượng hóa logic truy cập dữ liệu, cung cấp giao diện giống bộ sưu tập để truy cập các đối tượng miền. Thay vì controllers gọi trực tiếp các mô hình Mongoose, repositories cung cấp API sạch.

**Lợi ích:**

- **Trừu tượng hóa:** Controllers không cần biết chi tiết triển khai cơ sở dữ liệu
- **Khả năng kiểm thử:** Dễ dàng mock repositories trong kiểm thử đơn vị
- **Tính linh hoạt:** Có thể chuyển đổi công nghệ cơ sở dữ liệu mà không thay đổi mã controller
- **Tập trung hóa:** Logic truy cập dữ liệu được tập trung, dễ bảo trì và tối ưu hóa

**Cách triển khai:** Các lớp Repository với các phương thức như findById, findByUserId, create, update, delete. Controllers sử dụng repositories thay vì gọi trực tiếp các phương thức Model.

**C. Mẫu thiết kế Middleware**

Mẫu Middleware (trong ngữ cảnh Express) là một chuỗi các hàm được thực thi tuần tự, mỗi hàm có thể sửa đổi các đối tượng request/response hoặc kết thúc chu trình request-response.

**Common middleware trong DeepFocus:**

**Trung gian CORS:** Xử lý Chia sẻ Tài nguyên Giữa các Nguồn, cho phép frontend (nguồn khác) gọi API backend.

**Trung gian phân tích body:** Phân tích các thân yêu cầu đến (JSON, URL-encoded) và đính kèm dữ liệu đã phân tích vào req.body.

**Trung gian xác thực:** Xác minh JWT tokens và đính kèm đối tượng người dùng vào req.user.

**Trung gian ghi log:** Ghi nhật ký chi tiết yêu cầu (phương thức, đường dẫn, dấu thời gian) cho gỡ lỗi và giám sát.

**Trung gian xử lý lỗi:** Bắt các lỗi được ném từ trình xử lý route và trả về phản hồi lỗi thích hợp.

**Lợi ích:**

- **Khả năng tái sử dụng:** Middleware có thể được tái sử dụng trên nhiều route
- **Tính mô-đun:** Mỗi middleware xử lý một mối quan tâm (xác thực, ghi nhật ký, v.v.)
- **Khả năng kết hợp:** Middleware có thể được kết hợp để tạo các đường ống xử lý phức tạp

**D. Mẫu thiết kế Context API (Quản lý trạng thái Frontend)**

Context API là mẫu React để tránh truyền props qua nhiều tầng và quản lý trạng thái toàn cục.

**Mẫu Provider-Consumer:**

**Provider (Nhà cung cấp):** Thành phần bao bọc cây con ứng dụng và cung cấp giá trị (trạng thái + hàm) cho tất cả con cháu.

**Consumer (Người tiêu dùng):** Các thành phần truy cập giá trị được cung cấp bằng useContext hook, đăng ký các thay đổi.

**Lợi ích:**

- **Tránh truyền props qua nhiều tầng:** Không cần truyền props qua mỗi thành phần trung gian
- **Trạng thái tập trung:** Trạng thái toàn cục như user, tasks, settings được quản lý tập trung
- **Tính phản ứng:** Các thành phần tự động render lại khi giá trị context thay đổi

**Phân cấp context trong DeepFocus:**

Nhiều provider lồng nhau, mỗi provider quản lý trạng thái liên quan:

- AuthProvider: Trạng thái xác thực (user, token, hàm login/logout)
- RoleProvider: Quản lý vai trò (vai trò hiện tại, chuyển đổi vai trò)
- TaskProvider: Quản lý nhiệm vụ (mảng tasks, thao tác CRUD)
- PomodoroProvider: Trạng thái bộ đếm (thời gian còn lại, điều khiển bộ đếm)
- ClassProvider, AchievementProvider, v.v.

Cấu trúc lồng nhau cho phép các provider con truy cập trạng thái provider cha (ví dụ: TaskProvider sử dụng user của AuthProvider).

**E. Mẫu thiết kế Singleton**

Singleton đảm bảo một lớp chỉ có một thể hiện duy nhất và cung cấp điểm truy cập toàn cục cho nó.

**Implementation trong DeepFocus:**

**Kết nối cơ sở dữ liệu:** Kết nối MongoDB là singleton. Lần thử kết nối đầu tiên thiết lập kết nối, các lần gọi tiếp theo trả về kết nối hiện có. Ngăn chặn nhiều kết nối lãng phí tài nguyên.

**Lợi ích:**

- **Tối ưu hóa tài nguyên:** Tái sử dụng các tài nguyên tốn kém (kết nối cơ sở dữ liệu, đối tượng cấu hình)
- **Tính nhất quán:** Tất cả các phần của ứng dụng sử dụng cùng một thể hiện
- **Khởi tạo trễ:** Thể hiện chỉ được tạo khi cần lần đầu

## 2.8. Các thực hành tốt nhất và tiêu chuẩn lập trình

### 2.8.1. Tổ chức mã nguồn và cấu trúc dự án

**A. Nguyên tắc tổ chức code**

**Tách biệt các mối quan tâm:** Mỗi file/module/component có one clear responsibility. Không mix business logic với UI logic, data access với presentation.

**DRY (Đừng lặp lại chính mình):** Extract common code into reusable functions, components, hay utilities. Avoid copy-pasting code.

**Nguyên tắc trách nhiệm đơn:** Mỗi function/class should do one thing và do it well. Long functions should be broken down into smaller, focused functions.

**Quy ước đặt tên nhất quán:**

- camelCase cho variables và functions (getUserById, totalCount)
- PascalCase cho classes và React components (UserService, TaskList)
- UPPER_SNAKE_CASE cho constants (MAX_RETRY_COUNT, API_BASE_URL)

**B. Backend project structure**

Organized theo functional areas:

**server.js:** Application entry point, initializes server và middleware, connects database

**config/:** Configuration files (database connection, external services setup)

**models/:** Mongoose schemas và models, data structure definitions

**controllers/:** Request handlers với business logic, process requests và return responses

**routes/:** API route definitions, map URLs to controllers

**middleware/:** Custom middleware functions (authentication, error handling, validation)

**services/:** Business logic services (notification service, PDF generation, email sending)

**utils/:** Helper functions và utilities (validators, formatters, constants)

**tests/:** Test suites (unit tests, integration tests)

Structure này promotes modularity - easy to locate code và understand application flow.

**C. Frontend project structure**

Organized theo feature areas:

**app/:** Expo Router screens, file-based routing structure

**src/components/:** Các thành phần UI có thể tái sử dụng (Button, Card, TaskItem)

**src/contexts/:** Các provider Context cho trạng thái toàn cục

**src/screens/:** Các thành phần màn hình (trang đầy đủ)

**src/services/:** Các client API và tích hợp dịch vụ bên ngoài

**src/utils/:** Các hàm trợ giúp, bộ định dạng, hằng số

**src/hooks/:** Các hook React tùy chỉnh

**src/config/:** Cấu hình ứng dụng (giao diện, hằng số, cài đặt)

**assets/:** Các tệp tĩnh (hình ảnh, phông chữ, biểu tượng)

### 2.8.2. Các chiến lược xử lý lỗi

**A. Defensive programming**

**Kiểm tra đầu vào:** Luôn xác thực đầu vào của người dùng trước khi xử lý. Không bao giờ tin tưởng hoàn toàn vào xác thực phía client - luôn xác thực trên máy chủ.

**Khối try-catch:** Bao bọc các thao tác có thể thất bại (truy vấn cơ sở dữ liệu, lời gọi API, thao tác tệp) trong try-catch để xử lý lỗi một cách duyên dáng.

**Kiểm tra giá trị null:** Kiểm tra các giá trị null/undefined trước khi truy cập thuộc tính để tránh "Cannot read property of undefined" errors.

**B. Error handling levels**

**Cấp độ ứng dụng:** Trình xử lý lỗi toàn cục bắt các lỗi chưa được xử lý, ghi nhật ký chúng và trả về phản hồi lỗi chung cho client.

**Cấp độ route:** Mỗi trình xử lý route có try-catch, xử lý lỗi cụ thể cho các lỗi logic nghiệp vụ.

**Cấp độ kiểm tra:** Middleware xác thực đầu vào bắt dữ liệu không hợp lệ sớm, trước khi đến logic nghiệp vụ.

**C. Error response format**

Consistent error response structure:

- success: false (cho biết lỗi)
- message: Mô tả lỗi có thể đọc được bởi con người
- error: Chi tiết lỗi kỹ thuật (chỉ trong chế độ phát triển)
- status code: Mã trạng thái HTTP thích hợp (400 yêu cầu không hợp lệ, 401 không được phép, 404 không tìm thấy, 500 lỗi máy chủ)

### 2.8.3. Các thực hành bảo mật tốt nhất

**A. Authentication và authorization**

**Không bao giờ lưu mật khẩu dạng văn bản thuần:** Luôn mã hóa mật khẩu với thuật toán băm mạnh (bcrypt với salt).

**Biến môi trường:** Lưu trữ dữ liệu nhạy cảm (JWT secret, thông tin xác thực cơ sở dữ liệu, API keys) trong biến môi trường, không bao giờ trong mã nguồn.

**Truyền token an toàn:** Luôn sử dụng HTTPS để ngăn chặn việc chặn token. Không bao giờ gửi token trong URL.

**Thời gian hết hạn token:** Triển khai thời gian hết hạn token để hạn chế thiệt hại nếu token bị xâm phạm.

**Làm sạch đầu vào:** Làm sạch đầu vào của người dùng để ngăn chặn các cuộc tấn công injection (SQL injection, NoSQL injection, XSS).

**B. Data validation**

**Cách tiếp cận danh sách trắng:** Định nghĩa các đầu vào được phép thay vì cố gắng đưa vào danh sách đen các đầu vào nguy hiểm.

**Kiểm tra kiểu:** Xác thực các kiểu dữ liệu khớp với kỳ vọng.

**Kiểm tra phạm vi:** Kiểm tra các giá trị số trong phạm vi chấp nhận được.

**Kiểm tra định dạng:** Sử dụng regex để xác thực các định dạng (email, số điện thoại, URL).

**Kiểm tra lược đồ:** Sử dụng xác thực lược đồ Mongoose hoặc thư viện như Joi cho các quy tắc xác thực phức tạp.

### 2.8.4. Tối ưu hóa hiệu suất

**A. Database optimization**

**Đánh chỉ mục:** Tạo chỉ mục trên các trường thường xuyên được truy vấn để tăng tốc truy vấn.

**Tối ưu hóa truy vấn:** Chỉ chọn các trường cần thiết thay vì toàn bộ tài liệu. Sử dụng truy vấn lean khi không cần tính năng tài liệu Mongoose.

**Phân trang:** Giới hạn kết quả với phân trang thay vì trả về hàng nghìn tài liệu.

**Lưu cache:** Lưu cache dữ liệu được truy cập thường xuyên (hồ sơ người dùng, cài đặt) trong bộ nhớ hoặc Redis để giảm số lần truy cập cơ sở dữ liệu.

**B. Frontend optimization**

**Tách mã:** Tải chậm các thành phần và màn hình để giảm kích thước gói ban đầu.

**Ghi nhớ:** Sử dụng useMemo và useCallback để ngăn chặn việc render lại và tính toán lại không cần thiết.

**Danh sách ảo:** Sử dụng FlatList với tối ưu hóa windowSize cho danh sách dài để chỉ render các mục hiển thị.

**Tối ưu hóa hình ảnh:** Nén hình ảnh, sử dụng định dạng phù hợp, tải chậm hình ảnh.

**Tối ưu hóa mạng:** Gộp các yêu cầu API khi có thể, triển khai hủy yêu cầu, lưu cache phản hồi API.

### 2.8.5. Các chiến lược kiểm thử

**A. Testing pyramid**

**Kiểm thử đơn vị:** Kiểm thử các hàm riêng lẻ và thành phần trong môi trường cô lập. Nhanh, nhiều, dễ bảo trì. DeepFocus có 348 bài kiểm thử đơn vị backend.

**Kiểm thử tích hợp:** Kiểm thử cách nhiều đơn vị hoạt động cùng nhau (điểm cuối API, thao tác cơ sở dữ liệu). Chậm hơn kiểm thử đơn vị nhưng kiểm thử các tình huống thực tế.

**Kiểm thử đầu-cuối:** Kiểm thử toàn bộ luồng người dùng từ UI qua backend đến cơ sở dữ liệu. Chậm nhưng bắt được các vấn đề tích hợp.

**B. Test coverage goals**

**Các đường dẫn quan trọng:** 100% phủ sóng cho xác thực, phân quyền, xử lý thanh toán.

**Logic nghiệp vụ:** Phủ sóng cao (80%+) cho controllers và services.

**Hàm tiện ích:** 100% phủ sóng cho các hàm thuần túy và hàm trợ giúp.

**Thành phần UI:** Phủ sóng vừa phải cho các thành phần trình bày, tập trung vào các thành phần có nhiều logic.

**C. Continuous testing**

**Hook trước commit:** Chạy linters và formatters trước khi commit.

**Đường ống CI/CD:** Tự động chạy tests khi đẩy mã. Chặn việc hợp nhất nếu tests thất bại.

**Tự động hóa kiểm thử:** Các bài kiểm thử tự động chạy thường xuyên, bắt được các hồi quy sớm.

### 2.8.6. Chất lượng mã nguồn và bảo trì

**A. Code review practices**

**Xem xét ngang hàng:** Tất cả các thay đổi mã được xem xét bởi ít nhất một nhà phát triển khác.

**Danh sách kiểm tra:** Kiểm tra các lỗi logic, vấn đề bảo mật, vấn đề hiệu suất, tính nhất quán của phong cách mã.

**Tài liệu:** Xem xét kiểm tra các bình luận và tài liệu đầy đủ.

**B. Documentation standards**

**Bình luận mã:** Giải thích TẠI SAO, không phải CÁI GÌ. Logic phức tạp nên có các bình luận giải thích.

**Tài liệu hàm:** Bình luận JSDoc cho các hàm với tham số, giá trị trả về và ví dụ sử dụng.

**Tài liệu API:** Tài liệu hóa tất cả các điểm cuối API với định dạng yêu cầu/phản hồi, yêu cầu xác thực, mã lỗi.

**File README:** Tổng quan dự án, hướng dẫn cài đặt, hướng dẫn sử dụng.

**C. Version control practices**

**Chiến lược nhánh:** Sử dụng các nhánh tính năng cho phát triển mới, nhánh chính luôn ổn định.

**Thông điệp commit:** Thông điệp commit rõ ràng, mô tả theo quy ước (feat:, fix:, docs:, refactor:, test:).

**Yêu cầu kéo:** Sử dụng PRs cho xem xét mã và thảo luận trước khi hợp nhất.

**Phiên bản ngữ nghĩa:** Số phiên bản tuân theo semver (MAJOR.MINOR.PATCH).

---

**[KẾT THÚC CHƯƠNG 2 - CƠ SỞ LÝ THUYẾT]**

_Tổng số trang Chương 2: ~20 trang_
_Đã tập trung vào lý thuyết, giải thích khái niệm và phân tích thay vì code chi tiết_

---

## TÀI LIỆU THAM KHẢO (Một phần - dành cho Chương 1 và 2)[1] Mark, G., Iqbal, S. T., & Czerwinski, M. (2018). "How blocking distractions affects workplace focus and productivity". _Proceedings of the 2018 CHI Conference on Human Factors in Computing Systems_, pp. 1-12.

[2] Cirillo, F. (2006). _The Pomodoro Technique_. FC Garage, Berlin.

[3] Demerouti, E., Bakker, A. B., Sonnentag, S., & Fullagar, C. J. (2012). "Work-related flow and energy at work and at home: A study on the role of daily recovery". _Journal of Organizational Behavior_, 33(2), 276-295.

[4] Jalil, N. A., et al. (2015). "The Pomodoro Technique as a Tool for Improving Student Concentration". _International Journal of Education and Research_, 3(11), 123-134.

[5] Ariga, A., & Lleras, A. (2011). "Brief and rare mental 'breaks' keep you focused: Deactivation and reactivation of task goals preempt vigilance decrements". _Cognition_, 118(3), 439-443.

[6] Forest App. (2016). _Forest: Stay focused_. Seekrtech. Available at: https://www.forestapp.cc/

[7] Focus@Will. (2018). _Focus@Will: Music for Productivity_. Available at: https://www.focusatwill.com/

[8] Toggl Track. (2021). _Toggl Track: Time Tracking Software_. Available at: https://toggl.com/track/

[9] Be Focused. (2020). _Be Focused - Focus Timer_. Denys Ievenko. Available at: App Store.

[10] Software Mansion & Callstack. (2023). _State of React Native 2023_. Available at: https://stateofreactnative.com/

[11] Expo Team. (2023). _Expo Documentation_. Available at: https://docs.expo.dev/

[12] MongoDB Inc. (2023). _MongoDB Manual_. Available at: https://docs.mongodb.com/manual/

