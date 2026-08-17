import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { addLiveNotification } from "../state/notificationSlice";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "http://localhost:8000";

let globalSocket = null;

export const getSocket = () => globalSocket;

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [socketInstance, setSocketInstance] = useState(globalSocket);

  useEffect(() => {
    if (!user) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        setSocketInstance(null);
      }
      return;
    }

    if (globalSocket) {
      setSocketInstance(globalSocket);
      return;
    }

    console.log("[Socket] Connecting to", SOCKET_URL);
    const socket = io(SOCKET_URL, {
      // Browser automatically sends HttpOnly cookies because of withCredentials: true
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    globalSocket = socket;
    setSocketInstance(socket);

    socket.on("connect", () => {
      console.log("[Socket] ✅ CONNECTED! id:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] ❌ Error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket] ⚠️ Disconnected:", reason);
    });

    socket.on("notification", (data) => {
      console.log("[Socket] 🔔 Notification:", data.title);
      dispatch(addLiveNotification(data));
      toast(data.message, {
        icon: "🔔",
        duration: 5000,
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    });

    return () => {
      // We do NOT disconnect on component unmount, because this is a singleton!
    };
  }, [user, dispatch]);

  return socketInstance;
};
