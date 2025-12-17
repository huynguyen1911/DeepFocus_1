# Sơ đồ Use Case - DeepFocus Application

## Cách sử dụng:

### 1. Sử dụng PlantUML Online (Khuyến nghị)

- Truy cập: http://www.plantuml.com/plantuml/uml/
- Copy code PlantUML từ Phần 1
- Paste vào editor → Generate → Download PNG/SVG

### 2. Sử dụng Mermaid Live Editor

- Truy cập: https://mermaid.live/
- Copy code Mermaid từ Phần 2
- Paste → Export PNG/SVG/PDF

### 3. Sử dụng Draw.io

- Truy cập: https://app.diagrams.net/
- File → Import from → Text → Paste PlantUML code

---

## PHẦN 1: PlantUML CODE (Khuyến nghị cho Use Case)

### Use Case Diagram Tổng quan:

```plantuml
@startuml DeepFocus_UseCase_Overview
left to right direction
skinparam packageStyle rectangle

actor "Học sinh\n(Student)" as Student
actor "Giáo viên\n(Teacher)" as Teacher
actor "Phụ huynh\n(Guardian)" as Guardian
actor "Hệ thống" as System

rectangle "DeepFocus Application" {

  package "Xác thực & Quản lý Tài khoản" {
    usecase "Đăng ký" as UC1
    usecase "Đăng nhập" as UC2
    usecase "Đăng xuất" as UC3
    usecase "Cập nhật hồ sơ" as UC4
    usecase "Đổi mật khẩu" as UC5
  }

  package "Quản lý Nhiệm vụ" {
    usecase "Tạo nhiệm vụ" as UC6
    usecase "Chỉnh sửa nhiệm vụ" as UC7
    usecase "Xóa nhiệm vụ" as UC8
    usecase "Xem danh sách nhiệm vụ" as UC9
    usecase "Đánh dấu hoàn thành" as UC10
    usecase "Lọc nhiệm vụ theo trạng thái" as UC11
  }

  package "Pomodoro Timer" {
    usecase "Bắt đầu phiên Pomodoro" as UC12
    usecase "Tạm dừng/Tiếp tục" as UC13
    usecase "Kết thúc phiên sớm" as UC14
    usecase "Xem lịch sử phiên" as UC15
    usecase "Liên kết nhiệm vụ với phiên" as UC16
  }

  package "Trò chơi hóa" {
    usecase "Xem XP và Level" as UC17
    usecase "Xem thành tích đạt được" as UC18
    usecase "Xem bảng xếp hạng" as UC19
    usecase "Tham gia thi đấu" as UC20
  }

  package "Quản lý Lớp học" {
    usecase "Tạo lớp học" as UC21
    usecase "Thêm/Xóa học sinh" as UC22
    usecase "Giao nhiệm vụ cho lớp" as UC23
    usecase "Xem tiến độ học sinh" as UC24
    usecase "Tham gia lớp học" as UC25
    usecase "Tạo thi đấu trong lớp" as UC26
  }

  package "Thống kê & Báo cáo" {
    usecase "Xem dashboard cá nhân" as UC27
    usecase "Xem biểu đồ thời gian tập trung" as UC28
    usecase "Xem báo cáo hàng ngày" as UC29
    usecase "Xem báo cáo theo tuần/tháng" as UC30
    usecase "Xuất báo cáo PDF" as UC31
  }

  package "Giám sát Con em" {
    usecase "Xem hoạt động con em" as UC32
    usecase "Nhận thông báo cảnh báo" as UC33
    usecase "Gửi tin nhắn động viên" as UC34
    usecase "Xem báo cáo tiến độ" as UC35
  }

  package "Thông báo" {
    usecase "Nhận thông báo" as UC36
    usecase "Đánh dấu đã đọc" as UC37
    usecase "Xóa thông báo" as UC38
  }
}

' Student relationships
Student --> UC1
Student --> UC2
Student --> UC3
Student --> UC4
Student --> UC5
Student --> UC6
Student --> UC7
Student --> UC8
Student --> UC9
Student --> UC10
Student --> UC11
Student --> UC12
Student --> UC13
Student --> UC14
Student --> UC15
Student --> UC16
Student --> UC17
Student --> UC18
Student --> UC19
Student --> UC20
Student --> UC25
Student --> UC27
Student --> UC28
Student --> UC29
Student --> UC30
Student --> UC36
Student --> UC37
Student --> UC38

' Teacher relationships
Teacher --> UC1
Teacher --> UC2
Teacher --> UC3
Teacher --> UC4
Teacher --> UC5
Teacher --> UC21
Teacher --> UC22
Teacher --> UC23
Teacher --> UC24
Teacher --> UC26
Teacher --> UC27
Teacher --> UC30
Teacher --> UC31
Teacher --> UC36

' Guardian relationships
Guardian --> UC1
Guardian --> UC2
Guardian --> UC3
Guardian --> UC4
Guardian --> UC5
Guardian --> UC32
Guardian --> UC33
Guardian --> UC34
Guardian --> UC35
Guardian --> UC36

' System relationships
System --> UC36 : <<trigger>>
System --> UC18 : <<award>>

' Extensions and includes
UC12 ..> UC16 : <<include>>
UC23 ..> UC6 : <<extend>>
UC24 ..> UC30 : <<include>>
UC32 ..> UC35 : <<include>>

@enduml
```

