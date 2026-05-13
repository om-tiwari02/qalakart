import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./services/logger.js";
import { startCron } from "./services/cron.service.js";
import { createServer } from "http";
import { initSockets } from "./sockets/index.js";

async function main() {
  const app = createApp();
  startCron();
  const httpServer = createServer(app);
  initSockets(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info("backend_listening", { port: env.PORT });
    console.log(`\n🚀 Backend Server is running! Click to open: http://localhost:${env.PORT}\n`);
  });

  if (env.NODE_ENV === "production") {
    try {
      await connectDb();
      logger.info("db_connected");
    } catch (err) {
      logger.error("db_connection_failed_production", { err });
      process.exit(1);
    }
  } else {
    connectDb()
      .then(() => logger.info("db_connected"))
      .catch((err) => {
        logger.error("db_connect_failed", { 
          message: err.message,
          tip: "Ensure your IP is whitelisted in MongoDB Atlas. Current IP: 152.59.48.46"
        });
      });
  }
}

main().catch((err) => {
  logger.error("backend_start_failed", { err });
  process.exit(1);
});

