/**
 * Seed Sample Data Script
 * Run: node scripts/seed-data.js
 * This will populate MongoDB with sample data for testing
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const Class = require("../models/Class");
const Session = require("../models/Session");
const Task = require("../models/Task");
const Reward = require("../models/Reward");
const Achievement = require("../models/Achievement");
const Alert = require("../models/Alert");
const Stats = require("../models/Stats");
const GuardianLink = require("../models/GuardianLink");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/deepfocus";

// Sample data arrays
const studentNames = [
  "Nguyễn Văn An",
  "Trần Thị Bình",
  "Lê Hoàng Cường",
  "Phạm Thị Dung",
  "Hoàng Văn Em",
  "Vũ Thị Phượng",
  "Đặng Minh Giang",
  "Bùi Thị Hà",
  "Phan Văn Hùng",
  "Đinh Thị Linh",
  "Ngô Văn Khoa",
  "Võ Thị Mai",
  "Đỗ Văn Nam",
  "Lý Thị Nga",
  "Trịnh Văn Oanh",
  "Dương Thị Phương",
];

const teacherNames = [
  "Thầy Nguyễn Văn Toàn",
  "Cô Trần Thị Lan",
  "Thầy Lê Minh Tuấn",
  "Cô Phạm Thu Hà",
];

const classNames = [
  {
    name: "Lớp Toán 10A1",
    subject: "Toán",
    description: "Lớp toán nâng cao khối 10",
  },
  { name: "Lớp Văn 11B2", subject: "Văn", description: "Lớp văn học khối 11" },
  {
    name: "Lớp Anh Văn A2",
    subject: "Anh Văn",
    description: "Lớp tiếng Anh trình độ A2",
  },
  { name: "Lớp Lý 12C3", subject: "Lý", description: "Lớp vật lý khối 12" },
  { name: "Lớp Hóa 10D1", subject: "Hóa", description: "Lớp hóa học cơ bản" },
];

const taskTitles = [
  "Làm bài tập về nhà",
  "Ôn tập chương 1",
  "Đọc sách giáo khoa",
  "Làm đề kiểm tra",
  "Xem video bài giảng",
  "Làm bài tập nâng cao",
  "Ôn tập giữa kỳ",
  "Chuẩn bị bài mới",
  "Làm project nhóm",
  "Nghiên cứu tài liệu",
];

const rewardTitles = [
  "Hoàn thành 10 Pomodoro",
  "Tập trung tốt nhất tuần",
  "Điểm cao nhất bài kiểm tra",
  "Tham gia tích cực",
  "Tiến bộ vượt bậc",
];

const penaltyTitles = [
  "Thiếu tập trung trong giờ học",
  "Không hoàn thành bài tập",
  "Đi trễ",
  "Không chuẩn bị bài",
];

// Helper functions
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (arr) => arr[randomInt(0, arr.length - 1)];
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log("\n🗑️  Clearing existing data...");
  await User.deleteMany({ email: { $regex: /^sample/ } });
  await Class.deleteMany({ name: { $regex: /Lớp/ } });
  await Session.deleteMany({});
  await Task.deleteMany({});
  await Reward.deleteMany({});
  await Achievement.deleteMany({});
  await Alert.deleteMany({});
  await Stats.deleteMany({});
  await GuardianLink.deleteMany({});
  console.log("✅ Cleared sample data");
}

async function createUsers() {
  console.log("\n👥 Creating users...");
  const users = [];
  const password = "password123"; // Let User model's pre-save hook hash it

  // Create students
  for (let i = 0; i < studentNames.length; i++) {
    const user = await User.create({
      username: `student${i + 1}`,
      email: `sample.student${i + 1}@example.com`,
      password: password,
      defaultRole: "student",
      roles: [{ type: "student", isPrimary: true, isActive: true }],
      focusProfile: {
        fullName: studentNames[i],
        level: randomInt(1, 10),
        dailyGoal: randomInt(4, 12),
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        totalSessionsCompleted: randomInt(0, 100),
        totalFocusTime: randomInt(0, 5000),
        currentStreak: randomInt(0, 15),
        longestStreak: randomInt(0, 30),
      },
    });
    users.push(user);
  }

  // Create teachers
  for (let i = 0; i < teacherNames.length; i++) {
    const user = await User.create({
      username: `teacher${i + 1}`,
      email: `sample.teacher${i + 1}@example.com`,
      password: password,
      defaultRole: "teacher",
      roles: [{ type: "teacher", isPrimary: true, isActive: true }],
      focusProfile: {
        fullName: teacherNames[i],
        level: 1,
        dailyGoal: 4,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
      },
    });
    users.push(user);
  }

  console.log(
    `✅ Created ${users.length} users (${studentNames.length} students, ${teacherNames.length} teachers)`
  );
  return users;
}

async function createClasses(users) {
  console.log("\n🏫 Creating classes...");
  const classes = [];
  const students = users.filter((u) => u.defaultRole === "student");
  const teachers = users.filter((u) => u.defaultRole === "teacher");

  for (let i = 0; i < classNames.length; i++) {
    const teacher = teachers[i % teachers.length];
    const classData = classNames[i];

    // Random 8-15 students per class
    const numStudents = randomInt(8, 15);
    const classStudents = [];
    const usedIndices = new Set();

    while (classStudents.length < numStudents) {
      const idx = randomInt(0, students.length - 1);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        classStudents.push(students[idx]);
      }
    }

    const members = [
      {
        user: teacher._id,
        role: "teacher",
        status: "active",
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      ...classStudents.map((student) => ({
        user: student._id,
        role: "student",
        status: "active",
        joinedAt: randomDate(
          new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        ),
      })),
    ];

    const classObj = await Class.create({
      name: classData.name,
      description: classData.description,
      type: "school",
      createdBy: teacher._id,
      members: members,
      joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      joinCodeExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      stats: {
        totalMembers: members.length,
        activeMembers: members.length,
        totalPomodoros: randomInt(100, 500),
        averageCompletion: randomInt(60, 95),
      },
    });

    classes.push({ class: classObj, students: classStudents, teacher });
  }

  console.log(`✅ Created ${classes.length} classes`);
  return classes;
}

async function createSessions(classes) {
  console.log("\n⏱️  Creating sessions...");
  let sessionCount = 0;
  const now = new Date();

  for (const classData of classes) {
    for (const student of classData.students) {
      // Create 10-30 sessions per student over the last 14 days
      const numSessions = randomInt(10, 30);

      for (let i = 0; i < numSessions; i++) {
        const sessionDate = randomDate(
          new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          now
        );

        const duration = 25; // Pomodoro duration
        const completed = Math.random() > 0.1; // 90% completion rate

        await Session.create({
          user: student._id,
          class: classData.class._id,
          type: "focus",
          duration: completed ? duration : randomInt(10, 24),
          targetDuration: duration,
          completed: completed,
          rating: completed ? randomInt(3, 5) : null,
          mood: completed
            ? randomElement(["happy", "neutral", "focused", "tired"])
            : null,
          createdAt: sessionDate,
          updatedAt: sessionDate,
        });

        sessionCount++;

        // Add some break sessions (short or long break)
        if (Math.random() > 0.5) {
          const breakType = Math.random() > 0.75 ? "long-break" : "short-break";
          const breakDuration = breakType === "long-break" ? 15 : 5;

          await Session.create({
            user: student._id,
            class: classData.class._id,
            type: breakType,
            duration: breakDuration,
            targetDuration: breakDuration,
            completed: true,
            createdAt: new Date(sessionDate.getTime() + duration * 60 * 1000),
            updatedAt: new Date(sessionDate.getTime() + duration * 60 * 1000),
          });
          sessionCount++;
        }
      }
    }
  }

  console.log(`✅ Created ${sessionCount} sessions`);
}

async function createTasks(users, classes) {
  console.log("\n📝 Creating tasks...");
  let taskCount = 0;
  const now = new Date();

  // Create tasks for ALL users (students, teachers, guardians - everyone can have personal tasks)
  for (const user of users) {
    // Each user gets 8-15 tasks
    const numTasks = randomInt(8, 15);

    for (let i = 0; i < numTasks; i++) {
      // Tasks created over the last 30 days
      const createdAt = randomDate(
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        now
      );

      // Task status distribution:
      // 50% completed (in the past)
      // 30% in progress (ongoing)
      // 20% not started (future or pending)
      const rand = Math.random();
      let completed = false;
      let completedAt = null;
      let dueDate;
      let progress = 0;
      let actualPomodoros = 0;
      const estimatedPomodoros = randomInt(2, 8);

      if (rand < 0.5) {
        // Completed tasks (past tasks)
        completed = true;
        dueDate = new Date(
          createdAt.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000
        );
        completedAt = randomDate(createdAt, dueDate < now ? dueDate : now);
        actualPomodoros = randomInt(
          estimatedPomodoros - 1,
          estimatedPomodoros + 2
        );
        if (actualPomodoros < 0) actualPomodoros = estimatedPomodoros;
        progress = 100;
      } else if (rand < 0.8) {
        // In progress tasks (current tasks)
        completed = false;
        dueDate = randomDate(
          now,
          new Date(now.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000)
        );
        actualPomodoros = randomInt(1, Math.max(1, estimatedPomodoros - 1));
        progress = Math.round((actualPomodoros / estimatedPomodoros) * 100);
        if (progress > 90) progress = randomInt(60, 90); // Keep it in progress, not near completion
      } else {
        // Not started tasks (future tasks)
        completed = false;
        dueDate = randomDate(
          new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
          new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
        );
        actualPomodoros = 0;
        progress = 0;
      }

      // Assign to class if user is in any class
      let assignedClass = null;
      if (user.defaultRole === "student") {
        // Find a class this student is in
        const userClasses = classes.filter((c) =>
          c.students.some((s) => s._id.toString() === user._id.toString())
        );
        if (userClasses.length > 0) {
          assignedClass = randomElement(userClasses).class._id;
        }
      } else if (user.defaultRole === "teacher") {
        // Find a class this teacher created (optional, 30% chance)
        if (Math.random() < 0.3) {
          const teacherClasses = classes.filter(
            (c) => c.teacher._id.toString() === user._id.toString()
          );
          if (teacherClasses.length > 0) {
            assignedClass = randomElement(teacherClasses).class._id;
          }
        }
      }

      await Task.create({
        userId: user._id,
        title: randomElement(taskTitles),
        description: `Chi tiết về bài tập: ${randomElement(
          taskTitles
        ).toLowerCase()}. Cần hoàn thành đầy đủ và đúng hạn.`,
        priority: randomElement(["low", "medium", "high"]),
        isCompleted: completed,
        completedAt: completedAt,
        dueDate: dueDate,
        estimatedPomodoros: estimatedPomodoros,
        completedPomodoros: actualPomodoros,
        createdAt: createdAt,
        updatedAt: completed ? completedAt : now,
      });

      taskCount++;
    }
  }

  console.log(`✅ Created ${taskCount} tasks for ${users.length} users`);
  console.log(`   - ~50% isCompleted (past)`);
  console.log(`   - ~30% in progress (ongoing)`);
  console.log(`   - ~20% not started (future)`);
}

async function createRewards(classes) {
  console.log("\n🏆 Creating rewards...");
  let rewardCount = 0;

  for (const classData of classes) {
    // Give rewards to 3-5 random students in each class
    const numRewards = randomInt(3, 5);
    for (let i = 0; i < numRewards; i++) {
      const student = randomElement(classData.students);
      await Reward.create({
        student: student._id,
        class: classData.class._id,
        type: "reward",
        category: randomElement([
          "attendance",
          "performance",
          "behavior",
          "achievement",
        ]),
        points: randomInt(10, 50),
        reason: randomElement(rewardTitles),
        givenBy: classData.teacher._id,
        status: "approved",
        metadata: {
          notes: "Phần thưởng cho học sinh xuất sắc",
        },
      });
      rewardCount++;
    }

    // Give penalties to 1-2 random students in each class
    const numPenalties = randomInt(1, 2);
    for (let i = 0; i < numPenalties; i++) {
      const student = randomElement(classData.students);
      await Reward.create({
        student: student._id,
        class: classData.class._id,
        type: "penalty",
        category: randomElement(["attendance", "performance", "behavior"]),
        points: -randomInt(5, 20),
        reason: randomElement(penaltyTitles),
        givenBy: classData.teacher._id,
        status: "approved",
        metadata: {
          notes: "Nhắc nhở học sinh cần cải thiện",
        },
      });
      rewardCount++;
    }
  }

  console.log(`✅ Created ${rewardCount} rewards/penalties`);
}

async function createAchievements(users) {
  console.log("\n🎖️  Creating achievements...");

  // First, create achievement definitions (global achievements available to unlock)
  const achievementDefs = [
    {
      code: "FIRST_POMODORO",
      type: "milestone",
      name: { en: "First Steps", vi: "Bước Đầu Tiên" },
      description: {
        en: "Complete your first Pomodoro",
        vi: "Hoàn thành Pomodoro đầu tiên",
      },
      icon: "🎯",
      rarity: "common",
      points: 10,
      unlockCriteria: {
        metric: "pomodoros_completed",
        threshold: 1,
        timeframe: "all_time",
      },
      category: "milestone",
    },
    {
      code: "POMODORO_10",
      type: "pomodoro_count",
      name: { en: "Focus Beginner", vi: "Người Mới Bắt Đầu" },
      description: {
        en: "Complete 10 Pomodoros",
        vi: "Hoàn thành 10 Pomodoros",
      },
      icon: "🌱",
      rarity: "common",
      points: 20,
      unlockCriteria: {
        metric: "pomodoros_completed",
        threshold: 10,
        timeframe: "all_time",
      },
      category: "productivity",
    },
    {
      code: "POMODORO_50",
      type: "pomodoro_count",
      name: { en: "Focus Master", vi: "Bậc Thầy Tập Trung" },
      description: {
        en: "Complete 50 Pomodoros",
        vi: "Hoàn thành 50 Pomodoros",
      },
      icon: "🧠",
      rarity: "rare",
      points: 50,
      unlockCriteria: {
        metric: "pomodoros_completed",
        threshold: 50,
        timeframe: "all_time",
      },
      category: "productivity",
    },
    {
      code: "STREAK_7",
      type: "streak",
      name: { en: "Consistency King", vi: "Vua Kiên Trì" },
      description: {
        en: "Maintain 7-day streak",
        vi: "Duy trì streak 7 ngày liên tục",
      },
      icon: "🔥",
      rarity: "rare",
      points: 40,
      unlockCriteria: {
        metric: "streak_days",
        threshold: 7,
        timeframe: "all_time",
      },
      category: "consistency",
    },
    {
      code: "EARLY_BIRD",
      type: "early_bird",
      name: { en: "Early Bird", vi: "Chim Sớm" },
      description: {
        en: "Complete session before 7 AM",
        vi: "Học tập trước 7h sáng",
      },
      icon: "🌅",
      rarity: "common",
      points: 15,
      unlockCriteria: {
        metric: "early_sessions_count",
        threshold: 1,
        timeframe: "all_time",
      },
      category: "special",
    },
    {
      code: "NIGHT_OWL",
      type: "night_owl",
      name: { en: "Night Owl", vi: "Cú Đêm" },
      description: {
        en: "Complete session after 10 PM",
        vi: "Học tập sau 10h tối",
      },
      icon: "🦉",
      rarity: "common",
      points: 15,
      unlockCriteria: {
        metric: "late_sessions_count",
        threshold: 1,
        timeframe: "all_time",
      },
      category: "special",
    },
    {
      code: "TASK_MASTER",
      type: "task_completion",
      name: { en: "Task Master", vi: "Bậc Thầy Nhiệm Vụ" },
      description: { en: "Complete 20 tasks", vi: "Hoàn thành 20 nhiệm vụ" },
      icon: "✅",
      rarity: "rare",
      points: 30,
      unlockCriteria: {
        metric: "tasks_completed",
        threshold: 20,
        timeframe: "all_time",
      },
      category: "productivity",
    },
  ];

  // Create achievement definitions
  const createdAchievements = [];
  for (const def of achievementDefs) {
    const achievement = await Achievement.create(def);
    createdAchievements.push(achievement);
  }

  console.log(
    `✅ Created ${createdAchievements.length} achievement definitions`
  );
}

async function createAlerts(classes) {
  console.log("\n🔔 Creating alerts...");
  let alertCount = 0;

  for (const classData of classes) {
    // Create 2-3 alerts per class for each student
    for (const student of classData.students) {
      for (let i = 0; i < randomInt(2, 3); i++) {
        const alertTypes = [
          {
            type: "info",
            title: "Bài tập mới",
            message: "Bạn có bài tập mới từ lớp " + classData.class.name,
          },
          {
            type: "success",
            title: "Phần thưởng mới",
            message: "Bạn nhận được phần thưởng từ giáo viên!",
          },
          {
            type: "success",
            title: "Thành tựu mới",
            message: "Chúc mừng! Bạn đã mở khóa thành tựu mới",
          },
          {
            type: "warning",
            title: "Nhắc nhở",
            message: "Đừng quên hoàn thành mục tiêu hôm nay!",
          },
        ];

        const alertType = randomElement(alertTypes);

        await Alert.create({
          recipient: student._id,
          type: alertType.type,
          title: alertType.title,
          message: alertType.message,
          read: Math.random() > 0.3, // 70% read rate
        });
        alertCount++;
      }
    }
  }

  console.log(`✅ Created ${alertCount} alerts`);
}

async function createStats(users) {
  console.log("\n📊 Creating stats...");
  let statsCount = 0;
  const students = users.filter((u) => u.defaultRole === "student");

  for (const student of students) {
    // Create stats for the last 30 days
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const completedPomodoros = i === 0 ? 0 : randomInt(0, 8); // Today has 0
      const totalWorkTime = completedPomodoros * 25;
      const completedTasks = i === 0 ? 0 : randomInt(0, completedPomodoros);

      dailyStats.push({
        date: date,
        completedPomodoros: completedPomodoros,
        totalWorkTime: totalWorkTime,
        completedTasks: completedTasks,
        pomodoroSessions: [],
      });
    }

    // Calculate overall stats
    const totalPomodoros = dailyStats.reduce(
      (sum, d) => sum + d.completedPomodoros,
      0
    );
    const totalWorkTime = dailyStats.reduce(
      (sum, d) => sum + d.totalWorkTime,
      0
    );
    const totalCompletedTasks = dailyStats.reduce(
      (sum, d) => sum + d.completedTasks,
      0
    );

    // Calculate current streak
    let currentStreak = 0;
    for (let i = dailyStats.length - 2; i >= 0; i--) {
      if (dailyStats[i].completedPomodoros > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    dailyStats.forEach((d) => {
      if (d.completedPomodoros > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // Get current week data
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyData = dailyStats.filter((d) => d.date >= weekStart);
    const weeklyPomodoros = weeklyData.reduce(
      (sum, d) => sum + d.completedPomodoros,
      0
    );
    const weeklyWorkTime = weeklyData.reduce(
      (sum, d) => sum + d.totalWorkTime,
      0
    );

    // Get current month data
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyData = dailyStats.filter((d) => d.date >= monthStart);
    const monthlyPomodoros = monthlyData.reduce(
      (sum, d) => sum + d.completedPomodoros,
      0
    );
    const monthlyWorkTime = monthlyData.reduce(
      (sum, d) => sum + d.totalWorkTime,
      0
    );
    const monthlyTasks = monthlyData.reduce(
      (sum, d) => sum + d.completedTasks,
      0
    );

    await Stats.create({
      userId: student._id,
      totalPomodoros: totalPomodoros,
      totalWorkTime: totalWorkTime,
      totalCompletedTasks: totalCompletedTasks,
      currentStreak: currentStreak,
      longestStreak: longestStreak,
      lastActiveDate:
        currentStreak > 0 ? dailyStats[dailyStats.length - 2].date : null,
      dailyStats: dailyStats,
      weeklyStats: [
        {
          weekStartDate: weekStart,
          weekNumber: Math.ceil(
            (now - new Date(now.getFullYear(), 0, 1)) /
              (7 * 24 * 60 * 60 * 1000)
          ),
          year: now.getFullYear(),
          totalPomodoros: weeklyPomodoros,
          totalWorkTime: weeklyWorkTime,
          averageDailyPomodoros: Math.round(weeklyPomodoros / 7),
          mostProductiveDay:
            weeklyData.length > 0
              ? [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ][
                  weeklyData
                    .reduce((max, d) =>
                      d.completedPomodoros > max.completedPomodoros ? d : max
                    )
                    .date.getDay()
                ]
              : null,
        },
      ],
      monthlyStats: [
        {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          totalPomodoros: monthlyPomodoros,
          totalWorkTime: monthlyWorkTime,
          completedTasks: monthlyTasks,
          averageDailyPomodoros: Math.round(monthlyPomodoros / now.getDate()),
        },
      ],
      achievements: [],
    });

    statsCount++;
  }

  console.log(`✅ Created ${statsCount} stats records`);
}

async function createGuardianLinks(users) {
  console.log("\n👨‍👩‍👧 Creating guardian links...");
  let linkCount = 0;
  const students = users.filter((u) => u.defaultRole === "student");

  // Create 2-3 guardians
  const password = "password123"; // Let User model's pre-save hook hash it
  const guardians = [];

  for (let i = 0; i < 3; i++) {
    const guardian = await User.create({
      username: `guardian${i + 1}`,
      email: `sample.guardian${i + 1}@example.com`,
      password: password,
      defaultRole: "guardian",
      roles: [{ type: "guardian", isPrimary: true, isActive: true }],
      focusProfile: {
        fullName: `Phụ Huynh ${i + 1}`,
        level: 1,
        dailyGoal: 4,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
      },
    });
    guardians.push(guardian);
  }

  // Link guardians to random students (each guardian monitors 2-3 students)
  for (const guardian of guardians) {
    const numChildren = randomInt(2, 3);
    const linkedStudents = new Set();

    while (
      linkedStudents.size < numChildren &&
      linkedStudents.size < students.length
    ) {
      const student = randomElement(students);
      if (!linkedStudents.has(student._id.toString())) {
        linkedStudents.add(student._id.toString());

        await GuardianLink.create({
          guardian: guardian._id,
          child: student._id,
          status: "accepted",
          relation: randomElement(["parent", "guardian", "tutor"]),
          requestedAt: randomDate(
            new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ),
          respondedAt: randomDate(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          ),
          permissions: {
            viewProgress: true,
            giveRewards: true,
            setGoals: Math.random() > 0.5,
            viewSessions: true,
            receiveSummaries: true,
          },
        });

        linkCount++;
      }
    }
  }

  console.log(
    `✅ Created ${guardians.length} guardians and ${linkCount} guardian links`
  );
  return guardians.length;
}

async function main() {
  try {
    console.log("🌱 Starting database seeding...\n");

    await connectDB();
    await clearDatabase();

    const users = await createUsers();
    const classes = await createClasses(users);
    await createSessions(classes);
    await createTasks(users, classes); // Pass users instead of classes
    await createRewards(classes);
    await createAchievements(users);
    await createAlerts(classes);
    await createStats(users);
    const guardians = await createGuardianLinks(users);

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(
      `   - Users: ${users.length} (students + teachers) + ${guardians} guardians`
    );
    console.log(`   - Classes: ${classes.length}`);
    console.log(`   - Tasks: For ALL users (students, teachers, guardians)`);
    console.log(`   - Stats: Created for all students`);
    console.log(`   - Guardian Links: Created for random students`);
    console.log(`   - Login credentials: username/password123`);
    console.log(
      `   - Example: student1/password123, teacher1/password123, guardian1/password123`
    );
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  }
}

main();
