---

# CHƯƠNG 1. TỔNG QUAN

## 1.1. Giới thiệu đề tài

Trong kỷ nguyên số hóa hiện nay, việc duy trì sự tập trung và quản lý thời gian hiệu quả đã trở thành một thách thức lớn, đặc biệt đối với sinh viên và người học. Sự phân tán chú ý do các thiết bị thông minh, mạng xã hội và môi trường học tập đa nhiệm đã ảnh hưởng nghiêm trọng đến năng suất học tập. Theo nghiên cứu của Gloria Mark và cộng sự (2018), người dùng máy tính chuyển đổi nhiệm vụ trung bình mỗi 3 phút, gây giảm 40% năng suất làm việc [1].

Kỹ thuật Pomodoro, được phát triển bởi Francesco Cirillo vào cuối những năm 1980, đã được chứng minh là một phương pháp quản lý thời gian hiệu quả, giúp tăng cường khả năng tập trung và năng suất [2]. Phương pháp này chia công việc thành các khoảng thời gian 25 phút (gọi là "pomodoro"), xen kẽ với các khoảng nghỉ ngắn 5 phút. Nghiên cứu của Demerouti và cộng sự (2012) cho thấy việc xen kẽ giữa làm việc và nghỉ ngơi có thể cải thiện hiệu suất nhận thức lên đến 25% [3].

Tuy nhiên, các ứng dụng Pomodoro hiện có trên thị trường chủ yếu tập trung vào chức năng đếm giờ đơn thuần, thiếu sự tích hợp với quản lý nhiệm vụ, theo dõi tiến độ và hệ thống động lực (gamification). Hơn nữa, trong bối cảnh giáo dục, việc thiếu các tính năng hỗ trợ giáo viên theo dõi học sinh và phụ huynh giám sát con em làm hạn chế hiệu quả của các công cụ này.

**DeepFocus** được phát triển như một giải pháp toàn diện, kết hợp kỹ thuật Pomodoro với hệ thống quản lý nhiệm vụ, theo dõi tiến độ, gamification và hỗ trợ đa vai trò (sinh viên, giáo viên, phụ huynh). Ứng dụng được xây dựng trên nền tảng React Native và Expo, cho phép triển khai đồng thời trên iOS, Android và Web, với backend Node.js/Express và cơ sở dữ liệu MongoDB đảm bảo hiệu năng và khả năng mở rộng.

Đồ án này trình bày quá trình nghiên cứu, thiết kế và triển khai hệ thống DeepFocus, từ phân tích yêu cầu, lựa chọn công nghệ, thiết kế kiến trúc đến cài đặt và kiểm thử. Kết quả đạt được là một ứng dụng hoàn chỉnh với 88.5% tính năng đã được triển khai, 348 test cases backend đạt 100% pass rate, và giao diện người dùng thân thiện trên đa nền tảng.

## 1.2. Tình hình nghiên cứu liên quan

### 1.2.1. Nghiên cứu về kỹ thuật Pomodoro và quản lý thời gian

Kỹ thuật Pomodoro đã được nghiên cứu rộng rãi trong lĩnh vực tâm lý học nhận thức và quản lý năng suất. Cirillo (2006) trong cuốn "The Pomodoro Technique" đã trình bày chi tiết về phương pháp và các nguyên tắc cốt lõi: chia nhỏ công việc, loại bỏ gián đoạn, và xen kẽ nghỉ ngơi [2]. Nghiên cứu của Jalil và cộng sự (2015) cho thấy 78% sinh viên sử dụng kỹ thuật Pomodoro có cải thiện đáng kể về mức độ tập trung và hoàn thành nhiệm vụ đúng hạn [4].

Về mặt sinh lý học, nghiên cứu của Ariga và Lleras (2011) chứng minh rằng việc nghỉ ngơi ngắn giúp "tái tạo" khả năng tập trung của não bộ, tương tự như cơ chế "habituation" trong tâm lý học nhận thức [5]. Điều này giải thích vì sao các khoảng nghỉ 5 phút trong Pomodoro lại hiệu quả trong việc duy trì hiệu suất cao trong thời gian dài.

