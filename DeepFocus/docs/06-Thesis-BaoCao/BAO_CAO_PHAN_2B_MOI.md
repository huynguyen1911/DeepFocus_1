# PHẦN 2B - CHƯƠNG 2 (Phiên bản lý thuyết)

## 2.5. Cơ sở dữ liệu MongoDB và Mongoose ORM

### 2.5.1. MongoDB - Cơ sở dữ liệu NoSQL

**A. Giới thiệu và đặc điểm**

MongoDB là một hệ quản trị cơ sở dữ liệu NoSQL (Not Only SQL) hướng document, được phát triển bởi MongoDB Inc. từ năm 2009. Khác với các hệ quản trị cơ sở dữ liệu quan hệ truyền thống (RDBMS) như MySQL hay PostgreSQL sử dụng bảng và hàng, MongoDB lưu trữ dữ liệu dưới dạng các documents có cấu trúc giống JSON (Binary JSON - BSON).

**Các đặc điểm nổi bật của MongoDB:**

**1. Document-Oriented Storage:** Dữ liệu được lưu trữ dưới dạng documents - các đối tượng JSON có thể chứa nested objects và arrays. Mỗi document là một đơn vị dữ liệu độc lập, có thể có cấu trúc phức tạp mà không cần phải tách ra nhiều bảng như trong SQL.

**2. Schema Flexibility:** MongoDB là schema-less, cho phép các documents trong cùng một collection có cấu trúc khác nhau. Điều này mang lại sự linh hoạt cao trong quá trình phát triển ứng dụng, đặc biệt khi requirements thay đổi thường xuyên.

**3. Horizontal Scalability:** MongoDB được thiết kế để scale horizontally thông qua sharding - kỹ thuật phân tán dữ liệu ra nhiều servers. Điều này cho phép xử lý lượng dữ liệu lớn và traffic cao một cách hiệu quả.

**4. High Availability:** Replica Sets cung cấp khả năng sao lưu tự động và failover, đảm bảo hệ thống vẫn hoạt động ngay cả khi một hoặc nhiều servers gặp sự cố.

**5. Rich Query Language:** MongoDB hỗ trợ các query phức tạp với nhiều operators, aggregation framework mạnh mẽ, text search, và geospatial queries.

**B. So sánh MongoDB với SQL Databases**

**Về mô hình dữ liệu:** SQL databases sử dụng mô hình quan hệ với tables, rows và columns, yêu cầu schema cố định được định nghĩa trước. MongoDB sử dụng documents linh hoạt, cho phép nested structures và không bắt buộc schema cố định.

**Về relationships:** Trong SQL, relationships được thiết lập thông qua foreign keys và JOIN operations. MongoDB hỗ trợ hai cách: embedded documents (nhúng dữ liệu liên quan trực tiếp vào document) hoặc references (tham chiếu đến documents khác).

**Về scalability:** SQL databases thường scale vertically (tăng sức mạnh server), trong khi MongoDB được thiết kế để scale horizontally (thêm nhiều servers).

**Về use cases:** SQL phù hợp với dữ liệu có cấu trúc chặt chẽ, relationships phức tạp và yêu cầu ACID transactions mạnh. MongoDB phù hợp với rapid development, dữ liệu semi-structured, và applications cần scale lớn.

**C. Lý do chọn MongoDB cho DeepFocus**

**1. Sự phù hợp với JavaScript ecosystem:** Cả frontend (React Native) và backend (Node.js) của DeepFocus đều sử dụng JavaScript. MongoDB với BSON documents tương thích hoàn hảo với JSON, tạo ra data flow nhất quán từ database đến backend rồi frontend mà không cần chuyển đổi phức tạp.

**2. Tính linh hoạt trong phát triển Agile:** Trong quá trình phát triển đồ án, requirements thường thay đổi và features mới được thêm vào. Schema flexibility của MongoDB cho phép thêm/sửa fields dễ dàng mà không cần ALTER TABLE hay complex migrations như SQL.

**3. Performance phù hợp với use cases:** DeepFocus có nhiều read operations (xem tasks, statistics, leaderboards) và cấu trúc dữ liệu tương đối đơn giản. MongoDB với embedded documents giảm nhu cầu JOINs, cải thiện performance đáng kể.

**4. Ease of deployment:** MongoDB Atlas cung cấp database-as-a-service với free tier, giúp setup và deployment nhanh chóng mà không cần quản lý infrastructure phức tạp.

**5. Developer experience:** Mongoose ODM cung cấp API trực quan và dễ học, phù hợp với timeline ngắn của đồ án (4 tháng).

### 2.5.2. Mongoose - Object Data Modeling Library

**A. Vai trò và tầm quan trọng của Mongoose**

