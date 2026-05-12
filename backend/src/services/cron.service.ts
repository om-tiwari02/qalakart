import cron from "node-cron";
import { logger } from "./logger.js";

export function startCron() {
  // Placeholder: add real jobs per domain needs.
  cron.schedule("*/5 * * * *", () => {
    logger.debug("cron_tick");
  });
}

