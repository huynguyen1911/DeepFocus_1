// Mock Firebase Admin for tests
if (process.env.NODE_ENV === "test") {
  module.exports = {
    messaging: () => ({
      send: async () => ({ success: true }),
      sendMulticast: async () => ({ successCount: 1, failureCount: 0 }),
    }),
  };
} else {
  const admin = require("firebase-admin");

  // Initialize Firebase Admin
  // Note: Firebase credentials should be set via environment variables
  // FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL

  let firebaseInitialized = false;

  const initializeFirebase = () => {
    if (firebaseInitialized) {
      return admin;
    }

    try {
      // Try to load from JSON file first, then fall back to environment variables
      let serviceAccount;

      // Method 1: Try loading from JSON file
      try {
        const path = require("path");
        const credentialsPath = path.join(
          __dirname,
          "../credentials/firebase-admin-key.json"
        );
        serviceAccount = require(credentialsPath);
        console.log("✅ Firebase credentials loaded from JSON file");
      } catch (fileError) {
        // Method 2: Fall back to environment variables
        if (
          !process.env.FIREBASE_PROJECT_ID ||
          !process.env.FIREBASE_CLIENT_EMAIL
        ) {
          console.warn(
            "⚠️  Firebase credentials not configured. Push notifications will not work."
          );
          console.warn("   To enable push notifications, either:");
          console.warn(
            "   1. Add firebase-admin-key.json to backend/credentials/ folder, OR"
          );
          console.warn("   2. Set these environment variables:");
          console.warn("      - FIREBASE_PROJECT_ID");
          console.warn("      - FIREBASE_PRIVATE_KEY");
          console.warn("      - FIREBASE_CLIENT_EMAIL");
          return null;
        }

        serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
        };
        console.log(
          "✅ Firebase credentials loaded from environment variables"
        );
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      firebaseInitialized = true;
      console.log("✅ Firebase Admin SDK initialized successfully");
      return admin;
    } catch (error) {
      console.error(
        "❌ Failed to initialize Firebase Admin SDK:",
        error.message
      );
      console.warn(
        "   Push notifications will not work until Firebase is properly configured."
      );
      return null;
    }
  };

  // Initialize on require
  const firebaseAdmin = initializeFirebase();

  module.exports = firebaseAdmin;
}