Mongoose là một Object Data Modeling (ODM) library cho MongoDB và Node.js, đóng vai trò như một abstraction layer giữa application code và MongoDB. Mặc dù MongoDB là schema-less, Mongoose cung cấp khả năng định nghĩa schemas với validation, type casting, và business logic.

Mongoose giải quyết các thách thức quan trọng:

- **Data validation:** Đảm bảo dữ liệu đúng format và đáp ứng business rules trước khi lưu vào database
- **Schema definition:** Mặc dù MongoDB linh hoạt, việc có schema giúp maintain data consistency và documentation
- **Relationships management:** Simplify việc thiết lập và quản lý relationships giữa collections
- **Business logic integration:** Middleware hooks cho phép inject custom logic vào database operations

**B. Schema Modeling và Validation**

**Schema definition** trong Mongoose giúp cấu trúc hóa documents, định nghĩa các fields, kiểu dữ liệu, default values, và validation rules. Điều này mang lại nhiều lợi ích:

**Data consistency:** Mặc dù MongoDB không enforce schema, việc định nghĩa schema trong application layer đảm bảo tất cả documents tuân theo cùng structure cơ bản, giảm thiểu bugs và inconsistencies.

**Automatic validation:** Mongoose tự động validate data trước khi save. Validation rules có thể đơn giản (required, min/max length) hoặc phức tạp (custom validators với regex hay business logic). Điều này giúp reject invalid data ngay từ application layer, tránh lưu "garbage" vào database.

**Type safety:** Mỗi field có kiểu dữ liệu cụ thể (String, Number, Date, Boolean, ObjectId, Array, Mixed, Buffer). Mongoose tự động cast values sang đúng type, và throw errors nếu casting fails. Điều này giảm type-related bugs đáng kể.

**Documentation:** Schema definitions đóng vai trò như living documentation, giúp developers hiểu data structure mà không cần đọc database hay reverse-engineer code.

**C. Relationships và Data Modeling Strategies**

Một trong những quyết định quan trọng nhất khi thiết kế MongoDB schema là chọn giữa embedding và referencing cho relationships.

**Embedded Documents (Nhúng):**

Embedding là kỹ thuật lưu trữ related data trực tiếp bên trong parent document. Chiến lược này phù hợp khi:

- Relationship là one-to-few (một parent có ít children)
- Related data luôn được truy cập cùng parent
- Related data ít thay đổi và không được share giữa nhiều parents

**Ưu điểm của embedding:**

- **Performance cao:** Chỉ cần một query để retrieve toàn bộ related data
- **Atomicity:** Updates là atomic - cập nhật toàn bộ document một lượt, không có partial failures
- **Simplicity:** Code đơn giản hơn, không cần population hay multiple queries

**Nhược điểm:**

- **Document size limit:** MongoDB giới hạn document size ở 16MB
- **Data duplication:** Nếu embedded data cần share giữa nhiều parents
- **Difficult to query:** Khó query hay update embedded documents độc lập

Trong DeepFocus, User document nhúng focusProfile và settings vì chúng luôn được load cùng user, có kích thước nhỏ, và là one-to-one relationship.

**Referenced Documents (Tham chiếu):**

Referencing là kỹ thuật lưu ObjectId của related document thay vì toàn bộ data. Chiến lược này phù hợp khi:

- Relationship là one-to-many hay many-to-many
- Related documents thường được truy cập độc lập
- Related data lớn hoặc thay đổi thường xuyên
- Related data được share giữa nhiều documents

**Ưu điểm của referencing:**

- **Flexibility:** Không giới hạn số lượng related documents
- **No duplication:** Mỗi document chỉ tồn tại một lần
- **Independent queries:** Dễ query và update riêng từng document
- **Smaller parent documents:** Parent document nhẹ hơn

**Nhược điểm:**

- **Multiple queries:** Cần populate (similar to JOIN) để get full data
- **Performance overhead:** Chậm hơn embedded do cần additional lookups
- **No atomicity:** Không thể update parent và referenced documents atomically

Trong DeepFocus, Tasks reference User qua userId vì một user có thể có hàng trăm tasks, và tasks thường được query riêng biệt (filter by priority, due date, completion status).

**D. Indexing cho Performance Optimization**

Indexes trong MongoDB hoạt động tương tự như indexes trong sách - giúp tìm kiếm nhanh chóng mà không cần đọc hết toàn bộ. Trong database context, indexes là data structures đặc biệt lưu trữ một tập con của collection data theo cách dễ traverse.

**Các loại indexes:**

**Single field index:** Index trên một field duy nhất. MongoDB automatically tạo unique index cho \_id field. Application thường tạo indexes cho các fields hay được query (userId, email, createdAt).

**Compound index:** Index trên nhiều fields, hữu ích cho queries filter theo nhiều điều kiện. Thứ tự fields trong compound index quan trọng - index có thể được sử dụng cho queries match prefix của index.

