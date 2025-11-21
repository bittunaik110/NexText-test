import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSocketIO } from "./socket";
import usersRouter from "./api/users";
import chatsRouter from "./api/chats";
import uploadRouter from "./api/upload";
import groupsRouter from "./api/groups";
import messagesRouter from "./api/messages";
import notificationsRouter from "./api/notifications";
import blockedRouter from "./api/blocked";
import statusRouter from "./api/status";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/users", usersRouter);
  app.use("/api/chats", chatsRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/groups", groupsRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/blocked", blockedRouter);
  app.use("/api/status", statusRouter);

  const httpServer = createServer(app);

  setupSocketIO(httpServer);

  return httpServer;
}