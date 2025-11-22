import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: number;
}

export function usePresence(userId: string | undefined) {
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!userId) return;

    const presenceRef = ref(database, `presence/${userId}`);
    const unsubscribe = onValue(
      presenceRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPresence({
            userId,
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen || Date.now(),
          });
        }
      },
      (error) => {
        console.error("Error fetching presence:", error);
      }
    );

    return () => off(presenceRef, "value", unsubscribe);
  }, [userId]);

  return presence;
}

export function useMyPresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    // Update presence when component mounts
    const updatePresence = () => {
      const presenceRef = ref(database, `presence/${user.uid}`);
      presenceRef.set({
        isOnline: true,
        lastSeen: Date.now(),
      }).catch(console.error);
    };

    updatePresence();

    // Update presence every 30 seconds
    const interval = setInterval(updatePresence, 30000);

    // Update presence when page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updatePresence();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Set offline when component unmounts
      const presenceRef = ref(database, `presence/${user.uid}`);
      presenceRef.set({
        isOnline: false,
        lastSeen: Date.now(),
      }).catch(console.error);
    };
  }, [user?.uid]);
}