**Text index:** Cho phép full-text search trên string fields. Hữu ích cho search functionality trong title và description fields.

**Unique index:** Enforce uniqueness constraint, đảm bảo không có hai documents nào có cùng value cho indexed field (ví dụ: email, username).

**Performance trade-offs:**

**Benefits:**

- Queries nhanh hơn exponentially: O(log n) với index vs O(n) without index
- Sorting operations hiệu quả hơn khi sort field được indexed

**Costs:**

- Storage overhead: Indexes chiếm disk space
- Write performance: Insert, update, delete chậm hơn vì phải update indexes
- Maintenance: Too many indexes có thể làm performance worse instead of better

**Strategy:** Index các fields frequently queried, nhưng không over-index. Monitor query performance và add indexes based on actual usage patterns.

Trong DeepFocus, các indexes quan trọng:

- userId index trên Tasks collection (most common query)
- Compound index (userId, createdAt) cho pagination
- Compound index (userId, isCompleted) cho filtering
- Text index trên (title, description) cho search functionality
- Unique index trên User.email và User.username

**E. Middleware (Hooks) và Business Logic**

Mongoose middleware là functions được execute tại các điểm specific trong lifecycle của document operations. Chúng cho phép inject custom logic vào built-in operations như validate, save, remove.

**Pre-middleware (Pre-hooks):**

Execute TRƯỚC một operation. Use cases:

- **Data transformation:** Modify document trước khi save (hash passwords, slugify titles, generate timestamps)
- **Additional validation:** Business logic validation beyond schema constraints
- **Logging:** Record who/when made changes

Ví dụ trong DeepFocus: Pre-save hook trên User model hash password trước khi lưu vào database, đảm bảo passwords không bao giờ stored in plain text.

**Post-middleware (Post-hooks):**

Execute SAU một operation. Use cases:

- **Notifications:** Send emails hay push notifications sau khi data changes
- **Logging:** Log successful operations cho audit trails
- **Side effects:** Update related documents hay external systems

**Cascading operations:**

Một use case quan trọng của middleware là implement cascading deletes. Khi delete một document, middleware tự động delete tất cả related documents. Ví dụ: Khi delete User, pre-remove hook delete tất cả Tasks, Sessions, và Achievements của user đó, maintain referential integrity.

**F. Virtual Properties**

Virtual properties là computed fields không được persist trong database nhưng được calculate on-the-fly khi access. Chúng useful cho:

**Derived data:** Calculate từ existing fields. Ví dụ: Task.progress = (completedPomodoros / estimatedPomodoros) \* 100. Thay vì store progress trong database (waste space và risk inconsistency), calculate it when needed.

**Data transformation:** Format data before sending to client. Ví dụ: User.fullName = firstName + ' ' + lastName.

**Storage optimization:** Avoid storing redundant data that can be computed from existing data.

**Performance consideration:** Virtuals are computed every time accessed, so cho expensive computations, consider caching hay denormalization.

**G. Query Building và Optimization**

Mongoose cung cấp fluent API để xây dựng và execute MongoDB queries efficiently.

**Query methods:** Find, findOne, findById cho basic retrieval. Update methods (updateOne, updateMany, findByIdAndUpdate) cho modifications. Delete methods (deleteOne, deleteMany) cho removals.

**Query operators:** MongoDB query language hỗ trợ rich set của operators:

- Comparison: $eq, $gt, $gte, $lt, $lte, $ne, $in, $nin
- Logical: $and, $or, $not, $nor
- Element: $exists, $type
- Array: $all, $elemMatch, $size

**Query optimization techniques:**

**Selective field retrieval:** Sử dụng select() để chỉ retrieve fields cần thiết thay vì entire documents. Giảm network transfer và memory usage significantly, especially cho large documents.

**Lean queries:** Mongoose by default returns full Mongoose documents với all methods and getters. Lean queries return plain JavaScript objects, faster và use less memory. Useful khi chỉ cần read data without modifications.

**Pagination:** Limit số documents returned với limit() và skip(). Essential cho lists và tables có nhiều items, improve response time và UX.

**Sorting:** Sort results efficiently khi sort field được indexed. In-memory sorting (without index) expensive for large datasets.

**Population:** Replace ObjectId references với actual documents. Useful nhưng có performance cost (additional queries), nên chỉ populate khi really needed và limit populated fields.

**Aggregation pipeline:** MongoDB's aggregation framework là powerful tool cho complex data processing:

- **$match:** Filter documents (like WHERE in SQL)
- **$group:** Group documents và calculate aggregates (like GROUP BY)
- **$project:** Reshape documents, include/exclude fields
- **$sort:** Sort results
- **$limit và $skip:** Pagination
- **$lookup:** Join with other collections (like JOIN)

