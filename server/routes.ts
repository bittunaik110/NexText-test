import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSocketIO } from "./socket";
import usersRouter from "./api/users";
import chatsRouter from "./api/chats";
import uploadRouter from "./api/upload";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/users", usersRouter);
  app.use("/api/chats", chatsRouter);
  app.use("/api/upload", uploadRouter);

  const httpServer = createServer(app);

  setupSocketIO(httpServer);

  return httpServer;
}
