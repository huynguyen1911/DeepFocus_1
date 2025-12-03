const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Stats = require("../models/Stats");
const Session = require("../models/Session");
const Task = require("../models/Task");
const Reward = require("../models/Reward");
const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");

class ReportService {
  /**
   * Generate student progress report
   */
  async generateStudentReport(studentId, startDate, endDate) {
    try {
      // Fetch student data
      const student = await User.findById(studentId);
      const stats = await Stats.findOne({ user: studentId });

      // Fetch sessions in date range
      const sessions = await Session.find({
        user: studentId,
        startTime: { $gte: startDate, $lte: endDate },
        status: "completed",
      }).sort({ startTime: -1 });

      // Fetch tasks in date range
      const tasks = await Task.find({
        user: studentId,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      // Fetch rewards
      const rewards = await Reward.find({
        student: studentId,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      // Fetch achievements
      const userAchievements = await UserAchievement.find({
        user: studentId,
        unlockedAt: { $gte: startDate, $lte: endDate },
      }).populate("achievement");

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const filename = `student-report-${studentId}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, "../temp", filename);

      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, "../temp"))) {
        fs.mkdirSync(path.join(__dirname, "../temp"));
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add content to PDF
      this.addStudentReportContent(doc, {
        student,
        stats,
        sessions,
        tasks,
        rewards,
        userAchievements,
        startDate,
        endDate,
      });

      doc.end();

      // Wait for PDF to be written
      await new Promise((resolve) => stream.on("finish", resolve));

      return {
        success: true,
        filepath,
        filename,
        downloadUrl: `/api/reports/download/${filename}`,
      };
    } catch (error) {
      console.error("Error generating student report:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add content to student report PDF
   */
  addStudentReportContent(doc, data) {
    const {
      student,
      stats,
      sessions,
      tasks,
      rewards,
      userAchievements,
      startDate,
      endDate,
    } = data;

    // Header
    doc
      .fontSize(24)
      .text("DeepFocus - Student Progress Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        { align: "center" }
      );
    doc.moveDown(2);

    // Student Info
    doc.fontSize(16).text("Student Information", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Name: ${student.fullName}`)
      .text(`Email: ${student.email}`)
      .text(`Student ID: ${student.studentProfile?.studentId || "N/A"}`);
    doc.moveDown(2);

    // Statistics Overview
    doc.fontSize(16).text("Statistics Overview", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Total Pomodoros: ${stats?.totalPomodoros || 0}`)
      .text(
        `Total Focus Time: ${((stats?.totalFocusTime || 0) / 60).toFixed(
          1
        )} hours`
      )
      .text(`Total Tasks Completed: ${stats?.totalTasksCompleted || 0}`)
      .text(`Current Streak: ${stats?.currentStreak || 0} days`)
      .text(`Best Streak: ${stats?.bestStreak || 0} days`)
      .text(`Total Points: ${stats?.totalPoints || 0}`);
    doc.moveDown(2);

    // Sessions in Period
    doc.fontSize(16).text("Focus Sessions in Period", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Sessions: ${sessions.length}`);
    doc
      .fontSize(12)
      .text(
        `Total Focus Time: ${(
          sessions.reduce((sum, s) => sum + s.duration, 0) / 60
        ).toFixed(1)} hours`
      );
    doc.moveDown();

    // Recent sessions table
    if (sessions.length > 0) {
      doc.fontSize(12).text("Recent Sessions (Last 10):", { underline: true });
      doc.moveDown(0.5);

      sessions.slice(0, 10).forEach((session, index) => {
        doc
          .fontSize(10)
          .text(
            `${index + 1}. ${session.startTime.toLocaleDateString()} - ${
              session.duration
            }min - ${session.taskName || "No task"}`
          );
      });
      doc.moveDown(2);
    }

    // Tasks Summary
    doc.fontSize(16).text("Tasks Summary", { underline: true });
    doc.moveDown(0.5);
    const completedTasks = tasks.filter((t) => t.status === "completed");
    doc
      .fontSize(12)
      .text(`Total Tasks Created: ${tasks.length}`)
      .text(`Tasks Completed: ${completedTasks.length}`)
      .text(
        `Completion Rate: ${
          tasks.length > 0
            ? ((completedTasks.length / tasks.length) * 100).toFixed(1)
            : 0
        }%`
      );
    doc.moveDown(2);

    // Rewards Summary
    doc.fontSize(16).text("Rewards & Recognition", { underline: true });
    doc.moveDown(0.5);
    const positiveRewards = rewards.filter((r) => r.type === "positive");
    const negativeRewards = rewards.filter((r) => r.type === "negative");
    doc
      .fontSize(12)
      .text(`Positive Rewards: ${positiveRewards.length}`)
      .text(
        `Total Points Earned: +${positiveRewards.reduce(
          (sum, r) => sum + r.points,
          0
        )}`
      )
      .text(`Penalties: ${negativeRewards.length}`)
      .text(
        `Total Points Deducted: ${negativeRewards.reduce(
          (sum, r) => sum + r.points,
          0
        )}`
      );
    doc.moveDown(2);

    // Achievements
    if (userAchievements.length > 0) {
      doc
        .fontSize(16)
        .text("Achievements Unlocked in Period", { underline: true });
      doc.moveDown(0.5);
      userAchievements.forEach((ua, index) => {
        doc
          .fontSize(12)
          .text(
            `${index + 1}. ${ua.achievement.name} (${ua.achievement.rarity})`
          );
      });
      doc.moveDown(2);
    }

    // Footer
    doc
      .fontSize(10)
      .text(`Report generated on ${new Date().toLocaleDateString()}`, {
        align: "center",
      });
    doc.text("DeepFocus - Focus. Achieve. Succeed.", { align: "center" });
  }

  /**
   * Generate class summary report
   */
  async generateClassReport(classId, startDate, endDate) {
    // Similar structure, but for entire class
    // TODO: Implement class report
  }

  /**
   * Clean up old report files
   */
  async cleanupOldReports() {
    try {
      const tempDir = path.join(__dirname, "../temp");
      const files = fs.readdirSync(tempDir);
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filepath = path.join(tempDir, file);
        const stats = fs.statSync(filepath);
        if (stats.mtimeMs < oneDayAgo) {
          fs.unlinkSync(filepath);
        }
      });
    } catch (error) {
      console.error("Error cleaning up reports:", error);
    }
  }
}

module.exports = new ReportService();
