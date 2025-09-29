// Quick script to check users in database
const mongoose = require("mongoose");
const User = require("./models/User");

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/deepfocus", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Get all users
    const users = await User.find({}).select("-password");

    console.log(`\n📊 Total Users: ${users.length}\n`);

    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email})`);
        console.log(`   - Created: ${user.createdAt}`);
        console.log(`   - Focus Level: ${user.focusProfile.level}`);
        console.log(
          `   - Sessions: ${user.focusProfile.totalSessionsCompleted}`
        );
        console.log("");
      });
    } else {
      console.log("No users found in database");
    }

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

// Run the check
checkUsers();