### 1.2.2. Các ứng dụng Pomodoro hiện có

Trên thị trường hiện có nhiều ứng dụng Pomodoro phổ biến:

- **Forest** (2016): Ứng dụng kết hợp Pomodoro với gamification, người dùng "trồng cây ảo" khi tập trung. Tuy nhiên, ứng dụng này thiếu tính năng quản lý nhiệm vụ tích hợp và hỗ trợ lớp học [6].

- **Focus@Will** (2018): Tập trung vào âm nhạc nâng cao sự tập trung, nhưng không có timer Pomodoro đầy đủ và thiếu hệ thống theo dõi tiến độ chi tiết [7].

- **Toggl Track** (2021): Công cụ theo dõi thời gian mạnh mẽ cho doanh nghiệp nhưng phức tạp và không phù hợp với sinh viên, thiếu gamification [8].

- **Be Focused** (2020): Ứng dụng Pomodoro đơn giản cho iOS/Mac, nhưng không có hỗ trợ đa nền tảng và thiếu tính năng collaborative learning [9].

**Hạn chế chung:** Các ứng dụng hiện có thường tách biệt các tính năng: timer Pomodoro ở một ứng dụng, quản lý task ở ứng dụng khác, theo dõi tiến độ ở nơi thứ ba. Không có giải pháp nào tích hợp toàn diện cho môi trường giáo dục với hỗ trợ vai trò giáo viên và phụ huynh.

### 1.2.3. Công nghệ phát triển ứng dụng di động đa nền tảng

React Native, được Facebook phát triển từ 2015, đã trở thành framework hàng đầu cho phát triển cross-platform mobile apps. Theo State of React Native 2023, 42% developers chọn React Native cho khả năng tái sử dụng code cao (80-90% giữa iOS và Android) [10]. Expo framework (2016) mở rộng React Native với bộ công cụ và dịch vụ giúp đơn giản hóa quy trình phát triển, testing và deployment [11].

Về backend, kiến trúc RESTful API với Node.js/Express đã trở thành chuẩn mực trong ngành. MongoDB, là cơ sở dữ liệu NoSQL linh hoạt, phù hợp với các ứng dụng có cấu trúc dữ liệu đa dạng và yêu cầu scale nhanh [12]. Nghiên cứu của MongoDB Inc. (2022) cho thấy MongoDB có hiệu năng vượt trội cho các tác vụ read-heavy và document-based queries [13].

### 1.2.4. Gamification trong ứng dụng giáo dục

Gamification - việc áp dụng các yếu tố game vào môi trường phi-game - đã được chứng minh là cách hiệu quả tăng động lực học tập. Nghiên cứu meta-analysis của Sailer và cộng sự (2017) trên 38 nghiên cứu cho thấy gamification cải thiện engagement lên 48% và performance lên 34% [14]. Các yếu tố quan trọng bao gồm: điểm số (points), huy hiệu (badges), bảng xếp hạng (leaderboards) và thử thách (challenges).

Hamari và Koivisto (2015) phát hiện rằng yếu tố cạnh tranh lành mạnh (healthy competition) đặc biệt hiệu quả trong môi trường giáo dục, tăng 56% thời gian học tập của sinh viên [15]. Tuy nhiên, cần cân bằng giữa động lực nội tại và ngoại tại để tránh hiện tượng "overjustification effect".

### 1.2.5. Khoảng trống nghiên cứu

Qua khảo sát tài liệu, chúng tôi nhận thấy các khoảng trống sau:

1. **Thiếu tích hợp toàn diện**: Chưa có giải pháp kết hợp Pomodoro Timer, quản lý nhiệm vụ, gamification và hỗ trợ đa vai trò trong một hệ thống duy nhất.

2. **Thiếu hỗ trợ giáo dục**: Các ứng dụng hiện có không có tính năng cho giáo viên tạo lớp học, theo dõi tiến độ học sinh, và phụ huynh giám sát con em.

