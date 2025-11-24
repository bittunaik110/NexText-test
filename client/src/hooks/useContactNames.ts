import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";

interface ContactNames {
  [userId: string]: string;
}

export function useContactNames() {
  const [customNames, setCustomNames] = useState<ContactNames>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const fetchCustomNames = async () => {
      try {
        const namesRef = ref(database, `users/${user.uid}/contactNames`);
        const snapshot = await get(namesRef);
        if (snapshot.exists()) {
          setCustomNames(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching custom contact names:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomNames();
  }, [user?.uid]);

  const setCustomName = async (userId: string, name: string) => {
    if (!user?.uid) return;

    try {
      const nameRef = ref(database, `users/${user.uid}/contactNames/${userId}`);
      await set(nameRef, name);
      setCustomNames(prev => ({ ...prev, [userId]: name }));
    } catch (error) {
      console.error("Error saving custom contact name:", error);
    }
  };

  const getDisplayName = (userId: string, originalName: string) => {
    return customNames[userId] || originalName;
  };

  return { customNames, loading, setCustomName, getDisplayName };
}
