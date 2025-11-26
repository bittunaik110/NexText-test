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

    socket.on("callInitiated", (callData: any) => {
      console.log(`[CALL DEBUG] Call initiated from ${userId}`);
      console.log(`[CALL DEBUG] callData:`, JSON.stringify(callData));
      console.log(`[CALL DEBUG] Recipient ID: ${callData.recipient}`);
      
      // Find the recipient's socket and emit directly to them
      const recipientSocketId = Array.from(io.sockets.sockets.values())
        .find(s => s.data.userId === callData.recipient)?.id;
      
      if (recipientSocketId) {
        console.log(`[CALL DEBUG] Found recipient socket: ${recipientSocketId}`);
        io.to(recipientSocketId).emit("callInitiated", callData);
        console.log(`[CALL DEBUG] Emitted callInitiated directly to recipient`);
      } else {
        console.log(`[CALL DEBUG] WARNING: Recipient socket not found for userId: ${callData.recipient}`);
      }
      
      // Also broadcast to chat room as backup (in case both users have the chat open)
      socket.to(callData.chatId).emit("callInitiated", callData);
    });

    socket.on("callAnswered", (data: any) => {
      console.log(`Call answered by ${userId}:`, data);
      // Notify initiator that call was answered
      socket.to(data.chatId).emit("callAnswered", data);
    });

    socket.on("callRejected", (data: any) => {
      console.log(`Call rejected by ${userId}:`, data);
      // Broadcast call rejected to other user in the chat room
      socket.to(data.chatId).emit("callRejected", data);
    });

    socket.on("callEnded", (data: any) => {
      console.log(`Call ended by ${userId}:`, data);
      // Broadcast call ended to other user in the chat room
      socket.to(data.chatId || "").emit("callEnded", data);
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
          text: messageData.text || "",
          mediaUrl: messageData.mediaUrl || "",
          gifUrl: messageData.gifUrl || "",
          id: messageId,
          userId: userId,
          timestamp: Date.now(),
          status: "sent",
          replyTo: messageData.replyTo || "",
          reactions: {},
          edited: false,
          deleted: false
        };

        await messageRef.set(message);

        // Get other participant ID from chatId (format: userId1_userId2)
        const participants = chatId.split("_");
        const otherParticipantId = participants.find((id: string) => id !== userId);

        // Increment unread count for the recipient
        if (otherParticipantId) {
          const unreadCountRef = realtimeDb.ref(`chats/${chatId}/unreadCount/${otherParticipantId}`);
          const snapshot = await unreadCountRef.get();
          const currentCount = snapshot.val() || 0;
          await unreadCountRef.set(currentCount + 1);
          console.log(`Incremented unreadCount for ${otherParticipantId} in chat ${chatId}: ${currentCount + 1}`);
        }

        const chatRef = realtimeDb.ref(`chats/${chatId}`);
        await chatRef.update({
          lastMessage: message.text || (message.gifUrl ? "GIF" : message.mediaUrl ? "Media" : ""),
          lastMessageTime: new Date().toISOString()
        });

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
      try {
        const messageRef = realtimeDb.ref(`messages/${chatId}/${messageId}`);
        const snapshot = await messageRef.get();
        const message = snapshot.val();
        
        if (message && message.status === "sent") {
          await messageRef.update({ status: "delivered" });
          io.to(chatId).emit("message-status-update", { messageId, status: "delivered" });
          console.log(`Message ${messageId} marked as delivered`);
        }
      } catch (error) {
        console.error("Error marking message as delivered:", error);
      }
    });

    socket.on("message-read", async ({ chatId, messageId }) => {
      try {
        const messageRef = realtimeDb.ref(`messages/${chatId}/${messageId}`);
        const snapshot = await messageRef.get();
        const message = snapshot.val();

        if (message && message.userId !== userId) {
          const readBy = message.readBy || [];
          if (!readBy.includes(userId)) {
            readBy.push(userId);
            await messageRef.update({ status: "read", readBy });
            io.to(chatId).emit("message-status-update", { messageId, status: "read" });
            console.log(`Message ${messageId} marked as read by ${userId}`);
          }
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
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
