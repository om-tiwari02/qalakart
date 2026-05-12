import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyAccess } from "../utils/jwt.js";

export function initSockets(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.["token"];
    if (!token || typeof token !== "string") {
      return next(new Error("UNAUTHORIZED"));
    }
    try {
      const user = verifyAccess(token);
      socket.data.user = user;
      return next();
    } catch {
      return next(new Error("TOKEN_INVALID"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as { sub: string };
    socket.join(`user:${user.sub}`);
  });

  return io;
}

