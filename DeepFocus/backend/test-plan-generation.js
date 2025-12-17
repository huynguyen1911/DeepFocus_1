const axios = require("axios");

async function testPlanGeneration() {
  try {
    console.log("🚀 Calling generate-plan API...");
    const response = await axios.post(
      "http://localhost:5000/api/focus-training/generate-plan",
      {
        userId: "test123",
        assessmentData: {
          focusLevel: 5,
          goals: ["hoc tap"],
          challenges: ["de bi phan tam"],
          preferredTime: "morning",
        },
        userProfile: {
          name: "Test User",
          level: "beginner",
        },
      },
      { timeout: 300000 }
    );

    console.log("\n✅ Plan generated successfully!");
    console.log("\n=== WEEK 1, DAY 1, CHALLENGE 1 ===");
    const challenge = response.data.weeks[0].days[0].challenges[0];
    console.log("Title:", challenge.title);
    console.log("Instructions:", challenge.instructions);
    console.log("Benefits:", challenge.benefits);
    console.log("Tips:", challenge.tips);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
  }
}

testPlanGeneration();
