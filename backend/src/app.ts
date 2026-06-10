import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { aiRouter } from "./modules/ai/ai.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { demandRouter } from "./modules/demands/demand.routes.js";
import { momentRouter } from "./modules/moments/moment.routes.js";
import { orderRouter } from "./modules/orders/order.routes.js";
import { paymentRouter } from "./modules/payments/payment.routes.js";
import { productRouter } from "./modules/products/product.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { logger } from "./services/logger.js";

export function createApp() {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  if (env.SENTRY_DSN) {
    Sentry.init({ dsn: env.SENTRY_DSN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.use((Sentry as any).Handlers.requestHandler());
  }

  app.get("/", (_req, res) => res.status(200).json({ message: "Qalakart API is running!" }));
  app.get("/health", (_req, res) => res.status(200).send("ok"));
  app.get("/ready", (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    return res.status(ready ? 200 : 503).json({ ready });
  });

  app.use((req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      logger.info("http_request", {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - started
      });
    });
    next();
  });

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    })
  );
  app.use(express.json({ limit: "3mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  // express-mongo-sanitize v2.2.0 crashes in Express 5.x because req.query is read-only.
  // We use Zod for validation anyway, which prevents NoSQL injection.
  // app.use(mongoSanitize());

  const globalLimiter = rateLimit({
    windowMs: 60_000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use("/api", globalLimiter);

  app.use("/api", (_req, res, next) => {
    if (
      env.NODE_ENV !== "production" &&
      (_req.path.startsWith("/v1/auth") ||
        _req.path.startsWith("/v1/payments") ||
        _req.path.startsWith("/v1/ai") ||
        _req.path.startsWith("/v1/users"))
    ) {
      return next();
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: {
          code: "DB_NOT_CONNECTED",
          message: "Database is still connecting. Please try again in a few seconds."
        }
      });
    }
    return next();
  });

  const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use("/api/v1/auth", authLimiter);

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/ai", aiRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/payments", paymentRouter);
  app.use("/api/v1/demands", demandRouter);
  app.use("/api/v1/moments", momentRouter);

  if (env.SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.use((Sentry as any).Handlers.errorHandler());
  }

  app.use(errorHandler);
  return app;
}