Aggregations powerful nhưng complex và có thể expensive. Sử dụng cho reports, statistics, và analytics khi simple queries không đủ.

### 2.5.3. Database Schema Design trong DeepFocus

DeepFocus sử dụng 13 models chính, được thiết kế để balance giữa performance, flexibility, và maintainability.

**Core models:**

**User Model:** Central entity lưu authentication info (username, email, hashed password), embedded focusProfile (level, dailyGoal, work/break durations, stats), embedded settings (notifications, sound, vibration), và account status (isActive, roles).

**Task Model:** References User, chứa task details (title, description, priority, dueDate), Pomodoro tracking (estimatedPomodoros, completedPomodoros, pomodoroSessions array), và completion status.

**Session Model:** Records individual Pomodoro sessions, references cả User và Task, stores timing info (startTime, endTime, duration), và session type (work, shortBreak, longBreak).

**Class Management models:**

**Class Model:** Stores class info, references creator (teacher), has embedded members array (userId, role, status, joinedAt), unique joinCode với expiry, và aggregated stats.

**Gamification models:**

**Achievement Model:** Defines available achievements với code, name, description, category, difficulty, icon, condition object, và points reward.

**UserAchievement Model:** Junction table linking Users với Achievements, stores unlock timestamp và progress.

**Competition Model:** Defines competitions với type (individual/team), scope (global/class/private), date range, participants array, và leaderboard.

**Guardian features:**

**GuardianLink Model:** Links guardian users với child users, stores approval status và linking timestamp.

**Alert Model:** In-app notifications và alerts, references User, chứa message, type, status, và related object references.

**Reward Model:** Stores rewards và penalties issued by teachers hay guardians, references User and issuer, amount, reason, và status.

**Push notifications:**

**PushToken Model:** Stores Expo push notification tokens, references User, stores token, platform (iOS/Android/Web), deviceId, và activity status.

**Relationships design decisions:**

**Embedded relationships:** focusProfile và settings trong User (always accessed together), pomodoroSessions trong Task (bounded, small array), members trong Class (moderate size, frequently accessed with class).

**Referenced relationships:** User ← Tasks (one-to-many, unbounded), User ← Sessions (one-to-many, large number), Class ← Users (many-to-many through members array), Achievements ← Users (many-to-many through UserAchievement).

**Design considerations:**

**Denormalization:** Some stats (totalSessionsCompleted, totalFocusTime) denormalized trong User.focusProfile cho quick access, updated via middleware khi Sessions change.

**Indexing strategy:** Heavy indexes trên userId fields (most common query pattern), compound indexes cho common filters, text indexes cho search features.

**Data integrity:** Middleware ensures cascading deletes và stat updates, schema validation prevents invalid data, unique indexes prevent duplicates.

## 2.6. Hệ thống xác thực và phân quyền

### 2.6.1. JSON Web Token (JWT) Authentication

**A. Giới thiệu về JWT**

JSON Web Token (JWT) là một open standard (RFC 7519) định nghĩa cách truyền tải thông tin một cách compact và self-contained giữa các parties dưới dạng JSON object. JWT được widely adopted cho authentication trong modern web và mobile applications, đặc biệt trong kiến trúc RESTful APIs và microservices.

**Đặc điểm cốt lõi của JWT:**

**Self-contained:** Token chứa tất cả thông tin cần thiết về user (user ID, roles, permissions) ngay trong chính nó. Server không cần query database để validate token hay lấy user info - chỉ cần verify token signature.

**Stateless:** Server không cần maintain session state. Điều này critical cho scalability - multiple servers có thể handle requests mà không cần share session storage.

**Compact:** JWT size nhỏ, có thể truyền qua URL, POST parameter, hay HTTP header một cách hiệu quả.

**Secure:** Token được sign bằng secret key (HMAC) hay public/private key pair (RSA, ECDSA), đảm bảo không thể giả mạo.

**B. Cấu trúc JWT**

JWT gồm ba phần separated by dots (.), mỗi phần được Base64Url encoded:

**Header:** Chứa metadata về token - algorithm sử dụng để sign (ví dụ: HS256, RS256) và token type (JWT). Header giúp server biết cách verify signature.

**Payload (Claims):** Chứa actual data muốn transmit. Claims có thể là:

- **Registered claims:** Predefined claims như iss (issuer), exp (expiration time), sub (subject), aud (audience), iat (issued at)
- **Public claims:** Custom claims được define publicly để avoid collisions
- **Private claims:** Custom claims agreed giữa parties

Trong DeepFocus, payload chứa userId và email, cùng với exp time để enforce token expiration.

**Signature:** Tạo bằng cách hash (header + payload) với secret key. Signature đảm bảo:

