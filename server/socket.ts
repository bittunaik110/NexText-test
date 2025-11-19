import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { auth, realtimeDb } from "./firebase-admin";

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decodedToken = await auth.verifyIdToken(token);
      socket.data.userId = decodedToken.uid;
      socket.data.email = decodedToken.email;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}`);

    const presenceRef = realtimeDb.ref(`presence/${userId}`);
    presenceRef.set({
      isOnline: true,
      lastSeen: Date.now()
    });

    socket.on("join-chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(chatId);
      console.log(`User ${userId} left chat ${chatId}`);
    });

    socket.on("typing-start", ({ chatId }) => {
      const typingRef = realtimeDb.ref(`typing/${chatId}/${userId}`);
      typingRef.set({
        isTyping: true,
        timestamp: Date.now()
      });
      socket.to(chatId).emit("user-typing", { userId, isTyping: true });
    });

    socket.on("typing-stop", ({ chatId }) => {
      const typingRef = realtimeDb.ref(`typing/${chatId}/${userId}`);
      typingRef.remove();
      socket.to(chatId).emit("user-typing", { userId, isTyping: false });
    });

    socket.on("send-message", async ({ chatId, messageData }) => {
      try {
        const messageRef = realtimeDb.ref(`messages/${chatId}`).push();
        const messageId = messageRef.key;

        const message = {
          ...messageData,
          id: messageId,
          senderId: userId,
          timestamp: Date.now(),
          status: "sent",
          replyTo: messageData.replyTo || null,
          reactions: {},
          edited: false,
          deleted: false
        };

        await messageRef.set(message);

        io.to(chatId).emit("new-message", message);

        const typingRef = realtimeDb.ref(`typing/${chatId}/${userId}`);
        typingRef.remove();
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message-error", { error: "Failed to send message" });
      }
    });

    socket.on("edit-message", async ({ chatId, messageId, newText }) => {
      try {
        const messageRef = realtimeDb.ref(`messages/${chatId}/${messageId}`);
        const snapshot = await messageRef.get();
        const message = snapshot.val();

        if (message && message.senderId === userId) {
          await messageRef.update({
            text: newText,
            edited: true,
            editedAt: Date.now()
          });
          io.to(chatId).emit("message-edited", { messageId, newText, editedAt: Date.now() });
        }
      } catch (error) {
        console.error("Error editing message:", error);
      }
    });

    socket.on("delete-message", async ({ chatId, messageId }) => {
      try {
        const messageRef = realtimeDb.ref(`messages/${chatId}/${messageId}`);
        const snapshot = await messageRef.get();
        const message = snapshot.val();

        if (message && message.senderId === userId) {
          await messageRef.update({
            deleted: true,
            deletedAt: Date.now()
          });
          io.to(chatId).emit("message-deleted", { messageId });
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    socket.on("react-to-message", async ({ chatId, messageId, emoji }) => {
      try {
        const messageRef = realtimeDb.ref(`messages/${chatId}/${messageId}/reactions/${userId}`);
        await messageRef.set(emoji);
        io.to(chatId).emit("message-reaction", { messageId, userId, emoji });
      } catch (error) {
        console.error("Error adding reaction:", error);
      }
    });

    socket.on("message-delivered", async ({ chatId, messageId }) => {
      const messageRef = realtimeDb.ref(`messages/${chatId}/${messageId}`);
      await messageRef.update({ status: "delivered" });
      io.to(chatId).emit("message-status-update", { messageId, status: "delivered" });
    });

    socket.on("message-read", async ({ chatId, messageId, userId: readerId }) => {
      const messageRef = realtimeDb.ref(`messages/${chatId}/${messageId}`);
      const snapshot = await messageRef.get();
      const message = snapshot.val();

      if (message) {
        const readBy = message.readBy || [];
        if (!readBy.includes(readerId)) {
          readBy.push(readerId);
          await messageRef.update({ status: "read", readBy });
          io.to(chatId).emit("message-status-update", { messageId, status: "read" });
        }
      }
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${userId}`);
      await presenceRef.set({
        isOnline: false,
        lastSeen: Date.now()
      });
    });
  });

  return io;
}