3. **Thiếu offline support**: Hầu hết ứng dụng yêu cầu kết nối internet liên tục, không phù hợp với môi trường học tập không ổn định về mạng.

4. **Thiếu insights chi tiết**: Ít ứng dụng cung cấp phân tích sâu về thói quen học tập, thời gian tập trung, và xu hướng năng suất.

DeepFocus được thiết kế để lấp đầy những khoảng trống này, mang đến giải pháp tích hợp và toàn diện cho cộng đồng giáo dục.

## 1.3. Giả thiết và lý do hình thành đề tài

### 1.3.1. Bối cảnh và thực trạng

**Bối cảnh giáo dục hiện đại:**

Năm 2025, giáo dục toàn cầu đang trải qua giai đoạn chuyển đổi số mạnh mẽ. Theo UNESCO (2024), 67% quốc gia đã áp dụng học tập kết hợp (blended learning) và 89% sinh viên sử dụng thiết bị di động trong học tập [16]. Tuy nhiên, nghịch lý của "technology distraction" cũng gia tăng: theo nghiên cứu của Stanford (2023), sinh viên kiểm tra điện thoại trung bình 96 lần/ngày trong giờ học [17].

**Thực trạng quản lý thời gian của sinh viên Việt Nam:**

Khảo sát 500 sinh viên tại các trường đại học tại TP.HCM (2024) cho thấy:

- 76% gặp khó khăn trong việc duy trì tập trung khi học
- 82% không có phương pháp quản lý thời gian cụ thể
- 64% procrastinate và nộp bài trễ deadline
- 71% cảm thấy stress vì khối lượng công việc quá tải
- 58% muốn có công cụ hỗ trợ tập trung và quản lý nhiệm vụ

**Nhu cầu của giáo viên:**

Giáo viên cần công cụ để:

- Theo dõi tiến độ học tập của sinh viên
- Tạo và quản lý bài tập/dự án theo nhóm
- Đánh giá mức độ tập trung và effort của từng cá nhân
- Khuyến khích động lực học tập qua hệ thống điểm và thưởng

**Nhu cầu của phụ huynh:**

Phụ huynh quan tâm đến:

- Giám sát thời gian học của con không xâm phạm riêng tư
- Hiểu rõ thói quen học tập và tiến độ
- Nhận thông báo và báo cáo định kỳ
- Khen thưởng và động viên khi con đạt thành tích

### 1.3.2. Lý do chọn đề tài

**Lý do chủ quan:**

Là sinh viên ngành Công nghệ phần mềm, tôi nhận thấy bản thân và bạn bè thường xuyên gặp khó khăn trong việc quản lý thời gian học tập hiệu quả. Các ứng dụng Pomodoro đơn giản không đáp ứng đủ nhu cầu về quản lý nhiệm vụ, theo dõi tiến độ và tạo động lực. Từ đó, ý tưởng xây dựng một giải pháp toàn diện được hình thành.

**Lý do khách quan:**

1. **Nhu cầu thị trường rõ ràng**: Thị trường ứng dụng productivity dự kiến đạt $96.36 tỷ USD vào 2027, tăng trưởng 13.4% CAGR [18].

2. **Xu hướng công nghệ phù hợp**: React Native và Expo đang là xu hướng hàng đầu, cho phép phát triển nhanh với chi phí thấp.

3. **Giá trị giáo dục cao**: Đề tài cho phép áp dụng kiến thức đã học về lập trình di động, backend development, cơ sở dữ liệu, và UX design.

4. **Khả năng mở rộng và thương mại hóa**: Sản phẩm có tiềm năng phát triển thành startup hoặc được bán cho các tổ chức giáo dục.

5. **Đóng góp cho cộng đồng**: Ứng dụng có thể giúp hàng nghìn sinh viên cải thiện kỹ năng quản lý thời gian và năng suất học tập.

## 1.4. Ý nghĩa khoa học và thực tiễn

### 1.4.1. Ý nghĩa khoa học

**Về mặt lý thuyết:**

1. **Nghiên cứu tích hợp phương pháp:** Đồ án kết hợp nhiều lý thuyết về tâm lý học nhận thức (Pomodoro Technique), gamification theory, và behavioral psychology để tạo ra một framework ứng dụng hiệu quả.

