const mongoose = require("mongoose");
const User = require("../models/User");

async function checkUser() {
  try {
    await mongoose.connect("mongodb://localhost:27017/deepfocus");
    console.log("✅ Connected to MongoDB\n");

    const email = "sample.teacher1@example.com";
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("❌ User NOT FOUND:", email);
      console.log("\n📋 Checking all sample users...");
      const allSampleUsers = await User.find({ email: /^sample\./ }).select(
        "email username defaultRole"
      );
      console.log(`Found ${allSampleUsers.length} sample users:`);
      allSampleUsers.slice(0, 5).forEach((u) => {
        console.log(`  - ${u.email} (${u.username}, ${u.defaultRole})`);
      });
    } else {
      console.log("✅ User found:");
      console.log("  Email:", user.email);
      console.log("  Username:", user.username);
      console.log("  Default Role:", user.defaultRole);
      console.log("  Has password:", !!user.password);
      console.log(
        "  Password hash:",
        user.password ? user.password.substring(0, 30) + "..." : "N/A"
      );

      // Test password comparison
      const testPassword = "password123";
      const isMatch = await user.comparePassword(testPassword);
      console.log(`  Password "${testPassword}" matches:`, isMatch);
    }

    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkUser();