---

### Use Case Diagram Chi tiết - Module Authentication:

```plantuml
@startuml Authentication_UseCase
left to right direction

actor "Người dùng" as User
actor "Hệ thống Email" as Email

rectangle "Module Xác thực" {
  usecase "Đăng ký tài khoản" as Register
  usecase "Chọn vai trò\n(Student/Teacher/Guardian)" as ChooseRole
  usecase "Xác thực email" as VerifyEmail
  usecase "Đăng nhập" as Login
  usecase "Quên mật khẩu" as ForgotPassword
  usecase "Đặt lại mật khẩu" as ResetPassword
  usecase "Đăng nhập bằng Google" as GoogleLogin
  usecase "Đăng nhập bằng Facebook" as FacebookLogin
  usecase "Đổi mật khẩu" as ChangePassword
  usecase "Cập nhật thông tin cá nhân" as UpdateProfile
}

User --> Register
Register ..> ChooseRole : <<include>>
Register ..> VerifyEmail : <<extend>>
VerifyEmail --> Email

User --> Login
Login ..> GoogleLogin : <<extend>>
Login ..> FacebookLogin : <<extend>>

User --> ForgotPassword
ForgotPassword ..> ResetPassword : <<include>>
ForgotPassword --> Email

User --> ChangePassword
User --> UpdateProfile

note right of Register
  Đăng ký yêu cầu:
  - Email hợp lệ
  - Username unique
  - Password >= 8 ký tự
  - Chọn vai trò
end note

note right of Login
  Hỗ trợ đăng nhập bằng:
  - Email/Password
  - Google OAuth
  - Facebook OAuth
end note

@enduml
```

---

### Use Case Diagram Chi tiết - Module Pomodoro Timer:

```plantuml
@startuml Pomodoro_UseCase
left to right direction

actor "Học sinh" as Student
actor "Hệ thống\nThông báo" as NotificationSystem

rectangle "Module Pomodoro Timer" {
  usecase "Chọn nhiệm vụ" as SelectTask
  usecase "Cấu hình thời gian\n(25/5/15 phút)" as ConfigTime
  usecase "Bắt đầu phiên Focus" as StartFocus
  usecase "Đếm ngược thời gian" as Countdown
  usecase "Phát hiện phân tâm" as DetectDistraction
  usecase "Tạm dừng phiên" as Pause
  usecase "Tiếp tục phiên" as Resume
  usecase "Kết thúc phiên sớm" as EndEarly
  usecase "Hoàn thành phiên" as Complete
  usecase "Bắt đầu nghỉ ngắn\n(5 phút)" as ShortBreak
  usecase "Bắt đầu nghỉ dài\n(15 phút)" as LongBreak
  usecase "Cập nhật XP và streak" as UpdateXP
  usecase "Lưu lịch sử phiên" as SaveHistory
}

Student --> SelectTask
SelectTask ..> ConfigTime : <<include>>
ConfigTime --> StartFocus
StartFocus ..> Countdown : <<include>>
Countdown ..> DetectDistraction : <<extend>>

StartFocus --> Pause
Pause --> Resume
Pause --> EndEarly

Countdown --> Complete
Complete ..> UpdateXP : <<include>>
Complete ..> SaveHistory : <<include>>
Complete ..> ShortBreak : <<extend>>
Complete ..> LongBreak : <<extend>>

Complete --> NotificationSystem
UpdateXP --> NotificationSystem

note right of StartFocus
  Khi bắt đầu phiên:
  1. Chọn nhiệm vụ (optional)
  2. Set timer (default 25 phút)
  3. Bắt đầu đếm ngược
  4. Theo dõi focus score
end note

note right of Complete
  Khi hoàn thành:
  - Cộng XP (25 phút = 25 XP)
  - Tăng streak
  - Unlock achievements
  - Gửi notification
  - Đề xuất break
end note

@enduml
```