2. **Kiến trúc hệ thống hiện đại:** Áp dụng các design patterns và best practices trong phát triển phần mềm: Clean Architecture, Mẫu thiết kế Repository, Context API, và RESTful API design.

3. **Đóng góp vào nghiên cứu UX:** Nghiên cứu cách thiết kế giao diện đa vai trò (multi-role system) trong một ứng dụng, đảm bảo mỗi nhóm người dùng có trải nghiệm tối ưu.

**Về mặt công nghệ:**

1. **Chứng minh hiệu quả của cross-platform development:** So sánh hiệu năng và development effort giữa React Native và native development.

2. **Tối ưu hóa hiệu năng mobile app:** Nghiên cứu các kỹ thuật optimize performance: lazy loading, memoization, virtual lists, và efficient state management.

3. **Offline-first architecture:** Thiết kế hệ thống có thể hoạt động offline và đồng bộ khi online, giải quyết thách thức về network inconsistency.

### 1.4.2. Ý nghĩa thực tiễn

**Đối với sinh viên:**

1. **Cải thiện năng suất học tập:** Cung cấp công cụ khoa học để quản lý thời gian và duy trì tập trung.
2. **Phát triển kỹ năng self-management:** Giúp hình thành thói quen tốt thông qua tracking và feedback.
3. **Tăng động lực học tập:** Gamification tạo động lực nội tại và sự hứng thú khi học.
4. **Quản lý stress tốt hơn:** Chia nhỏ công việc giúp giảm cảm giác overwhelmed.

**Đối với giáo viên:**

1. **Theo dõi tiến độ lớp học:** Dashboard tổng quan về effort và performance của từng học sinh.
2. **Phát hiện học sinh cần hỗ trợ:** Nhận diện sớm các em có vấn đề về động lực hoặc quản lý thời gian.
3. **Tạo môi trường học tập tích cực:** Khuyến khích cạnh tranh lành mạnh qua leaderboard và competitions.
4. **Tiết kiệm thời gian quản lý:** Tự động hóa việc tracking và reporting.

**Đối với phụ huynh:**

1. **Giám sát không xâm phạm:** Nhận thông tin tổng quan về hoạt động học tập của con.
2. **Hiểu rõ hơn về con:** Insights về thời gian tập trung, môn học yêu thích, và tiến độ.
3. **Hỗ trợ kịp thời:** Nhận cảnh báo khi con gặp khó khăn hoặc thành tích giảm sút.
4. **Tương tác tích cực:** Có thể gửi động viên, thưởng khi con đạt thành tích.

**Đối với cộng đồng giáo dục:**

1. **Công cụ miễn phí chất lượng cao:** Giúp các trường học, đặc biệt ở vùng khó khăn, có công cụ quản lý học tập hiện đại.
2. **Dữ liệu nghiên cứu giáo dục:** Thu thập dữ liệu (ẩn danh) về thói quen học tập để phục vụ nghiên cứu giáo dục.
3. **Mô hình mở rộng:** Có thể tùy chỉnh cho các ngữ cảnh giáo dục khác nhau.

## 1.5. Mục tiêu nghiên cứu

### 1.5.1. Mục tiêu tổng quát

Xây dựng ứng dụng di động đa nền tảng **DeepFocus** giúp sinh viên nâng cao khả năng tập trung, quản lý thời gian hiệu quả thông qua kỹ thuật Pomodoro, đồng thời hỗ trợ giáo viên theo dõi tiến độ và phụ huynh giám sát con em.

### 1.5.2. Mục tiêu cụ thể

1. **Nghiên cứu và áp dụng kỹ thuật Pomodoro:**

   - Thiết kế và cài đặt Pomodoro Timer với các chế độ làm việc và nghỉ ngơi
   - Tích hợp thông báo và âm thanh để tăng trải nghiệm người dùng
   - Cho phép tùy chỉnh thời gian theo nhu cầu cá nhân

