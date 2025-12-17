// Test full plan creation flow with database save
require("dotenv").config();
const mongoose = require("mongoose");
const { getAIService } = require("./services/aiService");
const FocusPlan = require("./models/FocusPlan");
const User = require("./models/User");

async function testFullPlanCreation() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/deepfocus",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ Connected to MongoDB\n");

    // Find or create a test user
    let user = await User.findOne({ email: "test@deepfocus.com" });
    if (!user) {
      console.log("Creating test user...");
      user = await User.create({
        username: "testuser",
        email: "test@deepfocus.com",
        password: "hashedpassword123", // Would be hashed in real app
        defaultRole: "student",
      });
      console.log("✅ Test user created\n");
    } else {
      console.log("✅ Using existing test user\n");
    }

    // Generate plan using AI
    console.log("🤖 Generating AI training plan...");
    const aiService = getAIService();

    const assessmentData = {
      focusLevel: 5,
      goals: ["hoc tap", "tang tap trung"],
      challenges: ["de bi phan tam", "kho tap trung lau"],
      preferredTime: "morning",
      studyHours: 4,
      experienceLevel: "beginner",
      primaryGoal: "study",
    };

    const userProfile = {
      name: user.username,
      level: "beginner",
    };

    const planData = await aiService.generateTrainingPlan(
      assessmentData,
      userProfile
    );
    console.log("✅ AI plan generated\n");

    // Save to database
    console.log("💾 Saving to database...");
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planData.totalWeeks * 7);

    const savedPlan = await FocusPlan.create({
      userId: user._id,
      title: `${planData.totalWeeks}-Week Focus Training Plan`,
      description: "AI-generated personalized focus training plan",
      duration: planData.totalWeeks,
      difficulty: assessmentData.experienceLevel || "beginner",
      goals: assessmentData.goals,
      weeks: planData.weeks,
      totalWeeks: planData.totalWeeks,
      totalDays: planData.totalDays,
      trainingDays: planData.trainingDays,
      restDays: planData.restDays,
      startDate: startDate,
      endDate: endDate,
      status: "active",
    });
    console.log("✅ Plan saved to database with ID:", savedPlan._id, "\n");

    // Retrieve and display
    console.log("=== PLAN DETAILS FROM DATABASE ===");
    const retrievedPlan = await FocusPlan.findById(savedPlan._id);
    console.log("Total weeks:", retrievedPlan.weeks.length);
    console.log("Total days:", retrievedPlan.totalDays);
    console.log("Training days:", retrievedPlan.trainingDays);
    console.log("Rest days:", retrievedPlan.restDays);

    console.log("\n=== WEEK 1, DAY 1 ===");
    const day1 = retrievedPlan.weeks[0].days[0];
    console.log("Theme:", day1.dailyTheme);
    console.log("Challenges:", day1.challenges.length);

    day1.challenges.forEach((ch, i) => {
      console.log(`\n--- Challenge ${i + 1} ---`);
      console.log("Title:", ch.title);
      console.log("Duration:", ch.duration, "mins");
      console.log("Difficulty:", ch.difficulty);
      console.log("Description:", ch.description);
      console.log("Instructions:", ch.instructions);
      console.log("Benefits:", ch.benefits);
      console.log("Tips:", ch.tips);
    });

    console.log("\n=== ANALYSIS ===");

    // Analyze variety across Week 1
    const week1Titles = [];
    retrievedPlan.weeks[0].days.forEach((day, dayIdx) => {
      if (day.type === "training") {
        day.challenges.forEach((ch) => {
          week1Titles.push(`Day ${dayIdx + 1}: ${ch.title}`);
        });
      }
    });

    console.log("\n📋 All Week 1 Challenge Titles:");
    week1Titles.forEach((title) => console.log("  -", title));

    // Check for repetition
    const uniqueTitles = [...new Set(week1Titles)];
    console.log("\n📊 Variety Check:");
    console.log("  Total challenges:", week1Titles.length);
    console.log("  Unique titles:", uniqueTitles.length);
    console.log(
      "  Repetition rate:",
      ((1 - uniqueTitles.length / week1Titles.length) * 100).toFixed(1) + "%"
    );

    // Check detail level
    const sampleChallenge = retrievedPlan.weeks[0].days[0].challenges[0];
    console.log("\n📝 Detail Level Check:");
    console.log(
      "  Has Pomodoro cycles in title:",
      sampleChallenge.title.includes("chu ky")
    );
    console.log(
      "  Has work/rest times in title:",
      sampleChallenge.title.includes("work") ||
        sampleChallenge.title.includes("nghi")
    );
    console.log(
      "  Instructions count:",
      sampleChallenge.instructions.length,
      "(expected: 3-4)"
    );
    console.log(
      "  Benefits count:",
      sampleChallenge.benefits.length,
      "(expected: 3)"
    );
    console.log("  Tips count:", sampleChallenge.tips.length, "(expected: 3)");

    // Check for generic content
    const hasNumbers = sampleChallenge.instructions.some((inst) =>
      /\d+/.test(inst)
    );
    const hasSpecificUnits =
      sampleChallenge.description.includes("phut") ||
      sampleChallenge.description.includes("giay");
    console.log("  Instructions contain numbers:", hasNumbers);
    console.log("  Description has time units:", hasSpecificUnits);

    console.log("\n✅ Test completed successfully!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

testFullPlanCreation();