- Token không bị modify (integrity)
- Token issued bởi legitimate server (authenticity)

Nếu ai đó try modify payload, signature sẽ invalid vì họ không có secret key để re-sign.

**C. JWT Authentication Flow**

**Login process:**

1. User gửi credentials (email + password) lên server
2. Server verify credentials bằng cách:
   - Query user từ database by email
   - Hash provided password và compare với stored hashed password
3. Nếu credentials valid, server generate JWT:
   - Create payload với userId, email, và expiration time
   - Sign payload với secret key
   - Return JWT về client
4. Client lưu JWT (trong AsyncStorage cho React Native apps)

**Authenticated requests:**

1. Client attach JWT vào Authorization header của mọi API requests
   - Format: "Authorization: Bearer <token>"
2. Server extract và verify JWT:
   - Parse header để lấy token
   - Verify signature bằng secret key
   - Check expiration time
3. Nếu token valid, extract userId từ payload
4. Query user từ database by userId
5. Attach user object vào request object (req.user)
6. Proceed với business logic

**D. JWT vs Session-based Authentication**

**Session-based authentication (traditional approach):**

Khi user login, server tạo session object lưu trữ user info và store trong server memory hay database (Redis). Session ID được send về client dưới dạng cookie. Mỗi request, client send session ID, server lookup session để identify user.

**Drawbacks:**

- **Stateful:** Server phải maintain session state, difficult to scale horizontally
- **Storage overhead:** Need Redis hay database để store sessions
- **Cross-domain issues:** Cookies have security restrictions với cross-domain requests

**JWT approach:**

Token self-contained, server stateless. No session storage needed.

**Advantages:**

- **Scalability:** Any server có thể validate token mà không cần shared session store
- **Flexibility:** Works well với mobile apps (cookies problematic), microservices, và cross-domain requests
- **Performance:** No database lookup để validate token (chỉ cryptographic verification)

**Disadvantages:**

- **Cannot revoke before expiration:** Once issued, token valid cho đến khi expire. Logout chỉ delete token ở client-side, but token still valid nếu attacker có được
- **Token size:** Larger than session IDs, transferred trong mọi requests
- **Security:** Nếu secret key leaked, all tokens compromised

**Mitigation strategies:**

- Short expiration times (7 days trong DeepFocus)
- Secure secret key storage (environment variables, secrets management)
- HTTPS để prevent token interception
- Refresh token mechanism cho better security (advanced)

**E. JWT Security Best Practices trong DeepFocus**

**Secret key management:** JWT secret key never hardcoded trong source code. Stored trong environment variables (.env file), never committed to version control. For production, use secure secrets management service.

**Token expiration:** Tokens có expiration time (7 days). Trade-off giữa security (short) và UX (long). 7 days reasonable cho mobile apps where re-login annoying.

**HTTPS enforcement:** Production API must use HTTPS để prevent man-in-the-middle attacks stealing tokens.

**Input validation:** Server always validate token format, check Bearer prefix, handle malformed tokens gracefully.

**Error handling:** Don't leak sensitive info trong error messages. Generic "Invalid token" hay "Unauthorized" messages.

### 2.6.2. Role-Based Access Control (RBAC)

**A. Khái niệm RBAC**

Role-Based Access Control là security paradigm trong đó access rights granted based on roles rather than individual users. Users được assign roles, và roles được grant permissions. Điều này simplify management khi có nhiều users và permissions.

**RBAC components:**

**Users:** Individual entities using the system

**Roles:** Job functions hay responsibilities (Student, Teacher, Guardian trong DeepFocus)

**Permissions:** Specific access rights đến resources hay operations

**Role-Permission mapping:** Defines what each role can do

**User-Role assignment:** Assigns roles to users

**B. Multi-Role System trong DeepFocus**

Điểm unique của DeepFocus là support multi-role system - một user có thể có nhiều roles simultaneously. Ví dụ: một người có thể vừa là student (học), vừa là teacher (dạy ở trường khác), vừa là guardian (có con nhỏ).

**Roles trong DeepFocus:**

**Student role:** Focus on learning và personal productivity

- Permissions: Use Pomodoro timer, manage personal tasks, join classes, view own statistics, earn achievements, participate competitions

**Teacher role:** Focus on teaching và monitoring students

- Permissions: Create và manage classes, view class members, approve join requests, view class statistics và leaderboards, assign rewards/penalties

**Guardian role:** Focus on monitoring children

- Permissions: Link to child accounts (with child approval), view child's progress và statistics, receive alerts about child's activities, send encouragements

**C. Role Model và Database Design**

Role information stored trong separate Role collection rather than embedded trong User. Rationale:

**Flexibility:** User có thể add/remove roles dynamically mà không modify User document structure.

**Independent management:** Roles có their own lifecycle - can be activated/deactivated independently.

