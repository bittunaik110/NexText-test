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

    const handleDeliverMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { chatId: eventChatId, messageId } = customEvent.detail;
      if (eventChatId === chatId) {
        socket.emit("message-delivered", { chatId, messageId });
      }
    };

    const handleReadMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { chatId: eventChatId, messageId } = customEvent.detail;
      if (eventChatId === chatId) {
        socket.emit("message-read", { chatId, messageId });
      }
    };

    socket.on("message-error", handleMessageError);
    window.addEventListener("deliver-message", handleDeliverMessage);
    window.addEventListener("read-message", handleReadMessage);

    return () => {
      if (socket && chatId) {
        socket.emit("leave-chat", chatId);
        socket.off("message-error", handleMessageError);
      }
      window.removeEventListener("deliver-message", handleDeliverMessage);
      window.removeEventListener("read-message", handleReadMessage);
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

      // Stop typing when sending
      stopTyping();

      const messageData = {
        text: text.trim(),
        mediaUrl,
        gifUrl,
        timestamp: Date.now(),
      };

      console.log("sendMessage: Emitting send-message event", { chatId, messageData });
      socket.emit("send-message", { chatId, messageData });
    },
    [socket, chatId, isConnected, toast, stopTyping]
  );


  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (!socket || !chatId || !isConnected) return;
      socket.emit("react-to-message", { chatId, messageId, emoji });
    },
    [socket, chatId, isConnected]
  );

  const startTyping = useCallback(() => {
    if (!socket || !chatId || !isConnected) return;
    socket.emit("typing-start", { chatId });
  }, [socket, chatId, isConnected]);

  const stopTyping = useCallback(() => {
    if (!socket || !chatId || !isConnected) return;
    socket.emit("typing-stop", { chatId });
  }, [socket, chatId, isConnected]);

  const editMessage = useCallback(
    (messageId: string, newText: string) => {
      if (!socket || !chatId || !isConnected) return;

      socket.emit("edit-message", {
        chatId,
        messageId,
        newText,
      });
    },
    [socket, chatId, isConnected]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!socket || !chatId || !isConnected) return;

      socket.emit("delete-message", {
        chatId,
        messageId,
      });
    },
    [socket, chatId, isConnected]
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