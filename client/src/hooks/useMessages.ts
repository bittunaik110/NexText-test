import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";

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
  status?: "sent" | "delivered" | "read";
  readBy?: string[];
}

export function useMessages(chatId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const messagesRef = ref(database, `messages/${chatId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, msg]: [string, any]) => ({
          id,
          ...msg,
        })) as Message[];
        
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }, [chatId]);

  return { messages, loading, userId: user?.uid };
}
