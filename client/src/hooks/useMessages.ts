
import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "./useSocket";

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  userId: string;
  deleted: boolean;
  mediaUrl?: string;
  gifUrl?: string;
  replyTo?: string;
  reactions?: Record<string, string>;
  edited?: boolean;
  editedAt?: number;
  status?: "pending" | "sent" | "delivered" | "read";
  readBy?: string[];
}

export function useMessages(chatId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();

  // Listen for status updates via socket
  useEffect(() => {
    if (!socket || !chatId || !isConnected) return;

    const handleStatusUpdate = ({ messageId, status }: { messageId: string; status: string }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: status as Message["status"] }
            : msg
        )
      );
    };

    socket.on("message-status-update", handleStatusUpdate);

    return () => {
      socket.off("message-status-update", handleStatusUpdate);
    };
  }, [socket, chatId, isConnected]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = ref(database, `messages/${chatId}`);

    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const messageList = Object.entries(data)
              .map(([id, msg]: [string, any]) => ({
                id,
                ...msg,
              }))
              .filter((msg: Message) => !msg.deleted) as Message[];
            
            messageList.sort((a, b) => a.timestamp - b.timestamp);
            setMessages(messageList);
          } else {
            setMessages([]);
          }
          setLoading(false);
        } catch (err) {
          console.error("Error processing messages:", err);
          setError("Failed to load messages");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load messages. Please try again.",
          });
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching messages:", err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to connect to message database.",
        });
        setLoading(false);
      }
    );

    return () => off(messagesRef, 'value', unsubscribe);
  }, [chatId, toast]);

  return { messages, loading, error, userId: user?.uid };
}
