import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { addLiveNotification } from "../state/notificationSlice";
import toast from "react-hot-toast";

const SOCKET_URL = "/"; // Force relative path for Vercel proxy

let globalSocket = null;

export const getSocket = () => globalSocket;

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || !token) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      return;
    }

    if (globalSocket) {
      // Already connected
      return;
    }

    const freshToken = localStorage.getItem("token") || token;

    console.log("[Socket] Connecting to", SOCKET_URL);
    const socket = io(SOCKET_URL, {
      auth: { token: freshToken },
      withCredentials: true,
      transports: ["polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    globalSocket = socket;

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
      // Disconnection happens when user logs out (handled by user/token dependency check above)
    };
  }, [user, token, dispatch]);

  return globalSocket;
};

