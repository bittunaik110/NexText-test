import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { getIdToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectSocket = async () => {
      const token = await getIdToken();
      if (!token) return;

      const socket = io({
        auth: { token },
      });

      socket.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected");
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [getIdToken]);

  return { socket: socketRef.current, isConnected };
}
