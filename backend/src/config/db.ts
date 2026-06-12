import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../services/logger.js";

mongoose.set("bufferCommands", false);

export async function connectDb() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    family: 4
  });
}

export function startDbConnectionLoop() {
  let isConnecting = false;

  const connectWithRetry = async () => {
    if (mongoose.connection.readyState === 1 || isConnecting) {
      return;
    }

    isConnecting = true;
    try {
      await connectDb();
      logger.info("db_connected");
    } catch (err) {
      const error = err as Error;
      logger.error("db_connect_failed", {
        message: error.message,
        retryInMs: 5000
      });
    } finally {
      isConnecting = false;
    }
  };

  mongoose.connection.on("disconnected", () => {
    logger.warn("db_disconnected_retrying");
    void connectWithRetry();
  });

  void connectWithRetry();
  const interval = setInterval(() => {
    void connectWithRetry();
  }, 5000);

  return () => clearInterval(interval);
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

