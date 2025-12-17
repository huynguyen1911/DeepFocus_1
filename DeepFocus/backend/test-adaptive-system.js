// Test adaptive difficulty for different user profiles
require("dotenv").config();
const { getAIService } = require("./services/aiService");

async function testAdaptiveSystem() {
  try {
    console.log("🧪 Testing Adaptive Difficulty System\n");
    console.log("=".repeat(70));

    // Test profiles with different ability levels
    const testProfiles = [
      {
        name: "Very Struggling User",
        assessment: {
          focusLevel: 2,
          distractionLevel: 8,
          stressLevel: 8,
          energyLevel: 3,
          motivationLevel: 4,
          experienceLevel: "none",
          primaryGoal: "study",
          availableTimePerDay: 60,
        },
      },
      {
        name: "Beginner User",
        assessment: {
          focusLevel: 5,
          distractionLevel: 6,
          stressLevel: 5,
          energyLevel: 5,
          motivationLevel: 6,
          experienceLevel: "beginner",
          primaryGoal: "work_productivity",
          availableTimePerDay: 90,
        },
      },
      {
        name: "Intermediate User",
        assessment: {
          focusLevel: 7,
          distractionLevel: 4,
          stressLevel: 4,
          energyLevel: 7,
          motivationLevel: 8,
          experienceLevel: "intermediate",
          primaryGoal: "deep_work",
          availableTimePerDay: 120,
        },
      },
      {
        name: "Advanced User",
        assessment: {
          focusLevel: 9,
          distractionLevel: 2,
          stressLevel: 3,
          energyLevel: 9,
          motivationLevel: 9,
          experienceLevel: "advanced",
          primaryGoal: "deep_work",
          availableTimePerDay: 180,
        },
      },
    ];

    const aiService = getAIService();

    for (const profile of testProfiles) {
      console.log(`\n📊 PROFILE: ${profile.name}`);
      console.log("-".repeat(70));

      const scores = profile.assessment;
      console.log(`Assessment Scores:`);
      console.log(`  Focus: ${scores.focusLevel}/10`);
      console.log(`  Distraction: ${scores.distractionLevel}/10`);
      console.log(`  Energy: ${scores.energyLevel}/10`);
      console.log(`  Motivation: ${scores.motivationLevel}/10`);
      console.log(`  Stress: ${scores.stressLevel}/10`);

      // Calculate ability score (same formula as in aiService)
      const abilityScore =
        scores.focusLevel * 0.4 +
        scores.energyLevel * 0.2 +
        scores.motivationLevel * 0.15 +
        (10 - scores.distractionLevel) * 0.15 +
        (10 - scores.stressLevel) * 0.1;

      console.log(
        `\n🎯 Calculated Ability Score: ${abilityScore.toFixed(2)}/10`
      );

      // Determine expected settings
      let expectedWork, expectedCycles, level;
      if (abilityScore <= 3) {
        expectedWork = 10;
        expectedCycles = 3;
        level = "Very Low - Maximum Support";
      } else if (abilityScore <= 4.5) {
        expectedWork = 12;
        expectedCycles = 3;
        level = "Low - Gentle Start";
      } else if (abilityScore <= 6) {
        expectedWork = 15;
        expectedCycles = 4;
        level = "Moderate-Low - Beginner";
      } else if (abilityScore <= 7.5) {
        expectedWork = 20;
        expectedCycles = 4;
        level = "Moderate-High";
      } else if (abilityScore <= 8.5) {
        expectedWork = 25;
        expectedCycles = 5;
        level = "High - Standard";
      } else {
        expectedWork = 30;
        expectedCycles = 5;
        level = "Very High - Advanced";
      }

      console.log(`Expected Level: ${level}`);
      console.log(`Expected Settings:`);
      console.log(`  - Starting work time: ${expectedWork} minutes`);
      console.log(`  - Peak day max cycles: ${expectedCycles} cycles`);
      console.log(
        `  - Weekly increase: ${abilityScore <= 5 ? "3" : "5"} min/week`
      );

      // Generate actual plan (just Week 1 for speed)
      console.log(`\n⏳ Generating Week 1...`);
      const plan = await aiService.generateTrainingPlan(profile.assessment, {
        name: profile.name,
        level: scores.experienceLevel,
      });

      // Analyze Week 1
      const week1 = plan.weeks[0];
      const day1Challenge = week1.days[0].challenges.find(
        (c) => c.type === "focus_session"
      );
      const day5Challenge = week1.days[4].challenges.find(
        (c) => c.type === "focus_session"
      );

      console.log(`\n✅ Generated Plan:`);
      console.log(`  Day 1 Pomodoro: ${day1Challenge?.title || "N/A"}`);
      console.log(`  Day 5 Pomodoro: ${day5Challenge?.title || "N/A"}`);

      // Extract work time from title
      const workMatch = day1Challenge?.title.match(/(\d+)p work/);
      const actualWork = workMatch ? parseInt(workMatch[1]) : 0;

      // Extract cycle count from Day 5
      const cycleMatch = day5Challenge?.title.match(/^(\d+) chu ky/);
      const actualCycles = cycleMatch ? parseInt(cycleMatch[1]) : 0;

      console.log(`\n📈 Verification:`);
      console.log(
        `  Expected work time: ${expectedWork}p | Actual: ${actualWork}p | ${
          actualWork === expectedWork ? "✅ MATCH" : "⚠️ DIFF"
        }`
      );
      console.log(
        `  Expected peak cycles: ${expectedCycles} | Actual: ${actualCycles} | ${
          actualCycles === expectedCycles ? "✅ MATCH" : "⚠️ DIFF"
        }`
      );
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ Adaptive system test completed!");
    console.log(
      "The system now dynamically adapts to each user's ability score."
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAdaptiveSystem();