**Profile per role:** Mỗi role có thể có separate profile data. Ví dụ: Teacher profile có school info, Guardian profile có children list.

Role model schema:

- userId reference (which user)
- type (student/teacher/guardian)
- isPrimary flag (default active role)
- isActive flag (enabled/disabled)
- profile object (role-specific data)
- Timestamps

**Unique constraint:** Compound index trên (userId, type) ensures user cannot have duplicate roles of same type.

**D. Role Middleware và Access Control**

**Authentication middleware:** Verify JWT và attach user object to request.

**Authorization middleware:** Check if user's current role has permission cho requested operation.

Implementation approach:

- Define role requirements per route (which roles allowed)
- Middleware checks user's current active role
- If role allowed, proceed; otherwise return 403 Forbidden

**Permission matrix design:**

Rather than fine-grained permissions, DeepFocus uses role-based permissions where mỗi role has predefined set of allowed operations. Simpler to implement và maintain cho medium-sized application.

Examples:

- POST /classes route requires Teacher role
- POST /classes/:id/join requires Student role
- GET /guardian/children/:id/progress requires Guardian role with linked child

**E. Role Switching Mechanism**

User với multiple roles có thể switch between roles trong app. Current active role stored trong:

- Frontend state (Context API)
- Backend determines từ role system khi user make requests

Benefits:

- Clear separation of concerns
- Different UI/UX per role
- Prevent permission confusion (user always acting trong context của specific role)

Implementation:

- Role selection screen khi user có multiple roles
- API để switch active role
- Frontend adapts UI based on active role
- Backend validates permissions based on active role

**F. Security Considerations**

**Privilege escalation prevention:** Users cannot grant themselves roles. Roles must be explicitly assigned:

- Student role: Self-registration
- Teacher role: Self-registration
- Guardian role: Self-registration plus child approval

**Horizontal privilege escalation:** Users cannot access resources của other users, even with same role. Middleware always checks resource ownership before allowing access.

**Role hierarchy:** No hierarchy trong DeepFocus (all roles equal). Different approach would be hierarchical RBAC where higher roles inherit lower roles' permissions.

## 2.7. Mô hình thiết kế và kiến trúc hệ thống

### 2.7.1. Kiến trúc tổng quan - Client-Server 3-Tier

DeepFocus áp dụng kiến trúc three-tier architecture, một mô hình phổ biến trong phát triển ứng dụng web và mobile hiện đại. Kiến trúc này tách ứng dụng thành ba logical layers độc lập, mỗi layer có responsibilities riêng biệt.

**Presentation Tier (Client Layer):**

Layer này là React Native mobile application, responsible cho:

- **User Interface:** Render UI components, handle user interactions
- **Presentation logic:** Format và validate data trước khi display hay submit
- **State management:** Maintain application state với Context API
- **API communication:** Make HTTP requests tới backend

Separation này allows UI changes without affecting business logic hay database.

**Business Logic Tier (Application Layer):**

Layer này là Node.js/Express backend server, responsible cho:

- **Business rules:** Implement application logic (ví dụ: calculate pomodoro progress, determine achievements earned)
- **Request processing:** Handle incoming API requests, validate inputs
- **Authentication/Authorization:** Verify users và check permissions
- **Data transformation:** Convert data between formats khi needed
- **External integrations:** Interact với third-party services (push notifications, email)

Separation này centralizes business logic, making it reusable và easier to maintain.

**Data Tier (Persistence Layer):**

Layer này là MongoDB database, responsible cho:

- **Data storage:** Persist application data durably
- **Data retrieval:** Execute queries efficiently
- **Data integrity:** Enforce constraints và indexes
- **Transactions:** Handle concurrent access safely

Separation này allows database changes (schema, technology) without affecting application logic.

**Benefits của 3-tier architecture:**

**Modularity:** Mỗi tier có thể developed, tested, và deployed independently.

**Maintainability:** Changes trong một tier ít impact other tiers. Bug fixes và enhancements easier.

**Scalability:** Mỗi tier có thể scaled independently. Có thể add more API servers mà không touch database hay client.

**Reusability:** Business logic trong middle tier có thể reused bởi multiple clients (mobile app, web app, desktop app).

**Security:** Sensitive operations (authentication, authorization, data validation) centralized trong server, không expose cho client.

### 2.7.2. Design Patterns được áp dụng

Design patterns là reusable solutions cho common problems trong software design. DeepFocus áp dụng nhiều proven patterns.

**A. Model-View-Controller (MVC) Pattern**

MVC là architectural pattern tách application thành three interconnected components:

**Model:** Represents data và business logic. Trong DeepFocus, Mongoose models (User, Task, Session) là Models. Chúng define data structure, validation rules, và database operations.

