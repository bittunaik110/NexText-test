import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

export function useSocketMessages(chatId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !chatId) return;

    const initSocket = async () => {
      const token = await user.getIdToken();
      
      socketRef.current = io({
        auth: { token }
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        socketRef.current?.emit("join-chat", chatId);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-chat", chatId);
        socketRef.current.disconnect();
      }
    };
  }, [user, chatId]);

  const sendMessage = async (text: string, mediaUrl?: string, gifUrl?: string) => {
    if (!socketRef.current || !chatId) return;

    const messageData = {
      text,
      mediaUrl: mediaUrl || "",
      gifUrl: gifUrl || "",
    };

    socketRef.current.emit("send-message", { chatId, messageData });
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit("react-to-message", { chatId, messageId, emoji });
  };

  const startTyping = () => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit("typing-start", { chatId });
  };

  const stopTyping = () => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit("typing-stop", { chatId });
  };

  return { sendMessage, reactToMessage, startTyping, stopTyping };
}