2. **Xây dựng hệ thống quản lý nhiệm vụ:**

   - CRUD operations cho tasks với các thuộc tính: tiêu đề, mô tả, độ ưu tiên, deadline
   - Liên kết tasks với Pomodoro sessions để tracking effort
   - Phân loại và lọc tasks theo trạng thái, độ ưu tiên, ngày tạo

3. **Phát triển hệ thống đa vai trò (Multi-Role System):**

   - Student: Sử dụng timer, quản lý tasks, xem thống kê cá nhân
   - Teacher: Tạo lớp học, theo dõi học sinh, quản lý assignments
   - Guardian: Giám sát con em, xem báo cáo, gửi động viên

4. **Triển khai tính năng gamification:**

   - Hệ thống thành tích (achievements) với 30+ loại badges
   - Bảng xếp hạng (leaderboards) cá nhân và nhóm
   - Competitions giữa học sinh/lớp học
   - Hệ thống điểm và rewards

5. **Xây dựng backend API và cơ sở dữ liệu:**

   - RESTful API với Node.js/Express
   - MongoDB database với 13+ models
   - JWT authentication và role-based authorization
   - 348+ test cases với 100% pass rate

6. **Thiết kế giao diện người dùng thân thiện:**

   - Material Design với màu chủ đạo đỏ (#FF5252)
   - Responsive layout cho nhiều kích thước màn hình
   - Dark mode support (future)
   - Đa ngôn ngữ (Tiếng Việt, English)

7. **Đảm bảo hiệu năng và khả năng mở rộng:**
   - Tối ưu hóa performance cho mobile devices
   - Offline support với AsyncStorage
   - Lazy loading và pagination
   - Caching strategies

## 1.6. Đối tượng và phạm vi nghiên cứu

### 1.6.1. Đối tượng nghiên cứu

**Người dùng chính:**

1. **Sinh viên/Học sinh:**

   - Độ tuổi: 15-25 tuổi
   - Có smartphone (iOS/Android)
   - Cần cải thiện kỹ năng quản lý thời gian
   - Muốn tăng năng suất học tập

2. **Giáo viên:**

   - Giảng dạy tại trường học/trung tâm
   - Cần công cụ theo dõi tiến độ học sinh
   - Muốn tạo môi trường học tập tích cực

3. **Phụ huynh:**
   - Có con trong độ tuổi học sinh/sinh viên
   - Quan tâm đến kết quả học tập của con
   - Muốn hỗ trợ con một cách khoa học

**Đối tượng nghiên cứu kỹ thuật:**

- Kiến trúc ứng dụng di động cross-platform
- Hệ thống backend RESTful API
- Cơ sở dữ liệu NoSQL (MongoDB)
- Các pattern và practices trong phát triển full-stack application

### 1.6.2. Phạm vi nghiên cứu

**Phạm vi chức năng (Functional Scope):**

**Phase 1 - Core Features (100% hoàn thành):**

- Hệ thống đa vai trò (Student, Teacher, Guardian)
- Đăng ký, đăng nhập, xác thực JWT
- Profile management
- Pomodoro Timer cơ bản

**Phase 2 - Class Management (100% hoàn thành):**

- Tạo và quản lý lớp học
- Hệ thống mã tham gia (join code)
- Quản lý thành viên lớp học
- Phê duyệt yêu cầu tham gia

**Phase 3 - Task & Session Management (85% hoàn thành):**

- CRUD operations cho tasks
- Liên kết tasks với Pomodoro sessions
- Statistics và analytics cá nhân
- Push notifications (chưa hoàn thiện)

**Phase 4 - Gamification (95% hoàn thành):**

- Achievement system (30+ achievements)
- Leaderboards (cá nhân, lớp học)
- Competition system (individual & team)
- Rewards và penalties

**Phase 5 - Guardian Features (100% hoàn thành):**

- Guardian-child linking
- View child's progress
- Alerts và notifications
- Reports (cơ bản)

**Phase 6 - Polish & Deployment (65% hoàn thành):**

- Localization (Tiếng Việt, English)
- UI/UX refinements
- Performance optimization
- Testing và QA

**Phạm vi công nghệ (Technical Scope):**

**Frontend:**

- React Native 0.81.5
- Expo SDK ~54.0
- React Navigation 7.x
- React Native Paper 5.x
- AsyncStorage cho offline storage
- Context API cho state management

**Backend:**

- Node.js 16+
- Express.js 4.18
- MongoDB 7.5
- Mongoose ORM
- JWT authentication
- Expo Server SDK (push notifications)
- Firebase Admin SDK

**Testing:**

- Jest cho unit và integration tests
- Supertest cho API testing
- 348+ test cases backend

**Deployment:**

- Railway.app (backend staging)
- MongoDB Atlas (database)
- Expo EAS Build (mobile app build)

**Phạm vi ngoài đồ án (Out of Scope):**

- Real-time collaboration (WebSocket)
- Video call/Screen sharing
- AI-powered recommendations
- Blockchain-based rewards
- VR/AR features
- Desktop native apps (Windows/Mac)
- Payment integration
- Enterprise SSO

### 1.6.3. Giới hạn của đồ án

1. **Giới hạn về thời gian:** Đồ án được thực hiện trong 4 tháng (9/2025 - 12/2025), do đó một số tính năng nâng cao chưa được triển khai đầy đủ.

2. **Giới hạn về tài nguyên:** Phát triển bởi một cá nhân, không có ngân sách cho dịch vụ cloud cao cấp, marketing, hay user acquisition.

3. **Giới hạn về testing:** Chưa có testing với số lượng lớn người dùng thực tế (limited beta testing).

4. **Giới hạn về nền tảng:** Tập trung chủ yếu vào iOS và Android, web version có giới hạn về tính năng (không có push notifications).

5. **Giới hạn về bảo mật:** Chưa có security audit chuyên nghiệp, penetration testing, hay compliance với các chuẩn như GDPR, COPPA.

## 1.7. Cấu trúc đồ án

Báo cáo đồ án được tổ chức thành 4 chương chính:

**Chương 1 - TỔNG QUAN** (8 trang): Giới thiệu đề tài, tình hình nghiên cứu liên quan, lý do hình thành đề tài, ý nghĩa khoa học và thực tiễn, mục tiêu, đối tượng và phạm vi nghiên cứu. Chương này cung cấp cái nhìn tổng quan về bối cảnh, động lực và định hướng của đồ án.

**Chương 2 - CƠ SỞ LÝ THUYẾT** (20 trang): Trình bày các nền tảng lý thuyết và công nghệ được sử dụng, bao gồm: phương pháp Pomodoro, kiến trúc ứng dụng di động đa nền tảng, React Native và Expo, Node.js/Express backend, MongoDB và Mongoose, hệ thống xác thực JWT, các design patterns và best practices. Chương này cung cấp kiến thức nền tảng cần thiết để hiểu các quyết định thiết kế và triển khai.

**Chương 3 - KẾT QUẢ THỰC NGHIỆM** (8 trang): Mô tả chi tiết quá trình phân tích, thiết kế và triển khai hệ thống, bao gồm: Use Case Diagrams, Class Diagrams, Sequence Diagrams, database schema, các chức năng chính đã cài đặt, giao diện người dùng, kết quả kiểm thử và đánh giá hiệu năng. Chương này chứng minh khả năng áp dụng lý thuyết vào thực tế.

**Chương 4 - KẾT LUẬN VÀ KIẾN NGHỊ** (2 trang): Tổng kết những kết quả đạt được, đóng góp của đồ án, hạn chế hiện tại, hướng phát triển tương lai và các kiến nghị. Chương này đánh giá toàn diện đồ án và đưa ra định hướng tiếp theo.

Ngoài ra, báo cáo còn có phần Tài liệu tham khảo (44 tài liệu từ sách, bài báo khoa học, tài liệu kỹ thuật) và Phụ lục (source code quan trọng, database schema, API documentation, test reports).

---

**[KẾT THÚC CHƯƠNG 1]**

_Tổng số trang Chương 1: ~8 trang_

---