**View:** Presents data tới users. Trong mobile context, React Native components là Views. Chúng render UI based on data từ Models.

**Controller:** Handles user input và updates Models. Trong backend, Express route handlers và controllers act as Controllers. Chúng process requests, call Models để manipulate data, và return responses.

**Flow:** User interaction → Controller → Model (update data) → View (render updated data)

**Benefits:**

- **Separation of concerns:** Presentation logic tách khỏi business logic
- **Testability:** Mỗi component có thể tested independently
- **Parallel development:** Multiple developers có thể work on different components simultaneously

**B. Repository Pattern**

Repository pattern abstracts data access logic, providing collection-like interface cho accessing domain objects. Instead of controllers directly calling Mongoose models, repositories provide clean API.

**Benefits:**

- **Abstraction:** Controllers không cần biết database implementation details
- **Testability:** Easy to mock repositories trong unit tests
- **Flexibility:** Có thể switch database technologies mà không change controller code
- **Centralization:** Data access logic centralized, easy to maintain và optimize

**Implementation approach:** Repository classes với methods như findById, findByUserId, create, update, delete. Controllers use repositories rather than directly calling Model methods.

**C. Middleware Pattern**

Middleware pattern (trong Express context) là một series của functions được execute sequentially, mỗi function có thể modify request/response objects hay terminate request-response cycle.

**Common middleware trong DeepFocus:**

**CORS middleware:** Handles Cross-Origin Resource Sharing, allowing frontend (different origin) to call backend API.

**Body parser middleware:** Parses incoming request bodies (JSON, URL-encoded) và attaches parsed data to req.body.

**Authentication middleware:** Verifies JWT tokens và attaches user object to req.user.

**Logging middleware:** Logs request details (method, path, timestamp) cho debugging và monitoring.

**Error handling middleware:** Catches errors thrown từ route handlers và returns proper error responses.

**Benefits:**

- **Reusability:** Middleware có thể reused across multiple routes
- **Modularity:** Each middleware handles one concern (authentication, logging, etc.)
- **Composition:** Middleware can be composed để create complex processing pipelines

**D. Context API Pattern (Frontend State Management)**

Context API là React pattern cho prop drilling avoidance và global state management.

**Provider-Consumer pattern:**

**Provider:** Component wraps application subtree và provides value (state + functions) tới all descendants.

**Consumer:** Components access provided value using useContext hook, subscribing to changes.

**Benefits:**

- **Avoid prop drilling:** No need to pass props through every intermediate component
- **Centralized state:** Global state như user, tasks, settings managed centrally
- **Reactivity:** Components automatically re-render khi context value changes

**DeepFocus context hierarchy:**

Multiple nested providers, mỗi provider manages related state:

- AuthProvider: Authentication state (user, token, login/logout functions)
- RoleProvider: Role management (current role, switch role)
- TaskProvider: Task management (tasks array, CRUD operations)
- PomodoroProvider: Timer state (time left, timer controls)
- ClassProvider, AchievementProvider, v.v.

