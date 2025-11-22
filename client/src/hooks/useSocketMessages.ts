
import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useToast } from "./use-toast";

export function useSocketMessages(chatId: string | undefined) {
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket || !chatId || !isConnected) {
      console.log("useSocketMessages: Waiting for socket connection", { socket: !!socket, chatId, isConnected });
      return;
    }

    console.log("useSocketMessages: Joining chat", chatId);
    socket.emit("join-chat", chatId);

    const handleMessageError = (data: { error: string }) => {
      console.error("Message error:", data.error);
      toast({
        variant: "destructive",
        title: "Error",
        description: data.error || "Failed to send message",
      });
    };

    socket.on("message-error", handleMessageError);

    return () => {
      if (socket && chatId) {
        socket.emit("leave-chat", chatId);
        socket.off("message-error", handleMessageError);
      }
    };
  }, [socket, chatId, isConnected, toast]);

  const sendMessage = useCallback(
    async (text: string, mediaUrl?: string, gifUrl?: string) => {
      if (!socket || !chatId || !isConnected) {
        console.warn("sendMessage: Socket not ready", { socket: !!socket, chatId, isConnected });
        toast({
          variant: "destructive",
          title: "Error",
          description: "Not connected to chat server",
        });
        return;
      }

      if (!text.trim() && !mediaUrl && !gifUrl) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Message cannot be empty",
        });
        return;
      }

      try {
        socket.emit("send-message", {
          chatId,
          messageData: {
            text: text.trim(),
            mediaUrl: mediaUrl || "",
            gifUrl: gifUrl || "",
          },
        });
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send message",
        });
      }
    },
    [socket, chatId, isConnected, toast]
  );

  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (!socket || !chatId) return;

      socket.emit("react-to-message", {
        chatId,
        messageId,
        emoji,
      });
    },
    [socket, chatId]
  );

  const startTyping = useCallback(() => {
    if (!socket || !chatId) return;

    socket.emit("typing-start", { chatId });
  }, [socket, chatId]);

  const stopTyping = useCallback(() => {
    if (!socket || !chatId) return;

    socket.emit("typing-stop", { chatId });
  }, [socket, chatId]);

  const editMessage = useCallback(
    (messageId: string, newText: string) => {
      if (!socket || !chatId) return;

      socket.emit("edit-message", {
        chatId,
        messageId,
        newText,
      });
    },
    [socket, chatId]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!socket || !chatId) return;

      socket.emit("delete-message", {
        chatId,
        messageId,
      });
    },
    [socket, chatId]
  );

  return {
    sendMessage,
    reactToMessage,
    startTyping,
    stopTyping,
    editMessage,
    deleteMessage,
  };
}
