import { useEffect } from "react";
import { getSocket } from "../../features/notification/hook/useSocket";

/**
 * Hook to automatically refresh data when a specific resource is updated globally
 * @param {string} resourceName - The name of the resource (e.g. "billing", "pharmacy", "appointment")
 * @param {function} refreshCallback - The function to call when an update happens
 */
export const useRealtime = (resourceName, refreshCallback) => {
  useEffect(() => {
    let socket = getSocket();
    let intervalId = null;

    const handleDataUpdate = (payload) => {
      if (payload && payload.resource === resourceName) {
        console.log(`[Realtime] Triggering refresh for ${resourceName}`);
        refreshCallback();
      }
    };

    const attachListener = () => {
      socket = getSocket();
      if (socket) {
        socket.on("data_updated", handleDataUpdate);
        if (intervalId) clearInterval(intervalId);
      }
    };

    if (socket) {
      attachListener();
    } else {
      // Poll every 500ms until socket is ready
      intervalId = setInterval(attachListener, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (socket) {
        socket.off("data_updated", handleDataUpdate);
      }
    };
  }, [resourceName, refreshCallback]);
};
