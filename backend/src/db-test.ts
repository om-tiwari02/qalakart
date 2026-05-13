import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI not found in .env");
  process.exit(1);
}

console.log("Attempting to connect to:", uri.replace(/:([^@]+)@/, ":****@")); // Hide password

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("Successfully connected to MongoDB!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    if (err.reason) {
      console.error("Reason:", JSON.stringify(err.reason, null, 2));
    }
    process.exit(1);
  });