---

### Use Case Diagram Chi tiết - Module Class Management:

```plantuml
@startuml ClassManagement_UseCase
left to right direction

actor "Giáo viên" as Teacher
actor "Học sinh" as Student
actor "Hệ thống" as System

rectangle "Module Quản lý Lớp học" {

  package "Quản lý Lớp" {
    usecase "Tạo lớp học mới" as CreateClass
    usecase "Tạo mã lớp tự động" as GenerateCode
    usecase "Chỉnh sửa thông tin lớp" as EditClass
    usecase "Xóa lớp học" as DeleteClass
    usecase "Xem danh sách lớp" as ViewClasses
  }

  package "Quản lý Thành viên" {
    usecase "Mời học sinh vào lớp" as InviteStudent
    usecase "Duyệt yêu cầu tham gia" as ApproveRequest
    usecase "Xóa học sinh khỏi lớp" as RemoveStudent
    usecase "Xem danh sách thành viên" as ViewMembers
  }

  package "Tham gia Lớp" {
    usecase "Nhập mã lớp" as EnterCode
    usecase "Gửi yêu cầu tham gia" as SendRequest
    usecase "Rời khỏi lớp" as LeaveClass
  }

  package "Giao Nhiệm vụ" {
    usecase "Tạo nhiệm vụ cho lớp" as AssignTask
    usecase "Set deadline" as SetDeadline
    usecase "Xem tiến độ hoàn thành" as ViewProgress
    usecase "Gửi nhắc nhở" as SendReminder
  }

  package "Thi đấu" {
    usecase "Tạo cuộc thi" as CreateCompetition
    usecase "Thiết lập quy tắc" as SetRules
    usecase "Theo dõi bảng xếp hạng" as TrackLeaderboard
    usecase "Công bố kết quả" as AnnounceResults
  }
}

' Teacher interactions
Teacher --> CreateClass
CreateClass ..> GenerateCode : <<include>>
Teacher --> EditClass
Teacher --> DeleteClass
Teacher --> ViewClasses

Teacher --> InviteStudent
Teacher --> ApproveRequest
Teacher --> RemoveStudent
Teacher --> ViewMembers

Teacher --> AssignTask
AssignTask ..> SetDeadline : <<include>>
Teacher --> ViewProgress
Teacher --> SendReminder

Teacher --> CreateCompetition
CreateCompetition ..> SetRules : <<include>>
Teacher --> TrackLeaderboard
Teacher --> AnnounceResults

' Student interactions
Student --> EnterCode
EnterCode ..> SendRequest : <<include>>
Student --> LeaveClass
Student --> ViewMembers
Student --> ViewProgress
Student --> TrackLeaderboard

' System interactions
System --> GenerateCode
System --> SendReminder
System --> TrackLeaderboard

note right of CreateClass
  Tạo lớp bao gồm:
  - Tên lớp
  - Mô tả
  - Mã lớp 6 ký tự (auto)
  - Giáo viên là owner
end note

note right of AssignTask
  Giao nhiệm vụ cho:
  - Toàn bộ lớp
  - Nhóm học sinh
  - Cá nhân học sinh
end note

@enduml
```

---

### Use Case Diagram Chi tiết - Module Gamification:

```plantuml
@startuml Gamification_UseCase
left to right direction

actor "Học sinh" as Student
actor "Hệ thống" as System

rectangle "Module Trò chơi hóa" {

  package "Hệ thống XP & Level" {
    usecase "Kiếm XP từ\nphiên Pomodoro" as EarnXP
    usecase "Kiếm XP từ\nhoàn thành nhiệm vụ" as TaskXP
    usecase "Tăng Level" as LevelUp
    usecase "Xem tiến độ Level" as ViewProgress
    usecase "Unlock tính năng mới" as UnlockFeature
  }

  package "Thành tích (Achievements)" {
    usecase "Xem danh sách thành tích" as ViewAchievements
    usecase "Unlock thành tích" as UnlockAchievement
    usecase "Xem tiến độ thành tích" as AchievementProgress
    usecase "Chia sẻ thành tích" as ShareAchievement
  }

  package "Streak System" {
    usecase "Duy trì streak hàng ngày" as MaintainStreak
    usecase "Nhận streak bonus" as StreakBonus
    usecase "Phục hồi streak" as RecoverStreak
    usecase "Xem lịch sử streak" as StreakHistory
  }

  package "Bảng Xếp hạng" {
    usecase "Xem leaderboard toàn cầu" as GlobalLeaderboard
    usecase "Xem leaderboard lớp" as ClassLeaderboard
    usecase "Xem leaderboard bạn bè" as FriendsLeaderboard
    usecase "Lọc theo thời gian" as FilterTime
  }

  package "Thi đấu" {
    usecase "Tham gia thi đấu" as JoinCompetition
    usecase "Xem quy tắc thi đấu" as ViewRules
    usecase "Theo dõi tiến độ thi" as TrackProgress
    usecase "Nhận phần thưởng" as ClaimReward
  }
}

' Student interactions
Student --> EarnXP
Student --> TaskXP
EarnXP ..> LevelUp : <<trigger>>
TaskXP ..> LevelUp : <<trigger>>
Student --> ViewProgress
LevelUp ..> UnlockFeature : <<extend>>

Student --> ViewAchievements
Student --> AchievementProgress
Student --> ShareAchievement

Student --> MaintainStreak
MaintainStreak ..> StreakBonus : <<trigger>>
Student --> RecoverStreak
Student --> StreakHistory

Student --> GlobalLeaderboard
Student --> ClassLeaderboard
Student --> FriendsLeaderboard
GlobalLeaderboard ..> FilterTime : <<include>>

Student --> JoinCompetition
JoinCompetition ..> ViewRules : <<include>>
Student --> TrackProgress
Student --> ClaimReward

' System interactions
System --> UnlockAchievement
System --> StreakBonus
System --> GlobalLeaderboard
System --> ClassLeaderboard

note right of EarnXP
  Cách kiếm XP:
  - 1 phút focus = 1 XP
  - Hoàn thành task = 50 XP
  - Streak bonus = 10-100 XP
  - Achievement = 25-500 XP
end note

note right of LevelUp
  Level Requirements:
  - Level 1→2: 100 XP
  - Level 2→3: 250 XP
  - Level 3→4: 500 XP
  - Exponential growth
end note

note right of UnlockAchievement
  42 Achievements:
  - First Focus (25 XP)
  - 10 Hours Focus (100 XP)
  - 7 Day Streak (200 XP)
  - Task Master (150 XP)
  - etc.
end note

@enduml
```

---

## PHẦN 2: MERMAID CODE (Cho GitHub/GitLab)

```mermaid
graph TB
    subgraph Actors
        Student[Học sinh]
        Teacher[Giáo viên]
        Guardian[Phụ huynh]
        System[Hệ thống]
    end

    subgraph Authentication[Xác thực & Tài khoản]
        UC1[Đăng ký]
        UC2[Đăng nhập]
        UC3[Đăng xuất]
        UC4[Cập nhật hồ sơ]
        UC5[Đổi mật khẩu]
    end

    subgraph TaskManagement[Quản lý Nhiệm vụ]
        UC6[Tạo nhiệm vụ]
        UC7[Chỉnh sửa nhiệm vụ]
        UC8[Xóa nhiệm vụ]
        UC9[Xem danh sách]
        UC10[Đánh dấu hoàn thành]
    end

    subgraph Pomodoro[Pomodoro Timer]
        UC12[Bắt đầu phiên]
        UC13[Tạm dừng/Tiếp tục]
        UC14[Kết thúc sớm]
        UC15[Xem lịch sử]
    end

    subgraph Gamification[Trò chơi hóa]
        UC17[Xem XP/Level]
        UC18[Xem thành tích]
        UC19[Bảng xếp hạng]
        UC20[Tham gia thi đấu]
    end

    subgraph ClassMgmt[Quản lý Lớp học]
        UC21[Tạo lớp học]
        UC22[Thêm/Xóa học sinh]
        UC23[Giao nhiệm vụ]
        UC24[Xem tiến độ]
        UC25[Tham gia lớp]
    end

    subgraph Statistics[Thống kê & Báo cáo]
        UC27[Dashboard cá nhân]
        UC28[Biểu đồ thời gian]
        UC29[Báo cáo hàng ngày]
        UC30[Báo cáo tuần/tháng]
    end

    subgraph Monitoring[Giám sát Con em]
        UC32[Xem hoạt động]
        UC33[Nhận cảnh báo]
        UC34[Gửi động viên]
        UC35[Xem báo cáo]
    end

    Student --> UC1 & UC2 & UC3 & UC4 & UC5
    Student --> UC6 & UC7 & UC8 & UC9 & UC10
    Student --> UC12 & UC13 & UC14 & UC15
    Student --> UC17 & UC18 & UC19 & UC20
    Student --> UC25 & UC27 & UC28 & UC29 & UC30

    Teacher --> UC1 & UC2 & UC3 & UC4 & UC5
    Teacher --> UC21 & UC22 & UC23 & UC24
    Teacher --> UC27 & UC30

    Guardian --> UC1 & UC2 & UC3 & UC4 & UC5
    Guardian --> UC32 & UC33 & UC34 & UC35

    System -.-> UC18
    System -.-> UC33
```

