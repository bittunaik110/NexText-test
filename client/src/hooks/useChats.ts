import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, off, query, orderByChild } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: Record<string, number>;
  deleted: boolean;
  participantNames?: Record<string, string>;
  participantPhotos?: Record<string, string>;
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    const chatsRef = ref(database, 'chats');

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const chatList = Object.entries(data)
          .map(([id, chat]: [string, any]) => ({
            id,
            ...chat,
          }))
          .filter((chat: Chat) => 
            chat.participants.includes(user.uid) && !chat.deleted
          ) as Chat[];
        
        chatList.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
        
        setChats(chatList);
      } else {
        setChats([]);
      }
      setLoading(false);
    });

    return () => off(chatsRef, 'value', unsubscribe);
  }, [user]);

  return { chats, loading };
}
