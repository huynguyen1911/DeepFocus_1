// Test direct AI service call
require("dotenv").config();
const { getAIService } = require("./services/aiService");

async function testDirectAI() {
  try {
    console.log("🤖 Testing direct AI service call...\n");

    const aiService = getAIService();

    const assessmentData = {
      focusLevel: 5,
      goals: ["hoc tap"],
      challenges: ["de bi phan tam"],
      preferredTime: "morning",
      studyHours: 4,
    };

    const userProfile = {
      name: "Test User",
      level: "beginner",
    };

    console.log("⏳ Generating plan (this will take 2-3 minutes)...\n");
    const plan = await aiService.generateTrainingPlan(
      assessmentData,
      userProfile
    );

    console.log("\n✅ Plan generated successfully!");
    console.log(`📊 Total weeks: ${plan.weeks.length}`);
    console.log(
      `📅 Total days: ${plan.weeks.reduce((sum, w) => sum + w.days.length, 0)}`
    );

    console.log("\n=== WEEK 1, DAY 1, CHALLENGE 1 ===");
    const challenge = plan.weeks[0].days[0].challenges[0];
    console.log("\n📌 Title:", challenge.title);
    console.log("\n📝 Instructions:");
    challenge.instructions.forEach((inst, i) =>
      console.log(`  ${i + 1}. ${inst}`)
    );
    console.log("\n✨ Benefits:");
    challenge.benefits.forEach((ben, i) => console.log(`  ${i + 1}. ${ben}`));
    console.log("\n💡 Tips:");
    challenge.tips.forEach((tip, i) => console.log(`  ${i + 1}. ${tip}`));

    console.log("\n=== WEEK 1, DAY 1, ALL CHALLENGES ===");
    plan.weeks[0].days[0].challenges.forEach((ch, i) => {
      console.log(`\nChallenge ${i + 1}: ${ch.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDirectAI();