---

## PHẦN 3: Lệnh Command Line để tạo Use Case Diagram

### Sử dụng PlantUML CLI:

```bash
# 1. Cài đặt PlantUML
# Download từ: https://plantuml.com/download

# 2. Tạo file plantuml
# Copy code PlantUML từ Phần 1 vào file: usecase-overview.puml

# 3. Generate PNG
java -jar plantuml.jar usecase-overview.puml

# 4. Generate SVG (High quality)
java -jar plantuml.jar -tsvg usecase-overview.puml

# 5. Generate tất cả file .puml trong thư mục
java -jar plantuml.jar *.puml

# 6. Sử dụng Docker
docker run --rm -v $(pwd):/data plantuml/plantuml usecase-overview.puml

# 7. Generate với theme
java -jar plantuml.jar -theme bluegray usecase-overview.puml
```

### Sử dụng PlantUML với VS Code:

```bash
# 1. Cài extension PlantUML
code --install-extension jebbs.plantuml

# 2. Cài Graphviz (Required cho PlantUML)
# Windows (Chocolatey):
choco install graphviz

# macOS:
brew install graphviz

# Linux (Ubuntu):
sudo apt-get install graphviz

# 3. Trong VS Code:
# - Mở file .puml
# - Press Alt+D để preview
# - Right click → Export Current Diagram
```

### Sử dụng Mermaid CLI:

```bash
# 1. Cài đặt Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# 2. Tạo file mermaid
# Copy code Mermaid từ Phần 2 vào file: usecase.mmd

# 3. Generate PNG
mmdc -i usecase.mmd -o usecase.png -w 2400 -H 1800

# 4. Generate SVG
mmdc -i usecase.mmd -o usecase.svg

# 5. Generate với theme
mmdc -i usecase.mmd -o usecase.png -t forest
mmdc -i usecase.mmd -o usecase.png -t dark
mmdc -i usecase.mmd -o usecase.png -t neutral
```

---

## PHẦN 4: Công cụ Online (Không cần cài đặt)

### 1. PlantUML Online Server ⭐ (Khuyến nghị cho Use Case)

- **URL**: http://www.plantuml.com/plantuml/uml/
- **Cách dùng**:
  1. Copy code PlantUML từ Phần 1
  2. Paste vào text area
  3. Click "Submit"
  4. Download PNG/SVG

### 2. PlantText

- **URL**: https://www.planttext.com/
- **Features**: Online editor, real-time preview, export PNG/SVG

### 3. Mermaid Live Editor

- **URL**: https://mermaid.live/
- **Cách dùng**:
  1. Copy code Mermaid từ Phần 2
  2. Paste vào editor
  3. Export PNG/SVG/PDF

### 4. Draw.io / diagrams.net

- **URL**: https://app.diagrams.net/
- **Cách dùng**:
  1. File → Import from → PlantUML
  2. Paste code
  3. Edit và customize
  4. Export PNG/PDF/SVG

### 5. Visual Paradigm Online

- **URL**: https://online.visual-paradigm.com/diagrams/features/uml-tool/
- **Features**: Professional UML tool, many templates

---

## PHẦN 5: Script tự động tạo tất cả Use Case Diagrams

### PowerShell Script (Windows):

