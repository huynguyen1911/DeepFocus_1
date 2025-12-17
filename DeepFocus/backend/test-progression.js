// Analyze progressive difficulty in generated plan
require("dotenv").config();
const { getAIService } = require("./services/aiService");

async function analyzeProgression() {
  try {
    console.log("🔍 Analyzing Progressive Difficulty System...\n");

    const aiService = getAIService();

    const assessmentData = {
      focusLevel: 5,
      distractionLevel: 6,
      goals: ["hoc tap"],
      challenges: ["de bi phan tam"],
      preferredTime: "morning",
      studyHours: 4,
      experienceLevel: "beginner",
      primaryGoal: "study",
      availableTimePerDay: 60,
    };

    const userProfile = {
      name: "Test User",
      level: "beginner",
    };

    console.log("⏳ Generating 3-week plan...\n");
    const plan = await aiService.generateTrainingPlan(
      assessmentData,
      userProfile
    );

    console.log("✅ Plan generated!\n");
    console.log("=".repeat(60));
    console.log("PROGRESSIVE DIFFICULTY ANALYSIS");
    console.log("=".repeat(60));

    plan.weeks.forEach((week, weekIdx) => {
      console.log(`\n📅 WEEK ${weekIdx + 1}: ${week.theme}`);
      console.log("-".repeat(60));

      const trainingDays = week.days.filter((d) => d.type === "training");

      trainingDays.forEach((day, dayIdx) => {
        const focusChallenge = day.challenges.find(
          (c) => c.type === "focus_session"
        );
        const breathingChallenge = day.challenges.find(
          (c) => c.type === "breathing" || c.type === "mindfulness"
        );

        console.log(`\nDay ${dayIdx + 1} (${day.dailyTheme}):`);
        if (focusChallenge) {
          console.log(`  🎯 Pomodoro: ${focusChallenge.title}`);
          console.log(
            `     Duration: ${focusChallenge.duration} min | Difficulty: ${focusChallenge.difficulty}`
          );
        }
        if (breathingChallenge) {
          console.log(
            `  🧘 ${breathingChallenge.type}: ${breathingChallenge.title}`
          );
          console.log(
            `     Duration: ${breathingChallenge.duration} min | Difficulty: ${breathingChallenge.difficulty}`
          );
        }
      });

      console.log("\n📊 Week Summary:");
      const difficulties = trainingDays.map(
        (d) =>
          d.challenges.reduce((sum, c) => sum + c.difficulty, 0) /
          d.challenges.length
      );
      console.log(
        `  Avg difficulty by day: ${difficulties
          .map((d) => d.toFixed(1))
          .join(" → ")}`
      );

      const pomodoroDurations = trainingDays
        .map((d) => d.challenges.find((c) => c.type === "focus_session"))
        .filter((c) => c)
        .map((c) => c.duration);
      console.log(
        `  Pomodoro durations: ${pomodoroDurations.join("min → ")}min`
      );
    });

    console.log("\n" + "=".repeat(60));
    console.log("PROGRESSION QUALITY CHECK");
    console.log("=".repeat(60));

    // Check Week 1 progression
    const week1 = plan.weeks[0];
    const week1Training = week1.days.filter((d) => d.type === "training");
    const week1Difficulties = week1Training.map(
      (d) =>
        d.challenges.reduce((sum, c) => sum + c.difficulty, 0) /
        d.challenges.length
    );

    console.log("\n✅ Week 1 Progression:");
    console.log(
      `   Days 1-2: ${week1Difficulties
        .slice(0, 2)
        .map((d) => d.toFixed(1))
        .join(", ")} (should be easy ~2.0)`
    );
    console.log(
      `   Days 3-4: ${week1Difficulties
        .slice(2, 4)
        .map((d) => d.toFixed(1))
        .join(", ")} (should increase ~2.5-3.0)`
    );
    console.log(
      `   Day 5: ${week1Difficulties[4].toFixed(1)} (should be peak ~3.5-4.0)`
    );
    console.log(
      `   Day 6: ${week1Difficulties[5].toFixed(1)} (should be lighter ~2.0)`
    );

    // Check if progression is smooth
    let smoothProgression = true;
    for (let i = 1; i < 5; i++) {
      // Days 1-5 should increase
      if (week1Difficulties[i] < week1Difficulties[i - 1]) {
        smoothProgression = false;
        console.log(
          `   ⚠️  Day ${i + 1} is easier than Day ${i} - Not smooth!`
        );
      }
    }
    if (week1Difficulties[5] >= week1Difficulties[4]) {
      smoothProgression = false;
      console.log(`   ⚠️  Day 6 should be lighter than Day 5!`);
    }

    if (smoothProgression) {
      console.log("   ✅ Smooth progression confirmed!");
    }

    // Check Pomodoro work times
    const week1Pomodoros = week1Training.map((d) => {
      const fc = d.challenges.find((c) => c.type === "focus_session");
      return fc ? fc.title : "N/A";
    });

    console.log("\n✅ Pomodoro Work Times Progression:");
    week1Pomodoros.forEach((title, i) => {
      console.log(`   Day ${i + 1}: ${title}`);
    });

    // Extract work times from titles
    const workTimes = week1Pomodoros.map((title) => {
      const match = title.match(/(\d+)p work/);
      return match ? parseInt(match[1]) : 0;
    });

    console.log(
      `\n   Work time range: ${Math.min(...workTimes)}p - ${Math.max(
        ...workTimes
      )}p`
    );
    console.log(
      `   Starting work time: ${workTimes[0]}p (should match beginner level 10-15p)`
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

analyzeProgression();
