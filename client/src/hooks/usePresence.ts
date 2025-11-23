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
    const updatePresence = async (isOnline: boolean = true) => {
      const presenceRef = ref(database, `presence/${user.uid}`);
      try {
        const { set: fbSet } = await import("firebase/database");
        await fbSet(presenceRef, {
          isOnline,
          lastSeen: Date.now(),
        });
      } catch (error) {
        console.error("Error updating presence:", error);
      }
    };

    updatePresence(true);

    // Update presence every 15 seconds (more frequent)
    const interval = setInterval(() => updatePresence(true), 15000);

    // Update presence when page visibility changes
    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    // Handle before unload to set offline
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Set offline when component unmounts
      updatePresence(false);
    };
  }, [user?.uid]);
}