```powershell
# create-usecase-diagrams.ps1

# Tạo thư mục output
New-Item -ItemType Directory -Force -Path ".\diagrams\usecase"

# Tạo file PlantUML từ code
$files = @(
    "usecase-overview.puml",
    "usecase-authentication.puml",
    "usecase-pomodoro.puml",
    "usecase-class-management.puml",
    "usecase-gamification.puml"
)

# Download PlantUML jar nếu chưa có
if (-not (Test-Path "plantuml.jar")) {
    Write-Host "Downloading PlantUML..."
    Invoke-WebRequest -Uri "https://github.com/plantuml/plantuml/releases/download/v1.2023.13/plantuml-1.2023.13.jar" -OutFile "plantuml.jar"
}

# Generate diagrams
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Generating $file..."

        # PNG
        java -jar plantuml.jar $file -o "..\diagrams\usecase"

        # SVG
        java -jar plantuml.jar -tsvg $file -o "..\diagrams\usecase"

        Write-Host "✓ Generated: $file"
    }
}

Write-Host "All diagrams generated successfully!"
Write-Host "Check folder: .\diagrams\usecase\"
```

### Bash Script (Linux/Mac):

```bash
#!/bin/bash
# create-usecase-diagrams.sh

# Tạo thư mục output
mkdir -p ./diagrams/usecase

# Download PlantUML jar nếu chưa có
if [ ! -f plantuml.jar ]; then
    echo "Downloading PlantUML..."
    curl -L https://github.com/plantuml/plantuml/releases/download/v1.2023.13/plantuml-1.2023.13.jar -o plantuml.jar
fi

# Generate diagrams
for file in *.puml; do
    if [ -f "$file" ]; then
        echo "Generating $file..."

        # PNG
        java -jar plantuml.jar "$file" -o ../diagrams/usecase

        # SVG
        java -jar plantuml.jar -tsvg "$file" -o ../diagrams/usecase

        echo "✓ Generated: $file"
    fi
done

echo "All diagrams generated successfully!"
echo "Check folder: ./diagrams/usecase/"
```

---

## PHẦN 6: Tùy chỉnh Themes & Styles

### PlantUML Custom Theme:

```plantuml
@startuml
' Custom colors and styles
skinparam backgroundColor #FEFEFE
skinparam handwritten false

skinparam actor {
    BackgroundColor<<Student>> lightblue
    BorderColor<<Student>> blue
    BackgroundColor<<Teacher>> lightgreen
    BorderColor<<Teacher>> green
    BackgroundColor<<Guardian>> lightyellow
    BorderColor<<Guardian>> orange
}

skinparam usecase {
    BackgroundColor lightcyan
    BorderColor darkblue
    BorderThickness 2
    FontSize 12
    FontStyle bold
}

skinparam package {
    BackgroundColor wheat
    BorderColor brown
    FontStyle bold
}

' Your use case diagram here
@enduml
```

### PlantUML với Material Theme:

```plantuml
@startuml
!theme materia-outline

' Your use case diagram here
@enduml
```

Available themes: `bluegray`, `plain`, `sketchy`, `materia`, `carbon-gray`, `reddress-darkblue`

---

## PHẦN 7: Templates chi tiết cho từng Actor

### Template cho Student Use Cases:

```plantuml
@startuml Student_UseCases
left to right direction
skinparam actorStyle awesome

actor Student as "Học sinh\n👨‍🎓"

rectangle "Chức năng Học sinh" {

  usecase (Đăng nhập/Đăng ký) as UC_Auth
  usecase (Tạo và quản lý nhiệm vụ) as UC_Task
  usecase (Sử dụng Pomodoro Timer) as UC_Pomodoro
  usecase (Kiếm XP và thăng Level) as UC_XP
  usecase (Mở khóa thành tích) as UC_Achievement
  usecase (Tham gia lớp học) as UC_JoinClass
  usecase (Xem bảng xếp hạng) as UC_Leaderboard
  usecase (Thi đấu với bạn bè) as UC_Compete
  usecase (Xem thống kê cá nhân) as UC_Stats
  usecase (Nhận thông báo) as UC_Notification

  UC_Auth -[hidden]- UC_Task
  UC_Task -[hidden]- UC_Pomodoro
  UC_Pomodoro -[hidden]- UC_XP
}

Student --> UC_Auth
Student --> UC_Task
Student --> UC_Pomodoro
Student --> UC_XP
Student --> UC_Achievement
Student --> UC_JoinClass
Student --> UC_Leaderboard
Student --> UC_Compete
Student --> UC_Stats
Student --> UC_Notification

note right of Student
  Học sinh có đầy đủ
  tính năng để:
  - Quản lý thời gian
  - Hoàn thành nhiệm vụ
  - Tăng năng suất
  - Cạnh tranh lành mạnh
end note

@enduml
```

