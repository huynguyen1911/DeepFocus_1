/**
 * Script to update existing users' focusProfile.fullName
 * Run this once to fix users created before fullName field was added
 */

const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const updateUserFullNames = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all users without focusProfile.fullName
    const usersWithoutFullName = await User.find({
      $or: [
        { "focusProfile.fullName": { $exists: false } },
        { "focusProfile.fullName": "" },
        { "focusProfile.fullName": null },
      ],
    });

    console.log(
      `📋 Found ${usersWithoutFullName.length} users without fullName`
    );

    let updated = 0;
    for (const user of usersWithoutFullName) {
      // Set fullName to username or email prefix as fallback
      const fallbackName = user.username || user.email.split("@")[0];

      if (!user.focusProfile) {
        user.focusProfile = {};
      }

      user.focusProfile.fullName = fallbackName;

      await user.save();
      console.log(`✅ Updated user ${user.email} -> fullName: ${fallbackName}`);
      updated++;
    }

    console.log(`\n✅ Successfully updated ${updated} users`);
    console.log("🏁 Migration complete!");
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
};

// Run the migration
updateUserFullNames();
