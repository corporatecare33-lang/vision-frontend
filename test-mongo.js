import "dotenv/config";
import mongoose from "mongoose";

console.log("Testing MongoDB connection...");

const testConnection = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("No MONGODB_URI in .env");
    return;
  }

  console.log("Trying to connect...");

  try {
    // Try with SRV first
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Connected Successfully!");
    console.log("  Host:", mongoose.connection.host);
    console.log("  Database:", mongoose.connection.name);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.warn("❌ SRV Connection failed:", error.message);

    // If SRV fails, try without SRV (standard URI)
    console.log("\nLet's try a standard connection string instead!");
    console.log("\nSteps to get it from Atlas:");
    console.log("1. Go to your cluster → Connect");
    console.log("2. Click 'Connect your application'");
    console.log("3. TOGGLE OFF 'SRV Connection String' (it should be grey)");
    console.log("4. Copy that full string!");
    console.log("5. Replace the password placeholder with your real password!");
    console.log("6. Paste it in .env!");

    process.exit(1);
  }
};

testConnection();
