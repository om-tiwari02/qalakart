import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

async function test() {
  const uri = process.env.MONGODB_URI;
  console.log("Attempting to connect to:", uri);
  try {
    await mongoose.connect(uri as string, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Successfully connected to MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed!");
    console.error(err);
    process.exit(1);
  }
}

test();