Nested structure allows child providers access parent provider state (ví dụ: TaskProvider uses AuthProvider's user).

**E. Singleton Pattern**

Singleton ensures a class có only one instance và provides global access point to it.

**Implementation trong DeepFocus:**

**Database connection:** MongoDB connection là singleton. First connection attempt establishes connection, subsequent calls return existing connection. Prevents multiple connections wasting resources.

**Benefits:**

- **Resource optimization:** Reuse expensive resources (database connections, config objects)
- **Consistency:** All parts của application use same instance
- **Lazy initialization:** Instance created only when first needed

## 2.8. Best Practices và Coding Standards

### 2.8.1. Code Organization và Project Structure

**A. Nguyên tắc tổ chức code**

**Separation of concerns:** Mỗi file/module/component có one clear responsibility. Không mix business logic với UI logic, data access với presentation.

**DRY (Don't Repeat Yourself):** Extract common code into reusable functions, components, hay utilities. Avoid copy-pasting code.

**Single Responsibility Principle:** Mỗi function/class should do one thing và do it well. Long functions should be broken down into smaller, focused functions.

**Consistent naming conventions:**

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

**src/components/:** Reusable UI components (Button, Card, TaskItem)

**src/contexts/:** Context providers cho global state

**src/screens/:** Screen components (full pages)

**src/services/:** API clients và external service integrations

**src/utils/:** Helper functions, formatters, constants

**src/hooks/:** Custom React hooks

**src/config/:** App configuration (theme, constants, settings)

**assets/:** Static files (images, fonts, icons)

### 2.8.2. Error Handling Strategies

**A. Defensive programming**

**Input validation:** Always validate user inputs trước khi processing. Never trust client-side validation alone - always validate trên server.

**Try-catch blocks:** Wrap potentially failing operations (database queries, API calls, file operations) trong try-catch để handle errors gracefully.

**Null checks:** Check for null/undefined values trước khi accessing properties để avoid "Cannot read property of undefined" errors.

**B. Error handling levels**

**Application-level:** Global error handler catches unhandled errors, logs them, và returns generic error response tới client.

**Route-level:** Each route handler has try-catch, specific error handling cho business logic errors.

**Validation-level:** Input validation middleware catches invalid data early, trước khi reach business logic.

**C. Error response format**

Consistent error response structure:

- success: false (indicates error)
- message: Human-readable error description
- error: Technical error details (only trong development mode)
- status code: Appropriate HTTP status (400 bad request, 401 unauthorized, 404 not found, 500 server error)

### 2.8.3. Security Best Practices

**A. Authentication và authorization**

**Never store passwords in plain text:** Always hash passwords với strong hashing algorithm (bcrypt with salt).

**Environment variables:** Store sensitive data (JWT secret, database credentials, API keys) trong environment variables, never trong source code.

**Secure token transmission:** Always use HTTPS để prevent token interception. Never send tokens trong URLs.

**Token expiration:** Implement token expiration to limit damage if token compromised.

**Input sanitization:** Sanitize user inputs để prevent injection attacks (SQL injection, NoSQL injection, XSS).

**B. Data validation**

**Whitelist approach:** Define allowed inputs rather than trying to blacklist dangerous inputs.

**Type checking:** Validate data types match expectations.

**Range checking:** Check numeric values within acceptable ranges.

**Format validation:** Use regex để validate formats (email, phone number, URL).

**Schema validation:** Use Mongoose schema validation hay libraries như Joi cho complex validation rules.

### 2.8.4. Performance Optimization

**A. Database optimization**

**Indexing:** Create indexes on frequently queried fields để speed up queries.

**Query optimization:** Select only needed fields rather than entire documents. Use lean queries khi không cần Mongoose document features.

**Pagination:** Limit results với pagination rather than returning thousands of documents.

**Caching:** Cache frequently accessed data (user profile, settings) trong memory hay Redis để reduce database hits.

**B. Frontend optimization**

**Code splitting:** Lazy load components và screens to reduce initial bundle size.

**Memoization:** Use useMemo và useCallback để prevent unnecessary re-renders và re-computations.

**Virtual lists:** Use FlatList với windowSize optimization cho long lists to render only visible items.

**Image optimization:** Compress images, use appropriate formats, lazy load images.

**Network optimization:** Batch API requests where possible, implement request cancellation, cache API responses.

### 2.8.5. Testing Strategies

**A. Testing pyramid**

**Unit tests:** Test individual functions và components trong isolation. Fast, numerous, easy to maintain. DeepFocus có 348 backend unit tests.

**Integration tests:** Test how multiple units work together (API endpoints, database operations). Slower than unit tests but test realistic scenarios.

**End-to-end tests:** Test entire user flows from UI through backend to database. Slow nhưng catch integration issues.

**B. Test coverage goals**

**Critical paths:** 100% coverage cho authentication, authorization, payment processing.

**Business logic:** High coverage (80%+) cho controllers và services.

**Utility functions:** 100% coverage cho pure functions và helpers.

**UI components:** Moderate coverage cho presentation components, focus on logic-heavy components.

**C. Continuous testing**

**Pre-commit hooks:** Run linters và formatters trước commits.

**CI/CD pipeline:** Automatically run tests khi push code. Block merges nếu tests fail.

**Test automation:** Automated tests run regularly, catching regressions early.

### 2.8.6. Code Quality và Maintenance

**A. Code review practices**

**Peer reviews:** All code changes reviewed by at least one other developer.

**Review checklist:** Check for logic errors, security issues, performance problems, code style consistency.

**Documentation:** Review checks for adequate comments và documentation.

**B. Documentation standards**

**Code comments:** Explain WHY, not WHAT. Complex logic should have explanatory comments.

**Function documentation:** JSDoc comments cho functions với parameters, return values, và usage examples.

**API documentation:** Document all API endpoints với request/response formats, authentication requirements, error codes.

**README files:** Project overview, setup instructions, usage guides.

**C. Version control practices**

**Branching strategy:** Use feature branches cho new development, main branch always stable.

**Commit messages:** Clear, descriptive commit messages following conventions (feat:, fix:, docs:, refactor:, test:).

**Pull requests:** Use PRs cho code reviews và discussion before merging.

**Semantic versioning:** Version numbers follow semver (MAJOR.MINOR.PATCH).

---

**[KẾT THÚC CHƯƠNG 2 - CƠ SỞ LÝ THUYẾT]**

_Tổng số trang Chương 2: ~20 trang_
_Đã tập trung vào lý thuyết, giải thích khái niệm và phân tích thay vì code chi tiết_