### Template cho Teacher Use Cases:

```plantuml
@startuml Teacher_UseCases
left to right direction
skinparam actorStyle awesome

actor Teacher as "Giáo viên\n👩‍🏫"

rectangle "Chức năng Giáo viên" {

  usecase (Tạo và quản lý lớp học) as UC_CreateClass
  usecase (Thêm/Xóa học sinh) as UC_ManageStudent
  usecase (Giao nhiệm vụ cho lớp) as UC_AssignTask
  usecase (Theo dõi tiến độ học sinh) as UC_TrackProgress
  usecase (Tạo cuộc thi trong lớp) as UC_CreateComp
  usecase (Xem báo cáo lớp học) as UC_ClassReport
  usecase (Gửi thông báo cho học sinh) as UC_SendNotif
  usecase (Xuất báo cáo PDF) as UC_ExportPDF
  usecase (Phân tích hiệu suất) as UC_Analytics

}

Teacher --> UC_CreateClass
Teacher --> UC_ManageStudent
Teacher --> UC_AssignTask
Teacher --> UC_TrackProgress
Teacher --> UC_CreateComp
Teacher --> UC_ClassReport
Teacher --> UC_SendNotif
Teacher --> UC_ExportPDF
Teacher --> UC_Analytics

UC_AssignTask ..> UC_SendNotif : <<notify>>
UC_TrackProgress ..> UC_ClassReport : <<include>>

note right of Teacher
  Giáo viên quản lý:
  - Nhiều lớp học
  - Học sinh trong lớp
  - Tiến độ và hiệu suất
  - Tổ chức thi đấu
end note

@enduml
```

---

## PHẦN 8: Mô tả chi tiết Use Cases (Đặc tả)

### UC12: Bắt đầu phiên Pomodoro

**Tên**: Bắt đầu phiên Pomodoro  
**Actor**: Học sinh  
**Mô tả**: Học sinh bắt đầu một phiên học tập tập trung sử dụng kỹ thuật Pomodoro

**Tiền điều kiện**:

- Học sinh đã đăng nhập
- Không có phiên Pomodoro nào đang chạy

**Luồng sự kiện chính**:

1. Học sinh nhấn nút "Bắt đầu Focus"
2. Hệ thống hiển thị màn hình cấu hình
3. Học sinh chọn nhiệm vụ (optional)
4. Học sinh chọn thời gian (25/50/90 phút)
5. Học sinh xác nhận bắt đầu
6. Hệ thống bắt đầu đếm ngược
7. Hệ thống theo dõi focus score
8. Hệ thống phát hiện phân tâm (nếu có)
9. Hết thời gian, hệ thống thông báo hoàn thành
10. Hệ thống cộng XP và cập nhật streak

**Luồng thay thế**:

- 6a. Học sinh tạm dừng phiên → Use case UC13
- 8a. Học sinh kết thúc sớm → Use case UC14

**Hậu điều kiện**:

- Phiên Pomodoro được lưu vào lịch sử
- XP được cộng vào tài khoản
- Streak được cập nhật
- Nhiệm vụ được đánh dấu hoàn thành (nếu có)

---

## Ghi chú:

**Khuyến nghị công cụ cho Use Case Diagram:**

1. **PlantUML Online** ⭐⭐⭐⭐⭐ - Tốt nhất

   - Syntax đơn giản
   - Kết quả chuyên nghiệp
   - Export quality cao

2. **Visual Paradigm Online** ⭐⭐⭐⭐ - Chuyên nghiệp

   - Giao diện kéo thả
   - Nhiều template
   - Phù hợp báo cáo

3. **Mermaid** ⭐⭐⭐ - Đơn giản
   - Tốt cho GitHub/GitLab
   - Cú pháp ngắn gọn
   - Hạn chế về styling

**Lời khuyên:**

- Sử dụng **PlantUML** cho báo cáo học thuật
- Chia nhỏ thành nhiều diagram thay vì 1 diagram lớn
- Sử dụng colors để phân biệt actors
- Thêm notes để giải thích

Chúc bạn tạo Use Case Diagram thành công! 🎯
