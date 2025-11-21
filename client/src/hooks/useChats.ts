
import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const chatsRef = ref(database, 'chats');

    const unsubscribe = onValue(
      chatsRef,
      (snapshot) => {
        try {
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
        } catch (err) {
          console.error("Error processing chats:", err);
          setError("Failed to load chats");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load chats. Please try again.",
          });
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching chats:", err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to connect to chat database.",
        });
        setLoading(false);
      }
    );

    return () => off(chatsRef, 'value', unsubscribe);
  }, [user, toast]);

  return { chats, loading, error };
}
